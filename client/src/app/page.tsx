'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap, Shield, BarChart3, Code, Users, ArrowRight, Sparkles, Globe, Lock, Rocket, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function HomePage() {
  const { isLoading: authLoading } = useAuth()

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="flex flex-col items-center text-center space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles className="h-4 w-4" />
            <span>Fast, Simple, and Reliable</span>
          </div>

          <div className="space-y-6 max-w-4xl">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="block">License Management</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient">
                Made Effortless
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground sm:text-2xl leading-relaxed">
              The modern License as a Service platform that handles user management,
              device tracking, and license validation—so you can focus on what matters most.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group">
                Get Started {/* Free */}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2 hover:bg-accent/50 transition-all duration-300">
                View Documentation
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          {/* <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div> */}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 border-y">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              99.9%
            </div>
            <div className="text-sm text-muted-foreground">Historical Uptime</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              &lt;99ms
            </div>
            <div className="text-sm text-muted-foreground">Average Response Time</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              24/7
            </div>
            <div className="text-sm text-muted-foreground">Support</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              ∞
            </div>
            <div className="text-sm text-muted-foreground">Scalability</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              manage licenses
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to simplify license management and scale with your business.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Lightning Fast</CardTitle>
              <CardDescription className="text-base">
                Validate licenses in milliseconds with our optimized API infrastructure built for performance.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Secure by Default</CardTitle>
              <CardDescription className="text-base">
                Enterprise-grade security with API key authentication, encryption, and comprehensive audit logging.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Real-time Analytics</CardTitle>
              <CardDescription className="text-base">
                Track license usage, activations, and user behavior with detailed insights and custom dashboards.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Code className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Developer Friendly</CardTitle>
              <CardDescription className="text-base">
                Simple REST API with comprehensive documentation, SDK support, and code examples for multiple languages.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Multi-tenant Ready</CardTitle>
              <CardDescription className="text-base">
                Built for SaaS platforms with complete tenant isolation, role-based access, and management tools.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Check className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Flexible Licensing</CardTitle>
              <CardDescription className="text-base">
                Seat-based licensing model with configurable limits to match your business needs.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="relative bg-gradient-to-br from-muted/50 via-background to-muted/30 py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary w-fit">
                <Code className="h-4 w-4" />
                <span>Simple Integration</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Get started in{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  minutes
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Our API is designed for simplicity. Validate licenses with just a few lines of code.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/docs">
                  <Button size="lg" className="group">
                    View Full Docs
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Card className="border-2 bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-4 text-sm text-muted-foreground">validate.js</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <pre className="text-sm overflow-x-auto">
                    <code className="text-foreground">
                      {`import { SliceAPI } from '@sliceapi/sdk';

const client = new SliceAPI({
  apiKey: 'your-api-key'
});

// Validate a license
const license = await client
  .licenses
  .validate({
    key: 'license-key',
    deviceId: 'device-id'
  });

if (license.valid) {
  console.log('License is valid!');
}`}
                    </code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            How It{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our simple three-step integration process.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20"></div>

          <div className="relative text-center space-y-6 group">
            <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300 z-10">
              <span className="text-3xl font-bold text-primary-foreground">1</span>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold">Sign Up</h3>
              <p className="text-muted-foreground text-lg">
                Create your account and select a plan that fits your needs. {/* No credit card required. */}
              </p>
            </div>
          </div>

          <div className="relative text-center space-y-6 group">
            <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300 z-10">
              <span className="text-3xl font-bold text-primary-foreground">2</span>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold">Configure</h3>
              <p className="text-muted-foreground text-lg">
                Set up your products, plans, and license configurations through our intuitive dashboard.
              </p>
            </div>
          </div>

          <div className="relative text-center space-y-6 group">
            <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300 z-10">
              <span className="text-3xl font-bold text-primary-foreground">3</span>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold">Integrate</h3>
              <p className="text-muted-foreground text-lg">
                Use our API or SDK to validate licenses in your application. It's that simple.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/5 py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary w-fit">
                  <Rocket className="h-4 w-4" />
                  <span>Designed for Growth</span>
                </div>
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Built for{' '}
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    scale
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Whether you're a startup or enterprise, our platform scales with you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Worldwide Availability</h3>
                    <p className="text-muted-foreground">
                      Fast, reliable access no matter where your team is located.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Enterprise-Grade Security</h3>
                    <p className="text-muted-foreground">
                      Built with enterprise-grade security practices for peace of mind.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Reliable Infrastructure</h3>
                    <p className="text-muted-foreground">
                      Engineered for consistent performance and minimal downtime.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 p-6 hover:border-primary/50 transition-colors">
                  <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                  <div className="text-sm text-muted-foreground">API Calls/Day</div>
                </Card>
                <Card className="border-2 p-6 hover:border-primary/50 transition-colors">
                  <div className="text-3xl font-bold text-primary mb-2">&lt;99ms</div>
                  <div className="text-sm text-muted-foreground">Average Response Time</div>
                </Card>
                <Card className="border-2 p-6 hover:border-primary/50 transition-colors">
                  <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </Card>
                <Card className="border-2 p-6 hover:border-primary/50 transition-colors">
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <Card className="border-2 bg-gradient-to-br from-primary/5 via-background to-primary/5 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>

          <CardHeader className="text-center space-y-6 relative z-10 py-16">
            <CardTitle className="text-4xl sm:text-5xl font-bold">
              Ready to get started?
            </CardTitle>
            <CardDescription className="text-xl max-w-2xl mx-auto">
              Start managing your software licenses effortlessly with SliceAPI. {/*<br />*/}
              {/* Free trial - no credit card required. */}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center gap-4 pb-16 relative z-10">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2 hover:bg-accent/50 transition-all duration-300">
                View Pricing
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

