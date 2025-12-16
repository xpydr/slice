const API_BASE_URL = 'http://localhost:3001/api/v1/admin';

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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

// Get current authenticated user
export async function getCurrentUser(): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include', // Include cookies in request
    });

    // Parse JSON response regardless of status code (server returns JSON even on errors)
    let data: ApiResponse<LoginResponse>;
    try {
      data = await response.json();
    } catch (parseError) {
      // If JSON parsing fails, return error response
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }

    // If response is not ok, ensure we return success: false
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return data;
  } catch (error) {
    // Network errors or other fetch failures
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
  website?: string
): Promise<ApiResponse<RegisterResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify({ name, email, password, website }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

// Logout - clears session cookie
export async function logout(): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies in request
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
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
    const response = await fetch(`${API_BASE_URL}/auth/send-verification-code`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

export async function verifyEmail(code: string): Promise<ApiResponse<VerifyEmailResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

export async function resendVerificationCode(): Promise<ApiResponse<SendVerificationCodeResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification-code`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
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
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, description }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

export async function getProducts(): Promise<ApiResponse<Product[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
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
    const response = await fetch(`${API_BASE_URL}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        productId,
        name,
        description,
        maxSeats,
        expiresInDays,
        features,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

export async function getPlans(productId?: string): Promise<ApiResponse<Plan[]>> {
  try {
    const url = productId
      ? `${API_BASE_URL}/plans?productId=${encodeURIComponent(productId)}`
      : `${API_BASE_URL}/plans`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

export async function getPlan(id: string): Promise<ApiResponse<Plan>> {
  try {
    const response = await fetch(`${API_BASE_URL}/plans/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// ========== LICENSES API ==========

export async function createLicense(
  planId: string,
  expiresInDays?: number
): Promise<ApiResponse<License>> {
  try {
    const response = await fetch(`${API_BASE_URL}/licenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ planId, expiresInDays }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

export async function getLicenses(planId?: string): Promise<ApiResponse<License[]>> {
  try {
    const url = planId
      ? `${API_BASE_URL}/licenses?planId=${encodeURIComponent(planId)}`
      : `${API_BASE_URL}/licenses`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

export async function getLicenseUsage(id: string): Promise<ApiResponse<LicenseUsage>> {
  try {
    const response = await fetch(`${API_BASE_URL}/licenses/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// ========== USERS API ==========

export async function getUsers(externalId?: string): Promise<ApiResponse<LaaSUser[]>> {
  try {
    const url = externalId
      ? `${API_BASE_URL}/users?externalId=${encodeURIComponent(externalId)}`
      : `${API_BASE_URL}/users`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// ========== AUDIT LOGS API ==========

export async function getAuditLogs(
  entityType?: string,
  entityId?: string
): Promise<ApiResponse<AuditLog[]>> {
  try {
    const params = new URLSearchParams();
    if (entityType) params.append('entityType', entityType);
    if (entityId) params.append('entityId', entityId);
    const queryString = params.toString();
    const url = queryString
      ? `${API_BASE_URL}/audit-logs?${queryString}`
      : `${API_BASE_URL}/audit-logs`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
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

const BILLING_API_BASE_URL = 'http://localhost:3001/api/v1/billing';

export async function createCheckoutSession(
  priceId: string
): Promise<ApiResponse<CreateCheckoutSessionResponse>> {
  try {
    const response = await fetch(`${BILLING_API_BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ priceId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

export async function getSubscription(): Promise<ApiResponse<Subscription | null>> {
  try {
    const response = await fetch(`${BILLING_API_BASE_URL}/subscription`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

export async function cancelSubscription(): Promise<ApiResponse<{ message: string; cancelAtPeriodEnd: boolean }>> {
  try {
    const response = await fetch(`${BILLING_API_BASE_URL}/cancel-subscription`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

