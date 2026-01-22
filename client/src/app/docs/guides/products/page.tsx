import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Setting Up Products',
  description: 'Guide to creating and managing products',
}

export default function ProductsGuidePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Setting Up Products</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to create and organize your products.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              What is a Product?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>A Product represents your software application or service. It&apos;s the top-level container that groups related licensing plans together.</p>
            <div>
              <h3 className="font-semibold mb-2">Characteristics:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Simple structure - just name and description</li>
                <li>No licensing rules - those belong in Plans</li>
                <li>Container for Plans - a product can have multiple plans</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Creating a Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Using the Dashboard:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <Link href="/dashboard/products" className="text-primary hover:underline">Products</Link> in your dashboard</li>
                <li>Click &quot;Create Product&quot;</li>
                <li>Enter a name and optional description</li>
                <li>Click &quot;Create&quot;</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Using the API:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`POST /api/v1/admin/products
{
  "name": "My Software",
  "description": "My awesome software product"
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1">
              <li>Use clear, descriptive product names</li>
              <li>Add descriptions to explain what the product does</li>
              <li>Create separate products for different software applications</li>
              <li>Keep products simple - licensing rules go in Plans</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/api/products">
            <Button variant="outline">← Product API</Button>
          </Link>
          <Link href="/docs/guides/plans">
            <Button>Creating Plans →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

