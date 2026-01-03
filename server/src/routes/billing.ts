import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { StripeService } from '../services/stripe-service';
import { subscriptionLicenseService } from '../services/subscription-license-service';
import { authenticateTenantSession, AuthenticatedRequest } from '../middleware/tenant-auth';
import { ApiResponse, CreateCheckoutSessionRequest, CreateCheckoutSessionResponse, Subscription, Tenant } from '../types';
import dotenv from 'dotenv';

dotenv.config();

async function billingRoutes(fastify: FastifyInstance) {
  // ========== CHECKOUT SESSION ==========

  // Create checkout session
  fastify.post<{ Body: CreateCheckoutSessionRequest }>(
    '/create-checkout-session',
    { preHandler: [authenticateTenantSession] },
    async (request: AuthenticatedRequest<{ Body: CreateCheckoutSessionRequest }>, reply: FastifyReply) => {
      try {
        const { priceId } = request.body;
        const tenantId = request.tenant!.id;

        if (!priceId) {
          return reply.code(400).send({
            success: false,
            error: 'priceId is required',
          });
        }

        // Get full tenant object
        const tenant = await db.getTenant(tenantId);
        if (!tenant) {
          return reply.code(404).send({
            success: false,
            error: 'Tenant not found',
          });
        }

        // Check if tenant already has an active subscription
        if (tenant.stripeSubscriptionId &&
          (tenant.subscriptionStatus === 'active' || tenant.subscriptionStatus === 'trialing')) {
          return reply.code(400).send({
            success: false,
            error: 'You already have an active subscription. Please cancel your current subscription before subscribing to a new plan.',
          });
        }

        // Get or create Stripe customer
        let stripeCustomerId = tenant.stripeCustomerId;
        if (!stripeCustomerId) {
          const customer = await StripeService.createCustomer(tenant);
          stripeCustomerId = customer.id;
          await db.updateTenantStripeCustomer(tenant.id, stripeCustomerId);
        }

        // Create checkout session
        const returnUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;
        const session = await StripeService.createCheckoutSession(
          stripeCustomerId,
          priceId,
          returnUrl
        );

        return reply.send({
          success: true,
          data: {
            clientSecret: session.client_secret,
            sessionId: session.id,
          } as CreateCheckoutSessionResponse,
        });
      } catch (error) {
        console.error('Create checkout session error:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create checkout session',
        });
      }
    }
  );

  // ========== WEBHOOK HANDLER ==========

  // Stripe webhook endpoint (no authentication - uses signature verification)
  // Note: This endpoint needs raw body for signature verification
  fastify.post('/webhook', {
    config: {
      rawBody: true, // Enable raw body for this route
    },
  }, async (request: FastifyRequest<{ Body: Buffer | string | any; rawBody?: Buffer }>, reply: FastifyReply) => {
    const sig = request.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return reply.code(500).send({ error: 'Webhook secret not configured' });
    }

    if (!sig) {
      return reply.code(400).send({ error: 'Missing stripe-signature header' });
    }

    try {
      // Get raw body for signature verification
      // Use rawBody if available (from plugin), otherwise fall back to request.body
      const rawBody = (request as any).rawBody
        ? (request as any).rawBody.toString('utf8')
        : typeof request.body === 'string'
          ? request.body
          : request.body instanceof Buffer
            ? request.body.toString('utf8')
            : JSON.stringify(request.body);

      const event = StripeService.verifyWebhookSignature(rawBody, sig, webhookSecret);

      console.log(`[Webhook] Received event: ${event.type} (ID: ${event.id})`);

      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;
          const customerDetails = session.customer_details as any;

          console.log(`[Webhook] Processing checkout.session.completed - Customer: ${customerId}, Subscription: ${subscriptionId}`);

          if (customerId && subscriptionId) {
            const tenant = await db.getTenantByStripeCustomerId(customerId);
            if (tenant) {
              console.log(`[Webhook] Found tenant: ${tenant.id} (${tenant.email}) for customer ${customerId}`);

              // Update customer billing address if available
              if (customerDetails?.address) {
                try {
                  await StripeService.updateCustomerBillingAddress(
                    customerId,
                    customerDetails.address
                  );
                } catch (error) {
                  console.error(`[Webhook] Failed to update customer billing address for tenant ${tenant.id}:`, error);
                  // Don't fail the webhook if address update fails
                }
              }

              const subscription = await StripeService.getSubscription(subscriptionId);
              const priceId = subscription.items.data[0]?.price.id || null;
              const status = StripeService.mapSubscriptionStatus(subscription.status);

              console.log(`[Webhook] Subscription details - ID: ${subscriptionId}, Price ID: ${priceId}, Status: ${subscription.status} -> ${status}`);

              await db.updateTenantSubscription(
                tenant.id,
                subscriptionId,
                status,
                priceId || null
              );

              console.log(`[Webhook] Updated tenant subscription record for tenant ${tenant.id}`);

              // Update subscription license tracking
              try {
                await subscriptionLicenseService.updateSubscriptionFromWebhook(
                  tenant.id,
                  subscriptionId,
                  priceId,
                  status
                );
                console.log(`[Webhook] Successfully updated subscription license tracking for tenant ${tenant.id}`);
              } catch (error) {
                console.error(`[Webhook] Failed to update subscription license tracking for tenant ${tenant.id}:`, error);
                // Log detailed error information
                if (error instanceof Error) {
                  console.error(`[Webhook] Error details: ${error.message}`);
                  console.error(`[Webhook] Stack trace: ${error.stack}`);
                }
                // Don't fail the webhook, but log the error for debugging
              }
            } else {
              console.warn(`[Webhook] No tenant found for Stripe customer ID: ${customerId}`);
            }
          } else {
            console.warn(`[Webhook] Missing customerId or subscriptionId in checkout.session.completed event`);
          }
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as any;
          const customerId = subscription.customer as string;
          const subscriptionId = subscription.id;
          const priceId = subscription.items.data[0]?.price.id || null;
          const status = StripeService.mapSubscriptionStatus(subscription.status);

          console.log(`[Webhook] Processing ${event.type} - Customer: ${customerId}, Subscription: ${subscriptionId}, Price ID: ${priceId}, Status: ${subscription.status} -> ${status}`);

          const tenant = await db.getTenantByStripeCustomerId(customerId);
          if (tenant) {
            console.log(`[Webhook] Found tenant: ${tenant.id} (${tenant.email}) for customer ${customerId}`);

            await db.updateTenantSubscription(
              tenant.id,
              subscriptionId,
              status,
              priceId || null
            );

            console.log(`[Webhook] Updated tenant subscription record for tenant ${tenant.id}`);

            // Update subscription license tracking
            try {
              await subscriptionLicenseService.updateSubscriptionFromWebhook(
                tenant.id,
                subscriptionId,
                priceId,
                status
              );
              console.log(`[Webhook] Successfully updated subscription license tracking for tenant ${tenant.id}`);
            } catch (error) {
              console.error(`[Webhook] Failed to update subscription license tracking for tenant ${tenant.id}:`, error);
              // Log detailed error information
              if (error instanceof Error) {
                console.error(`[Webhook] Error details: ${error.message}`);
                console.error(`[Webhook] Stack trace: ${error.stack}`);
              }
              // Don't fail the webhook, but log the error for debugging
            }
          } else {
            console.warn(`[Webhook] No tenant found for Stripe customer ID: ${customerId}`);
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          const subscriptionId = subscription.id;

          console.log(`[Webhook] Processing customer.subscription.deleted - Subscription: ${subscriptionId}`);

          const tenant = await db.getTenantByStripeSubscriptionId(subscriptionId);
          if (tenant) {
            console.log(`[Webhook] Found tenant: ${tenant.id} (${tenant.email}) for subscription ${subscriptionId}`);

            await db.updateTenantSubscription(
              tenant.id,
              null,
              'canceled',
              null
            );

            console.log(`[Webhook] Updated tenant subscription record to canceled for tenant ${tenant.id}`);

            // Update subscription license tracking to mark as canceled
            try {
              await subscriptionLicenseService.updateSubscriptionFromWebhook(
                tenant.id,
                null,
                null,
                'canceled'
              );
              console.log(`[Webhook] Successfully updated subscription license tracking to canceled for tenant ${tenant.id}`);
            } catch (error) {
              console.error(`[Webhook] Failed to update subscription license tracking for tenant ${tenant.id}:`, error);
              // Log detailed error information
              if (error instanceof Error) {
                console.error(`[Webhook] Error details: ${error.message}`);
                console.error(`[Webhook] Stack trace: ${error.stack}`);
              }
              // Don't fail the webhook, but log the error for debugging
            }
          } else {
            console.warn(`[Webhook] No tenant found for Stripe subscription ID: ${subscriptionId}`);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return reply.send({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return reply.code(400).send({
        error: error instanceof Error ? error.message : 'Webhook verification failed',
      });
    }
  });

  // Note: Webhook endpoint needs raw body for signature verification
  // Fastify should be configured to handle raw body for this route
  // In production, use @fastify/raw-body or similar plugin

  // ========== SUBSCRIPTION MANAGEMENT ==========

  // Get current subscription
  fastify.get(
    '/subscription',
    { preHandler: [authenticateTenantSession] },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const tenantId = request.tenant!.id;
        const tenant = await db.getTenant(tenantId);

        if (!tenant) {
          return reply.code(404).send({
            success: false,
            error: 'Tenant not found',
          });
        }

        if (!tenant.stripeSubscriptionId) {
          return reply.send({
            success: true,
            data: null,
          });
        }

        const subscription = await StripeService.getSubscription(tenant.stripeSubscriptionId);
        const priceId = subscription.items.data[0]?.price.id || '';
        const price = subscription.items.data[0]?.price;

        const subscriptionData: Subscription = {
          id: subscription.id,
          status: StripeService.mapSubscriptionStatus(subscription.status),
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
          canceledAt: (subscription as any).canceled_at ? new Date((subscription as any).canceled_at * 1000) : undefined,
          planId: priceId,
          planName: (price as any)?.nickname || undefined,
        };

        return reply.send({
          success: true,
          data: subscriptionData,
        });
      } catch (error) {
        console.error('Get subscription error:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get subscription',
        });
      }
    }
  );

  // Cancel subscription
  fastify.post(
    '/cancel-subscription',
    { preHandler: [authenticateTenantSession] },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const tenantId = request.tenant!.id;
        const tenant = await db.getTenant(tenantId);

        if (!tenant) {
          return reply.code(404).send({
            success: false,
            error: 'Tenant not found',
          });
        }

        if (!tenant.stripeSubscriptionId) {
          return reply.code(400).send({
            success: false,
            error: 'No active subscription found',
          });
        }

        const subscription = await StripeService.cancelSubscription(
          tenant.stripeSubscriptionId,
          true // Cancel at period end
        );

        // Update tenant subscription status
        const status = StripeService.mapSubscriptionStatus(subscription.status);
        await db.updateTenantSubscription(
          tenant.id,
          tenant.stripeSubscriptionId,
          status,
          tenant.currentPlanId || null
        );

        return reply.send({
          success: true,
          data: {
            message: 'Subscription will be canceled at the end of the billing period',
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
      } catch (error) {
        console.error('Cancel subscription error:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to cancel subscription',
        });
      }
    }
  );

  // Create billing portal session
  fastify.post(
    '/create-billing-portal-session',
    { preHandler: [authenticateTenantSession] },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const tenantId = request.tenant!.id;
        const tenant = await db.getTenant(tenantId);

        if (!tenant) {
          return reply.code(404).send({
            success: false,
            error: 'Tenant not found',
          });
        }

        if (!tenant.stripeCustomerId) {
          return reply.code(400).send({
            success: false,
            error: 'No Stripe customer found. Please create a subscription first.',
          });
        }

        // Create return URL pointing back to dashboard settings
        const returnUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/settings`;

        const session = await StripeService.createBillingPortalSession(
          tenant.stripeCustomerId,
          returnUrl
        );

        return reply.send({
          success: true,
          data: {
            url: session.url,
          },
        });
      } catch (error) {
        console.error('Create billing portal session error:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create billing portal session',
        });
      }
    }
  );
}

export default billingRoutes;

