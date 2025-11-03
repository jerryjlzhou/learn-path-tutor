import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, FileText } from 'lucide-react';

export function LegalPage() {
  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Terms of Service Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6" />
                Terms of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-AU', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">1. Acceptance of Terms</h3>
                  <p className="text-muted-foreground">
                    By accessing and using Jenius Education's services, you agree to be bound by these Terms of Service. 
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">2. Service Description</h3>
                  <p className="text-muted-foreground">
                    Jenius Education provides private tutoring services for students in Years 3-12, specializing in:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    <li>HSC Mathematics and English</li>
                    <li>OC (Opportunity Class) preparation</li>
                    <li>Selective School entrance preparation</li>
                    <li>General academic support</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    Sessions are available both online and in-person, subject to availability.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">3. Booking and Payment</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>All bookings must be made through our online booking system or by phone or email contact</li>
                    <li>Payment is required by Card, Bank transfer or Cash</li>
                    <li>Prices are displayed in Australian Dollars (AUD)</li>
                    <li>Online sessions: from $60/hour</li>
                    <li>In-person sessions: from $70/hour</li>
                    <li>Rates may vary based on subject complexity and session length</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">4. Cancellation Policy</h3>
                  <p className="text-muted-foreground">
                    You may cancel or reschedule a session through your account dashboard. 
                    There is no time requirement for cancellations. In the event that payment has been processed,
                    a full refund will be issued.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">5. Student Conduct</h3>
                  <p className="text-muted-foreground">Students are expected to:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    <li>Attend sessions on time and prepared</li>
                    <li>Treat the tutor with respect</li>
                    <li>Have necessary materials ready for each session</li>
                    <li>Maintain appropriate behavior during online and in-person sessions</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    We reserve the right to terminate services for inappropriate conduct without refund.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">6. Intellectual Property</h3>
                  <p className="text-muted-foreground">
                    All materials provided during tutoring sessions, including worksheets, notes, and resources, 
                    are for the student's personal educational use only. Materials may not be reproduced, 
                    distributed, or shared without permission.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">7. Limitation of Liability</h3>
                  <p className="text-muted-foreground">
                    While we strive to provide high-quality tutoring services, we cannot guarantee specific academic outcomes. 
                    Jenius Education is not liable for any indirect, incidental, or consequential damages arising from the use of our services.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">8. Account Termination</h3>
                  <p className="text-muted-foreground">
                    You may delete your account at any time through your profile settings. 
                    We reserve the right to suspend or terminate accounts that violate these terms. 
                    Upon account deletion, your personal information will be removed, but booking history may be retained for business records.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">9. Changes to Terms</h3>
                  <p className="text-muted-foreground">
                    We reserve the right to modify these Terms of Service at any time. 
                    Changes will be effective immediately upon posting to our website. 
                    Continued use of our services after changes constitutes acceptance of the modified terms.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">10. Contact Information</h3>
                  <p className="text-muted-foreground">
                    For questions about these Terms of Service, please contact us at:{' '}
                    <a href="mailto:jerry.zhou25@gmail.com" className="text-primary hover:underline">
                      jerry.zhou25@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Privacy Policy Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6" />
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-AU', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">1. Information We Collect</h3>
                  <p className="text-muted-foreground">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    <li>Name and Email address</li>
                    <li>School information and year level</li>
                    <li>Booking and session details</li>
                    <li>Payment information (processed securely through Stripe)</li>
                    <li>Communication history and feedback</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">2. How We Use Your Information</h3>
                  <p className="text-muted-foreground">We use the information we collect to:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    <li>Provide and manage tutoring services</li>
                    <li>Process bookings and payments</li>
                    <li>Communicate with you about sessions and updates</li>
                    <li>Improve our services and user experience</li>
                    <li>Send important notifications related to your account</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">3. Data Security</h3>
                  <p className="text-muted-foreground">
                    We implement appropriate technical and organizational measures to protect your personal information. 
                    Your data is stored securely using Supabase infrastructure with encryption and access controls. 
                    Payment information is processed through Stripe and we do not store complete payment card details.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">4. Data Retention</h3>
                  <p className="text-muted-foreground">
                    We retain your personal information for as long as necessary to provide our services and comply with legal obligations. 
                    You can request deletion of your account at any time through your profile settings. 
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">5. Third-Party Services</h3>
                  <p className="text-muted-foreground">
                    We use trusted third-party services to operate our platform:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    <li>Supabase - Database and authentication</li>
                    <li>Stripe - Payment processing</li>
                    <li>Email service providers - Resend</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    These services have their own privacy policies and security measures.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">6. Your Rights</h3>
                  <p className="text-muted-foreground">You have the right to:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    <li>Access and review your personal information</li>
                    <li>Update or correct your information</li>
                    <li>Request deletion of your account</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Contact us with privacy concerns</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">7. Contact Us</h3>
                  <p className="text-muted-foreground">
                    If you have any questions about this Privacy Policy, please contact us at:{' '}
                    <a href="mailto:jerry.zhou25@gmail.com" className="text-primary hover:underline">
                      jerry.zhou25@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
