import { apiClient, billingClient } from './axios-client';
import { AxiosError } from 'axios';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

/**
 * Helper function to get admin API key from environment variable
 * Throws error if not configured (should only be used in admin functions)
 */
function getAdminApiKey(): string {
  if (!ADMIN_API_KEY) {
    throw new Error('ADMIN_API_KEY environment variable is not set');
  }
  return ADMIN_API_KEY;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tenant: {
    id: string;
    name: string;
    email: string;
    website?: string;
    status: 'active' | 'suspended' | 'inactive';
    emailVerified: boolean;
    emailVerifiedAt?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
  };
  requiresVerification?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  website?: string;
  metadata?: Record<string, any>;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  website?: string;
  status: 'active' | 'suspended' | 'inactive';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export async function login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getCurrentUser(): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await apiClient.get<ApiResponse<LoginResponse>>('/auth/me');
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
  website?: string
): Promise<ApiResponse<RegisterResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', {
      name,
      email,
      password,
      website,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function logout(): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout');
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ========== EMAIL VERIFICATION API ==========

export interface VerifyEmailResponse {
  success: boolean;
  data?: {
    tenant: LoginResponse['tenant'];
  };
}

export interface SendVerificationCodeResponse {
  success: boolean;
  message?: string;
}

export async function sendVerificationCode(): Promise<ApiResponse<SendVerificationCodeResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<SendVerificationCodeResponse>>('/auth/send-verification-code');
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function verifyEmail(code: string): Promise<ApiResponse<VerifyEmailResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<VerifyEmailResponse>>('/auth/verify-email', { code });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function resendVerificationCode(): Promise<ApiResponse<SendVerificationCodeResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<SendVerificationCodeResponse>>('/auth/resend-verification-code');
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ========== DASHBOARD TYPES ==========

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  productId: string;
  name: string;
  description?: string;
  maxSeats?: number;
  expiresInDays?: number;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface License {
  id: string;
  productId: string;
  planId: string;
  status: 'active' | 'suspended' | 'revoked' | 'expired';
  maxSeats?: number;
  expiresAt?: string;
  features?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activation {
  id: string;
  userId: string;
  licenseId: string;
  activatedAt: string;
  lastCheckedAt?: string;
  metadata?: Record<string, any>;
}

export interface LicenseUsage {
  license: License;
  activations: Activation[];
  totalActivations: number;
  activeSeats: number;
}

export interface LaaSUser {
  id: string;
  tenantId: string;
  externalId: string;
  email?: string;
  name?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  performedBy?: string;
  timestamp: string;
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

export interface CreateLicenseRequest {
  planId: string;
  expiresInDays?: number;
}

// ========== PRODUCTS API ==========

export async function createProduct(
  name: string,
  description?: string
): Promise<ApiResponse<Product>> {
  try {
    const response = await apiClient.post<ApiResponse<Product>>('/products', { name, description });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getProducts(): Promise<ApiResponse<Product[]>> {
  try {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products');
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  try {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ========== PLANS API ==========

export async function createPlan(
  productId: string,
  name: string,
  description?: string,
  maxSeats?: number,
  expiresInDays?: number,
  features?: string[]
): Promise<ApiResponse<Plan>> {
  try {
    const response = await apiClient.post<ApiResponse<Plan>>('/plans', {
      productId,
      name,
      description,
      maxSeats,
      expiresInDays,
      features,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getPlans(productId?: string): Promise<ApiResponse<Plan[]>> {
  try {
    const response = await apiClient.get<ApiResponse<Plan[]>>('/plans', {
      params: productId ? { productId } : undefined,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getPlan(id: string): Promise<ApiResponse<Plan>> {
  try {
    const response = await apiClient.get<ApiResponse<Plan>>(`/plans/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ========== LICENSES API ==========

export async function createLicense(
  planId: string,
  expiresInDays?: number
): Promise<ApiResponse<License>> {
  try {
    const response = await apiClient.post<ApiResponse<License>>('/licenses', { planId, expiresInDays });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getLicenses(planId?: string): Promise<ApiResponse<License[]>> {
  try {
    const response = await apiClient.get<ApiResponse<License[]>>('/licenses', {
      params: planId ? { planId } : undefined,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getLicenseUsage(id: string): Promise<ApiResponse<LicenseUsage>> {
  try {
    const response = await apiClient.get<ApiResponse<LicenseUsage>>(`/licenses/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface UserLicense {
  id: string;
  userId: string;
  licenseId: string;
  assignedAt: string;
  assignedBy?: string;
  metadata?: Record<string, any>;
}

export async function assignLicense(
  licenseId: string,
  userId: string,
  metadata?: Record<string, any>
): Promise<ApiResponse<UserLicense>> {
  try {
    const response = await apiClient.post<ApiResponse<UserLicense>>(`/licenses/${licenseId}/assign`, {
      userId,
      metadata,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ========== USERS API ==========

export async function getUsers(externalId?: string): Promise<ApiResponse<LaaSUser[]>> {
  try {
    const response = await apiClient.get<ApiResponse<LaaSUser[]>>('/users', {
      params: externalId ? { externalId } : undefined,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ========== AUDIT LOGS API ==========

export async function getAuditLogs(
  entityType?: string,
  entityId?: string
): Promise<ApiResponse<AuditLog[]>> {
  try {
    const params: Record<string, string> = {};
    if (entityType) params.entityType = entityType;
    if (entityId) params.entityId = entityId;
    
    const response = await apiClient.get<ApiResponse<AuditLog[]>>('/audit-logs', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ========== BILLING API ==========

export interface Subscription {
  id: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  planId: string;
  planName?: string;
}

export interface CreateCheckoutSessionRequest {
  priceId: string;
}

export interface CreateCheckoutSessionResponse {
  clientSecret: string;
  sessionId: string;
}

export async function createCheckoutSession(
  priceId: string
): Promise<ApiResponse<CreateCheckoutSessionResponse>> {
  try {
    const response = await billingClient.post<ApiResponse<CreateCheckoutSessionResponse>>('/create-checkout-session', {
      priceId,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getSubscription(): Promise<ApiResponse<Subscription | null>> {
  try {
    const response = await billingClient.get<ApiResponse<Subscription | null>>('/subscription');
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function cancelSubscription(): Promise<ApiResponse<{ message: string; cancelAtPeriodEnd: boolean }>> {
  try {
    const response = await billingClient.post<ApiResponse<{ message: string; cancelAtPeriodEnd: boolean }>>('/cancel-subscription');
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface CreateBillingPortalSessionResponse {
  url: string;
}

export async function createBillingPortalSession(): Promise<ApiResponse<CreateBillingPortalSessionResponse>> {
  try {
    const response = await billingClient.post<ApiResponse<CreateBillingPortalSessionResponse>>('/create-billing-portal-session');
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ========== API KEYS API ==========

export interface TenantApiKey {
  id: string;
  tenantId: string;
  name: string;
  keyPrefix: string; // First 8 chars for identification
  lastUsedAt?: string;
  expiresAt?: string;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyRequest {
  name?: string;
  expiresInDays?: number;
}

export interface CreateApiKeyResponse {
  apiKey: string; // Plaintext key - shown only once!
  apiKeyRecord: TenantApiKey;
}

export async function createApiKey(
  name?: string,
  expiresInDays?: number
): Promise<ApiResponse<CreateApiKeyResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<CreateApiKeyResponse>>('/api-keys', {
      name,
      expiresInDays,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getApiKeys(): Promise<ApiResponse<TenantApiKey[]>> {
  try {
    const response = await apiClient.get<ApiResponse<TenantApiKey[]>>('/api-keys');
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ========== ADMIN API (Platform Admin) ==========
// These endpoints require ADMIN_API_KEY authentication
// Set NEXT_PUBLIC_ADMIN_API_KEY environment variable in your .env.local file

export interface Tenant {
  id: string;
  name: string;
  email: string;
  website?: string;
  status: 'active' | 'suspended' | 'inactive';
  emailVerified: boolean;
  emailVerifiedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  name: string;
  email?: string;
  website?: string;
  metadata?: Record<string, any>;
}

export interface CreateTenantApiKeyRequest {
  name: string;
  expiresInDays?: number;
}

export interface CreateTenantApiKeyResponse {
  apiKey: string; // Plaintext key - shown only once!
  apiKeyRecord: TenantApiKey;
}

/**
 * Create a new tenant (Platform Admin only)
 * Requires ADMIN_API_KEY in environment variable
 */
export async function createTenant(
  request: CreateTenantRequest
): Promise<ApiResponse<Tenant>> {
  try {
    const adminApiKey = getAdminApiKey();
    const response = await apiClient.post<ApiResponse<Tenant>>('/tenants', request, {
      headers: {
        'Authorization': `Bearer ${adminApiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get all tenants (Platform Admin only)
 * Requires ADMIN_API_KEY in environment variable
 */
export async function getAllTenants(): Promise<ApiResponse<Tenant[]>> {
  try {
    const adminApiKey = getAdminApiKey();
    const response = await apiClient.get<ApiResponse<Tenant[]>>('/tenants', {
      headers: {
        'Authorization': `Bearer ${adminApiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get tenant by ID (Platform Admin only)
 * Requires ADMIN_API_KEY in environment variable
 */
export async function getTenantById(id: string): Promise<ApiResponse<Tenant>> {
  try {
    const adminApiKey = getAdminApiKey();
    const response = await apiClient.get<ApiResponse<Tenant>>(`/tenants/${id}`, {
      headers: {
        'Authorization': `Bearer ${adminApiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Create API key for a tenant (Platform Admin only)
 * Requires ADMIN_API_KEY in environment variable
 */
export async function createTenantApiKey(
  tenantId: string,
  request: CreateTenantApiKeyRequest
): Promise<ApiResponse<CreateTenantApiKeyResponse>> {
  try {
    const adminApiKey = getAdminApiKey();
    const response = await apiClient.post<ApiResponse<CreateTenantApiKeyResponse>>(`/tenants/${tenantId}/api-keys`, request, {
      headers: {
        'Authorization': `Bearer ${adminApiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? (error.response?.data as any)?.error || error.message
      : error instanceof Error ? error.message : 'Network error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

