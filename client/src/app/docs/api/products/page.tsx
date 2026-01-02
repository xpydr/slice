import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Product Management API',
  description: 'API reference for managing products and plans',
}

export default function ProductsAPIPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Product Management API
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create and manage products and plans.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Create Product</h3>
              <p className="text-sm text-muted-foreground mb-2">POST /api/v1/admin/products</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "name": "My Software",
  "description": "My awesome software product"
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Get Products</h3>
              <p className="text-sm text-muted-foreground mb-2">GET /api/v1/admin/products</p>
              <p className="text-sm text-muted-foreground">Returns all products for your tenant.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Create Plan</h3>
              <p className="text-sm text-muted-foreground mb-2">POST /api/v1/admin/plans</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "productId": "product_123",
  "name": "Professional",
  "description": "Professional plan",
  "maxSeats": 5,
  "expiresInDays": 365,
  "features": ["feature1", "feature2"]
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Get Plans</h3>
              <p className="text-sm text-muted-foreground mb-2">GET /api/v1/admin/plans?productId=...</p>
              <p className="text-sm text-muted-foreground">Returns plans, optionally filtered by product.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/api/users">
            <Button variant="outline">← User Management</Button>
          </Link>
          <Link href="/docs/guides/products">
            <Button>Products Guide →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

