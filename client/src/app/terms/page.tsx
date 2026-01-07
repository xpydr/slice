import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for SliceAPI - Read our terms and conditions for using our platform.',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing or using SliceAPI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these
                Terms of Service (&quot;Terms&quot;). If you disagree with any part of these Terms, then you may not access
                the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use our License as a Service
                platform and related services (collectively, the &quot;Service&quot;).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                SliceAPI provides a License as a Service (LaaS) platform that enables you to manage software licenses,
                track activations, monitor usage, and handle license validation through our API. The Service includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Multi-tenant license management</li>
                <li>License validation and activation services</li>
                <li>User and seat management</li>
                <li>Analytics and reporting tools</li>
                <li>API access and integration support</li>
                <li>Billing and subscription management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Account Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>To use our Service, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be at least 18 years old or have parental consent</li>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information to keep it accurate</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p>
                You are responsible for safeguarding your account password and API keys. We are not liable for any
                loss or damage arising from your failure to comply with this security obligation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Violate or infringe upon the rights of others, including intellectual property rights</li>
                <li>Transmit any malicious code, viruses, or harmful data</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the integrity or performance of the Service</li>
                <li>Use the Service to send spam, phishing, or other unsolicited communications</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                <li>Share your account credentials or API keys with unauthorized parties</li>
                <li>Use the Service in a manner that could damage, disable, or impair our systems</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">5.1 Subscription Fees</h3>
                <p>
                  Access to the Service requires payment of subscription fees as specified in your selected plan.
                  Fees are billed in advance on a monthly or annual basis, as applicable.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">5.2 Payment Processing</h3>
                <p>
                  Payments are processed through third-party payment processors. By providing payment information,
                  you authorize us to charge your payment method for all fees owed.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">5.3 Price Changes</h3>
                <p>
                  We reserve the right to modify our pricing at any time. Price changes will be communicated to
                  you in advance and will apply to subsequent billing cycles.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">5.4 Refunds</h3>
                <p>
                  Subscription fees are generally non-refundable. Refunds may be provided at our sole discretion
                  or as required by applicable law. Contact us for refund requests.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">5.5 Overdue Payments</h3>
                <p>
                  If payment is not received by the due date, we may suspend or terminate your access to the Service
                  until payment is received. You remain responsible for all fees incurred during the suspension period.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">6.1 Our Intellectual Property</h3>
                <p>
                  The Service, including its original content, features, functionality, and software, is owned by
                  SliceAPI and protected by copyright laws and other applicable intellectual property laws.
                  Unauthorized use, reproduction, or distribution of the Service or its components is prohibited.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">6.2 Your Content</h3>
                <p>
                  You retain ownership of any data, content, or information you submit to the Service (&quot;Your Content&quot;).
                  By using the Service, you grant us a limited, non-exclusive license to use, process, and store
                  Your Content solely for the purpose of providing the Service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">6.3 Feedback</h3>
                <p>
                  Any feedback, comments, or suggestions you provide regarding the Service may be used by us
                  without restriction or obligation to compensate you.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Data and Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your use of the Service is also governed by our Privacy Policy, which explains how we collect,
                use, and protect your information. By using the Service, you consent to the collection and use
                of information as described in our Privacy Policy.
              </p>
              <p>
                You are responsible for ensuring that any data you submit to the Service complies with applicable
                data protection laws and that you have obtained necessary consents from data subjects.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We strive to maintain high availability of the Service but do not guarantee uninterrupted or
                error-free operation. The Service may be temporarily unavailable due to maintenance, updates,
                or circumstances beyond our control.
              </p>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time
                with or without notice. We are not liable for any loss or damage resulting from such actions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">9.1 Termination by You</h3>
                <p>
                  You may terminate your account at any time by contacting us or using the account deletion
                  features in the Service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">9.2 Termination by Us</h3>
                <p>
                  We may suspend or terminate your access to the Service immediately, without prior notice,
                  if you breach these Terms or engage in any fraudulent, illegal, or harmful activity.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">9.3 Effect of Termination</h3>
                <p>
                  Upon termination, your right to use the Service will immediately cease. We may delete your
                  account and data, though we may retain certain information as required by law or for legitimate
                  business purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p>
                We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects
                will be corrected. We do not warrant or make any representations regarding the use or results of
                the Service in terms of accuracy, reliability, or otherwise.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL SLICEAPI, ITS AFFILIATES, OR THEIR
                RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST DATA, OR BUSINESS
                INTERRUPTION, ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE.
              </p>
              <p>
                OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE SHALL NOT EXCEED
                THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You agree to indemnify, defend, and hold harmless SliceAPI and its affiliates from any claims,
                damages, losses, liabilities, and expenses (including legal fees) arising out of or relating to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your Content or any data you submit to the Service</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
                without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising out of or relating to these Terms or the Service shall be resolved through
                binding arbitration in accordance with the rules of [Arbitration Organization], except where
                prohibited by law.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of material changes
                by posting the updated Terms on this page and updating the &quot;Last updated&quot; date.
                Your continued use of the Service after such changes constitutes acceptance of the modified Terms.
              </p>
              <p>
                If you do not agree to the modified Terms, you must stop using the Service and may terminate
                your account.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>15. Miscellaneous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">15.1 Entire Agreement</h3>
                <p>
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you
                  and SliceAPI regarding the Service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">15.2 Severability</h3>
                <p>
                  If any provision of these Terms is found to be unenforceable or invalid, that provision
                  shall be limited or eliminated to the minimum extent necessary, and the remaining provisions
                  shall remain in full force and effect.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">15.3 Waiver</h3>
                <p>
                  No waiver of any term of these Terms shall be deemed a further or continuing waiver of such
                  term or any other term.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">15.4 Assignment</h3>
                <p>
                  You may not assign or transfer these Terms or your account without our prior written consent.
                  We may assign these Terms without restriction.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>16. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul className="list-none space-y-2 ml-4">
                <li><strong>Email:</strong> legal@sliceapi.com</li>
                <li><strong>Website:</strong> <a href="/contact" className="text-primary hover:underline">Contact Page</a></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

