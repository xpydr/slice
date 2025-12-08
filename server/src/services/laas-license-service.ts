import { db } from '../db';
import { License, Plan, ValidateLicenseResponse, Activation, LicenseStatus, LaaSUser, UserLicense } from '../types';

export class LaaSLicenseService {
  /**
   * Validates a user's license status
   * This is the main LaaS endpoint - called by tenant's applications
   */
  async validateUserLicense(
    tenantId: string,
    userId: string, // Customer's internal user ID
    deviceId?: string,
    deviceInfo?: Record<string, any>
  ): Promise<ValidateLicenseResponse> {
    // Get or create user
    let user = await db.getUserByExternalId(tenantId, userId);
    if (!user) {
      // Auto-create user if doesn't exist
      user = await db.createUser({
        tenantId,
        externalId: userId,
      });
    }

    // Get user's licenses
    const licenses = await db.getUserLicenses(user.id);

    if (licenses.length === 0) {
      return { valid: false, reason: 'no_license' };
    }

    // Find the first active, non-expired license
    let activeLicense: License | null = null;
    const now = new Date();

    for (const license of licenses) {
      // Check if license is revoked
      if (license.status === 'revoked') {
        continue;
      }

      // Check if license is suspended
      if (license.status === 'suspended') {
        continue;
      }

      // Check if license is expired
      if (license.expiresAt && license.expiresAt < now) {
        // Auto-update status to expired
        await db.updateLicense(license.id, { status: 'expired' });
        continue;
      }

      // Found an active license
      activeLicense = license;
      break;
    }

    if (!activeLicense) {
      return { valid: false, reason: 'no_license' };
    }

    // Check existing activations for this user-license combo
    const existingActivations = await db.getActivationsByUserAndLicense(user.id, activeLicense.id);
    
    // Check seat limits (unique users per license)
    if (activeLicense.maxSeats) {
      // Count unique users with this license
      const allActivations = await db.getActivationsByLicense(activeLicense.id);
      const uniqueUsers = new Set(allActivations.map(a => a.userId)).size;

      if (uniqueUsers >= activeLicense.maxSeats) {
        await db.createAuditLog({
          tenantId,
          action: 'license.validated',
          entityType: 'license',
          entityId: activeLicense.id,
          metadata: { result: 'exceeded_seats', userId },
        });
        return { valid: false, reason: 'exceeded_seats' };
      }
    }

    // Check device limits
    if (deviceId && activeLicense.maxDevices) {
      const uniqueDevices = new Set(
        existingActivations
          .map(a => a.deviceId)
          .filter((id): id is string => !!id)
      ).size;

      if (uniqueDevices >= activeLicense.maxDevices) {
        await db.createAuditLog({
          tenantId,
          action: 'license.validated',
          entityType: 'license',
          entityId: activeLicense.id,
          metadata: { result: 'exceeded_devices', userId, deviceId },
        });
        return { valid: false, reason: 'exceeded_devices' };
      }
    }

    // Find or create activation
    let activation = existingActivations.find(a => a.deviceId === deviceId);
    
    if (!activation) {
      // Create new activation
      activation = await db.createActivation({
        userId: user.id,
        licenseId: activeLicense.id,
        deviceId,
        deviceInfo,
      });

      await db.createAuditLog({
        tenantId,
        action: 'license.activated',
        entityType: 'activation',
        entityId: activation.id,
        metadata: { licenseId: activeLicense.id, userId, deviceId },
      });
    } else {
      // Update last checked time
      const updated = await db.updateActivation(activation.id, {
        lastCheckedAt: new Date(),
        deviceId: deviceId || activation.deviceId,
        deviceInfo: deviceInfo || activation.deviceInfo,
      });
      if (updated) {
        activation = updated;
      }
    }

    // Log validation
    await db.createAuditLog({
      tenantId,
      action: 'license.validated',
      entityType: 'license',
      entityId: activeLicense.id,
      metadata: { result: 'valid', userId },
    });

    return {
      valid: true,
      license: activeLicense,
      activation,
      features: activeLicense.features,
    };
  }

