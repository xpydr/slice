import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'User Management API',
  description: 'API reference for managing users',
}

export default function UsersAPIPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            User Management API
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create and manage users in your tenant.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create User
            </CardTitle>
            <CardDescription>POST /api/v1/admin/users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Creates a new user. Users are identified by their <code className="bg-muted px-1 rounded">externalId</code>, which should be your internal user identifier.</p>
            <div>
              <h3 className="font-semibold mb-2">Request Body</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "externalId": "user_123",      // Required: Your internal user ID
  "email": "user@example.com",   // Optional
  "name": "John Doe",            // Optional
  "metadata": {                   // Optional
    "source": "signup"
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
    "id": "user_internal_id",
    "tenantId": "tenant_123",
    "externalId": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "metadata": { "source": "signup" },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}`}</code>
              </pre>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <p className="text-sm">
                <strong>Note:</strong> Users are automatically created when validating a license if they don&apos;t exist. 
                You only need to create users manually if you want to set additional metadata.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Get Users
            </CardTitle>
            <CardDescription>GET /api/v1/admin/users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Retrieves all users for your tenant, optionally filtered by external ID.</p>
            <div>
              <h3 className="font-semibold mb-2">Query Parameters</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">externalId</code> (optional) - Filter by external ID</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/api/licenses">
            <Button variant="outline">← License Management</Button>
          </Link>
          <Link href="/docs/api/products">
            <Button>Product Management →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

