import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Key, Code2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Quick Start Guide',
  description: 'Get started with Slice License as a Service in 5 minutes',
}

export default function QuickStartPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Quick Start Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get up and running with Slice License as a Service in just 5 minutes.
          </p>
        </div>

        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>What You&apos;ll Learn</CardTitle>
            <CardDescription>
              This guide will walk you through the essential steps to start using Slice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Create an account and get your API key</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Set up your first product and plan</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Create a license and assign it to a user</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Validate a license using the API</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Step 1 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                1
              </div>
              <div>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>Sign up and get your API key</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              First, you&apos;ll need to create a tenant account. This gives you access to the 
              Slice dashboard where you can manage your products, plans, and licenses.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to the <Link href="/signup" className="text-primary hover:underline">signup page</Link></li>
                <li>Enter your business name, email, and password</li>
                <li>Verify your email address</li>
                <li>Log in to your dashboard</li>
              </ol>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <p className="text-sm">
                <strong>Tip:</strong> After signing up, you&apos;ll need to verify your email before 
                you can access all features. Check your inbox for the verification code.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                2
              </div>
              <div>
                <CardTitle>Get Your API Key</CardTitle>
                <CardDescription>Generate an API key for authentication</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              API keys are used to authenticate your requests to the Slice API. You&apos;ll need 
              one to make API calls from your application.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Navigate to <Link href="/dashboard/api-keys" className="text-primary hover:underline">API Keys</Link> in your dashboard</li>
                <li>Click &quot;Create API Key&quot;</li>
                <li>Give your key a name (e.g., &quot;Production Key&quot; or &quot;Development Key&quot;)</li>
                <li>Copy the API key immediately - you won&apos;t be able to see it again!</li>
                <li>Store it securely in your environment variables</li>
              </ol>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
              <p className="text-sm">
                <strong>Security Warning:</strong> API keys are sensitive credentials. Never commit 
                them to version control. Always use environment variables or secure secret management.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Example:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`# .env
SLICE_API_KEY=sk_live_abc123...
SLICE_API_URL=https://api.slice.example.com`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                3
              </div>
              <div>
                <CardTitle>Create a Product and Plan</CardTitle>
                <CardDescription>Set up your licensing structure</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Products represent your software applications, and Plans define the licensing tiers 
              (e.g., Basic, Professional, Enterprise). You need at least one product and plan before 
              you can create licenses.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Using the Dashboard:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <Link href="/dashboard/products" className="text-primary hover:underline">Products</Link> and create a new product</li>
                <li>Go to <Link href="/dashboard/plans" className="text-primary hover:underline">Plans</Link> and create a plan for your product</li>
                <li>Configure the plan settings (max seats, expiration, features)</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Using the API:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`# Create a product
POST /api/v1/admin/products
{
  "name": "My Software",
  "description": "My awesome software product"
}

# Create a plan
POST /api/v1/admin/plans
{
  "productId": "<product-id>",
  "name": "Professional",
  "maxSeats": 5,
  "expiresInDays": 365,
  "features": ["feature1", "feature2"]
}`}</code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              See the <Link href="/docs/guides/products" className="text-primary hover:underline">Products Guide</Link> and{' '}
              <Link href="/docs/guides/plans" className="text-primary hover:underline">Plans Guide</Link> for detailed information.
            </p>
          </CardContent>
        </Card>

        {/* Step 4 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                4
              </div>
              <div>
                <CardTitle>Create and Assign a License</CardTitle>
                <CardDescription>Generate a license and assign it to a user</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Licenses are created from plans and assigned to users. When a user validates their 
              license, they get access to the features defined in the plan.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Using the Dashboard:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <Link href="/dashboard/licenses" className="text-primary hover:underline">Licenses</Link></li>
                <li>Click &quot;Create License&quot; and select a plan</li>
                <li>Go to the license details and assign it to a user</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Using the API:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`# Create a license from a plan
POST /api/v1/admin/licenses
{
  "planId": "<plan-id>"
}

# Assign license to a user
POST /api/v1/admin/licenses/:licenseId/assign
{
  "userId": "user_123"
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Step 5 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                5
              </div>
              <div>
                <CardTitle>Validate a License</CardTitle>
                <CardDescription>Check if a user has a valid license</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This is the core operation - validating whether a user has a valid license. This 
              endpoint is called from your application to check license status.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Using the API:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`POST /api/v1/validate
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "userId": "user_123"
}

# Response (valid)
{
  "success": true,
  "data": {
    "valid": true,
    "license": {
      "id": "...",
      "status": "active",
      "features": ["feature1", "feature2"]
    }
  }
}

# Response (invalid)
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "no_license"
  }
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Using the SDK:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import { SliceClient } from '@slice/sdk';

const client = new SliceClient(process.env.SLICE_API_KEY!);

const result = await client.validate.validate('user_123');

if (result.valid) {
  console.log('License is valid!');
  console.log('Features:', result.features);
} else {
  console.log('License invalid:', result.reason);
}`}</code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              See the <Link href="/docs/api/validate" className="text-primary hover:underline">License Validation API</Link> documentation for complete details.
            </p>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              You&apos;re ready to start! Here are some helpful resources:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/docs/sdk">
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Code2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">SDK Documentation</CardTitle>
                    </div>
                    <CardDescription>
                      Learn how to use our TypeScript SDK
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/docs/api/validate">
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">API Reference</CardTitle>
                    </div>
                    <CardDescription>
                      Complete API documentation
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs">
            <Button variant="outline">← Back to Documentation</Button>
          </Link>
          <Link href="/docs/authentication">
            <Button>
              Authentication Guide <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

