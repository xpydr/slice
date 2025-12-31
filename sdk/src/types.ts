// Re-export shared types from the shared package
export type {
  // Core types
  Tenant,
  TenantApiKey,
  LaaSUser,
  Product,
  Plan,
  License,
  LicenseStatus,
  UserLicense,
  Activation,
  AuditLog,
  AuditLogAction,
  
  // Request/Response types
  ValidateLicenseRequest,
  ValidateLicenseResponse,
  CreateUserRequest,
  AssignLicenseRequest,
  ApiResponse,
} from '../../shared/api-types';

// SDK-specific types
export interface SliceClientOptions {
  /**
   * Base URL for the API (defaults to process.env.SLICE_API_URL or 'http://localhost:3001')
   */
  baseUrl?: string;
  
  /**
   * Timeout for requests in milliseconds (defaults to 30000)
   */
  timeout?: number;
}

export interface SliceRequestOptions {
  /**
   * Additional headers to include in the request
   */
  headers?: Record<string, string>;
  
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
}

