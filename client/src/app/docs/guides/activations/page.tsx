import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Handling Activations',
  description: 'Understanding license activations',
}

export default function ActivationsGuidePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Handling Activations</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how license activations work.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              What are Activations?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Activations track when a user validates their license. They are automatically created or updated when you call the validate endpoint.</p>
            <div>
              <h3 className="font-semibold mb-2">Activation Properties:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">activatedAt</code> - When the license was first activated</li>
                <li><code className="bg-muted px-1 rounded">lastCheckedAt</code> - Last time the license was validated</li>
                <li>Links a user to a license</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How Activations Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>When you validate a license, the system checks for an existing activation</li>
              <li>If no activation exists, one is created</li>
              <li>If an activation exists, <code className="bg-muted px-1 rounded">lastCheckedAt</code> is updated</li>
              <li>Activations are used to track seat usage for licenses with <code className="bg-muted px-1 rounded">maxSeats</code></li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Viewing Activations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You can view activation information through the license usage endpoint:</p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`GET /api/v1/admin/licenses/:id/usage

Response:
{
  "license": { ... },
  "activations": [ ... ],
  "totalActivations": 10,
  "activeSeats": 5
}`}</code>
            </pre>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/guides/licenses">
            <Button variant="outline">← Managing Licenses</Button>
          </Link>
          <Link href="/docs">
            <Button>Documentation →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

