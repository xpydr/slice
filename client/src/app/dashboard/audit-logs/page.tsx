'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useAuditLogs } from '@/hooks/use-audit-logs'

type SortField = 'timestamp' | 'action' | 'entityType' | 'entityId'
type SortDirection = 'asc' | 'desc'
type EntityTypeFilter = 'all' | 'tenant' | 'api_key' | 'user' | 'license' | 'product' | 'plan' | 'activation'

const ITEMS_PER_PAGE = 20

export default function AuditLogsPage() {
  const auditLogsQuery = useAuditLogs()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityTypeFilter>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('timestamp')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const auditLogs = useMemo(() => auditLogsQuery.data?.data || [], [auditLogsQuery.data?.data])

  // Get unique actions for filter dropdown
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>()
    auditLogs.forEach((log) => actions.add(log.action))
    return Array.from(actions).sort()
  }, [auditLogs])

  // Filter and sort audit logs
  const filteredAndSortedLogs = useMemo(() => {
    let filtered = [...auditLogs]

    // Filter by entity type
    if (entityTypeFilter !== 'all') {
      filtered = filtered.filter((log) => log.entityType === entityTypeFilter)
    }

    // Filter by action
    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => log.action === actionFilter)
    }

    // Filter by search term (searches in action, entityId, and metadata)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(searchLower) ||
          log.entityId.toLowerCase().includes(searchLower) ||
          (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchLower))
      )
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filtered = filtered.filter((log) => new Date(log.timestamp) >= fromDate)
    }
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999) // Include the entire end date
      filtered = filtered.filter((log) => new Date(log.timestamp) <= toDate)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
          break
        case 'action':
          aValue = a.action
          bValue = b.action
          break
        case 'entityType':
          aValue = a.entityType
          bValue = b.entityType
          break
        case 'entityId':
          aValue = a.entityId
          bValue = b.entityId
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [auditLogs, entityTypeFilter, actionFilter, searchTerm, dateFrom, dateTo, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedLogs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedLogs = filteredAndSortedLogs.slice(startIndex, endIndex)

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    )
  }

  const formatTimestamp = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">
          View and filter all audit log entries for your tenant
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Showing {filteredAndSortedLogs.length} of {auditLogs.length} total entries
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => auditLogsQuery.refetch()}
              disabled={auditLogsQuery.isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${auditLogsQuery.isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    handleFilterChange()
                  }}
                  placeholder="Search action, entity ID, or metadata"
                />
              </div>

              {/* Entity Type Filter */}
              <div>
                <Label htmlFor="entity-type">Entity Type</Label>
                <select
                  id="entity-type"
                  value={entityTypeFilter}
                  onChange={(e) => {
                    setEntityTypeFilter(e.target.value as EntityTypeFilter)
                    handleFilterChange()
                  }}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="all">All Types</option>
                  <option value="tenant">Tenant</option>
                  <option value="api_key">API Key</option>
                  <option value="user">User</option>
                  <option value="license">License</option>
                  <option value="product">Product</option>
                  <option value="plan">Plan</option>
                  <option value="activation">Activation</option>
                </select>
              </div>

              {/* Action Filter */}
              <div>
                <Label htmlFor="action">Action</Label>
                <select
                  id="action"
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value)
                    handleFilterChange()
                  }}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="all">All Actions</option>
                  {uniqueActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <Label htmlFor="date-from">Date From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value)
                    handleFilterChange()
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date To */}
              <div>
                <Label htmlFor="date-to">Date To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value)
                    handleFilterChange()
                  }}
                />
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setEntityTypeFilter('all')
                    setActionFilter('all')
                    setDateFrom('')
                    setDateTo('')
                    setCurrentPage(1)
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          {auditLogsQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading audit logs...</div>
          ) : auditLogsQuery.data && !auditLogsQuery.data.success ? (
            <div className="text-sm text-red-600">
              {auditLogsQuery.data.error || 'Failed to fetch audit logs'}
            </div>
          ) : paginatedLogs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No audit logs found matching your filters</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">
                        <button
                          onClick={() => handleSort('timestamp')}
                          className="flex items-center hover:text-foreground"
                        >
                          Timestamp
                          <SortIcon field="timestamp" />
                        </button>
                      </th>
                      <th className="text-left p-2">
                        <button
                          onClick={() => handleSort('action')}
                          className="flex items-center hover:text-foreground"
                        >
                          Action
                          <SortIcon field="action" />
                        </button>
                      </th>
                      <th className="text-left p-2">
                        <button
                          onClick={() => handleSort('entityType')}
                          className="flex items-center hover:text-foreground"
                        >
                          Entity Type
                          <SortIcon field="entityType" />
                        </button>
                      </th>
                      <th className="text-left p-2">
                        <button
                          onClick={() => handleSort('entityId')}
                          className="flex items-center hover:text-foreground"
                        >
                          Entity ID
                          <SortIcon field="entityId" />
                        </button>
                      </th>
                      <th className="text-left p-2">Performed By</th>
                      <th className="text-left p-2">Metadata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 text-sm">{formatTimestamp(log.timestamp)}</td>
                        <td className="p-2 text-sm">
                          <span className="font-mono text-xs">{log.action}</span>
                        </td>
                        <td className="p-2 text-sm">
                          <span className="px-2 py-1 bg-muted rounded text-xs">{log.entityType}</span>
                        </td>
                        <td className="p-2 text-sm">
                          <span className="font-mono text-xs">{log.entityId}</span>
                        </td>
                        <td className="p-2 text-sm">
                          {log.performedBy ? (
                            <span className="font-mono text-xs">{log.performedBy}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="p-2 text-sm">
                          {log.metadata && Object.keys(log.metadata).length > 0 ? (
                            <details className="cursor-pointer">
                              <summary className="text-xs text-muted-foreground hover:text-foreground">
                                View metadata
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-w-md">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedLogs.length)} of{' '}
                    {filteredAndSortedLogs.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

