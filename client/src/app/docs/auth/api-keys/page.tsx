import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Key, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'API Keys',
  description: 'Complete guide to managing API keys',
}

export default function APIKeysPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">API Keys</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to create, manage, and secure your API keys.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Creating API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>API keys authenticate your requests to the Slice API. Create them from your dashboard.</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Navigate to <Link href="/dashboard/api-keys" className="text-primary hover:underline">API Keys</Link> in your dashboard</li>
              <li>Click &quot;Create API Key&quot;</li>
              <li>Enter a descriptive name (e.g., &quot;Production Server&quot;)</li>
              <li>Optionally set an expiration date</li>
              <li>Copy the key immediately - it&apos;s only shown once!</li>
            </ol>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
              <p className="text-sm">
                <strong>Warning:</strong> API keys are sensitive credentials. Store them securely and never commit them to version control.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1">
              <li>Use environment variables to store API keys</li>
              <li>Use different keys for development and production</li>
              <li>Rotate keys periodically</li>
              <li>Set expiration dates when possible</li>
              <li>Revoke compromised keys immediately</li>
              <li>Monitor key usage in audit logs</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You can view all your API keys, see when they were last used, and revoke them from your dashboard.</p>
            <p className="text-sm text-muted-foreground">
              See <Link href="/docs/authentication" className="text-primary hover:underline">Authentication</Link> for more details.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/authentication">
            <Button variant="outline">← Authentication</Button>
          </Link>
          <Link href="/docs/auth/security">
            <Button>Security Best Practices →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

