'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { useLicenses } from '@/hooks/use-licenses'
import { useAuditLogs } from '@/hooks/use-audit-logs'

export default function AnalyticsPage() {
  const licensesQuery = useLicenses()
  const auditLogsQuery = useAuditLogs()

  const licenses = licensesQuery.data?.data || []
  const auditLogs = auditLogsQuery.data?.data || []

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
    </div>
  )
}

