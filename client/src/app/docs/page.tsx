import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Book, Code, Key, BarChart3, Shield, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Comprehensive documentation for the Slice License as a Service platform. Learn how to integrate and use our API.',
}

const docSections = [
  {
    title: 'Getting Started',
    description: 'Learn the basics and get up and running quickly',
    icon: Zap,
    links: [
      { title: 'SDK Documentation', href: '/docs/sdk' },
      { title: 'Quick Start Guide', href: '/docs/quickstart' },
      { title: 'Authentication', href: '/docs/authentication' },
      { title: 'Your First Request', href: '/docs/first-request' },
    ],
  },
  {
    title: 'API Reference',
    description: 'Complete API documentation with examples',
    icon: Code,
    links: [
      { title: 'License Validation', href: '/docs/api/validate' },
      { title: 'License Management', href: '/docs/api/licenses' },
      { title: 'User Management', href: '/docs/api/users' },
      { title: 'Product Management', href: '/docs/api/products' },
    ],
  },
  {
    title: 'Authentication',
    description: 'Learn about API keys and security',
    icon: Key,
    links: [
      { title: 'API Keys', href: '/docs/auth/api-keys' },
      { title: 'Security Best Practices', href: '/docs/auth/security' },
      { title: 'Rate Limiting', href: '/docs/auth/rate-limiting' },
    ],
  },
  {
    title: 'Guides',
    description: 'Step-by-step guides for common tasks',
    icon: Book,
    links: [
      { title: 'Setting Up Products', href: '/docs/guides/products' },
      { title: 'Creating Plans', href: '/docs/guides/plans' },
      { title: 'Managing Licenses', href: '/docs/guides/licenses' },
      { title: 'Handling Activations', href: '/docs/guides/activations' },
    ],
  },
  {
    title: 'Analytics',
    description: 'Track usage and monitor your licenses',
    icon: BarChart3,
    links: [
      { title: 'Usage Metrics', href: '/docs/analytics/usage' },
      { title: 'Reporting', href: '/docs/analytics/reporting' },
      { title: 'Webhooks', href: '/docs/analytics/webhooks' },
    ],
  },
  {
    title: 'Security',
    description: 'Security features and compliance',
    icon: Shield,
    links: [
      { title: 'Data Protection', href: '/docs/security/data-protection' },
      { title: 'Audit Logs', href: '/docs/security/audit-logs' },
      { title: 'Compliance', href: '/docs/security/compliance' },
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Documentation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to integrate and use the Slice License as a Service platform.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/docs/sdk">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle>SDK Documentation</CardTitle>
                <CardDescription>
                  TypeScript SDK for integrating license validation
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/docs/quickstart">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>
                  Get started in 5 minutes with our quick start guide
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/docs/api/validate">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle>API Reference</CardTitle>
                <CardDescription>
                  Complete API documentation with code examples
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Documentation Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {docSections.map((section) => {
              const Icon = section.icon
              return (
                <Card key={section.title}>
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    </div>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="text-sm text-primary hover:underline"
                          >
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-muted/50">
          <CardHeader className="text-center">
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/contact">
              <Button variant="outline">Contact Support</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

