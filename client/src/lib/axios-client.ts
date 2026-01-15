/**
 * Axios client instance with interceptors for logging and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from './logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const BILLING_URL = process.env.NEXT_PUBLIC_BILLING_URL;

// Create main API axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Create billing API axios instance
export const billingClient: AxiosInstance = axios.create({
  baseURL: BILLING_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for main API client
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const startTime = Date.now();
    (config as any).startTime = startTime;

    logger.trackApiRequest(
      config.method?.toUpperCase() || 'UNKNOWN',
      config.url || '',
      {
        baseURL: config.baseURL,
        headers: config.headers ? Object.keys(config.headers) : [],
      }
    );

    return config;
  },
  (error: AxiosError) => {
    logger.trackApiError('REQUEST', error.config?.url || 'unknown', error as Error, {
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Response interceptor for main API client
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const startTime = (response.config as any).startTime;
    const duration = startTime ? Date.now() - startTime : undefined;

    logger.trackApiResponse(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      response.config.url || '',
      response.status,
      duration,
      {
        dataSize: JSON.stringify(response.data).length,
      }
    );

    return response;
  },
  (error: AxiosError) => {
    const startTime = (error.config as any)?.startTime;
    const duration = startTime ? Date.now() - startTime : undefined;

    const errorMessage = error.response?.data
      ? (error.response.data as any)?.error || error.message
      : error.message;

    logger.trackApiError(
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      error.config?.url || 'unknown',
      error as Error,
      {
        status: error.response?.status,
        statusText: error.response?.statusText,
        duration,
        errorMessage,
      }
    );

    return Promise.reject(error);
  }
);

// Request interceptor for billing client
billingClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const startTime = Date.now();
    (config as any).startTime = startTime;

    logger.trackApiRequest(
      config.method?.toUpperCase() || 'UNKNOWN',
      config.url || '',
      {
        baseURL: config.baseURL,
        service: 'billing',
      }
    );

    return config;
  },
  (error: AxiosError) => {
    logger.trackApiError('REQUEST', error.config?.url || 'unknown', error as Error, {
      message: error.message,
      service: 'billing',
    });
    return Promise.reject(error);
  }
);

// Response interceptor for billing client
billingClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const startTime = (response.config as any).startTime;
    const duration = startTime ? Date.now() - startTime : undefined;

    logger.trackApiResponse(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      response.config.url || '',
      response.status,
      duration,
      {
        service: 'billing',
        dataSize: JSON.stringify(response.data).length,
      }
    );

    return response;
  },
  (error: AxiosError) => {
    const startTime = (error.config as any)?.startTime;
    const duration = startTime ? Date.now() - startTime : undefined;

    const errorMessage = error.response?.data
      ? (error.response.data as any)?.error || error.message
      : error.message;

    logger.trackApiError(
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      error.config?.url || 'unknown',
      error as Error,
      {
        status: error.response?.status,
        statusText: error.response?.statusText,
        duration,
        errorMessage,
        service: 'billing',
      }
    );

    return Promise.reject(error);
  }
);
