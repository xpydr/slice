import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SliceAPI</h3>
            <p className="text-sm text-muted-foreground">
              Modern License as a Service platform for managing software licenses and user access.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/docs/api/validate" className="hover:text-primary transition-colors">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SliceAPI. All rights reserved.</p>
          {/* <p>Powered by <Link href="https://www.sliceapi.com" className="hover:text-primary transition-colors">SliceAPI</Link></p> */}
          {/* <p>Developed by <Link href="https://www.xpydr.xyz" className="hover:text-primary transition-colors">xpydr</Link></p> */}
        </div>
      </div>
    </footer>
  )
}
