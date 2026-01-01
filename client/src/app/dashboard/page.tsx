'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Key, Users, Activity, TrendingUp, Plus, RefreshCw, CreditCard, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProducts } from '@/hooks/use-products'
import { usePlans } from '@/hooks/use-plans'
import { useLicenses } from '@/hooks/use-licenses'
import { useUsers } from '@/hooks/use-users'
import { useAuditLogs } from '@/hooks/use-audit-logs'
import { getSubscription, cancelSubscription, type Subscription } from '@/lib/api'
import type { AuditLog } from '@/lib/api'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  // React Query hooks
  const productsQuery = useProducts()
  const plansQuery = usePlans()
  const licensesQuery = useLicenses()
  const usersQuery = useUsers()
  const auditLogsQuery = useAuditLogs()
  
  // Subscription state
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)

  // Extract data from queries
  const products = productsQuery.data?.data || []
  const plans = plansQuery.data?.data || []
  const licenses = licensesQuery.data?.data || []
  const users = usersQuery.data?.data || []
  const auditLogs = auditLogsQuery.data?.data || []

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
    licensesQuery.refetch()
    usersQuery.refetch()
    auditLogsQuery.refetch()
  }

  // Calculate stats
  const totalLicenses = licenses.length
  const activeUsers = users.length
  const activeProducts = products.length
  const validationsToday = auditLogs.filter(
    (log: AuditLog) => log.action.includes('validated') && 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  ).length

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
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

      {/* Main Content */}
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
            <Link href="/dashboard/licenses">
              <Button
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New License
              </Button>
            </Link>
            <Link href="/dashboard/products">
              <Button
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </Link>
            <Link href="/dashboard/plans">
              <Button
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Plan
              </Button>
            </Link>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={fetchAllData}
              disabled={productsQuery.isFetching || plansQuery.isFetching || licensesQuery.isFetching || usersQuery.isFetching || auditLogsQuery.isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${productsQuery.isFetching || plansQuery.isFetching || licensesQuery.isFetching || usersQuery.isFetching || auditLogsQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh All Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
