import { db } from '../db';
import { SubscriptionStatus } from '../types';

export interface LicenseQuota {
  maxLicenses: number;
  usedLicenses: number;
  remainingLicenses: number;
  hasActiveSubscription: boolean;
}

export class SubscriptionLicenseService {
  /**
   * Check if tenant can create a license (hasn't exceeded limit)
   * Returns true if allowed, false if limit exceeded
   */
  async checkLicenseLimit(tenantId: string): Promise<{ allowed: boolean; reason?: string; quota?: LicenseQuota }> {
    const usage = await db.getTenantLicenseUsage(tenantId);

    // If no tracking record exists, tenant has no subscription - deny
    if (!usage) {
      return {
        allowed: false,
        reason: 'No active subscription found. Please purchase a plan to create licenses.',
      };
    }

    // Check if subscription is active
    if (!usage.hasActiveSubscription) {
      return {
        allowed: false,
        reason: 'Subscription is not active. Please ensure your subscription is active to create licenses.',
        quota: usage,
      };
    }

    // Check if limit exceeded
    if (usage.usedLicenses >= usage.maxLicenses) {
      return {
        allowed: false,
        reason: `License limit exceeded. You have used ${usage.usedLicenses} of ${usage.maxLicenses} licenses.`,
        quota: usage,
      };
    }

    return {
      allowed: true,
      quota: usage,
    };
  }

  /**
   * Update subscription tracking from webhook event
   * This is called when Stripe sends subscription events
   */
  async updateSubscriptionFromWebhook(
    tenantId: string,
    stripeSubscriptionId: string | null,
    stripePriceId: string | null,
    subscriptionStatus: SubscriptionStatus | null
  ): Promise<void> {
    // If no price ID, we can't determine license limit - skip
    if (!stripePriceId) {
      console.warn(`No Stripe Price ID provided for tenant ${tenantId}, skipping license tracking update`);
      return;
    }

    // Get license limit from Stripe Plan Mapping
    const planMapping = await db.getStripePlanMapping(stripePriceId);

    if (!planMapping) {
      console.warn(`No plan mapping found for Stripe Price ID ${stripePriceId}, skipping license tracking update`);
      return;
    }

    // Create or update subscription tracking
    await db.createOrUpdateSubscriptionTracking(
      tenantId,
      stripeSubscriptionId,
      stripePriceId,
      planMapping.maxLicenses,
      subscriptionStatus || null
    );
  }

  /**
   * Get tenant's license quota and usage
   */
  async getTenantLicenseQuota(tenantId: string): Promise<LicenseQuota | null> {
    return await db.getTenantLicenseUsage(tenantId);
  }

  /**
   * Increment license count when a license is created
   */
  async incrementLicenseCount(tenantId: string): Promise<void> {
    await db.incrementLicenseCount(tenantId);
  }

  /**
   * Decrement license count when a license is deleted
   */
  async decrementLicenseCount(tenantId: string): Promise<void> {
    await db.decrementLicenseCount(tenantId);
  }
}

export const subscriptionLicenseService = new SubscriptionLicenseService();

