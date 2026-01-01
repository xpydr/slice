'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, Search } from 'lucide-react'
import { useUsers } from '@/hooks/use-users'
import type { LaaSUser } from '@/lib/api'

export default function UsersPage() {
  const usersQuery = useUsers()
  const [userSearch, setUserSearch] = useState('')

  const users = usersQuery.data?.data || []

  const filteredUsers = userSearch
    ? users.filter((u: LaaSUser) => 
        u.externalId.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase())
      )
    : users

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-2">
          Manage users in your system
        </p>
      </div>

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
    </div>
  )
}

