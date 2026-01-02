import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Code2, Package, Settings, CheckCircle2, Users, Key, AlertCircle, Type, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SDK Documentation',
  description: 'Complete guide to using the Slice SDK for license validation and management in your applications.',
}

export default function SDKDocsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Slice SDK Documentation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            TypeScript SDK for integrating license validation and management into your applications.
          </p>
        </div>

        {/* Introduction & Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Introduction
            </CardTitle>
            <CardDescription>
              What is the Slice SDK and why use it?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Slice SDK is a TypeScript library that provides a type-safe, cross-platform interface for integrating 
              license validation and management into your applications. It simplifies API interactions and provides 
              comprehensive error handling.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>Type Safe:</strong> Full TypeScript support with exported types</li>
                <li><strong>Cross-Platform:</strong> Works in both Node.js (18+) and browser environments</li>
                <li><strong>Modern:</strong> Uses native <code className="bg-muted px-1 rounded">fetch</code> API</li>
                <li><strong>Error Handling:</strong> Custom error classes with meaningful messages</li>
                <li><strong>Flexible:</strong> Configurable base URL and timeout settings</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Use Cases</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Validate user licenses in your application</li>
                <li>Create and manage users programmatically</li>
                <li>Assign licenses to users</li>
                <li>Update license status</li>
                <li>Build license-gated features</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Installation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Installation
            </CardTitle>
            <CardDescription>
              Install the SDK in your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Slice SDK is available as a workspace package. Since it&apos;s a private package, you&apos;ll need 
              to install it from your workspace or configure it as a local dependency.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Using pnpm (Recommended)</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>pnpm add @slice/sdk</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Using npm</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>npm install @slice/sdk</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Using yarn</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>yarn add @slice/sdk</code>
              </pre>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <p className="text-sm">
                <strong>Note:</strong> This is a private package. Make sure your workspace is properly configured 
                to access the <code className="bg-muted px-1 rounded">@slice/sdk</code> package.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Quick Start
            </CardTitle>
            <CardDescription>
              Get up and running in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Import the SDK</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import { SliceClient } from '@slice/sdk';`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Initialize the Client</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`const client = new SliceClient('sk_live_...', {
  baseUrl: 'https://api.example.com' // Optional
});`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Validate a License</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`const result = await client.validate.validate('user_123');

if (result.valid) {
  console.log('License is valid:', result.license);
  console.log('Features:', result.features);
} else {
  console.log('License invalid:', result.reason);
}`}</code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              See the <Link href="#api-reference" className="text-primary hover:underline">API Reference</Link> section 
              for complete documentation on all available methods.
            </p>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Configure the SDK to match your environment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Constructor Options</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`interface SliceClientOptions {
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
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Environment Variables</h3>
              <p className="text-sm text-muted-foreground mb-2">
                You can set the base URL using an environment variable:
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`# .env
SLICE_API_URL=https://api.example.com`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">API Key Setup</h3>
              <p className="text-sm text-muted-foreground mb-2">
                To get your API key:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Log in to your Slice dashboard</li>
                <li>Navigate to the API Keys section</li>
                <li>Create a new API key (starts with <code className="bg-muted px-1 rounded">sk_live_</code> or <code className="bg-muted px-1 rounded">sk_test_</code>)</li>
                <li>Copy the key and store it securely (never commit it to version control)</li>
              </ol>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mt-2">
                <p className="text-sm">
                  <strong>Security Tip:</strong> Always use environment variables for API keys. Never hardcode them 
                  in your source code.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Reference */}
        <Card id="api-reference">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              API Reference
            </CardTitle>
            <CardDescription>
              Complete API documentation with examples
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* License Validation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">License Validation</h3>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Method: <code className="bg-muted px-2 py-1 rounded">client.validate.validate(userId)</code></h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Validates a user&apos;s license and returns the validation result. This is the primary method for 
                  checking if a user has a valid license.
                </p>
                <div>
                  <p className="text-sm font-semibold mb-1">Parameters:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li><code className="bg-muted px-1 rounded">userId</code> (string, required): The tenant&apos;s internal user ID</li>
                  </ul>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1">Returns:</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm mt-2">
                    <code>{`type ValidateLicenseResponse = 
  | { valid: true; license: License; activation?: Activation; features?: string[] }
  | { valid: false; reason: 'expired' | 'revoked' | 'suspended' | 'exceeded_seats' | 'no_license' | 'user_not_found' };`}</code>
                  </pre>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1">Example:</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`const result = await client.validate.validate('user_123');

