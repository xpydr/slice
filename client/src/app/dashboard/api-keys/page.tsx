'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, RefreshCw, X } from 'lucide-react'
import { useApiKeys, useCreateApiKey } from '@/hooks/use-api-keys'
import type { TenantApiKey } from '@/lib/api'

export default function ApiKeysPage() {
  const apiKeysQuery = useApiKeys()
  const createApiKeyMutation = useCreateApiKey()
  
  const [showCreateApiKey, setShowCreateApiKey] = useState(false)
  const [newlyCreatedApiKey, setNewlyCreatedApiKey] = useState<{ apiKey: string; apiKeyRecord: TenantApiKey } | null>(null)
  const [apiKeyForm, setApiKeyForm] = useState({ name: 'Production Key', expiresInDays: '365' })

  const apiKeys = apiKeysQuery.data?.data || []

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await createApiKeyMutation.mutateAsync({
        name: apiKeyForm.name || undefined,
        expiresInDays: apiKeyForm.expiresInDays ? parseInt(apiKeyForm.expiresInDays) : undefined,
      })
      if (response.success && response.data) {
        // Show the newly created key
        setNewlyCreatedApiKey(response.data)
        setApiKeyForm({ name: 'Production Key', expiresInDays: '365' })
        setShowCreateApiKey(false)
      }
    } catch (error) {
      // Error handled by React Query
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground mt-2">
          Manage your API keys for authentication
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for authentication</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => apiKeysQuery.refetch()}
                disabled={apiKeysQuery.isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${apiKeysQuery.isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => setShowCreateApiKey(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeysQuery.data && !apiKeysQuery.data.success && (
            <div className="mb-4 text-sm text-red-600">{apiKeysQuery.data.error || 'Failed to fetch API keys'}</div>
          )}
          
          {/* Show newly created key with warning */}
          {newlyCreatedApiKey && (
            <Card className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-yellow-800 dark:text-yellow-200">API Key Created</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNewlyCreatedApiKey(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md p-4">
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚠️ Store this key securely. It will never be shown again.
                  </p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border border-yellow-300 dark:border-yellow-700 font-mono text-sm break-all">
                    {newlyCreatedApiKey.apiKey}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      navigator.clipboard.writeText(newlyCreatedApiKey.apiKey)
                      alert('API key copied to clipboard!')
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showCreateApiKey && (
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create API Key</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowCreateApiKey(false)
                      setApiKeyForm({ name: 'Production Key', expiresInDays: '365' })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateApiKey} className="space-y-4">
                  <div>
                    <Label htmlFor="api-key-name">Name (optional)</Label>
                    <Input
                      id="api-key-name"
                      value={apiKeyForm.name}
                      onChange={(e) => setApiKeyForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Production Key"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Default: Production Key</p>
                  </div>
                  <div>
                    <Label htmlFor="api-key-expires">Expires In Days (optional)</Label>
                    <Input
                      id="api-key-expires"
                      type="number"
                      value={apiKeyForm.expiresInDays}
                      onChange={(e) => setApiKeyForm(prev => ({ ...prev, expiresInDays: e.target.value }))}
                      placeholder="365"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Default: 365 days</p>
                  </div>
                  <Button type="submit" disabled={createApiKeyMutation.isPending}>
                    {createApiKeyMutation.isPending ? 'Creating...' : 'Create API Key'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {apiKeysQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading API keys...</div>
          ) : apiKeys.length === 0 ? (
            <div className="text-sm text-muted-foreground">No API keys found. Create your first API key!</div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{apiKey.name}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            apiKey.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            apiKey.status === 'revoked' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            apiKey.status === 'expired' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            {apiKey.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {apiKey.keyPrefix}...
                        </p>
                        {apiKey.expiresAt && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                        {apiKey.lastUsedAt && (
                          <p className="text-xs text-muted-foreground">
                            Last used: {new Date(apiKey.lastUsedAt).toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                        </p>
                      </div>
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

