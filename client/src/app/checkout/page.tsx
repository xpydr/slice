'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createCheckoutSession } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const priceId = searchParams?.get('priceId') || null

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/checkout?priceId=${encodeURIComponent(priceId || '')}`)
    }
  }, [authLoading, isAuthenticated, router, priceId])

  // Create checkout session
  useEffect(() => {
    if (!isAuthenticated || authLoading || !priceId) {
      return
    }

    const createSession = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await createCheckoutSession(priceId)

        if (response.success && response.data) {
          setClientSecret(response.data.clientSecret)
        } else {
          setError(response.error || 'Failed to create checkout session')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    createSession()
  }, [isAuthenticated, authLoading, priceId])

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-2xl">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading checkout...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!priceId) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-2xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">No plan selected</h2>
                <p className="text-muted-foreground">Please select a plan from the pricing page.</p>
                <Link href="/pricing">
                  <Button>View Pricing</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-2xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-red-600">Error</h2>
                <p className="text-muted-foreground">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Link href="/pricing">
                    <Button variant="outline">Back to Pricing</Button>
                  </Link>
                  <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-2xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Preparing checkout...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/pricing">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pricing
            </Button>
          </Link>
          <Card>
            <CardHeader>
              <CardTitle>Complete your subscription</CardTitle>
              <CardDescription>
                Enter your payment details to complete your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientSecret && (
                <EmbeddedCheckoutProvider
                  key={clientSecret}
                  stripe={stripePromise}
                  options={{ clientSecret }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-2xl">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading checkout...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}

