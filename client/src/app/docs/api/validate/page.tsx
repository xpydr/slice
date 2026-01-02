import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'License Validation API',
  description: 'API reference for validating user licenses',
}

export default function ValidateAPIPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            License Validation API
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Validate whether a user has a valid license and get license details.
          </p>
        </div>

        {/* Endpoint Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Endpoint</CardTitle>
            <CardDescription>
              POST /api/v1/validate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This is the core endpoint of the Slice API. It validates a user&apos;s license status 
              and returns the license details if valid. This endpoint is called from your application 
              to check if a user has access to licensed features.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Requires API key authentication via Bearer token in the Authorization header.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Request */}
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Headers</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`Authorization: Bearer sk_live_abc123...
Content-Type: application/json`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Request Body</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "userId": "user_123"  // Required: Your internal user identifier
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Parameters</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="bg-muted px-2 py-1 rounded">userId</code> <span className="text-muted-foreground">(string, required)</span>
                  <p className="text-muted-foreground ml-6 mt-1">
                    Your internal user identifier. This can be any string that uniquely identifies 
                    the user in your system (e.g., user ID, email, username).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response - Valid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Response: Valid License
            </CardTitle>
            <CardDescription>
              HTTP 200 - License is valid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`{
  "success": true,
  "data": {
    "valid": true,
    "license": {
      "id": "license_abc123",
      "productId": "product_xyz",
      "planId": "plan_456",
      "status": "active",
      "maxSeats": 5,
      "expiresAt": null,
      "features": ["feature1", "feature2"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "activation": {
      "id": "activation_789",
      "userId": "user_internal_id",
      "licenseId": "license_abc123",
      "activatedAt": "2024-01-01T00:00:00Z",
      "lastCheckedAt": "2024-01-15T12:00:00Z"
    },
    "features": ["feature1", "feature2"]
  }
}`}</code>
              </pre>
            <div>
              <h3 className="font-semibold mb-2">Response Fields</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <code className="bg-muted px-1 rounded">valid</code> - <code className="bg-muted px-1 rounded">true</code> when license is valid
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">license</code> - The license object with all details
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">activation</code> - Activation record (created/updated on validation)
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">features</code> - Array of feature flags from the license
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Response - Invalid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Response: Invalid License
            </CardTitle>
            <CardDescription>
              HTTP 200 - License is invalid (this is not an error)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`{
  "success": true,
  "data": {
    "valid": false,
    "reason": "no_license"
  }
}`}</code>
              </pre>
            <div>
              <h3 className="font-semibold mb-2">Invalid Reasons</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <code className="bg-muted px-1 rounded">no_license</code> - User has no assigned license
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">expired</code> - License has expired
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">revoked</code> - License has been revoked
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">suspended</code> - License is suspended
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">exceeded_seats</code> - License has reached its seat limit
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">user_not_found</code> - User does not exist (rare, user is auto-created)
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <p className="text-sm">
                <strong>Note:</strong> An invalid license response is not an error. The API returns 
                HTTP 200 with <code className="bg-muted px-1 rounded">valid: false</code>. This allows 
                you to handle invalid licenses gracefully in your application.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              What happens when you validate a license
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>The API looks up the user by their <code className="bg-muted px-1 rounded">userId</code> (auto-creates if doesn&apos;t exist)</li>
              <li>Retrieves all licenses assigned to that user</li>
              <li>Finds the first active, non-expired license</li>
              <li>Checks seat limits if the license has <code className="bg-muted px-1 rounded">maxSeats</code> set</li>
              <li>Creates or updates the activation record</li>
              <li>Returns the license details and features</li>
            </ol>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <p className="text-sm">
                <strong>Auto-creation:</strong> If a user doesn&apos;t exist, the API automatically 
                creates them with the provided <code className="bg-muted px-1 rounded">userId</code>. 
                This simplifies integration - you don&apos;t need to create users before validating.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">cURL</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`curl -X POST https://api.slice.example.com/api/v1/validate \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "user_123"}'`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">JavaScript/Node.js</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`const response = await fetch('https://api.slice.example.com/api/v1/validate', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.SLICE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ userId: 'user_123' }),
});

const result = await response.json();

if (result.data.valid) {
  console.log('License valid:', result.data.license);
  console.log('Features:', result.data.features);
} else {
  console.log('License invalid:', result.data.reason);
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Using the SDK (Recommended)</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import { SliceClient } from '@slice/sdk';

const client = new SliceClient(process.env.SLICE_API_KEY!);

const result = await client.validate.validate('user_123');

if (result.valid) {
  console.log('License valid:', result.license);
  console.log('Features:', result.features);
} else {
  console.log('License invalid:', result.reason);
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Error Responses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Responses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">400 Bad Request</h3>
              <p className="text-sm text-muted-foreground mb-2">Missing or invalid request parameters</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "success": false,
  "error": "Missing required field: userId"
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">401 Unauthorized</h3>
              <p className="text-sm text-muted-foreground mb-2">Invalid or missing API key</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "success": false,
  "error": "Unauthorized"
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">429 Too Many Requests</h3>
              <p className="text-sm text-muted-foreground mb-2">Rate limit exceeded</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1">
              <li>Validate licenses at application startup or when accessing premium features</li>
              <li>Cache validation results to reduce API calls (respect license expiration)</li>
              <li>Handle all invalid reasons appropriately (show upgrade prompts, etc.)</li>
              <li>Use the SDK for type safety and automatic error handling</li>
              <li>Monitor rate limits and implement exponential backoff</li>
              <li>Log validation failures for debugging and analytics</li>
            </ul>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/first-request">
            <Button variant="outline">← Your First Request</Button>
          </Link>
          <Link href="/docs/api/licenses">
            <Button>License Management →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

