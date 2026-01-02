import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Reporting',
  description: 'Generate reports on license usage',
}

export default function ReportingPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Reporting</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate reports on license usage and activity.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>All actions in the system are logged in audit logs, providing a complete history of changes.</p>
            <div>
              <h3 className="font-semibold mb-2">Get Audit Logs</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`GET /api/v1/admin/audit-logs?entityType=license&entityId=...

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "action": "license.validated",
      "entityType": "license",
      "entityId": "...",
      "timestamp": "2024-01-01T00:00:00Z",
      "metadata": { ... }
    }
  ]
}`}</code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              See <Link href="/docs/security/audit-logs" className="text-primary hover:underline">Audit Logs</Link> for more details.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/analytics/usage">
            <Button variant="outline">← Usage Metrics</Button>
          </Link>
          <Link href="/docs/analytics/webhooks">
            <Button>Webhooks →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

