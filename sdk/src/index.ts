import { HttpClient } from './client';
import { ValidateMethods } from './methods/validate';
import { UserMethods } from './methods/users';
import { LicenseMethods } from './methods/licenses';
import type { SliceClientOptions } from './types';

// Re-export types for convenience
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
  
  // SDK-specific types
  SliceClientOptions,
} from './types';

// Re-export error classes
export {
  SliceError,
  SliceAPIError,
  SliceAuthenticationError,
  SliceValidationError,
  SliceNetworkError,
  SliceTimeoutError,
} from './errors';

/**
 * Slice Client - Main SDK class for interacting with the Slice LaaS API
 * 
 * @example
 * ```typescript
 * import { SliceClient } from '@sliceapi/sdk';
 * 
 * const client = new SliceClient('sk_live_...', {
 *   baseUrl: 'https://api.example.com'
 * });
 * 
 * // Validate a user's license
 * const result = await client.validate.validate('user_123');
 * 
 * // Create a user
 * const user = await client.users.createUser({
 *   externalId: 'user_123',
 *   email: 'user@example.com'
 * });
 * 
 * // Assign a license
 * const assignment = await client.licenses.assignLicense('license_123', 'user_123');
 * ```
 */
export class SliceClient {
  private client: HttpClient;
  public readonly validate: ValidateMethods;
  public readonly users: UserMethods;
  public readonly licenses: LicenseMethods;

  /**
   * Create a new SliceClient instance
   * 
   * @param apiKey - Your Slice API key (starts with 'sk_live_' or 'sk_test_')
   * @param options - Optional configuration
   * @param options.baseUrl - Base URL for the API (defaults to process.env.SLICE_API_URL or 'http://localhost:3001')
   * @param options.timeout - Request timeout in milliseconds (defaults to 30000)
   * 
   * @example
   * ```typescript
   * // Using default settings
   * const client = new SliceClient('sk_live_...');
   * 
   * // With custom base URL
   * const client = new SliceClient('sk_live_...', {
   *   baseUrl: 'https://api.example.com'
   * });
   * 
   * // Use method groups
   * const result = await client.validate.validate('user_123');
   * const user = await client.users.createUser({ externalId: 'user_123' });
   * ```
   */
  constructor(apiKey: string, options?: SliceClientOptions) {
    // Determine base URL
    let baseUrl: string = options?.baseUrl || 'http://localhost:3001';
    if (!options?.baseUrl) {
      // Check for process.env in Node.js environment
      // @ts-ignore - process may not be defined in browser environments
      const envUrl = typeof process !== 'undefined' && process?.env?.SLICE_API_URL;
      if (envUrl) {
        baseUrl = envUrl;
      }
    }

    // Create HTTP client
    this.client = new HttpClient(apiKey, baseUrl, options?.timeout);

    // Initialize method groups
    this.validate = new ValidateMethods(this.client);
    this.users = new UserMethods(this.client);
    this.licenses = new LicenseMethods(this.client);
  }
}

// Default export
export default SliceClient;

