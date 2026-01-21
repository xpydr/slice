'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, RefreshCw, X } from 'lucide-react'
import { useProducts, useCreateProduct } from '@/hooks/use-products'
import { usePlans } from '@/hooks/use-plans'

export default function ProductsPage() {
  const productsQuery = useProducts()
  const plansQuery = usePlans()
  const createProductMutation = useCreateProduct()
  
  const [showCreateProduct, setShowCreateProduct] = useState(false)
  const [productForm, setProductForm] = useState({ name: '', description: '' })

  const products = productsQuery.data?.data || []
  const plans = plansQuery.data?.data || []

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await createProductMutation.mutateAsync({
        name: productForm.name,
        description: productForm.description || undefined,
      })
      if (response.success) {
        setProductForm({ name: '', description: '' })
        setShowCreateProduct(false)
      }
    } catch (error) {
      // Error handled by React Query
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground mt-2">
          Manage your products and plans
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your products and plans</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => productsQuery.refetch()}
                disabled={productsQuery.isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${productsQuery.isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => setShowCreateProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {productsQuery.data && !productsQuery.data.success && (
            <div className="mb-4 text-sm text-red-600 dark:text-red-400">{productsQuery.data.error || 'Failed to fetch products'}</div>
          )}
          {showCreateProduct && (
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create Product</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowCreateProduct(false)
                      setProductForm({ name: '', description: '' })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div>
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-description">Description (optional)</Label>
                    <Input
                      id="product-description"
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" disabled={createProductMutation.isPending}>
                    {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          {productsQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-sm text-muted-foreground">No products found. Create your first product!</div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => {
                const productPlans = plans.filter(p => p.productId === product.id)
                return (
                  <Card key={product.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Plans: {productPlans.length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

