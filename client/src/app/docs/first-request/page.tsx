import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Code2, CheckCircle2, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Your First Request',
  description: 'Make your first API request to validate a license',
}

export default function FirstRequestPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Your First Request
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to make your first API call to validate a license.
          </p>
        </div>

        {/* Prerequisites */}
        <Card>
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
            <CardDescription>
              Before making your first request, make sure you have:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Created a tenant account</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Generated an API key (see <Link href="/docs/authentication" className="text-primary hover:underline">Authentication</Link>)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Created a product and plan</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Created a license and assigned it to a user</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* The Validate Endpoint */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              The Validate Endpoint
            </CardTitle>
            <CardDescription>
              The most common endpoint you&apos;ll use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The <code className="bg-muted px-1 rounded">/api/v1/validate</code> endpoint is the 
              core of the Slice API. It checks whether a user has a valid license and returns the 
              license details if valid.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Endpoint Details</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>Method:</strong> POST</li>
                <li><strong>URL:</strong> <code className="bg-muted px-1 rounded">/api/v1/validate</code></li>
                <li><strong>Authentication:</strong> Bearer token (API key)</li>
                <li><strong>Content-Type:</strong> application/json</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Request Example */}
        <Card>
          <CardHeader>
            <CardTitle>Making the Request</CardTitle>
            <CardDescription>
              Example request with cURL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Request</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`curl -X POST https://api.slice.example.com/api/v1/validate \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "user_123"
  }'`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Request Body</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "userId": "user_123"  // Your internal user identifier
}`}</code>
              </pre>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4">
              <p className="text-sm">
                <strong>Note:</strong> The <code className="bg-muted px-1 rounded">userId</code> is your 
                internal user identifier. It can be any string that uniquely identifies the user in your system.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Response Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Response Examples</CardTitle>
            <CardDescription>
              What to expect in the response
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Valid License Response</h3>
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
            </div>
            <div>
              <h3 className="font-semibold mb-2">Invalid License Response</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "success": true,
  "data": {
    "valid": false,
    "reason": "no_license"  // or "expired", "revoked", "suspended", "exceeded_seats"
  }
}`}</code>
              </pre>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p><strong>Possible reasons:</strong></p>
                <ul className="list-disc list-inside ml-2">
                  <li><code className="bg-muted px-1 rounded">no_license</code> - User has no assigned license</li>
                  <li><code className="bg-muted px-1 rounded">expired</code> - License has expired</li>
                  <li><code className="bg-muted px-1 rounded">revoked</code> - License has been revoked</li>
                  <li><code className="bg-muted px-1 rounded">suspended</code> - License is suspended</li>
                  <li><code className="bg-muted px-1 rounded">exceeded_seats</code> - License has reached its seat limit</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
            <CardDescription>
              Examples in different programming languages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">JavaScript/Node.js</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`async function validateLicense(userId) {
  const response = await fetch('https://api.slice.example.com/api/v1/validate', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.SLICE_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  const result = await response.json();
  
  if (result.data.valid) {
    console.log('License is valid!');
    console.log('Features:', result.data.features);
    return result.data.license;
  } else {
    console.log('License invalid:', result.data.reason);
    return null;
  }
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Python</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import requests
import os

def validate_license(user_id):
    response = requests.post(
        'https://api.slice.example.com/api/v1/validate',
        headers={
            'Authorization': f'Bearer {os.environ["SLICE_API_KEY"]}',
            'Content-Type': 'application/json',
        },
        json={'userId': user_id}
    )
    
    result = response.json()
    
    if result['data']['valid']:
        print('License is valid!')
        print('Features:', result['data']['features'])
        return result['data']['license']
    else:
        print('License invalid:', result['data']['reason'])
        return None`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Using the SDK (Recommended)</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import { SliceClient } from '@sliceapi/sdk';

const client = new SliceClient(process.env.SLICE_API_KEY!);

const result = await client.validate.validate('user_123');

if (result.valid) {
  console.log('License is valid!');
  console.log('Features:', result.features);
} else {
  console.log('License invalid:', result.reason);
}`}</code>
              </pre>
              <p className="text-sm text-muted-foreground mt-2">
                The SDK handles authentication, error handling, and type safety automatically. 
                See the <Link href="/docs/sdk" className="text-primary hover:underline">SDK Documentation</Link> for more details.
              </p>
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
              How to handle errors in your requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">HTTP Status Codes</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>200 OK:</strong> Request successful (license may be valid or invalid)</li>
                <li><strong>400 Bad Request:</strong> Invalid request parameters (e.g., missing userId)</li>
                <li><strong>401 Unauthorized:</strong> Invalid or missing API key</li>
                <li><strong>429 Too Many Requests:</strong> Rate limit exceeded</li>
                <li><strong>500 Internal Server Error:</strong> Server error - retry later</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Example Error Response</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "success": false,
  "error": "Missing required field: userId"
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Error Handling Example</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`try {
  const result = await client.validate.validate('user_123');
  // Handle result...
} catch (error) {
  if (error.statusCode === 401) {
    console.error('Authentication failed - check your API key');
  } else if (error.statusCode === 429) {
    console.error('Rate limit exceeded - retry later');
  } else {
    console.error('Error:', error.message);
  }
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Now that you&apos;ve made your first request, explore more:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs/api/validate" className="text-primary hover:underline">
                  → License Validation API Reference
                </Link>
              </li>
              <li>
                <Link href="/docs/api/users" className="text-primary hover:underline">
                  → User Management API
                </Link>
              </li>
              <li>
                <Link href="/docs/api/licenses" className="text-primary hover:underline">
                  → License Management API
                </Link>
              </li>
              <li>
                <Link href="/docs/sdk" className="text-primary hover:underline">
                  → SDK Documentation
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/authentication">
            <Button variant="outline">← Authentication</Button>
          </Link>
          <Link href="/docs/api/validate">
            <Button>API Reference →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

