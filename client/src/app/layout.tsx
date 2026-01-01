import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { QueryProvider } from '@/lib/query-provider'
import { ConditionalLayout } from '@/components/conditional-layout'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'SliceAPI - License as a Service Platform',
    template: '%s | SliceAPI'
  },
  description: 'Modern, scalable License as a Service (LaaS) platform for managing software licenses, activations, and user access.',
  keywords: ['license management', 'SaaS', 'software licensing', 'API', 'tenant management', 'SliceAPI', 'Software Licensing as a Service', 'LaaS', 'License as a Service', 'software monetization'],
  authors: [{ name: 'Rohan Puri' }],
  creator: 'xpydr',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.sliceapi.com',
    siteName: 'SliceAPI',
    title: 'SliceAPI - Software Licensing',
    description: 'Modern, scalable License as a Service (LaaS) platform for managing software licenses, activations, and user access.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

