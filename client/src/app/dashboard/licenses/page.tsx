'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, RefreshCw, X } from 'lucide-react'
import { useLicenses, useCreateLicense, useLicenseUsage } from '@/hooks/use-licenses'
import { usePlans } from '@/hooks/use-plans'
import { useProducts } from '@/hooks/use-products'
import type { Plan, Product } from '@/lib/api'

export default function LicensesPage() {
  const plansQuery = usePlans()
  const productsQuery = useProducts()
  const filteredLicensesQuery = useLicenses()
  const createLicenseMutation = useCreateLicense()
  
  const [showCreateLicense, setShowCreateLicense] = useState(false)
  const [planFilter, setPlanFilter] = useState<string>('')
  const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(null)
  const [licenseForm, setLicenseForm] = useState({ planId: '', expiresInDays: '' })
  
  const filteredLicensesQueryWithFilter = useLicenses(planFilter || undefined)
  const licenseUsageQuery = useLicenseUsage(selectedLicenseId || '')
  
  const plans = plansQuery.data?.data || []
  const products = productsQuery.data?.data || []
  const licenses = filteredLicensesQueryWithFilter.data?.data || []
  const licenseUsage = selectedLicenseId && licenseUsageQuery.data?.success ? licenseUsageQuery.data.data : null

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!licenseForm.planId) {
      return
    }
    try {
      const response = await createLicenseMutation.mutateAsync({
        planId: licenseForm.planId,
        expiresInDays: licenseForm.expiresInDays ? parseInt(licenseForm.expiresInDays) : undefined,
      })
      if (response.success) {
        setLicenseForm({ planId: '', expiresInDays: '' })
        setShowCreateLicense(false)
      }
    } catch (error) {
      // Error handled by React Query
    }
  }

  const getPlanName = (planId: string) => {
    return plans.find((p: Plan) => p.id === planId)?.name || planId
  }

  const getProductName = (productId: string) => {
    return products.find((p: Product) => p.id === productId)?.name || productId
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Licenses</h1>
        <p className="text-muted-foreground mt-2">
          Manage all your software licenses
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Licenses</CardTitle>
              <CardDescription>Manage all your software licenses</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => filteredLicensesQueryWithFilter.refetch()}
                disabled={filteredLicensesQueryWithFilter.isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${filteredLicensesQueryWithFilter.isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => setShowCreateLicense(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create License
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLicensesQueryWithFilter.data && !filteredLicensesQueryWithFilter.data.success && (
            <div className="mb-4 text-sm text-red-600">{filteredLicensesQueryWithFilter.data.error || 'Failed to fetch licenses'}</div>
          )}
          {showCreateLicense && (
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create License</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowCreateLicense(false)
                      setLicenseForm({ planId: '', expiresInDays: '' })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateLicense} className="space-y-4">
                  <div>
                    <Label htmlFor="license-plan">Plan</Label>
                    <select
                      id="license-plan"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={licenseForm.planId}
                      onChange={(e) => setLicenseForm(prev => ({ ...prev, planId: e.target.value }))}
                      required
                    >
                      <option value="">Select a plan</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} ({getProductName(plan.productId)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="license-expires">Expires In Days (optional)</Label>
                    <Input
                      id="license-expires"
                      type="number"
                      value={licenseForm.expiresInDays}
                      onChange={(e) => setLicenseForm(prev => ({ ...prev, expiresInDays: e.target.value }))}
                      placeholder="Leave empty to use plan default"
                    />
                  </div>
                  <Button type="submit" disabled={createLicenseMutation.isPending}>
                    {createLicenseMutation.isPending ? 'Creating...' : 'Create License'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          <div className="mb-4">
            <Label htmlFor="plan-filter">Filter by Plan</Label>
            <select
              id="plan-filter"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value)
              }}
            >
              <option value="">All Plans</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
          {filteredLicensesQueryWithFilter.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading licenses...</div>
          ) : licenses.length === 0 ? (
            <div className="text-sm text-muted-foreground">No licenses found</div>
          ) : (
            <div className="space-y-4">
              {licenses.map((license) => (
                <Card key={license.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getPlanName(license.planId)}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            license.status === 'active' ? 'bg-green-100 text-green-800' :
                            license.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                            license.status === 'revoked' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {license.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Product: {getProductName(license.productId)}
                        </p>
                        {license.expiresAt && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(license.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                        {license.maxSeats && (
                          <p className="text-xs text-muted-foreground">
                            Max Seats: {license.maxSeats}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLicenseId(license.id)}
                      >
                        View Usage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selectedLicenseId && licenseUsageQuery.data?.success && licenseUsage && (
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>License Usage</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedLicenseId(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Total Activations:</span> {licenseUsage.totalActivations}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Active Seats:</span> {licenseUsage.activeSeats}
                    {licenseUsage.license.maxSeats && ` / ${licenseUsage.license.maxSeats}`}
                  </p>
                  {licenseUsage.activations.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Recent Activations:</p>
                      <div className="space-y-1">
                        {licenseUsage.activations.slice(0, 5).map((activation) => (
                          <div key={activation.id} className="text-xs text-muted-foreground">
                            User: {activation.userId} | {new Date(activation.activatedAt).toLocaleString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

