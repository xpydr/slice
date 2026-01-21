import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Key, Shield, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Learn how to authenticate with the Slice API using API keys',
}

export default function AuthenticationPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Authentication
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to authenticate your requests to the Slice API using API keys.
          </p>
        </div>

        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key Authentication
            </CardTitle>
            <CardDescription>
              All API requests require authentication using a Bearer token
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Slice API uses API key authentication. Every request to the API must include 
              your API key in the <code className="bg-muted px-1 rounded">Authorization</code> header.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Authentication Header</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`Authorization: Bearer sk_live_abc123...`}</code>
              </pre>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4">
              <p className="text-sm">
                <strong>Note:</strong> API keys start with <code className="bg-muted px-1 rounded">sk_live_</code> for 
                production keys or <code className="bg-muted px-1 rounded">sk_test_</code> for test keys.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Getting API Keys */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Your API Key</CardTitle>
            <CardDescription>
              Create and manage API keys from your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Log in to your <Link href="/dashboard/api-keys" className="text-primary hover:underline">dashboard</Link></li>
                <li>Navigate to the API Keys section</li>
                <li>Click &quot;Create API Key&quot;</li>
                <li>Give your key a descriptive name (e.g., &quot;Production Server&quot;)</li>
                <li>Optionally set an expiration date</li>
                <li>Copy the key immediately - it&apos;s only shown once!</li>
              </ol>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
              <p className="text-sm">
                <strong>Important:</strong> API keys are sensitive credentials. Store them securely 
                and never commit them to version control. Use environment variables or secure secret 
                management systems.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Using API Keys */}
        <Card>
          <CardHeader>
            <CardTitle>Using API Keys</CardTitle>
            <CardDescription>
              Examples of authenticating requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">cURL Example</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`curl -X POST https://api.slice.example.com/api/v1/validate \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "user_123"}'`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">JavaScript/Node.js Example</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`const response = await fetch('https://api.slice.example.com/api/v1/validate', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.SLICE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ userId: 'user_123' }),
});

const data = await response.json();`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Using the SDK</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import { SliceClient } from '@sliceapi/sdk';

const client = new SliceClient(process.env.SLICE_API_KEY!);

// The SDK automatically includes the API key in all requests
const result = await client.validate.validate('user_123');`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* API Key Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Best Practices
            </CardTitle>
            <CardDescription>
              Keep your API keys secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Do:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Store API keys in environment variables</li>
                <li>Use different keys for development and production</li>
                <li>Rotate keys periodically</li>
                <li>Use secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)</li>
                <li>Set expiration dates on keys when possible</li>
                <li>Monitor key usage in your dashboard</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Don&apos;t:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Commit API keys to version control (Git, SVN, etc.)</li>
                <li>Share keys in chat, email, or documentation</li>
                <li>Hardcode keys in your source code</li>
                <li>Use the same key for multiple applications</li>
                <li>Leave keys in client-side code (browser, mobile apps)</li>
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>If your API key is compromised:</strong> Immediately revoke it in your 
                  dashboard and create a new one. Monitor your audit logs for any suspicious activity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Management */}
        <Card>
          <CardHeader>
            <CardTitle>API Key Management</CardTitle>
            <CardDescription>
              Managing your API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Key Operations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Create:</strong> Generate new keys from your dashboard. Each key can have 
                  a name and optional expiration date.
                </li>
                <li>
                  <strong>View:</strong> See all your keys, their names, prefixes, and last used dates. 
                  Note that the full key is only shown once when created.
                </li>
                <li>
                  <strong>Revoke:</strong> Immediately invalidate a key if it&apos;s compromised or no 
                  longer needed. Revoked keys cannot be restored.
                </li>
                <li>
                  <strong>Monitor:</strong> Check when keys were last used and track their usage in 
                  audit logs.
                </li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              See the <Link href="/docs/auth/api-keys" className="text-primary hover:underline">API Keys documentation</Link> for 
              detailed information on managing keys.
            </p>
          </CardContent>
        </Card>

        {/* Error Responses */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Errors</CardTitle>
            <CardDescription>
              Common authentication error responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">401 Unauthorized</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Returned when the API key is missing, invalid, or expired.
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "success": false,
  "error": "Unauthorized"
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">403 Forbidden</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Returned when the API key is valid but doesn&apos;t have permission to access the resource.
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "success": false,
  "error": "Access denied"
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/quickstart">
            <Button variant="outline">← Quick Start</Button>
          </Link>
          <Link href="/docs/first-request">
            <Button>Your First Request →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

