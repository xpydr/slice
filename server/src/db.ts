import { PrismaClient, AuditLogAction, EntityType, LicenseStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { Product, Plan, License, Activation, AuditLog, Tenant, TenantApiKey, LaaSUser, UserLicense, TenantWithApiKey } from './types';
import { hashApiKey, verifyApiKey, getApiKeyPrefix } from './services/api-key-service';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Prisma client with PostgreSQL adapter
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper functions to convert Prisma models to our types
function prismaProductToProduct(prismaProduct: any): Product {
  return {
    id: prismaProduct.id,
    tenantId: prismaProduct.tenantId,
    name: prismaProduct.name,
    description: prismaProduct.description || undefined,
    createdAt: prismaProduct.createdAt,
    updatedAt: prismaProduct.updatedAt,
  };
}

function prismaPlanToPlan(prismaPlan: any): Plan {
  return {
    id: prismaPlan.id,
    productId: prismaPlan.productId,
    name: prismaPlan.name,
    description: prismaPlan.description || undefined,
    maxSeats: prismaPlan.maxSeats || undefined,
    maxDevices: prismaPlan.maxDevices || undefined,
    expiresInDays: prismaPlan.expiresInDays || undefined,
    features: prismaPlan.features as string[] | undefined,
    createdAt: prismaPlan.createdAt,
    updatedAt: prismaPlan.updatedAt,
  };
}

function prismaLicenseToLicense(prismaLicense: any): License {
  return {
    id: prismaLicense.id,
    productId: prismaLicense.productId,
    planId: prismaLicense.planId,
    status: prismaLicense.status.toLowerCase() as License['status'],
    maxSeats: prismaLicense.maxSeats || undefined,
    maxDevices: prismaLicense.maxDevices || undefined,
    expiresAt: prismaLicense.expiresAt || undefined,
    features: prismaLicense.features as string[] | undefined,
    createdBy: prismaLicense.createdBy || undefined,
    createdAt: prismaLicense.createdAt,
    updatedAt: prismaLicense.updatedAt,
  };
}

function prismaActivationToActivation(prismaActivation: any): Activation {
  return {
    id: prismaActivation.id,
    userId: prismaActivation.userId,
    licenseId: prismaActivation.licenseId,
    deviceId: prismaActivation.deviceId || undefined,
    deviceInfo: prismaActivation.deviceInfo as Record<string, any> | undefined,
    activatedAt: prismaActivation.activatedAt,
    lastCheckedAt: prismaActivation.lastCheckedAt || undefined,
    metadata: prismaActivation.metadata as Record<string, any> | undefined,
  };
}

function prismaTenantToTenant(prismaTenant: any): Tenant {
  return {
    id: prismaTenant.id,
    name: prismaTenant.name,
    email: prismaTenant.email || undefined,
    website: prismaTenant.website || undefined,
    status: prismaTenant.status.toLowerCase() as Tenant['status'],
    metadata: prismaTenant.metadata as Record<string, any> | undefined,
    createdAt: prismaTenant.createdAt,
    updatedAt: prismaTenant.updatedAt,
  };
}

function prismaAuditLogToAuditLog(prismaLog: any): AuditLog {
  return {
    id: prismaLog.id,
    tenantId: prismaLog.tenantId || undefined,
    action: prismaLog.action.toLowerCase().replace(/_/g, '.') as AuditLog['action'],
    entityType: prismaLog.entityType.toLowerCase() as AuditLog['entityType'],
    entityId: prismaLog.entityId,
    metadata: prismaLog.metadata as Record<string, any> | undefined,
    performedBy: prismaLog.performedBy || undefined,
    timestamp: prismaLog.timestamp,
  };
}

// Helper to convert LicenseStatus enum
function toPrismaLicenseStatus(status: string): LicenseStatus {
  return status.toUpperCase() as LicenseStatus;
}

// Helper to convert AuditLogAction
function toPrismaAuditLogAction(action: string): AuditLogAction {
  return action.toUpperCase().replace(/\./g, '_') as AuditLogAction;
}

// Helper to convert EntityType
function toPrismaEntityType(entityType: string): EntityType {
  return entityType.toUpperCase() as EntityType;
}

class PrismaDB {

  // Plans
  async createPlan(plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plan> {
    const prismaPlan = await prisma.plan.create({
      data: {
        productId: plan.productId,
        name: plan.name,
        description: plan.description,
        maxSeats: plan.maxSeats,
        maxDevices: plan.maxDevices,
        expiresInDays: plan.expiresInDays,
        features: plan.features ?? undefined,
      },
    });
    return prismaPlanToPlan(prismaPlan);
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    const prismaPlan = await prisma.plan.findUnique({
      where: { id },
    });
    return prismaPlan ? prismaPlanToPlan(prismaPlan) : undefined;
  }

  async getPlansByProduct(productId: string): Promise<Plan[]> {
    const prismaPlans = await prisma.plan.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    return prismaPlans.map(prismaPlanToPlan);
  }

  async getAllPlans(): Promise<Plan[]> {
    const prismaPlans = await prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return prismaPlans.map(prismaPlanToPlan);
  }

  // Licenses

  async getLicense(id: string): Promise<License | undefined> {
    const prismaLicense = await prisma.license.findUnique({
      where: { id },
    });
    return prismaLicense ? prismaLicenseToLicense(prismaLicense) : undefined;
  }

  async updateLicense(id: string, updates: Partial<License>): Promise<License | undefined> {
    const updateData: any = {};

    if (updates.status !== undefined) {
      updateData.status = toPrismaLicenseStatus(updates.status);
    }
    if (updates.maxSeats !== undefined) updateData.maxSeats = updates.maxSeats;
    if (updates.maxDevices !== undefined) updateData.maxDevices = updates.maxDevices;
    if (updates.expiresAt !== undefined) updateData.expiresAt = updates.expiresAt;
    if (updates.features !== undefined) updateData.features = updates.features ?? undefined;
    if (updates.createdBy !== undefined) updateData.createdBy = updates.createdBy;

    try {
      const prismaLicense = await prisma.license.update({
        where: { id },
        data: updateData,
      });
      return prismaLicenseToLicense(prismaLicense);
    } catch (error) {
      return undefined;
    }
  }

  async getLicensesByPlan(planId: string): Promise<License[]> {
    const prismaLicenses = await prisma.license.findMany({
      where: { planId },
      orderBy: { createdAt: 'desc' },
    });
    return prismaLicenses.map(prismaLicenseToLicense);
  }

  async getAllLicenses(): Promise<License[]> {
    const prismaLicenses = await prisma.license.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return prismaLicenses.map(prismaLicenseToLicense);
  }

  // Activations

  // Audit Logs
  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    console.log('Creating audit log:', log);
    const prismaLog = await prisma.auditLog.create({
      data: {
        tenantId: log.tenantId,
        action: toPrismaAuditLogAction(log.action),
        entityType: toPrismaEntityType(log.entityType),
        entityId: log.entityId,
        metadata: log.metadata ?? undefined,
        performedBy: log.performedBy,
      },
    });
    return prismaAuditLogToAuditLog(prismaLog);
  }

  async getAuditLogs(entityType?: string, entityId?: string, tenantId?: string): Promise<AuditLog[]> {
    const where: any = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }
    if (entityType) {
      where.entityType = toPrismaEntityType(entityType);
    }
    if (entityId) {
      where.entityId = entityId;
    }

    const prismaLogs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 10000, // Keep only last 10,000 logs
    });

    return prismaLogs.map(prismaAuditLogToAuditLog);
  }

  async getUsersByTenant(tenantId: string): Promise<LaaSUser[]> {
    const prismaUsers = await prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return prismaUsers.map(u => ({
      id: u.id,
      tenantId: u.tenantId,
      externalId: u.externalId,
      email: u.email || undefined,
      name: u.name || undefined,
      metadata: u.metadata as Record<string, any> | undefined,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }

  // ========== TENANT METHODS ==========

  async createTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const prismaTenant = await prisma.tenant.create({
      data: {
        name: tenant.name,
        email: tenant.email,
        website: tenant.website,
        status: tenant.status.toUpperCase() as any,
        metadata: tenant.metadata ?? undefined,
      },
    });
    return prismaTenantToTenant(prismaTenant);
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const prismaTenant = await prisma.tenant.findUnique({
      where: { id },
    });
    if (!prismaTenant) return undefined;
    return prismaTenantToTenant(prismaTenant);
  }

  async getAllTenants(): Promise<Tenant[]> {
    const prismaTenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return prismaTenants.map(t => ({
      id: t.id,
      name: t.name,
      email: t.email || undefined,
      website: t.website || undefined,
      status: t.status.toLowerCase() as Tenant['status'],
      metadata: t.metadata as Record<string, any> | undefined,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }

  async getTenantByApiKey(apiKey: string): Promise<TenantWithApiKey | undefined> {
    const keyHash = hashApiKey(apiKey);
    const prismaApiKey = await prisma.tenantApiKey.findUnique({
      where: { keyHash },
      include: { tenant: true },
    });

    if (!prismaApiKey || !prismaApiKey.tenant) return undefined;

    // Verify the key matches
    if (!verifyApiKey(apiKey, prismaApiKey.keyHash)) {
      return undefined;
    }

    return {
      id: prismaApiKey.tenant.id,
      name: prismaApiKey.tenant.name,
      email: prismaApiKey.tenant.email || undefined,
      website: prismaApiKey.tenant.website || undefined,
      status: prismaApiKey.tenant.status.toLowerCase() as Tenant['status'],
      metadata: prismaApiKey.tenant.metadata as Record<string, any> | undefined,
      createdAt: prismaApiKey.tenant.createdAt,
      updatedAt: prismaApiKey.tenant.updatedAt,
      apiKeyId: prismaApiKey.id,
      apiKeyStatus: prismaApiKey.status.toLowerCase(),
      apiKeyExpiresAt: prismaApiKey.expiresAt || undefined,
    };
  }

  async updateApiKeyLastUsed(apiKeyId: string): Promise<void> {
    await prisma.tenantApiKey.update({
      where: { id: apiKeyId },
      data: { lastUsedAt: new Date() },
    });
  }

  async createApiKey(tenantId: string, name: string, expiresInDays?: number): Promise<{ apiKey: string; apiKeyRecord: TenantApiKey }> {
    const apiKeyService = await import('./services/api-key-service');
    const apiKey = apiKeyService.generateApiKey();
    const keyHash = hashApiKey(apiKey);
    const keyPrefix = getApiKeyPrefix(apiKey);

    let expiresAt: Date | undefined;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    const prismaApiKey = await prisma.tenantApiKey.create({
      data: {
        tenantId,
        name,
        keyHash,
        keyPrefix,
        expiresAt,
      },
    });

    return {
      apiKey, // Return plaintext key (only shown once)
      apiKeyRecord: {
        id: prismaApiKey.id,
        tenantId: prismaApiKey.tenantId,
        name: prismaApiKey.name,
        keyPrefix: prismaApiKey.keyPrefix,
        lastUsedAt: prismaApiKey.lastUsedAt || undefined,
        expiresAt: prismaApiKey.expiresAt || undefined,
        status: prismaApiKey.status.toLowerCase() as TenantApiKey['status'],
        createdAt: prismaApiKey.createdAt,
        updatedAt: prismaApiKey.updatedAt,
      },
    };
  }

  // ========== USER METHODS (Tenant-scoped) ==========

  async createUser(user: Omit<LaaSUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<LaaSUser> {
    const prismaUser = await prisma.user.create({
      data: {
        tenantId: user.tenantId,
        externalId: user.externalId,
        email: user.email,
        name: user.name,
        metadata: user.metadata ?? undefined,
      },
    });
    return {
      id: prismaUser.id,
      tenantId: prismaUser.tenantId,
      externalId: prismaUser.externalId,
      email: prismaUser.email || undefined,
      name: prismaUser.name || undefined,
      metadata: prismaUser.metadata as Record<string, any> | undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }

  async getUserByExternalId(tenantId: string, externalId: string): Promise<LaaSUser | undefined> {
    const prismaUser = await prisma.user.findUnique({
      where: {
        tenantId_externalId: {
          tenantId,
          externalId,
        },
      },
    });
    if (!prismaUser) return undefined;
    return {
      id: prismaUser.id,
      tenantId: prismaUser.tenantId,
      externalId: prismaUser.externalId,
      email: prismaUser.email || undefined,
      name: prismaUser.name || undefined,
      metadata: prismaUser.metadata as Record<string, any> | undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }

  async getUserLicenses(userId: string): Promise<License[]> {
    const prismaUserLicenses = await prisma.userLicense.findMany({
      where: { userId },
      include: { license: true },
    });
    return prismaUserLicenses.map(ul => prismaLicenseToLicense(ul.license));
  }

  async getActivationsByLicense(licenseId: string): Promise<Activation[]> {
    const prismaActivations = await prisma.activation.findMany({
      where: { licenseId },
      orderBy: { activatedAt: 'desc' },
    });
    return prismaActivations.map(a => ({
      id: a.id,
      userId: a.userId,
      licenseId: a.licenseId,
      deviceId: a.deviceId || undefined,
      deviceInfo: a.deviceInfo as Record<string, any> | undefined,
      activatedAt: a.activatedAt,
      lastCheckedAt: a.lastCheckedAt || undefined,
      metadata: a.metadata as Record<string, any> | undefined,
    }));
  }

  async assignLicenseToUser(userId: string, licenseId: string, assignedBy?: string, metadata?: Record<string, any>): Promise<UserLicense> {
    const prismaUserLicense = await prisma.userLicense.create({
      data: {
        userId,
        licenseId,
        assignedBy,
        metadata: metadata ?? undefined,
      },
    });
    return {
      id: prismaUserLicense.id,
      userId: prismaUserLicense.userId,
      licenseId: prismaUserLicense.licenseId,
      assignedAt: prismaUserLicense.assignedAt,
      assignedBy: prismaUserLicense.assignedBy || undefined,
      metadata: prismaUserLicense.metadata as Record<string, any> | undefined,
    };
  }

  // ========== UPDATED PRODUCT METHODS (Tenant-scoped) ==========

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const prismaProduct = await prisma.product.create({
      data: {
        tenantId: product.tenantId,
        name: product.name,
        description: product.description,
      },
    });
    return prismaProductToProduct(prismaProduct);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const prismaProduct = await prisma.product.findUnique({
      where: { id },
    });
    if (!prismaProduct) return undefined;
    return prismaProductToProduct(prismaProduct);
  }

  async getProductsByTenant(tenantId: string): Promise<Product[]> {
    const prismaProducts = await prisma.product.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return prismaProducts.map(p => ({
      id: p.id,
      tenantId: p.tenantId,
      name: p.name,
      description: p.description || undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  // ========== UPDATED LICENSE METHODS (No key) ==========

  async createLicense(license: Omit<License, 'id' | 'createdAt' | 'updatedAt'>): Promise<License> {
    const prismaLicense = await prisma.license.create({
      data: {
        productId: license.productId,
        planId: license.planId,
        status: toPrismaLicenseStatus(license.status),
        maxSeats: license.maxSeats,
        maxDevices: license.maxDevices,
        expiresAt: license.expiresAt,
        features: license.features ?? undefined,
        createdBy: license.createdBy,
      },
    });
    return prismaLicenseToLicense(prismaLicense);
  }

  // ========== UPDATED ACTIVATION METHODS (User-based) ==========

  async createActivation(activation: Omit<Activation, 'id' | 'activatedAt'>): Promise<Activation> {
    const prismaActivation = await prisma.activation.create({
      data: {
        userId: activation.userId,
        licenseId: activation.licenseId,
        deviceId: activation.deviceId,
        deviceInfo: activation.deviceInfo ?? undefined,
        metadata: activation.metadata ?? undefined,
        lastCheckedAt: new Date(),
      },
    });
    return prismaActivationToActivation(prismaActivation);
  }

  async getActivationsByUserAndLicense(userId: string, licenseId: string): Promise<Activation[]> {
    const prismaActivations = await prisma.activation.findMany({
      where: { userId, licenseId },
      orderBy: { activatedAt: 'desc' },
    });
    return prismaActivations.map(a => ({
      id: a.id,
      userId: a.userId,
      licenseId: a.licenseId,
      deviceId: a.deviceId || undefined,
      deviceInfo: a.deviceInfo as Record<string, any> | undefined,
      activatedAt: a.activatedAt,
      lastCheckedAt: a.lastCheckedAt || undefined,
      metadata: a.metadata as Record<string, any> | undefined,
    }));
  }

  async updateActivation(id: string, updates: Partial<Activation>): Promise<Activation | undefined> {
    const updateData: any = {};

    if (updates.deviceId !== undefined) updateData.deviceId = updates.deviceId;
    if (updates.deviceInfo !== undefined) updateData.deviceInfo = updates.deviceInfo ?? undefined;
    if (updates.lastCheckedAt !== undefined) updateData.lastCheckedAt = updates.lastCheckedAt;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata ?? undefined;

    try {
      const prismaActivation = await prisma.activation.update({
        where: { id },
        data: updateData,
      });
      return prismaActivationToActivation(prismaActivation);
    } catch (error) {
      return undefined;
    }
  }
}

export const db = new PrismaDB();
