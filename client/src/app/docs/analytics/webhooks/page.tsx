import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Webhook } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Webhooks',
  description: 'Receive real-time events via webhooks',
}

export default function WebhooksPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Webhooks</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Receive real-time notifications about license events.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Webhook support is coming soon. This will allow you to receive real-time notifications about license events such as:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>License validations</li>
              <li>License assignments</li>
              <li>License status changes</li>
              <li>User activations</li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <p className="text-sm">
                In the meantime, you can monitor activity through audit logs and the dashboard.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/analytics/reporting">
            <Button variant="outline">← Reporting</Button>
          </Link>
          <Link href="/docs">
            <Button>Documentation →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

