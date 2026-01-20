// Re-export shared types and add server-specific types
export * from '@slice/shared/api-types';
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
} from '@slice/shared/api-types';

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
