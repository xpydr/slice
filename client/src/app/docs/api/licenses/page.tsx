import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Key, Plus, Settings } from 'lucide-react'

export const metadata: Metadata = {
  title: 'License Management API',
  description: 'API reference for creating and managing licenses',
}

export default function LicensesAPIPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            License Management API
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create, assign, and manage licenses for your users.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create License
            </CardTitle>
            <CardDescription>POST /api/v1/admin/licenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Creates a new license from a plan. The license inherits all settings from the plan.</p>
            <div>
              <h3 className="font-semibold mb-2">Request Body</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "planId": "plan_abc123",      // Required
  "expiresInDays": 365          // Optional: Override plan default
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Response</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "success": true,
  "data": {
    "id": "license_xyz",
    "productId": "product_123",
    "planId": "plan_abc123",
    "status": "active",
    "maxSeats": 5,
    "expiresAt": "2025-01-01T00:00:00Z",
    "features": ["feature1", "feature2"]
  }
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Assign License to User
            </CardTitle>
            <CardDescription>POST /api/v1/admin/licenses/:id/assign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Assigns a license to a user. The user will be created if they don&apos;t exist.</p>
            <div>
              <h3 className="font-semibold mb-2">Request Body</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "userId": "user_123",          // Required: Your internal user ID
  "metadata": {                  // Optional
    "source": "admin_panel"
  }
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Response</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "success": true,
  "data": {
    "id": "user_license_xyz",
    "userId": "user_internal_id",
    "licenseId": "license_abc",
    "assignedAt": "2024-01-01T00:00:00Z"
  }
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Update License Status
            </CardTitle>
            <CardDescription>PATCH /api/v1/admin/licenses/:id/status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Updates a license&apos;s status (active, suspended, revoked, expired).</p>
            <div>
              <h3 className="font-semibold mb-2">Request Body</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "status": "suspended"  // "active" | "suspended" | "revoked" | "expired"
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Response</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "success": true,
  "data": {
    "id": "license_abc",
    "status": "suspended",
    ...
  }
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get Licenses</CardTitle>
            <CardDescription>GET /api/v1/admin/licenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Retrieves all licenses for your tenant, optionally filtered by plan.</p>
            <div>
              <h3 className="font-semibold mb-2">Query Parameters</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">planId</code> (optional) - Filter by plan ID</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get License Usage</CardTitle>
            <CardDescription>GET /api/v1/admin/licenses/:id/usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Gets detailed usage information for a license, including activations and seat usage.</p>
            <div>
              <h3 className="font-semibold mb-2">Response</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
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
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/api/validate">
            <Button variant="outline">← License Validation</Button>
          </Link>
          <Link href="/docs/api/users">
            <Button>User Management →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

