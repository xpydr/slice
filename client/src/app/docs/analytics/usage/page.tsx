import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Usage Metrics',
  description: 'Track license usage and metrics',
}

export default function UsageMetricsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Usage Metrics</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track and monitor license usage across your platform.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              License Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Monitor how your licenses are being used through the license usage endpoint.</p>
            <div>
              <h3 className="font-semibold mb-2">Get License Usage</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`GET /api/v1/admin/licenses/:id/usage

Response:
{
  "success": true,
  "data": {
    "license": { ... },
    "activations": [ ... ],
    "totalActivations": 10,
    "activeSeats": 5
  }
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Metrics Available:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">totalActivations</code> - Total number of activations</li>
                <li><code className="bg-muted px-1 rounded">activeSeats</code> - Number of unique users using the license</li>
                <li>Activation details with timestamps</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View usage metrics in your <Link href="/dashboard/analytics" className="text-primary hover:underline">dashboard</Link> for a visual overview of license usage.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs">
            <Button variant="outline">← Documentation</Button>
          </Link>
          <Link href="/docs/analytics/reporting">
            <Button>Reporting →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

