import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Lock, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security Best Practices',
  description: 'Security guidelines for using the Slice API',
}

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Security Best Practices</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Guidelines for keeping your API keys and data secure.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              API Key Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Do:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Store keys in environment variables</li>
                <li>Use secret management services (AWS Secrets Manager, HashiCorp Vault)</li>
                <li>Use different keys for different environments</li>
                <li>Rotate keys regularly</li>
                <li>Set expiration dates on keys</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Don&apos;t:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Commit keys to version control</li>
                <li>Share keys in chat or email</li>
                <li>Hardcode keys in source code</li>
                <li>Use keys in client-side code</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>All API requests are encrypted in transit using HTTPS. We never store your API keys in plaintext.</p>
            <p className="text-sm text-muted-foreground">
              See <Link href="/docs/security/data-protection" className="text-primary hover:underline">Data Protection</Link> for more information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              If Your Key is Compromised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Immediately revoke the compromised key in your dashboard</li>
              <li>Create a new API key</li>
              <li>Update your applications with the new key</li>
              <li>Monitor audit logs for suspicious activity</li>
            </ol>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/auth/api-keys">
            <Button variant="outline">← API Keys</Button>
          </Link>
          <Link href="/docs/auth/rate-limiting">
            <Button>Rate Limiting →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

