'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { verifyEmail, resendVerificationCode, sendVerificationCode } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Check if already verified
  useEffect(() => {
    if (user && user.emailVerified) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Send initial verification code if user is authenticated but not verified
  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !user.emailVerified) {
      // Try to send verification code on mount
      sendVerificationCode().catch((err) => {
        console.error('Failed to send initial verification code:', err)
      })
    }
  }, [authLoading, isAuthenticated, user])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate code format
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)

    try {
      const response = await verifyEmail(code)
      
      if (response.success && response.data) {
        setSuccess('Email verified successfully!')
        // Refresh auth state to get updated user
        await checkAuth()
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        setError(response.error || 'Verification failed. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setSuccess('')
    setIsResending(true)

    try {
      const response = await resendVerificationCode()
      if (response.success) {
        setSuccess('Verification code resent! Please check your email.')
      } else {
        setError(response.error || 'Failed to resend code. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">Loading...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated || !user) {
    return null
  }

  // Don't render if already verified (redirect will happen)
  if (user.emailVerified) {
    return null
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a 6-digit verification code to {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && (
                <div className="p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                  {success}
                </div>
              )}
              {error && (
                <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => {
                    // Only allow digits and limit to 6 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setCode(value)
                  }}
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code sent to your email. Code expires in 15 minutes.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={isResending || isLoading}
                className="text-sm"
              >
                {isResending ? 'Resending...' : "Didn't receive a code? Resend"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
