import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSearch } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Audit Logs',
  description: 'Track all actions with audit logs',
}

export default function AuditLogsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Audit Logs</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track all actions and changes in your system.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              What are Audit Logs?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Audit logs provide a complete history of all actions performed in your tenant. Every important action is automatically logged.</p>
            <div>
              <h3 className="font-semibold mb-2">Logged Actions:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>License validations</li>
                <li>License assignments</li>
                <li>License status changes</li>
                <li>User creation</li>
                <li>Product and plan creation</li>
                <li>API key creation and revocation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retrieving Audit Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Get Audit Logs</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`GET /api/v1/admin/audit-logs?entityType=license&entityId=...

Query Parameters:
- entityType (optional) - Filter by entity type
- entityId (optional) - Filter by entity ID

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "action": "license.validated",
      "entityType": "license",
      "entityId": "license_123",
      "timestamp": "2024-01-01T00:00:00Z",
      "metadata": {
        "result": "valid",
        "userId": "user_123"
      }
    }
  ]
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Log Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>License actions:</strong> license.created, license.assigned, license.validated, license.suspended, license.revoked</p>
              <p><strong>User actions:</strong> user.created, user.updated</p>
              <p><strong>Product/Plan actions:</strong> product.created, plan.created</p>
              <p><strong>API key actions:</strong> api_key.created, api_key.revoked</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/security/data-protection">
            <Button variant="outline">← Data Protection</Button>
          </Link>
          <Link href="/docs/security/compliance">
            <Button>Compliance →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

