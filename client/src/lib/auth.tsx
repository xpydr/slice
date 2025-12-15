'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout as apiLogout, LoginResponse } from './api'

interface AuthContextType {
  user: LoginResponse['tenant'] | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: LoginResponse['tenant']) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse['tenant'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      const response = await getCurrentUser()
      
      if (response.success && response.data?.tenant) {
        // Successfully authenticated
        setUser(response.data.tenant)
        console.log('[Auth] User authenticated:', response.data.tenant.email)
      } else {
        // Authentication failed - clear user state
        setUser(null)
        if (response.error) {
          console.log('[Auth] Authentication check failed:', response.error)
        } else {
          console.log('[Auth] Authentication check failed: No user data returned')
        }
      }
    } catch (error) {
      // Network or other errors
      console.error('[Auth] Error checking authentication:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = (userData: LoginResponse['tenant']) => {
    setUser(userData)
    setIsLoading(false)
  }

  const logout = async () => {
    try {
      await apiLogout()
      setUser(null)
      router.push('/')
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null)
      router.push('/')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
