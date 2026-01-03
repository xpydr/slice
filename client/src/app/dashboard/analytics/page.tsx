'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useLicenses } from '@/hooks/use-licenses'
import { useAuditLogs } from '@/hooks/use-audit-logs'
import type { AuditLog } from '@/lib/api'

type EntityType = 'all' | 'user' | 'license' | 'activation'

export default function AnalyticsPage() {
  const licensesQuery = useLicenses()
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('all')
  
  // Always fetch all audit logs, we'll filter in the component
  const auditLogsQuery = useAuditLogs()

  const licenses = licensesQuery.data?.data || []
  const auditLogs = useMemo(() => auditLogsQuery.data?.data || [], [auditLogsQuery.data?.data])

  // Filter audit logs by selected entity type for display
  const filteredLogs = useMemo(() => {
    if (selectedEntityType === 'all') {
      return auditLogs
    }
    return auditLogs.filter(log => log.entityType === selectedEntityType)
  }, [auditLogs, selectedEntityType])

  // Process audit logs to group by date and entity type
  // Use all logs when showing 'all', filtered logs when showing specific type
  const chartData = useMemo(() => {
    // Get the last 30 days
    const days = 30
    const today = new Date()
    type ChartDataPoint = {
      date: string
      user: number
      license: number
      activation: number
      validations: number
      total: number
    }
    const dateMap = new Map<string, ChartDataPoint>()

    // Initialize all dates with zero counts for each entity type
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      dateMap.set(dateKey, {
        date: dateKey,
        user: 0,
        license: 0,
        activation: 0,
        validations: 0,
        total: 0,
      })
    }

    // Use all logs when showing 'all', filtered logs when showing specific type
    const logsToProcess = selectedEntityType === 'all' ? auditLogs : filteredLogs

    // Count logs by date and entity type
    logsToProcess.forEach((log: AuditLog) => {
      const logDate = new Date(log.timestamp)
      const dateKey = logDate.toISOString().split('T')[0]
      
      if (dateMap.has(dateKey)) {
        const dayData = dateMap.get(dateKey)!
        const entityType = log.entityType as keyof ChartDataPoint
        
        // Count by entity type
        if (entityType in dayData && typeof dayData[entityType] === 'number') {
          (dayData[entityType] as number) = (dayData[entityType] as number) + 1
        }
        
        // Count validations separately (license.validated actions)
        if (log.action === 'license.validated') {
          dayData.validations = dayData.validations + 1
        }
        
        dayData.total = dayData.total + 1
      }
    })

    return Array.from(dateMap.values())
  }, [auditLogs, filteredLogs, selectedEntityType])

  // Chart configuration
  const chartConfig = {
    user: {
      label: 'User',
      color: 'hsl(var(--chart-3))',
    },
    license: {
      label: 'License',
      color: 'hsl(var(--chart-4))',
    },
    activation: {
      label: 'Activation',
      color: 'hsl(var(--chart-2))',
    },
    validations: {
      label: 'Validations',
      color: 'hsl(var(--chart-4))',
    },
    total: {
      label: 'Total',
      color: 'hsl(var(--chart-3))',
    },
  }

  // Determine which data keys to show based on selection
  const dataKeys = useMemo(() => {
    if (selectedEntityType === 'all') {
      return ['user', 'license', 'activation', 'validations']
    }
    // When showing a specific entity type, also show validations if it's license-related
    if (selectedEntityType === 'license') {
      return [selectedEntityType, 'validations', 'total']
    }
    return [selectedEntityType, 'total']
  }, [selectedEntityType])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          License usage and performance metrics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log Analytics</CardTitle>
          <CardDescription>Activity trends over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Entity Type Filter */}
            <div className="flex items-center gap-4">
              <Label htmlFor="entity-type" className="text-sm font-medium">
                Filter by Entity Type:
              </Label>
              <select
                id="entity-type"
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value as EntityType)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Types</option>
                <option value="user">User</option>
                <option value="license">License</option>
                <option value="activation">Activation</option>
              </select>
            </div>

            {/* Area Chart */}
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    {dataKeys.map((key) => (
                      <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop 
                          offset="5%" 
                          stopColor={chartConfig[key as keyof typeof chartConfig]?.color || 'hsl(var(--chart-1))'} 
                          stopOpacity={0.8}
                        />
                        <stop 
                          offset="95%" 
                          stopColor={chartConfig[key as keyof typeof chartConfig]?.color || 'hsl(var(--chart-1))'} 
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="font-medium text-sm">
                              {formatDate(label)}
                            </div>
                            {payload.map((entry, index) => {
                              const config = chartConfig[entry.dataKey as keyof typeof chartConfig]
                              return (
                                <div key={index} className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-2.5 w-2.5 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      {config?.label || entry.dataKey}
                                    </span>
                                  </div>
                                  <span className="font-mono text-xs font-medium">
                                    {entry.value}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    }}
                  />
                  {dataKeys.map((key) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={chartConfig[key as keyof typeof chartConfig]?.color || 'hsl(var(--chart-1))'}
                      fill={`url(#color${key})`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No audit log data available for the selected filter
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
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
              {filteredLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <p className="text-xs text-muted-foreground">No audit logs found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

