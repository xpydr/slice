'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated, isLoading, logout } = useAuth()

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                SliceAPI
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/pricing') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/docs') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Documentation
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`text-sm font-medium transition-colors border-dotted border-2 p-2 hover:text-primary ${
                        isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

