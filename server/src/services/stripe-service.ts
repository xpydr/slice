import Stripe from 'stripe';
import dotenv from 'dotenv';
import { SubscriptionStatus, Tenant } from '../types';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY not set. Stripe functionality will be disabled.');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-11-17.clover',
}) : null as Stripe | null;

export class StripeService {
  /**
   * Create a Stripe customer for a tenant
   */
  static async createCustomer(tenant: Tenant): Promise<Stripe.Customer> {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
    }

    const customer = await stripe.customers.create({
      email: tenant.email,
      name: tenant.name,
      metadata: {
        tenantId: tenant.id,
      },
    });

    return customer;
  }

  /**
   * Update customer billing address
   */
  static async updateCustomerBillingAddress(
    customerId: string,
    address: Stripe.Address
  ): Promise<Stripe.Customer> {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
    }

    // Convert Stripe.Address (which has null values) to AddressParam (which expects undefined)
    const addressParam: Stripe.AddressParam = {
      line1: address.line1 || undefined,
      line2: address.line2 || undefined,
      city: address.city || undefined,
      state: address.state || undefined,
      postal_code: address.postal_code || undefined,
      country: address.country || undefined,
    };

    // Update customer with billing address
    const customer = await stripe.customers.update(customerId, {
      address: addressParam,
      metadata: {
        billingAddressLine1: address.line1 || '',
        billingAddressLine2: address.line2 || '',
        billingAddressCity: address.city || '',
        billingAddressState: address.state || '',
        billingAddressPostalCode: address.postal_code || '',
        billingAddressCountry: address.country || '',
      },
    });

    return customer;
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(
    customerId: string,
    priceId: string,
    returnUrl: string
  ): Promise<Stripe.Checkout.Session> {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      return_url: returnUrl,
      billing_address_collection: 'required', // Required for tax purposes and bookkeeping
    });

    return session;
  }

  /**
   * Retrieve a subscription by ID
   */
  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method'],
    });

    return subscription;
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = false
  ): Promise<Stripe.Subscription> {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    if (!cancelAtPeriodEnd) {
      // Cancel immediately
      return await stripe.subscriptions.cancel(subscriptionId);
    }

    return subscription;
  }

  /**
   * Create a billing portal session for customer subscription management
   */
  static async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Stripe.Event {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
    }

    try {
      const payloadString = typeof payload === 'string' ? payload : payload.toString('utf8');
      const event = stripe.webhooks.constructEvent(payloadString, signature, secret);
      return event;
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  /**
   * Map Stripe subscription status to our SubscriptionStatus type
   * Handles both test mode and live mode subscriptions identically
   */
  static mapSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
    const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
      active: 'active',
      past_due: 'past_due',
      canceled: 'canceled',
      unpaid: 'unpaid',
      trialing: 'trialing', // Test mode subscriptions can be in trialing status
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
      paused: 'active', // Stripe paused subscriptions are considered active
    }

    const mappedStatus = statusMap[stripeStatus] || 'incomplete';
    
    // Log if we encounter an unmapped status (shouldn't happen, but helps with debugging)
    if (!statusMap[stripeStatus]) {
      console.warn(`[StripeService] Unmapped subscription status: ${stripeStatus}, defaulting to 'incomplete'`);
    }
    
    return mappedStatus;
  }
}

