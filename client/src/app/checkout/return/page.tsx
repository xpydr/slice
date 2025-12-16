'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // In a real implementation, you might want to verify the session status
    // with your backend. For now, we'll assume success if session_id is present
    if (sessionId) {
      // Wait a moment for webhook to process
      setTimeout(() => {
        setStatus('success')
      }, 2000)
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

