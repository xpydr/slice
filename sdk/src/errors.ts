/**
 * Base error class for all Slice SDK errors
 */
export class SliceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SliceError';
    Object.setPrototypeOf(this, SliceError.prototype);
  }
}

/**
 * Error thrown when API returns an error response (4xx, 5xx)
 */
export class SliceAPIError extends SliceError {
  public readonly statusCode: number;
  public readonly response?: any;

  constructor(message: string, statusCode: number, response?: any) {
    super(message);
    this.name = 'SliceAPIError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, SliceAPIError.prototype);
  }
}

/**
 * Error thrown when authentication fails (401, 403)
 */
export class SliceAuthenticationError extends SliceAPIError {
  constructor(message: string, statusCode: number = 401, response?: any) {
    super(message, statusCode, response);
    this.name = 'SliceAuthenticationError';
    Object.setPrototypeOf(this, SliceAuthenticationError.prototype);
  }
}

/**
 * Error thrown when validation fails (400)
 */
export class SliceValidationError extends SliceAPIError {
  constructor(message: string, response?: any) {
    super(message, 400, response);
    this.name = 'SliceValidationError';
    Object.setPrototypeOf(this, SliceValidationError.prototype);
  }
}

/**
 * Error thrown when a network error occurs
 */
export class SliceNetworkError extends SliceError {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'SliceNetworkError';
    this.originalError = originalError;
    Object.setPrototypeOf(this, SliceNetworkError.prototype);
  }
}

/**
 * Error thrown when a request times out
 */
export class SliceTimeoutError extends SliceError {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'SliceTimeoutError';
    Object.setPrototypeOf(this, SliceTimeoutError.prototype);
  }
}

