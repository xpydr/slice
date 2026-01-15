import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
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
  private axiosInstance: AxiosInstance;

  constructor(apiKey: string, baseUrl: string, defaultTimeout: number = 30000) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultTimeout = defaultTimeout;

    // Create Axios instance
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: this.defaultTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const startTime = Date.now();
        (config as any).startTime = startTime;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging and error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const startTime = (response.config as any).startTime;
        const duration = startTime ? Date.now() - startTime : undefined;
        // Log successful requests in development
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[SDK] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
        }
        return response;
      },
      (error: AxiosError) => {
        const startTime = (error.config as any)?.startTime;
        const duration = startTime ? Date.now() - startTime : undefined;
        
        // Log errors
        if (process.env.NODE_ENV !== 'production') {
          console.error(`[SDK] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error (${duration}ms):`, error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make an HTTP request
   */
  async request<T>(
    method: string,
    path: string,
    options: SliceRequestOptions = {}
  ): Promise<HttpClientResponse<T>> {
    const timeout = options.timeout ?? this.defaultTimeout;

    const config: AxiosRequestConfig = {
      method: method as any,
      url: path,
      timeout,
      headers: {
        ...options.headers,
      },
    };

    try {
      const response = await this.axiosInstance.request<T>(config);

      // Extract data from ApiResponse wrapper if present
      const responseData = (response.data as any)?.data !== undefined 
        ? (response.data as any).data 
        : response.data;

      // Convert Axios headers to Headers object for compatibility
      const headers = new Headers();
      Object.entries(response.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers.set(key, value);
        } else if (Array.isArray(value)) {
          headers.set(key, value.join(', '));
        }
      });

      return {
        data: responseData as T,
        status: response.status,
        statusText: response.statusText,
        headers,
      };
    } catch (error: any) {
      return this.handleError(error, timeout);
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
    const timeout = options?.timeout ?? this.defaultTimeout;

    const config: AxiosRequestConfig = {
      method: 'POST',
      url: path,
      data: body,
      timeout,
      headers: {
        ...options?.headers,
      },
    };

    try {
      const response = await this.axiosInstance.request<T>(config);
      return this.handleResponse<T>(response);
    } catch (error: any) {
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
    const timeout = options?.timeout ?? this.defaultTimeout;

    const config: AxiosRequestConfig = {
      method: 'PATCH',
      url: path,
      data: body,
      timeout,
      headers: {
        ...options?.headers,
      },
    };

    try {
      const response = await this.axiosInstance.request<T>(config);
      return this.handleResponse<T>(response);
    } catch (error: any) {
      return this.handleError(error, timeout);
    }
  }

  /**
   * Handle Axios response
   */
  private handleResponse<T>(response: AxiosResponse): HttpClientResponse<T> {
    // Extract data from ApiResponse wrapper if present
    const responseData = (response.data as any)?.data !== undefined 
      ? (response.data as any).data 
      : response.data;

    // Convert Axios headers to Headers object for compatibility
    const headers = new Headers();
    Object.entries(response.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(', '));
      }
    });

    return {
      data: responseData as T,
      status: response.status,
      statusText: response.statusText,
      headers,
    };
  }

  /**
   * Handle errors from Axios
   */
  private handleError(error: any, timeout: number): never {
    // Handle Axios timeout
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new SliceTimeoutError(`Request timeout after ${timeout}ms`);
      }

      // Handle HTTP error responses
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        const errorMessage = data?.error || data?.message || `HTTP ${status}: ${error.response.statusText}`;

        if (status === 401 || status === 403) {
          throw new SliceAuthenticationError(errorMessage, status, data);
        } else if (status === 400) {
          throw new SliceValidationError(errorMessage, data);
        } else {
          throw new SliceAPIError(errorMessage, status, data);
        }
      }

      // Handle network errors (no response)
      if (error.request) {
        throw new SliceNetworkError('Network error: Failed to connect to API', error);
      }
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

    // Unknown error
    throw new SliceNetworkError(error?.message || 'Unknown error occurred', error);
  }
}
