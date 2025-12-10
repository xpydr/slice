// Re-export shared types and add server-specific types
export * from '../../shared/api-types';
import type { 
  Product, 
  Plan, 
  License, 
  Activation, 
  AuditLog,
  Tenant,
  TenantApiKey,
  LaaSUser,
  UserLicense
} from '../../shared/api-types';

export interface Database {
  tenants: Map<string, Tenant>;
  products: Map<string, Product>;
  plans: Map<string, Plan>;
  licenses: Map<string, License>;
  activations: Map<string, Activation>;
  auditLogs: AuditLog[];
}

// Extended types for internal use
export interface TenantWithApiKey extends Tenant {
  apiKeyId: string;
  apiKeyStatus: string;
  apiKeyExpiresAt?: Date;
}

export interface TenantSession {
  id: string;
  tenantId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
  revokedAt?: Date;
}
