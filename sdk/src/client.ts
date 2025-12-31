import {
  SliceAPIError,
  SliceAuthenticationError,
  SliceNetworkError,
  SliceTimeoutError,
  SliceValidationError,
} from './errors';
import type { SliceRequestOptions } from './types';

export interface HttpClientResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export class HttpClient {
  private apiKey: string;
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(apiKey: string, baseUrl: string, defaultTimeout: number = 30000) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * Make an HTTP request
   */
  async request<T>(
    method: string,
    path: string,
    options: SliceRequestOptions = {}
  ): Promise<HttpClientResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const timeout = options.timeout ?? this.defaultTimeout;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response body
      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          // If JSON parsing fails, use text
          data = await response.text();
        }
      } else {
        data = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
        
        if (response.status === 401 || response.status === 403) {
          throw new SliceAuthenticationError(errorMessage, response.status, data);
        } else if (response.status === 400) {
          throw new SliceValidationError(errorMessage, data);
        } else {
          throw new SliceAPIError(errorMessage, response.status, data);
        }
      }

      // Extract data from ApiResponse wrapper if present
      const responseData = data?.data !== undefined ? data.data : data;

      return {
        data: responseData as T,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle AbortError (timeout)
      if (error.name === 'AbortError') {
        throw new SliceTimeoutError(`Request timeout after ${timeout}ms`);
      }

      // Re-throw our custom errors
      if (
        error instanceof SliceAPIError ||
        error instanceof SliceAuthenticationError ||
        error instanceof SliceValidationError ||
        error instanceof SliceNetworkError ||
        error instanceof SliceTimeoutError
      ) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new SliceNetworkError('Network error: Failed to connect to API', error);
      }

      // Unknown error
      throw new SliceNetworkError(
        error?.message || 'Unknown error occurred',
        error
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string, options?: SliceRequestOptions): Promise<HttpClientResponse<T>> {
    return this.request<T>('GET', path, options);
  }

  /**
   * POST request
   */
  async post<T>(
    path: string,
    body?: any,
    options?: SliceRequestOptions
  ): Promise<HttpClientResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const timeout = options?.timeout ?? this.defaultTimeout;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options?.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      return this.handleError(error, timeout);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(
    path: string,
    body?: any,
    options?: SliceRequestOptions
  ): Promise<HttpClientResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const timeout = options?.timeout ?? this.defaultTimeout;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options?.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      return this.handleError(error, timeout);
    }
  }

  /**
   * Handle fetch response
   */
  private async handleResponse<T>(response: Response): Promise<HttpClientResponse<T>> {
    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        data = await response.text();
      }
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
      
      if (response.status === 401 || response.status === 403) {
        throw new SliceAuthenticationError(errorMessage, response.status, data);
      } else if (response.status === 400) {
        throw new SliceValidationError(errorMessage, data);
      } else {
        throw new SliceAPIError(errorMessage, response.status, data);
      }
    }

    const responseData = data?.data !== undefined ? data.data : data;

    return {
      data: responseData as T,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * Handle errors from fetch
   */
  private handleError(error: any, timeout: number): never {
    if (error.name === 'AbortError') {
      throw new SliceTimeoutError(`Request timeout after ${timeout}ms`);
    }

    if (
      error instanceof SliceAPIError ||
      error instanceof SliceAuthenticationError ||
      error instanceof SliceValidationError ||
      error instanceof SliceNetworkError ||
      error instanceof SliceTimeoutError
    ) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new SliceNetworkError('Network error: Failed to connect to API', error);
    }

    throw new SliceNetworkError(error?.message || 'Unknown error occurred', error);
  }
}

