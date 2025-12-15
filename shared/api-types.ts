export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// LaaS Platform Types - Multi-tenant Licensing as a Service

// Tenant represents a business/customer using the LaaS platform
export interface Tenant {
  id: string;
  name: string;
  email: string; // Required for login
  website?: string;
  status: 'active' | 'suspended' | 'inactive';
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// API Key for tenant authentication
export interface TenantApiKey {
  id: string;
  tenantId: string;
  name: string;
  keyPrefix: string; // First 8 chars for identification
  lastUsedAt?: Date;
  expiresAt?: Date;
  status: 'active' | 'revoked' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

// User belongs to a tenant (replaces installId concept)
export interface LaaSUser {
  id: string;
  tenantId: string;
  externalId: string; // Customer's internal user ID
  email?: string;
  name?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Product belongs to a tenant
export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  productId: string;
  name: string;
  description?: string;
  // License configuration
  maxSeats?: number; // undefined = unlimited
  expiresInDays?: number; // undefined = never expires
  features?: string[]; // feature flags
  createdAt: Date;
  updatedAt: Date;
}

export type LicenseStatus = 'active' | 'suspended' | 'revoked' | 'expired';

// License is assigned to users
export interface License {
  id: string;
  productId: string;
  planId: string;
  status: LicenseStatus;
  // Configuration from plan (snapshot at creation)
  maxSeats?: number;
  expiresAt?: Date;
  features?: string[];
  // Metadata
  createdBy?: string; // admin user ID
  createdAt: Date;
  updatedAt: Date;
}

// User-License relationship
export interface UserLicense {
  id: string;
  userId: string;
  licenseId: string;
  assignedAt: Date;
  assignedBy?: string;
  metadata?: Record<string, any>;
}

export interface Activation {
  id: string;
  userId: string;
  licenseId: string;
  activatedAt: Date;
  lastCheckedAt?: Date;
  metadata?: Record<string, any>;
}

export type AuditLogAction = 
  | 'tenant.created'
  | 'tenant.updated'
  | 'tenant.suspended'
  | 'api_key.created'
  | 'api_key.revoked'
  | 'user.created'
  | 'user.updated'
  | 'license.created'
  | 'license.assigned'
  | 'license.activated'
  | 'license.validated'
  | 'license.suspended'
  | 'license.revoked'
  | 'license.reactivated'
  | 'product.created'
  | 'plan.created';

export interface AuditLog {
  id: string;
  tenantId?: string;
  action: AuditLogAction;
  entityType: 'tenant' | 'api_key' | 'user' | 'license' | 'product' | 'plan' | 'activation';
  entityId: string;
  metadata?: Record<string, any>;
  performedBy?: string;
  timestamp: Date;
}

// API Request/Response Types

// New LaaS validation request (uses API key + userId)
export interface ValidateLicenseRequest {
  userId: string; // Customer's internal user ID
}

// Validation response
export type ValidateLicenseResponse = 
  | { valid: true; license: License; activation?: Activation; features?: string[] }
  | { valid: false; reason: 'expired' | 'revoked' | 'suspended' | 'exceeded_seats' | 'no_license' | 'user_not_found' };

// Tenant management requests
export interface CreateTenantRequest {
  name: string;
  email?: string;
  website?: string;
  metadata?: Record<string, any>;
}

// Tenant registration request (for self-registration with password)
export interface RegisterTenantRequest {
  name: string;
  email: string;
  password: string;
  website?: string;
  metadata?: Record<string, any>;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response
export interface LoginResponse {
  success: boolean;
  data?: {
    tenant: Tenant;
    token?: string; // Optional, deprecated - token is now in HTTP-only cookie
    requiresVerification?: boolean; // True if email verification is required
  };
  error?: string;
}

// Email verification request
export interface VerifyEmailRequest {
  code: string;
}

// Email verification response
export interface VerifyEmailResponse {
  success: boolean;
}

// Send verification code response
export interface SendVerificationCodeResponse {
  success: boolean;
}

export interface CreateApiKeyRequest {
  name: string;
  expiresInDays?: number;
}

// User management requests
export interface CreateUserRequest {
  externalId: string;
  email?: string;
  name?: string;
  metadata?: Record<string, any>;
}

// License assignment
export interface AssignLicenseRequest {
  userId: string;
  licenseId: string;
  metadata?: Record<string, any>;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
}

export interface CreatePlanRequest {
  productId: string;
  name: string;
  description?: string;
  maxSeats?: number;
  expiresInDays?: number;
  features?: string[];
}

// Create license (no key generation needed)
export interface CreateLicenseRequest {
  planId: string;
  expiresInDays?: number; // Override plan default
}

export interface LicenseUsage {
  license: License;
  activations: Activation[];
  totalActivations: number;
  activeSeats: number;
}
