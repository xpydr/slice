import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about SliceAPI and our mission to simplify license management for software companies.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            About SliceAPI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re building the future of software license management.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Slice was born from the frustration of managing software licenses at scale. 
                We believe that license management shouldn&apos;t be a complex, time-consuming task 
                that distracts you from building great products.
              </p>
              <p>
                Our platform provides everything you need to manage licenses, track activations, 
                and monitor usage—all through a simple, powerful API. Whether you&apos;re a startup 
                or an enterprise, SliceAPI scales with you.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What We Do</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                SliceAPI is a License as a Service (LaaS) platform that handles the complexity 
                of software licensing so you don&apos;t have to. We provide:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Multi-tenant license management</li>
                <li>Real-time license validation</li>
                <li>Per-license seat tracking</li>
                <li>Comprehensive analytics and reporting</li>
                <li>Secure API access with audit logging</li>
                <li>Flexible pricing and plan management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why Choose SliceAPI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We&apos;ve built SliceAPI with developers in mind. Our API is intuitive, our documentation 
                is comprehensive, and our platform is designed to scale. We handle the infrastructure 
                so you can focus on what matters most—your product.
              </p>
              <p>
                With enterprise-grade security, 99.9% uptime SLA, and dedicated support, 
                SliceAPI is the reliable foundation your licensing needs.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

