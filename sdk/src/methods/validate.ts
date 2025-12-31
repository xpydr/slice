import { HttpClient } from '../client';
import type { ValidateLicenseResponse } from '../types';

export class ValidateMethods {
  constructor(private client: HttpClient) {}

  /**
   * Validate a user's license
   * 
   * @param userId - The tenant's internal user ID
   * @returns Promise resolving to the validation response
   * 
   * @example
   * ```typescript
   * const result = await client.validate('user_123');
   * if (result.valid) {
   *   console.log('License is valid:', result.license);
   * } else {
   *   console.log('License invalid:', result.reason);
   * }
   * ```
   */
  async validate(userId: string): Promise<ValidateLicenseResponse> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('userId must be a non-empty string');
    }

    const response = await this.client.post<ValidateLicenseResponse>(
      '/api/v1/validate',
      { userId }
    );

    return response.data;
  }
}

