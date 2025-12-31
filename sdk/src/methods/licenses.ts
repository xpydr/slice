import { HttpClient } from '../client';
import type { License, LicenseStatus, UserLicense } from '../types';

export class LicenseMethods {
  constructor(private client: HttpClient) {}

  /**
   * Assign a license to a user
   * 
   * @param licenseId - The license ID to assign
   * @param userId - The user ID to assign the license to
   * @param metadata - Optional metadata for the assignment
   * @returns Promise resolving to the user-license relationship
   * 
   * @example
   * ```typescript
   * const assignment = await client.assignLicense('license_123', 'user_456', {
   *   source: 'admin_panel'
   * });
   * ```
   */
  async assignLicense(
    licenseId: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<UserLicense> {
    if (!licenseId || typeof licenseId !== 'string') {
      throw new Error('licenseId must be a non-empty string');
    }

    if (!userId || typeof userId !== 'string') {
      throw new Error('userId must be a non-empty string');
    }

    const response = await this.client.post<UserLicense>(
      `/api/v1/admin/licenses/${encodeURIComponent(licenseId)}/assign`,
      { userId, metadata }
    );

    return response.data;
  }

  /**
   * Update a license's status
   * 
   * @param licenseId - The license ID to update
   * @param status - The new status for the license
   * @returns Promise resolving to the updated license
   * 
   * @example
   * ```typescript
   * const license = await client.updateLicenseStatus('license_123', 'suspended');
   * ```
   */
  async updateLicenseStatus(
    licenseId: string,
    status: LicenseStatus
  ): Promise<License> {
    if (!licenseId || typeof licenseId !== 'string') {
      throw new Error('licenseId must be a non-empty string');
    }

    const validStatuses: LicenseStatus[] = ['active', 'suspended', 'revoked', 'expired'];
    if (!validStatuses.includes(status)) {
      throw new Error(`status must be one of: ${validStatuses.join(', ')}`);
    }

    const response = await this.client.patch<License>(
      `/api/v1/admin/licenses/${encodeURIComponent(licenseId)}/status`,
      { status }
    );

    return response.data;
  }
}

