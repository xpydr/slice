'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, RefreshCw, X } from 'lucide-react'
import { usePlans, useCreatePlan } from '@/hooks/use-plans'
import { useProducts } from '@/hooks/use-products'
import type { Product } from '@/lib/api'

export default function PlansPage() {
  const plansQuery = usePlans()
  const productsQuery = useProducts()
  const createPlanMutation = useCreatePlan()
  
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [planForm, setPlanForm] = useState({
    productId: '',
    name: '',
    description: '',
    maxSeats: '',
    expiresInDays: '',
    features: '',
  })

  const plans = plansQuery.data?.data || []
  const products = productsQuery.data?.data || []

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planForm.productId || !planForm.name) {
      return
    }
    try {
      const response = await createPlanMutation.mutateAsync({
        productId: planForm.productId,
        name: planForm.name,
        description: planForm.description || undefined,
        maxSeats: planForm.maxSeats ? parseInt(planForm.maxSeats) : undefined,
        expiresInDays: planForm.expiresInDays ? parseInt(planForm.expiresInDays) : undefined,
        features: planForm.features ? planForm.features.split(',').map(f => f.trim()).filter(Boolean) : undefined,
      })
      if (response.success) {
        setPlanForm({
          productId: '',
          name: '',
          description: '',
          maxSeats: '',
          expiresInDays: '',
          features: '',
        })
        setShowCreatePlan(false)
      }
    } catch (error) {
      // Error handled by React Query
    }
  }

  const getProductName = (productId: string) => {
    return products.find((p: Product) => p.id === productId)?.name || productId
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plans</h1>
        <p className="text-muted-foreground mt-2">
          Manage your product plans
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plans</CardTitle>
              <CardDescription>Manage your product plans</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => plansQuery.refetch()}
                disabled={plansQuery.isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${plansQuery.isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => setShowCreatePlan(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {plansQuery.data && !plansQuery.data.success && (
            <div className="mb-4 text-sm text-red-600">{plansQuery.data.error || 'Failed to fetch plans'}</div>
          )}
          {showCreatePlan && (
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create Plan</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowCreatePlan(false)
                      setPlanForm({
                        productId: '',
                        name: '',
                        description: '',
                        maxSeats: '',
                        expiresInDays: '',
                        features: '',
                      })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePlan} className="space-y-4">
                  <div>
                    <Label htmlFor="plan-product">Product</Label>
                    <select
                      id="plan-product"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={planForm.productId}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, productId: e.target.value }))}
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="plan-name">Plan Name</Label>
                    <Input
                      id="plan-name"
                      value={planForm.name}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-description">Description (optional)</Label>
                    <Input
                      id="plan-description"
                      value={planForm.description}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plan-max-seats">Max Seats (optional)</Label>
                      <Input
                        id="plan-max-seats"
                        type="number"
                        value={planForm.maxSeats}
                        onChange={(e) => setPlanForm(prev => ({ ...prev, maxSeats: e.target.value }))}
                        placeholder="Unlimited if empty"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="plan-expires">Expires In Days (optional)</Label>
                    <Input
                      id="plan-expires"
                      type="number"
                      value={planForm.expiresInDays}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, expiresInDays: e.target.value }))}
                      placeholder="Never expires if empty"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-features">Features (comma-separated, optional)</Label>
                    <Input
                      id="plan-features"
                      value={planForm.features}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, features: e.target.value }))}
                      placeholder="feature1, feature2, feature3"
                    />
                  </div>
                  <Button type="submit" disabled={createPlanMutation.isPending}>
                    {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          {plansQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="text-sm text-muted-foreground">No plans found. Create your first plan!</div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{plan.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {getProductName(plan.productId)}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        {plan.maxSeats && <p>Max Seats: {plan.maxSeats}</p>}
                        {plan.expiresInDays && <p>Expires In: {plan.expiresInDays} days</p>}
                        {plan.features && plan.features.length > 0 && (
                          <p>Features: {plan.features.join(', ')}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

