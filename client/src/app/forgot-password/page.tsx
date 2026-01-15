import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Password reset page for SliceAPI accounts.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Password Reset</CardTitle>
            <CardDescription>
              Reset your account password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md">
              <p className="font-medium mb-2">Password reset is currently under maintenance</p>
              <p className="text-amber-700">
                We&apos;re working to improve our password reset system. In the meantime, please contact our support team to reset your password.
              </p>
            </div>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/contact">
                  Contact Support
                </Link>
              </Button>
              <div className="text-center text-sm">
                <Link href="/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
