import { HttpClient } from '../client';
import type { CreateUserRequest, LaaSUser } from '../types';

export class UserMethods {
  constructor(private client: HttpClient) {}

  /**
   * Create a new user
   * 
   * @param params - User creation parameters
   * @param params.externalId - The tenant's internal user ID (required)
   * @param params.email - User's email address (optional)
   * @param params.name - User's name (optional)
   * @param params.metadata - Additional metadata (optional)
   * @returns Promise resolving to the created user
   * 
   * @example
   * ```typescript
   * const user = await client.createUser({
   *   externalId: 'user_123',
   *   email: 'user@example.com',
   *   name: 'John Doe'
   * });
   * ```
   */
  async createUser(params: CreateUserRequest): Promise<LaaSUser> {
    if (!params.externalId || typeof params.externalId !== 'string') {
      throw new Error('externalId must be a non-empty string');
    }

    const response = await this.client.post<LaaSUser>(
      '/api/v1/admin/users',
      params
    );

    return response.data;
  }
}

