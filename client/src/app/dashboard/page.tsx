'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Key, Users, Activity, TrendingUp, Plus, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProducts } from '@/hooks/use-products'
import { usePlans } from '@/hooks/use-plans'
import { useLicenses } from '@/hooks/use-licenses'
import { useUsers } from '@/hooks/use-users'
import { useAuditLogs } from '@/hooks/use-audit-logs'
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
              <div className="text-sm text-red-600 dark:text-red-400">{auditLogsQuery.data.error || 'Failed to fetch audit logs'}</div>
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
                    <span className="text-xs text-green-600 dark:text-green-400">Success</span>
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
