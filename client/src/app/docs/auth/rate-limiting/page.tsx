import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gauge, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Rate Limiting',
  description: 'Understanding API rate limits',
}

export default function RateLimitingPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Rate Limiting</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn about API rate limits and how to handle them.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Rate Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>The Slice API implements rate limiting to ensure fair usage and system stability.</p>
            <div>
              <h3 className="font-semibold mb-2">Default Limits</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>Limit:</strong> 100 requests per minute per tenant</li>
                <li><strong>Window:</strong> 1 minute rolling window</li>
                <li><strong>Tracking:</strong> Per tenant (based on API key)</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <p className="text-sm">
                Rate limits are configurable via environment variables. Contact support for higher limits.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Rate Limit Headers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Every API response includes rate limit headers:</p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T12:01:00Z`}</code>
            </pre>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><code className="bg-muted px-1 rounded">X-RateLimit-Limit</code> - Maximum requests allowed</li>
              <li><code className="bg-muted px-1 rounded">X-RateLimit-Remaining</code> - Requests remaining in current window</li>
              <li><code className="bg-muted px-1 rounded">X-RateLimit-Reset</code> - When the rate limit window resets</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Limit Exceeded</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>When you exceed the rate limit, you&apos;ll receive a 429 Too Many Requests response:</p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}`}</code>
            </pre>
            <div>
              <h3 className="font-semibold mb-2">Best Practices</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Implement exponential backoff when receiving 429 responses</li>
                <li>Monitor rate limit headers to avoid hitting limits</li>
                <li>Cache validation results to reduce API calls</li>
                <li>Use batch operations when possible</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/auth/security">
            <Button variant="outline">← Security</Button>
          </Link>
          <Link href="/docs">
            <Button>Documentation →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

