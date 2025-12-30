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
    console.log(`[SubscriptionLicenseService] updateSubscriptionFromWebhook called - Tenant: ${tenantId}, Subscription: ${stripeSubscriptionId}, Price ID: ${stripePriceId}, Status: ${subscriptionStatus}`);

    // If no price ID, we can't determine license limit - skip
    if (!stripePriceId) {
      const errorMsg = `No Stripe Price ID provided for tenant ${tenantId}, skipping license tracking update`;
      console.warn(`[SubscriptionLicenseService] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // Get license limit from Stripe Plan Mapping
    let planMapping;
    try {
      planMapping = await db.getStripePlanMapping(stripePriceId);
    } catch (error) {
      const errorMsg = `Failed to retrieve plan mapping for Stripe Price ID ${stripePriceId} (tenant ${tenantId})`;
      console.error(`[SubscriptionLicenseService] ${errorMsg}:`, error);
      throw new Error(`${errorMsg}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (!planMapping) {
      const errorMsg = `No plan mapping found for Stripe Price ID ${stripePriceId} (tenant ${tenantId}). Please create a plan mapping using the admin API endpoint POST /api/v1/admin/stripe-plan-mappings with body: { "stripePriceId": "${stripePriceId}", "name": "Plan Name", "maxLicenses": <number> }`;
      console.error(`[SubscriptionLicenseService] ${errorMsg}`);
      console.warn(`[SubscriptionLicenseService] Creating tracking record with default maxLicenses=1 for tenant ${tenantId} to allow basic functionality`);
      
      // Create tracking record with default maxLicenses=1 as a temporary workaround
      // This allows the tenant to create at least 1 license while the proper mapping is created
      // The admin should create the proper plan mapping as soon as possible
      try {
        await db.createOrUpdateSubscriptionTracking(
          tenantId,
          stripeSubscriptionId,
          stripePriceId,
          1, // Default to 1 license as a temporary workaround
          subscriptionStatus || null
        );
        console.log(`[SubscriptionLicenseService] Created tracking record with default maxLicenses=1 for tenant ${tenantId}. IMPORTANT: Please create proper plan mapping for ${stripePriceId} using POST /api/v1/admin/stripe-plan-mappings`);
        // Don't throw error - we've created the tracking record with a temporary default
        return;
      } catch (error) {
        const fallbackErrorMsg = `Failed to create fallback tracking record for tenant ${tenantId}`;
        console.error(`[SubscriptionLicenseService] ${fallbackErrorMsg}:`, error);
        throw new Error(`${errorMsg}. Additionally, ${fallbackErrorMsg}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`[SubscriptionLicenseService] Found plan mapping for ${stripePriceId}: ${planMapping.name} (maxLicenses: ${planMapping.maxLicenses})`);

    // Validate subscription status
    if (subscriptionStatus && !['active', 'past_due', 'canceled', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired'].includes(subscriptionStatus)) {
      console.warn(`[SubscriptionLicenseService] Invalid subscription status: ${subscriptionStatus} for tenant ${tenantId}`);
    }

    // Create or update subscription tracking
    try {
      await db.createOrUpdateSubscriptionTracking(
        tenantId,
        stripeSubscriptionId,
        stripePriceId,
        planMapping.maxLicenses,
        subscriptionStatus || null
      );
      console.log(`[SubscriptionLicenseService] Successfully created/updated subscription tracking for tenant ${tenantId} with ${planMapping.maxLicenses} max licenses`);
    } catch (error) {
      const errorMsg = `Failed to create/update subscription tracking for tenant ${tenantId}`;
      console.error(`[SubscriptionLicenseService] ${errorMsg}:`, error);
      throw new Error(`${errorMsg}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