  /**
   * Assigns a license to a user
   */
  async assignLicenseToUser(
    tenantId: string,
    userId: string,
    licenseId: string,
    assignedBy?: string
  ): Promise<UserLicense | null> {
    // Get or create user
    let user = await db.getUserByExternalId(tenantId, userId);
    if (!user) {
      user = await db.createUser({
        tenantId,
        externalId: userId,
      });
    }

    // Check if license exists and belongs to tenant
    const license = await db.getLicense(licenseId);
    if (!license) {
      return null;
    }

    // Verify license belongs to tenant's product
    const product = await db.getProduct(license.productId);
    if (!product || product.tenantId !== tenantId) {
      return null;
    }

    // Assign license
    const userLicense = await db.assignLicenseToUser(user.id, licenseId, assignedBy);

    await db.createAuditLog({
      tenantId,
      action: 'license.assigned',
      entityType: 'license',
      entityId: licenseId,
      metadata: { userId: user.id, externalId: userId },
      performedBy: assignedBy,
    });

    return userLicense;
  }

  /**
   * Creates a license from a plan
   */
  async createLicense(
    tenantId: string,
    planId: string,
    createdBy?: string,
    expiresInDays?: number
  ): Promise<License | null> {
    const plan = await db.getPlan(planId);
    if (!plan) return null;

    // Verify plan belongs to tenant
    const product = await db.getProduct(plan.productId);
    if (!product || product.tenantId !== tenantId) {
      return null;
    }

    // Calculate expiration date
    let expiresAt: Date | undefined;
    const daysToExpire = expiresInDays ?? plan.expiresInDays;
    if (daysToExpire) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysToExpire);
    }

    const license: Omit<License, 'id' | 'createdAt' | 'updatedAt'> = {
      productId: plan.productId,
      planId: plan.id,
      status: 'active',
      maxSeats: plan.maxSeats,
      maxDevices: plan.maxDevices,
      expiresAt,
      features: plan.features ? [...plan.features] : undefined,
      createdBy,
    };

    const newLicense = await db.createLicense(license);

    // Audit log
    await db.createAuditLog({
      tenantId,
      action: 'license.created',
      entityType: 'license',
      entityId: newLicense.id,
      metadata: { planId, productId: plan.productId },
      performedBy: createdBy,
    });

    return newLicense;
  }

  /**
   * Updates license status
   */
  async updateLicenseStatus(
    tenantId: string,
    licenseId: string,
    status: LicenseStatus,
    performedBy?: string
  ): Promise<License | null> {
    const license = await db.getLicense(licenseId);
    if (!license) return null;

    // Verify license belongs to tenant
    const product = await db.getProduct(license.productId);
    if (!product || product.tenantId !== tenantId) {
      return null;
    }

    const updated = await db.updateLicense(licenseId, { status });

    if (updated) {
      const action = status === 'revoked' 
        ? 'license.revoked' 
        : status === 'suspended' 
        ? 'license.suspended' 
        : 'license.reactivated';

      await db.createAuditLog({
        tenantId,
        action,
        entityType: 'license',
        entityId: licenseId,
        metadata: { previousStatus: license.status, newStatus: status },
        performedBy,
      });
    }

    return updated || null;
  }

  /**
   * Gets license usage information
   */
  async getLicenseUsage(tenantId: string, licenseId: string) {
    const license = await db.getLicense(licenseId);
    if (!license) return null;

    // Verify license belongs to tenant
    const product = await db.getProduct(license.productId);
    if (!product || product.tenantId !== tenantId) {
      return null;
    }

    // Get activations for this license
    const activations = await db.getActivationsByLicense(licenseId);

    const uniqueSeats = new Set(activations.map(a => a.userId)).size;
    const uniqueDevices = new Set(
      activations
        .map(a => a.deviceId)
        .filter((id): id is string => !!id)
    ).size;

    return {
      license,
      activations,
      totalActivations: activations.length,
      activeSeats: uniqueSeats,
      activeDevices: uniqueDevices,
    };
  }
}

export const laasLicenseService = new LaaSLicenseService();