if (result.valid) {
  // License is valid
  console.log('License ID:', result.license.id);
  console.log('Status:', result.license.status);
  console.log('Features:', result.features || []);
  
  if (result.license.expiresAt) {
    console.log('Expires at:', result.license.expiresAt);
  }
} else {
  // License is invalid
  console.log('License invalid:', result.reason);
  // Handle invalid license (e.g., show upgrade prompt)
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* User Management */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">User Management</h3>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Method: <code className="bg-muted px-2 py-1 rounded">client.users.createUser(params)</code></h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Creates a new user in the system. Users are identified by their <code className="bg-muted px-1 rounded">externalId</code>, 
                  which should be your internal user identifier.
                </p>
                <div>
                  <p className="text-sm font-semibold mb-1">Parameters:</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm mt-2">
                    <code>{`interface CreateUserRequest {
  externalId: string;              // Required: Your internal user ID
  email?: string;                  // Optional
  name?: string;                   // Optional
  metadata?: Record<string, any>;  // Optional
}`}</code>
                  </pre>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1">Returns:</p>
                  <p className="text-sm text-muted-foreground">
                    Promise resolving to a <code className="bg-muted px-1 rounded">LaaSUser</code> object
                  </p>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1">Example:</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`// Create user with minimal data
const user = await client.users.createUser({
  externalId: 'user_123'
});

// Create user with full data
const user = await client.users.createUser({
  externalId: 'user_123',
  email: 'user@example.com',
  name: 'John Doe',
  metadata: {
    source: 'signup_form',
    plan: 'premium'
  }
});

console.log('Created user:', user.id);
console.log('External ID:', user.externalId);`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* License Management */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">License Management</h3>
              </div>
              
              <div className="space-y-6">
                {/* Assign License */}
                <div>
                  <h4 className="font-semibold mb-2">Method: <code className="bg-muted px-2 py-1 rounded">client.licenses.assignLicense(licenseId, userId, metadata?)</code></h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Assigns a license to a user. This creates a relationship between a license and a user, allowing 
                    the user to use the license.
                  </p>
                  <div>
                    <p className="text-sm font-semibold mb-1">Parameters:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li><code className="bg-muted px-1 rounded">licenseId</code> (string, required): The license ID to assign</li>
                      <li><code className="bg-muted px-1 rounded">userId</code> (string, required): The user ID to assign the license to</li>
                      <li><code className="bg-muted px-1 rounded">metadata</code> (object, optional): Additional metadata for the assignment</li>
                    </ul>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold mb-1">Returns:</p>
                    <p className="text-sm text-muted-foreground">
                      Promise resolving to a <code className="bg-muted px-1 rounded">UserLicense</code> object
                    </p>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold mb-1">Example:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{`const assignment = await client.licenses.assignLicense(
  'license_123',
  'user_456',
  {
    source: 'admin_panel',
    assignedBy: 'admin_user_1'
  }
);

console.log('License assigned:', assignment.id);
console.log('User ID:', assignment.userId);
console.log('License ID:', assignment.licenseId);`}</code>
                    </pre>
                  </div>
                </div>

                {/* Update License Status */}
                <div>
                  <h4 className="font-semibold mb-2">Method: <code className="bg-muted px-2 py-1 rounded">client.licenses.updateLicenseStatus(licenseId, status)</code></h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Updates a license&apos;s status. This allows you to suspend, revoke, or reactivate licenses.
                  </p>
                  <div>
                    <p className="text-sm font-semibold mb-1">Parameters:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li><code className="bg-muted px-1 rounded">licenseId</code> (string, required): The license ID to update</li>
                      <li><code className="bg-muted px-1 rounded">status</code> (LicenseStatus, required): The new status - <code className="bg-muted px-1 rounded">'active'</code>, <code className="bg-muted px-1 rounded">'suspended'</code>, <code className="bg-muted px-1 rounded">'revoked'</code>, or <code className="bg-muted px-1 rounded">'expired'</code></li>
                    </ul>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold mb-1">Returns:</p>
                    <p className="text-sm text-muted-foreground">
                      Promise resolving to the updated <code className="bg-muted px-1 rounded">License</code> object
                    </p>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold mb-1">Example:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{`// Suspend a license
const license = await client.licenses.updateLicenseStatus(
  'license_123',
  'suspended'
);

// Reactivate a license
const license = await client.licenses.updateLicenseStatus(
  'license_123',
  'active'
);

console.log('License status:', license.status);`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Handling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Handling
            </CardTitle>
            <CardDescription>
              Handle errors gracefully in your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The SDK provides custom error classes for different error scenarios. All errors extend from 
              <code className="bg-muted px-1 rounded">SliceError</code>, making it easy to handle them consistently.
            </p>
            
            <div>
              <h3 className="font-semibold mb-2">Error Classes</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm"><code className="bg-muted px-2 py-1 rounded">SliceError</code></h4>
                  <p className="text-sm text-muted-foreground">Base error class for all SDK errors</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm"><code className="bg-muted px-2 py-1 rounded">SliceAPIError</code></h4>
                  <p className="text-sm text-muted-foreground">API errors (4xx, 5xx status codes). Includes <code className="bg-muted px-1 rounded">statusCode</code> and <code className="bg-muted px-1 rounded">response</code> properties.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm"><code className="bg-muted px-2 py-1 rounded">SliceAuthenticationError</code></h4>
                  <p className="text-sm text-muted-foreground">Authentication errors (401, 403). Invalid API key or insufficient permissions.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm"><code className="bg-muted px-2 py-1 rounded">SliceValidationError</code></h4>
                  <p className="text-sm text-muted-foreground">Validation errors (400). Invalid request parameters.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm"><code className="bg-muted px-2 py-1 rounded">SliceNetworkError</code></h4>
                  <p className="text-sm text-muted-foreground">Network connectivity errors. Failed to connect to the API.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm"><code className="bg-muted px-2 py-1 rounded">SliceTimeoutError</code></h4>
                  <p className="text-sm text-muted-foreground">Request timeout errors. Request exceeded the timeout duration.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Error Handling Example</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import {
  SliceClient,
  SliceAuthenticationError,
  SliceValidationError,
  SliceNetworkError,
  SliceTimeoutError,
  SliceAPIError,
} from '@slice/sdk';

const client = new SliceClient(process.env.SLICE_API_KEY!);

try {
  const result = await client.validate.validate('user_123');
  // Handle success...
} catch (error) {
  if (error instanceof SliceAuthenticationError) {
    // Invalid API key or authentication failed
    console.error('Auth error:', error.message, error.statusCode);
    // Redirect to login or show error message
  } else if (error instanceof SliceValidationError) {
    // Invalid request parameters
    console.error('Validation error:', error.message);
    // Show user-friendly error message
  } else if (error instanceof SliceNetworkError) {
    // Network connectivity issue
    console.error('Network error:', error.message);
    // Show retry option or offline message
  } else if (error instanceof SliceTimeoutError) {
    // Request timed out
    console.error('Timeout:', error.message);
    // Show retry option
  } else if (error instanceof SliceAPIError) {
    // Other API errors (4xx, 5xx)
    console.error('API error:', error.message, error.statusCode);
    // Handle based on status code
  } else {
    // Unknown error
    console.error('Unknown error:', error);
  }
}`}</code>
              </pre>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <p className="text-sm">
                <strong>Best Practice:</strong> Always handle errors appropriately in your application. Provide 
                user-friendly error messages and implement retry logic for network errors when appropriate.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* TypeScript Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              TypeScript Support
            </CardTitle>
            <CardDescription>
              Full type safety with exported types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The SDK is written in TypeScript and provides full type definitions. All types are exported for 
              your convenience, allowing you to use them in your own code.
            </p>
            
            <div>
              <h3 className="font-semibold mb-2">Available Types</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import type {
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
} from '@slice/sdk';`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Example: Using Types</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import { SliceClient } from '@slice/sdk';
import type { ValidateLicenseResponse, LicenseStatus } from '@slice/sdk';

const client = new SliceClient(process.env.SLICE_API_KEY!);

async function checkLicense(userId: string): Promise<ValidateLicenseResponse> {
  return await client.validate.validate(userId);
}

async function updateLicense(
  licenseId: string, 
  status: LicenseStatus
) {
  return await client.licenses.updateLicenseStatus(licenseId, status);
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Complete Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Complete Examples
            </CardTitle>
            <CardDescription>
              Real-world integration examples
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Full Workflow */}
            <div>
              <h3 className="font-semibold mb-2">Complete Workflow Example</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This example shows a complete workflow: creating a user, assigning a license, and validating it.
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import { SliceClient, SliceAuthenticationError } from '@slice/sdk';

const client = new SliceClient(process.env.SLICE_API_KEY!, {
  baseUrl: process.env.SLICE_API_URL
});

async function setupUserWithLicense(
  externalId: string,
  email: string,
  licenseId: string
) {
  try {
    // Step 1: Create user
    const user = await client.users.createUser({
      externalId,
      email,
      name: 'New User',
      metadata: { source: 'signup' }
    });
    console.log('User created:', user.id);

    // Step 2: Assign license
    const assignment = await client.licenses.assignLicense(
      licenseId,
      externalId,
      { source: 'signup_flow' }
    );
    console.log('License assigned:', assignment.id);

    // Step 3: Validate license
    const validation = await client.validate.validate(externalId);
    if (validation.valid) {
      console.log('License is valid!');
      console.log('Features:', validation.features);
      return true;
    } else {
      console.log('License validation failed:', validation.reason);
      return false;
    }
  } catch (error) {
    if (error instanceof SliceAuthenticationError) {
      console.error('Authentication failed');
    } else {
      console.error('Error:', error);
    }
    throw error;
  }
}`}</code>
              </pre>
            </div>

            {/* Node.js Example */}
            <div>
              <h3 className="font-semibold mb-2">Node.js Example</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Example of using the SDK in a Node.js backend service.
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`// server.ts
import { SliceClient } from '@slice/sdk';
import express from 'express';

const app = express();
const client = new SliceClient(process.env.SLICE_API_KEY!, {
  baseUrl: process.env.SLICE_API_URL
});

// Middleware to check license
async function checkLicense(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const result = await client.validate.validate(userId);
    if (!result.valid) {
      return res.status(403).json({ 
        error: 'License invalid', 
        reason: result.reason 
      });
    }
    
    // Attach license info to request
    req.license = result.license;
    req.features = result.features || [];
    next();
  } catch (error) {
    console.error('License validation error:', error);
    return res.status(500).json({ error: 'License validation failed' });
  }
}

// Protected route
app.get('/api/premium-feature', checkLicense, (req, res) => {
  const features = req.features || [];
  if (!features.includes('premium')) {
    return res.status(403).json({ error: 'Premium feature not available' });
  }
  
  res.json({ message: 'Premium feature accessed' });
});`}</code>
              </pre>
            </div>

            {/* Browser Example */}
            <div>
              <h3 className="font-semibold mb-2">Browser Example</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Example of using the SDK in a browser application (React).
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`// LicenseCheck.tsx
import { useEffect, useState } from 'react';
import { SliceClient } from '@slice/sdk';

const client = new SliceClient(import.meta.env.VITE_SLICE_API_KEY, {
  baseUrl: import.meta.env.VITE_SLICE_API_URL
});

export function LicenseCheck({ userId }: { userId: string }) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validateLicense() {
      try {
        const result = await client.validate.validate(userId);
        setIsValid(result.valid);
        if (result.valid) {
          setFeatures(result.features || []);
        }
      } catch (error) {
        console.error('License validation failed:', error);
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    }

    validateLicense();
  }, [userId]);

  if (loading) {
    return <div>Checking license...</div>;
  }

  if (!isValid) {
    return <div>License is invalid. Please upgrade your plan.</div>;
  }

  return (
    <div>
      <h2>License Valid</h2>
      <ul>
        {features.map(feature => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </div>
  );
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs">
            <Button variant="outline">← Back to Documentation</Button>
          </Link>
          <Link href="/dashboard/api-keys">
            <Button>Get API Key →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

