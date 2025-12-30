'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { getSubscription } from '@/lib/api'

export default function CheckoutReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      // Poll for subscription status instead of just waiting
      const checkSubscription = async () => {
        try {
          const response = await getSubscription()
          if (response.success && response.data) {
            setStatus('success')
          } else {
            // Retry a few times in case webhook is still processing
            let retries = 0
            const maxRetries = 5
            const pollInterval = setInterval(async () => {
              retries++
              const pollResponse = await getSubscription()
              if (pollResponse.success && pollResponse.data) {
                setStatus('success')
                clearInterval(pollInterval)
              } else if (retries >= maxRetries) {
                setStatus('error')
                clearInterval(pollInterval)
              }
            }, 2000)
          }
        } catch (error) {
          console.error('Failed to check subscription:', error)
          setStatus('error')
        }
      }
      checkSubscription()
    } else {
      setStatus('error')
    }
  }, [sessionId])

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Processing your subscription...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <XCircle className="h-12 w-12 text-red-500" />
                <h2 className="text-2xl font-bold">Payment Failed</h2>
                <p className="text-muted-foreground">
                  There was an issue processing your payment. Please try again.
                </p>
                <div className="flex gap-2">
                  <Link href="/pricing">
                    <Button variant="outline">Back to Pricing</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button>Go to Dashboard</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h2 className="text-2xl font-bold">Subscription Successful!</h2>
              <p className="text-muted-foreground">
                Your subscription has been activated. You can now access all features of your plan.
              </p>
              <Link href="/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

