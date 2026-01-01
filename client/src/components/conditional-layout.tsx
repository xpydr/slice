'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import Script from 'next/script'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Script 
        strategy="lazyOnload"
        src={process.env.CHAT_EMBED_URL}
        async 
      />
      <Footer />
    </>
  )
}

