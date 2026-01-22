import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Layers } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Creating Plans',
  description: 'Guide to creating licensing plans',
}

export default function PlansGuidePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Creating Plans</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to create licensing plans for your products.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              What is a Plan?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>A Plan defines a specific licensing tier or pricing model for a Product. It contains all the licensing rules that will be applied to licenses created from it.</p>
            <div>
              <h3 className="font-semibold mb-2">Plan Properties:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">maxSeats</code> - Maximum number of users (null = unlimited)</li>
                <li><code className="bg-muted px-1 rounded">expiresInDays</code> - License expiration period (null = never expires)</li>
                <li><code className="bg-muted px-1 rounded">features</code> - Array of feature flags</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Creating a Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Using the Dashboard:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <Link href="/dashboard/plans" className="text-primary hover:underline">Plans</Link> in your dashboard</li>
                <li>Click &quot;Create Plan&quot;</li>
                <li>Select a product</li>
                <li>Enter plan name and configure settings</li>
                <li>Add feature flags if needed</li>
                <li>Click &quot;Create&quot;</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Using the API:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`POST /api/v1/admin/plans
{
  "productId": "product_123",
  "name": "Professional",
  "maxSeats": 5,
  "expiresInDays": 365,
  "features": ["feature1", "feature2"]
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Example Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Basic Plan</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "name": "Basic",
  "maxSeats": 1,
  "expiresInDays": 365,
  "features": ["basic_editing"]
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Enterprise Plan</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "name": "Enterprise",
  "maxSeats": null,  // Unlimited
  "expiresInDays": null,  // Never expires
  "features": ["all_features", "api_access", "priority_support"]
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/docs/guides/products">
            <Button variant="outline">← Setting Up Products</Button>
          </Link>
          <Link href="/docs/guides/licenses">
            <Button>Managing Licenses →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

