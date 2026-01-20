import { FastifyInstance, FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import { db } from '../db';
import { StripeService } from '../services/stripe-service';
import { subscriptionLicenseService } from '../services/subscription-license-service';
import { authenticateTenantSession, AuthenticatedRequest } from '../middleware/tenant-auth';
import { CreateCheckoutSessionRequest, CreateCheckoutSessionResponse, Subscription } from '../types';
import Stripe from 'stripe';

async function billingRoutes(fastify: FastifyInstance) {
  // ========== CHECKOUT SESSION ==========

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

        const tenant = await db.getTenant(tenantId);
        if (!tenant) {
          return reply.code(404).send({
            success: false,
            error: 'Tenant not found',
          });
        }

        if (tenant.stripeSubscriptionId &&
          (tenant.subscriptionStatus === 'active' || tenant.subscriptionStatus === 'trialing')) {
          return reply.code(400).send({
            success: false,
            error: 'You already have an active subscription. Please cancel your current subscription before subscribing to a new plan.',
          });
        }

        let stripeCustomerId = tenant.stripeCustomerId;
        if (!stripeCustomerId) {
          const customer = await StripeService.createCustomer(tenant);
          stripeCustomerId = customer.id;
          await db.updateTenantStripeCustomer(tenant.id, stripeCustomerId);
        }

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

  fastify.post(
    '/webhook',
    { config: { rawBody: true } },
    async (
      request: FastifyRequest<RouteGenericInterface & { rawBody?: Buffer }>,
      reply: FastifyReply
    ) => {
      const sig = request.headers['stripe-signature'] as string | undefined;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        request.log.error('STRIPE_WEBHOOK_SECRET is not set');
        return reply.code(500).send({ error: 'Webhook secret not configured' });
      }
      if (!sig) {
        return reply.code(400).send({ error: 'Missing stripe-signature header' });
      }
      if (!(request as any).rawBody) {
        request.log.error('Raw body missing on Stripe webhook request');
        return reply.code(400).send({ error: 'Raw body missing' });
      }

      let event: Stripe.Event;

      try {
        event = StripeService.verifyWebhookSignature(
          (request as any).rawBody, // Buffer, untouched
          sig,
          webhookSecret
        );
      } catch (err) {
        request.log.error({ err }, 'Stripe webhook signature verification failed');
        return reply.code(400).send({
          error:
            err instanceof Error
              ? err.message
              : 'Webhook signature verification failed',
        });
      }

      request.log.info(
        `[Webhook] Received event: ${event.type} (ID: ${event.id})`
      );

      try {
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as any;
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;
            const customerDetails = session.customer_details as any;

            if (customerId && subscriptionId) {
              const tenant = await db.getTenantByStripeCustomerId(customerId);

              if (tenant) {
                if (customerDetails?.address) {
                  try {
                    await StripeService.updateCustomerBillingAddress(
                      customerId,
                      customerDetails.address
                    );
                  } catch (err) {
                    request.log.error(
                      { err },
                      `Failed to update billing address for tenant ${tenant.id}`
                    );
                  }
                }

                const subscription = await StripeService.getSubscription(subscriptionId);

                const priceId = subscription.items.data[0]?.price.id ?? null;

                const status = StripeService.mapSubscriptionStatus(subscription.status);

                await db.updateTenantSubscription(
                  tenant.id,
                  subscriptionId,
                  status,
                  priceId
                );

                try {
                  await subscriptionLicenseService.updateSubscriptionFromWebhook(
                    tenant.id,
                    subscriptionId,
                    priceId,
                    status
                  );
                } catch (err) {
                  request.log.error(
                    { err },
                    `Failed to update license tracking for tenant ${tenant.id}`
                  );
                }
              }
            }
            break;
          }

          case 'customer.subscription.created':
          case 'customer.subscription.updated': {
            const subscription = event.data.object as any;
            const customerId = subscription.customer as string;
            const subscriptionId = subscription.id;
            const priceId =
              subscription.items.data[0]?.price.id ?? null;
            const status = StripeService.mapSubscriptionStatus(
              subscription.status
            );

            const tenant = await db.getTenantByStripeCustomerId(customerId);
            if (tenant) {
              await db.updateTenantSubscription(
                tenant.id,
                subscriptionId,
                status,
                priceId
              );

              try {
                await subscriptionLicenseService.updateSubscriptionFromWebhook(
                  tenant.id,
                  subscriptionId,
                  priceId,
                  status
                );
              } catch (err) {
                request.log.error(
                  { err },
                  `Failed to update license tracking for tenant ${tenant.id}`
                );
              }
            }
            break;
          }

          case 'customer.subscription.deleted': {
            const subscription = event.data.object as any;
            const subscriptionId = subscription.id;

            const tenant =
              await db.getTenantByStripeSubscriptionId(subscriptionId);

            if (tenant) {
              await db.updateTenantSubscription(
                tenant.id,
                null,
                'canceled',
                null
              );

              try {
                await subscriptionLicenseService.updateSubscriptionFromWebhook(
                  tenant.id,
                  null,
                  null, 
                  'canceled'
                );
              } catch (err) {
                request.log.error(
                  { err },
                  `Failed to update license tracking for tenant ${tenant.id}`
                );
              }
            }
            break;
          }

          default:
            request.log.info(`Unhandled Stripe event type: ${event.type}`);
        }

        return reply.send({ received: true });
      } catch (err) {
        request.log.error({ err }, 'Error processing Stripe webhook event');
        return reply.code(500).send({ error: 'Webhook processing failed' });
      }
    }
  );

  // ========== SUBSCRIPTION MANAGEMENT ==========

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

