'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'
import { Settings as SettingsIcon, CreditCard, AlertCircle } from 'lucide-react'
import { getSubscription, cancelSubscription, type Subscription } from '@/lib/api'

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  
  // Subscription state
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>View and manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
              <p className="text-sm mt-1">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm mt-1">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
              <p className="text-sm mt-1">
                {user?.emailVerified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-yellow-600">Not Verified</span>
                )}
              </p>
            </div>
            {user?.createdAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <p className="text-sm mt-1">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your dashboard experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Additional preferences and settings will be available here in the future.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

