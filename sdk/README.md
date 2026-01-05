# SliceAPI SDK

TypeScript SDK for the SliceAPI LaaS (Licensing as a Service) platform. This SDK provides a type-safe, cross-platform interface for integrating license validation and management into your applications.

## Features

- ✅ **Type Safe**: Full TypeScript support with exported types
- ✅ **Cross-Platform**: Works in both Node.js (18+) and browser environments
- ✅ **Modern**: Uses native `fetch` API
- ✅ **Error Handling**: Custom error classes with meaningful messages
- ✅ **Flexible**: Configurable base URL and timeout settings

## Installation

```bash
npm install @sliceapi/sdk
# or
yarn add @sliceapi/sdk
# or
pnpm add @sliceapi/sdk
```

## Quick Start

```typescript
import { SliceClient } from '@sliceapi/sdk';

// Initialize the client with your API key
const client = new SliceClient('sk_live_...', {
  baseUrl: 'https://api.example.com' // Optional, defaults to process.env.SLICE_API_URL or localhost
});

// Validate a user's license
const result = await client.validate.validate('user_123');

if (result.valid) {
  console.log('License is valid:', result.license);
  console.log('Features:', result.features);
} else {
  console.log('License invalid:', result.reason);
}
```

## Configuration

### Constructor Options

```typescript
interface SliceClientOptions {
  /**
   * Base URL for the API
   * Defaults to process.env.SLICE_API_URL or 'http://localhost:3001'
   */
  baseUrl?: string;
  
  /**
   * Request timeout in milliseconds
   * Defaults to 30000 (30 seconds)
   */
  timeout?: number;
}
```

### Environment Variables

- `SLICE_API_URL`: Base URL for the API (used if not provided in constructor)

## API Reference

### License Validation

#### `client.validate.validate(userId: string)`

Validates a user's license and returns the validation result.

```typescript
const result = await client.validate.validate('user_123');

if (result.valid) {
  // License is valid
  console.log(result.license);      // License object
  console.log(result.activation);   // Activation object (if exists)
  console.log(result.features);     // Array of feature flags
} else {
  // License is invalid
  console.log(result.reason);       // 'expired' | 'revoked' | 'suspended' | 'exceeded_seats' | 'no_license' | 'user_not_found'
}
```

**Response Types:**

```typescript
type ValidateLicenseResponse = 
  | { valid: true; license: License; activation?: Activation; features?: string[] }
  | { valid: false; reason: 'expired' | 'revoked' | 'suspended' | 'exceeded_seats' | 'no_license' | 'user_not_found' };
```

### User Management

#### `client.users.createUser(params: CreateUserRequest)`

Creates a new user in the system.

```typescript
const user = await client.users.createUser({
  externalId: 'user_123',           // Required: Your internal user ID
  email: 'user@example.com',        // Optional
  name: 'John Doe',                 // Optional
  metadata: {                        // Optional
    source: 'signup_form'
  }
});
```

**Request Type:**

```typescript
interface CreateUserRequest {
  externalId: string;              // Required: Tenant's internal user ID
  email?: string;                  // Optional
  name?: string;                   // Optional
  metadata?: Record<string, any>;  // Optional
}
```

### License Management

#### `client.licenses.assignLicense(licenseId: string, userId: string, metadata?: Record<string, any>)`

Assigns a license to a user.

```typescript
const assignment = await client.licenses.assignLicense(
  'license_123',                    // License ID
  'user_456',                       // User ID
  {                                 // Optional metadata
    source: 'admin_panel',
    assignedBy: 'admin_user_1'
  }
);
```

#### `client.licenses.updateLicenseStatus(licenseId: string, status: LicenseStatus)`

Updates a license's status.

```typescript
const license = await client.licenses.updateLicenseStatus(
  'license_123',
  'suspended'  // 'active' | 'suspended' | 'revoked' | 'expired'
);
```

## Error Handling

The SDK provides custom error classes for different error scenarios:

