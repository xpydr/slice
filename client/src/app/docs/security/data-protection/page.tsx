import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Data Protection',
  description: 'How we protect your data',
}

export default function DataProtectionPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Data Protection</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how we protect your data and ensure security.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Encryption in Transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All API requests are encrypted in transit using HTTPS/TLS. This ensures that data cannot be intercepted or modified during transmission.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              API Key Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>API keys are never stored in plaintext. They are hashed using secure cryptographic functions.</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Keys are hashed before storage</li>
              <li>Only the key prefix is stored for identification</li>
              <li>Full keys are only shown once when created</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Isolation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All data is tenant-scoped. Each tenant can only access their own products, plans, licenses, and users. 
              Multi-tenancy is enforced at the database level.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs">
            <Button variant="outline">← Documentation</Button>
          </Link>
          <Link href="/docs/security/audit-logs">
            <Button>Audit Logs →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

