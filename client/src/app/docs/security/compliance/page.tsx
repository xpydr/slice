import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Compliance',
  description: 'Compliance and security standards',
}

export default function CompliancePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Compliance</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Security standards and compliance information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Security Standards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Slice follows industry best practices for security and data protection.</p>
            <div>
              <h3 className="font-semibold mb-2">Security Measures:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>HTTPS/TLS encryption for all API communications</li>
                <li>Secure API key storage with hashing</li>
                <li>Tenant data isolation</li>
                <li>Comprehensive audit logging</li>
                <li>Rate limiting to prevent abuse</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We take data privacy seriously. All data is stored securely and access is restricted to authorized personnel only. 
              For specific compliance requirements, please contact support.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/security/audit-logs">
            <Button variant="outline">← Audit Logs</Button>
          </Link>
          <Link href="/docs">
            <Button>Documentation →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

