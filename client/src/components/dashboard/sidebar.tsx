'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Key, 
  Package, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar-context'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Licenses', href: '/dashboard/licenses', icon: Key },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Plans', href: '/dashboard/plans', icon: FileText },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Shield },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface SidebarProps {
  isMobileOpen: boolean
  onMobileToggle: () => void
}

export function Sidebar({ isMobileOpen, onMobileToggle }: SidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapse } = useSidebar()

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-background border-r transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            {!isCollapsed && (
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  SliceAPI
                </span>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/dashboard" className="flex items-center justify-center w-full">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  S
                </span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="hidden lg:flex"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileToggle}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    // Close mobile menu on navigation
                    if (window.innerWidth < 1024) {
                      onMobileToggle()
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    isCollapsed && 'justify-center'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={cn('h-5 w-5 flex-shrink-0', isCollapsed && 'mx-auto')} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

