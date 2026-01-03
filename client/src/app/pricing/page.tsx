'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getSubscription, createBillingPortalSession, Subscription } from '@/lib/api'

// Map plans to Stripe Price IDs (from environment variables or placeholder)
const getPriceId = (planName: string): string | null => {
  const priceMap: Record<string, string> = {
    'Starter': process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || 'price_placeholder_starter',
    'Professional': process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL || 'price_placeholder_professional',
    'Enterprise': process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || 'price_placeholder_enterprise',
  }
  return priceMap[planName] || null
}

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 1,000 licenses',
      '5 products',
      'Basic analytics',
      'Email support',
      'API access',
      'Standard SLA',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'For growing businesses with advanced needs',
    features: [
      'Up to 10,000 licenses',
      'Unlimited products',
      'Advanced analytics',
      'Priority support',
      'API access',
      '99.9% SLA',
      'Audit logs',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with specific requirements',
    features: [
      'Unlimited licenses',
      'Unlimited products',
      'Custom analytics',
      'Dedicated support',
      'API access',
      '99.99% SLA',
      'Custom integrations',
      'Advanced audit logs',
      'SSO support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false)

  // Fetch subscription when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingSubscription(true)
      getSubscription()
        .then((response) => {
          if (response.success && response.data) {
            setSubscription(response.data)
          }
        })
        .catch((error) => {
          console.error('Failed to fetch subscription:', error)
        })
        .finally(() => {
          setIsLoadingSubscription(false)
        })
    }
  }, [isAuthenticated])

  const handlePlanClick = async (planName: string) => {
    if (planName === 'Enterprise') {
      router.push('/contact')
      return
    }

    const priceId = getPriceId(planName)
    if (!priceId) {
      console.error(`No price ID found for plan: ${planName}`)
      return
    }

    // If not authenticated, redirect to signup first
    if (!isAuthenticated) {
      router.push(`/signup?redirect=/checkout?priceId=${encodeURIComponent(priceId)}`)
      return
    }

    // If subscription data is not loaded yet, fetch it now
    let currentSubscription = subscription
    if (!currentSubscription && !isLoadingSubscription) {
      try {
        const response = await getSubscription()
        if (response.success && response.data) {
          currentSubscription = response.data
          setSubscription(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      }
    }

    // Check if tenant has an active subscription
    const hasActiveSubscription = currentSubscription && 
      (currentSubscription.status === 'active' || currentSubscription.status === 'trialing')

    if (hasActiveSubscription) {
      // Route to Stripe billing portal to manage subscription
      try {
        const response = await createBillingPortalSession()
        if (response.success && response.data?.url) {
          window.location.href = response.data.url
        } else {
          console.error('Failed to create billing portal session:', response.error)
          // Fallback to checkout if billing portal fails
          router.push(`/checkout?priceId=${encodeURIComponent(priceId)}`)
        }
      } catch (error) {
        console.error('Error creating billing portal session:', error)
        // Fallback to checkout if billing portal fails
        router.push(`/checkout?priceId=${encodeURIComponent(priceId)}`)
      }
      return
    }

    // Navigate to checkout with priceId
    router.push(`/checkout?priceId=${encodeURIComponent(priceId)}`)
  }
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your needs. All plans include our core features 
          with no hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.popular ? 'border-2 border-primary relative' : ''}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Best Value {/* Most Popular - Once it becomes true */}
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handlePlanClick(plan.name)}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Need help choosing?</CardTitle>
            <CardDescription>
              Our team is here to help you find the perfect plan for your business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/contact">
              <Button variant="outline">Contact Sales</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