```typescript
import {
  SliceError,
  SliceAPIError,
  SliceAuthenticationError,
  SliceValidationError,
  SliceNetworkError,
  SliceTimeoutError,
} from '@sliceapi/sdk';

try {
  const result = await client.validate.validate('user_123');
} catch (error) {
  if (error instanceof SliceAuthenticationError) {
    // Invalid API key or authentication failed
    console.error('Auth error:', error.message, error.statusCode);
  } else if (error instanceof SliceValidationError) {
    // Invalid request parameters
    console.error('Validation error:', error.message);
  } else if (error instanceof SliceNetworkError) {
    // Network connectivity issue
    console.error('Network error:', error.message);
  } else if (error instanceof SliceTimeoutError) {
    // Request timed out
    console.error('Timeout:', error.message);
  } else if (error instanceof SliceAPIError) {
    // Other API errors (4xx, 5xx)
    console.error('API error:', error.message, error.statusCode);
  }
}
```

### Error Classes

- **`SliceError`**: Base error class for all SDK errors
- **`SliceAPIError`**: API errors (4xx, 5xx status codes)
- **`SliceAuthenticationError`**: Authentication errors (401, 403)
- **`SliceValidationError`**: Validation errors (400)
- **`SliceNetworkError`**: Network connectivity errors
- **`SliceTimeoutError`**: Request timeout errors

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions. All types are exported for your convenience:

```typescript
import type {
  License,
  LicenseStatus,
  LaaSUser,
  UserLicense,
  Activation,
  ValidateLicenseResponse,
  CreateUserRequest,
  // ... and more
} from '@sliceapi/sdk';
```

## Environment Support

### Node.js

The SDK works in Node.js 18+ (which includes native `fetch` support). For older versions, you may need a polyfill.

```typescript
// Node.js example
import { SliceClient } from '@sliceapi/sdk';

const client = new SliceClient(process.env.SLICE_API_KEY!, {
  baseUrl: process.env.SLICE_API_URL
});
```

### Browser

The SDK works in all modern browsers that support the `fetch` API.

```typescript
// Browser example
import { SliceClient } from '@sliceapi/sdk';

const client = new SliceClient('sk_live_...', {
  baseUrl: 'https://api.example.com'
});
```

## Examples

### Complete Example: License Validation Flow

```typescript
import { SliceClient, SliceAuthenticationError } from '@sliceapi/sdk';

const client = new SliceClient('sk_live_...');

async function checkUserLicense(userId: string) {
  try {
    const result = await client.validate.validate(userId);
    
    if (result.valid) {
      console.log('✅ License is valid');
      console.log('License ID:', result.license.id);
      console.log('Status:', result.license.status);
      console.log('Features:', result.features || []);
      
      if (result.license.expiresAt) {
        console.log('Expires at:', result.license.expiresAt);
      }
      
      return true;
    } else {
      console.log('❌ License is invalid:', result.reason);
      return false;
    }
  } catch (error) {
    if (error instanceof SliceAuthenticationError) {
      console.error('Authentication failed. Check your API key.');
    } else {
      console.error('Error validating license:', error);
    }
    return false;
  }
}

// Usage
await checkUserLicense('user_123');
```

### Example: User and License Management

```typescript
import { SliceClient } from '@sliceapi/sdk';

const client = new SliceClient('sk_live_...');

// Create a user
const user = await client.users.createUser({
  externalId: 'user_123',
  email: 'user@example.com',
  name: 'John Doe'
});

console.log('Created user:', user.id);

// Assign a license to the user
const assignment = await client.licenses.assignLicense(
  'license_123',
  'user_123',
  { source: 'admin_panel' }
);

console.log('License assigned:', assignment.id);

// Update license status
const updated = await client.licenses.updateLicenseStatus(
  'license_123',
  'active'
);

console.log('License status updated:', updated.status);
```

## API Endpoints

The SDK uses the following API endpoints:

- `POST /api/v1/validate` - Validate user license
- `POST /api/v1/admin/users` - Create user
- `POST /api/v1/admin/licenses/:id/assign` - Assign license to user
- `PATCH /api/v1/admin/licenses/:id/status` - Update license status

All requests are authenticated using the `Authorization: Bearer <api_key>` header.

## License

MIT
