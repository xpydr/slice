import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Key } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Managing Licenses',
  description: 'Guide to creating and managing licenses',
}

export default function LicensesGuidePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Managing Licenses</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to create, assign, and manage licenses.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Creating Licenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Licenses are created from plans and inherit all the plan&apos;s settings. When you create a license, it snapshots the plan configuration at that moment.</p>
            <div>
              <h3 className="font-semibold mb-2">Using the Dashboard:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <Link href="/dashboard/licenses" className="text-primary hover:underline">Licenses</Link></li>
                <li>Click &quot;Create License&quot;</li>
                <li>Select a plan</li>
                <li>Optionally override expiration</li>
                <li>Click &quot;Create&quot;</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigning Licenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>After creating a license, assign it to a user by their <code className="bg-muted px-1 rounded">userId</code> (your internal user identifier).</p>
            <div>
              <h3 className="font-semibold mb-2">Using the API:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`POST /api/v1/admin/licenses/:licenseId/assign
{
  "userId": "user_123"
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>License Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Licenses can have different statuses:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><code className="bg-muted px-1 rounded">active</code> - License is active and valid</li>
              <li><code className="bg-muted px-1 rounded">suspended</code> - Temporarily disabled</li>
              <li><code className="bg-muted px-1 rounded">revoked</code> - Permanently disabled</li>
              <li><code className="bg-muted px-1 rounded">expired</code> - Past expiration date</li>
            </ul>
            <p className="text-sm">Update status using <code className="bg-muted px-1 rounded">PATCH /api/v1/admin/licenses/:id/status</code></p>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/guides/plans">
            <Button variant="outline">← Creating Plans</Button>
          </Link>
          <Link href="/docs/guides/activations">
            <Button>Handling Activations →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

