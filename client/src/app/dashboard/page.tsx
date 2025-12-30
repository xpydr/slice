'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart3, Users, Key, Activity, TrendingUp, Plus, RefreshCw, X, Search, CreditCard, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProducts, useCreateProduct } from '@/hooks/use-products'
import { usePlans, useCreatePlan } from '@/hooks/use-plans'
import { useLicenses, useCreateLicense, useLicenseUsage } from '@/hooks/use-licenses'
import { useUsers } from '@/hooks/use-users'
import { useAuditLogs } from '@/hooks/use-audit-logs'
import { getSubscription, cancelSubscription, type Subscription } from '@/lib/api'
import type { Product, Plan, License, LicenseUsage, LaaSUser, AuditLog } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  // React Query hooks
  const productsQuery = useProducts()
  const plansQuery = usePlans()
  const licensesQuery = useLicenses()
  const usersQuery = useUsers()
  const auditLogsQuery = useAuditLogs()
  
  const createProductMutation = useCreateProduct()
  const createPlanMutation = useCreatePlan()
  const createLicenseMutation = useCreateLicense()

  // Subscription state
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  
  // Form states
  const [showCreateProduct, setShowCreateProduct] = useState(false)
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [showCreateLicense, setShowCreateLicense] = useState(false)
  
  // Form data
  const [productForm, setProductForm] = useState({ name: '', description: '' })
  const [planForm, setPlanForm] = useState({
    productId: '',
    name: '',
    description: '',
    maxSeats: '',
    expiresInDays: '',
    features: '',
  })
  const [licenseForm, setLicenseForm] = useState({ planId: '', expiresInDays: '' })
  
  // Filters
  const [planFilter, setPlanFilter] = useState<string>('')
  const [userSearch, setUserSearch] = useState('')
  const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(null)
  
  // Filtered queries
  const filteredLicensesQuery = useLicenses(planFilter || undefined)
  const licenseUsageQuery = useLicenseUsage(selectedLicenseId || '')
  
  // Extract data from queries
  const products = productsQuery.data?.data || []
  const plans = plansQuery.data?.data || []
  const licenses = filteredLicensesQuery.data?.data || []
  const users = usersQuery.data?.data || []
  const auditLogs = auditLogsQuery.data?.data || []
  const licenseUsage = selectedLicenseId && licenseUsageQuery.data?.success ? licenseUsageQuery.data.data : null

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.push('/login')
    }
  }, [isAuthenticated, user, router])
  
  // Redirect if email not verified
  useEffect(() => {
    if (user && !user.emailVerified) {
      router.push('/verify-email')
    }
  }, [user, router])
  
  // Handle auth errors
  useEffect(() => {
    if (productsQuery.data && !productsQuery.data.success && 
        (productsQuery.data.error?.includes('401') || productsQuery.data.error?.includes('Unauthorized'))) {
      router.push('/login')
    }
  }, [productsQuery.data, router])

  // Load subscription
  useEffect(() => {
    if (isAuthenticated) {
      const loadSubscription = async () => {
        try {
          setSubscriptionLoading(true)
          const response = await getSubscription()
          if (response.success) {
            setSubscription(response.data || null)
          }
        } catch (error) {
          console.error('Failed to load subscription:', error)
        } finally {
          setSubscriptionLoading(false)
        }
      }
      loadSubscription()
    }
  }, [isAuthenticated])

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? It will remain active until the end of the billing period.')) {
      return
    }

    try {
      setCanceling(true)
      const response = await cancelSubscription()
      if (response.success) {
        // Reload subscription to get updated status
        const subResponse = await getSubscription()
        if (subResponse.success) {
          setSubscription(subResponse.data || null)
        }
        alert('Subscription will be canceled at the end of the billing period.')
      } else {
        alert(response.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      alert('An error occurred while canceling subscription')
    } finally {
      setCanceling(false)
    }
  }

  // Refetch all data
  const fetchAllData = () => {
    productsQuery.refetch()
    plansQuery.refetch()
    filteredLicensesQuery.refetch()
    usersQuery.refetch()
    auditLogsQuery.refetch()
  }

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

  const handleViewLicenseUsage = (licenseId: string) => {
    setSelectedLicenseId(licenseId)
  }

  // Calculate stats
  const totalLicenses = licenses.length
  const activeUsers = users.length
  const activeProducts = products.length
  const validationsToday = auditLogs.filter(
    (log: AuditLog) => log.action.includes('validated') && 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  ).length

  // Filtered data
  const filteredUsers = userSearch
    ? users.filter((u: LaaSUser) => 
        u.externalId.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase())
      )
    : users

  // Get plan name by ID
  const getPlanName = (planId: string) => {
    return plans.find((p: Plan) => p.id === planId)?.name || planId
  }

  // Get product name by ID
  const getProductName = (productId: string) => {
    return products.find((p: Product) => p.id === productId)?.name || productId
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your license management operations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLicenses}</div>
              <p className="text-xs text-muted-foreground">
                {licenses.filter(l => l.status === 'active').length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validations Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{validationsToday}</div>
              <p className="text-xs text-muted-foreground">
                License validations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProducts}</div>
              <p className="text-xs text-muted-foreground">
                Products with plans
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription
                </CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {subscriptionLoading ? (
              <div className="text-sm text-muted-foreground">Loading subscription...</div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Plan</Label>
                    <p className="font-medium">{subscription.planName || subscription.planId}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        subscription.status === 'active' ? 'text-green-600' :
                        subscription.status === 'canceled' ? 'text-red-600' :
                        subscription.status === 'past_due' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Period</Label>
                    <p className="text-sm">
                      {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                  {subscription.cancelAtPeriodEnd && (
                    <div>
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-yellow-600" />
                        Cancellation Scheduled
                      </Label>
                      <p className="text-sm text-yellow-600">
                        Will cancel on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                    >
                      {canceling ? 'Canceling...' : 'Cancel Subscription'}
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/pricing')}>
                      Change Plan
                    </Button>
                  </div>
                )}
                {!subscription.cancelAtPeriodEnd && subscription.status !== 'canceled' && (
                  <Button variant="outline" onClick={() => router.push('/pricing')}>
                    Upgrade Plan
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">No active subscription</p>
                <Button onClick={() => router.push('/pricing')}>
                  Subscribe to a Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="licenses">Licenses</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest license validations and changes</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => auditLogsQuery.refetch()}
                      disabled={auditLogsQuery.isFetching}
                    >
                      <RefreshCw className={`h-4 w-4 ${auditLogsQuery.isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {auditLogsQuery.isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  ) : auditLogsQuery.data && !auditLogsQuery.data.success ? (
                    <div className="text-sm text-red-600">{auditLogsQuery.data.error || 'Failed to fetch audit logs'}</div>
                  ) : auditLogs.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No activity yet</div>
                  ) : (
                    <div className="space-y-4">
                      {auditLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{log.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <span className="text-xs text-green-600">Success</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setShowCreateLicense(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New License
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setShowCreateProduct(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setShowCreatePlan(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Plan
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={fetchAllData}
                    disabled={productsQuery.isFetching || plansQuery.isFetching || filteredLicensesQuery.isFetching || usersQuery.isFetching || auditLogsQuery.isFetching}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${productsQuery.isFetching || plansQuery.isFetching || filteredLicensesQuery.isFetching || usersQuery.isFetching || auditLogsQuery.isFetching ? 'animate-spin' : ''}`} />
                    Refresh All Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="licenses" className="space-y-4">
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
                      onClick={() => filteredLicensesQuery.refetch()}
                      disabled={filteredLicensesQuery.isFetching}
                    >
                      <RefreshCw className={`h-4 w-4 ${filteredLicensesQuery.isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={() => setShowCreateLicense(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create License
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredLicensesQuery.data && !filteredLicensesQuery.data.success && (
                  <div className="mb-4 text-sm text-red-600">{filteredLicensesQuery.data.error || 'Failed to fetch licenses'}</div>
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
                {filteredLicensesQuery.isLoading ? (
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
                              onClick={() => handleViewLicenseUsage(license.id)}
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
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
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
                  <div className="mb-4 text-sm text-red-600">{productsQuery.data.error || 'Failed to fetch products'}</div>
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
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage users in your system</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => usersQuery.refetch()}
                      disabled={usersQuery.isFetching}
                    >
                      <RefreshCw className={`h-4 w-4 ${usersQuery.isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersQuery.data && !usersQuery.data.success && (
                  <div className="mb-4 text-sm text-red-600">{usersQuery.data.error || 'Failed to fetch users'}</div>
                )}
                <div className="mb-4">
                  <Label htmlFor="user-search">Search Users</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="user-search"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by external ID, email, or name"
                    />
                    <Button
                      variant="outline"
                      onClick={() => usersQuery.refetch()}
                      disabled={usersQuery.isFetching}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {usersQuery.isLoading ? (
                  <div className="text-sm text-muted-foreground">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No users found</div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <Card key={user.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{user.name || user.externalId}</h3>
                              <span className="text-xs text-muted-foreground">
                                ID: {user.externalId}
                              </span>
                            </div>
                            {user.email && (
                              <p className="text-sm text-muted-foreground">Email: {user.email}</p>
                            )}
                            {user.metadata && Object.keys(user.metadata).length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                <p className="font-medium">Metadata:</p>
                                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                                  {JSON.stringify(user.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>License usage and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">License Status Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Active</span>
                            <span className="font-medium">
                              {licenses.filter(l => l.status === 'active').length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Suspended</span>
                            <span className="font-medium">
                              {licenses.filter(l => l.status === 'suspended').length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Revoked</span>
                            <span className="font-medium">
                              {licenses.filter(l => l.status === 'revoked').length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Expired</span>
                            <span className="font-medium">
                              {licenses.filter(l => l.status === 'expired').length}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Recent Audit Logs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {auditLogs.slice(0, 5).map((log) => (
                            <div key={log.id} className="text-xs">
                              <p className="font-medium">{log.action}</p>
                              <p className="text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-2">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Advanced analytics charts will be displayed here
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
