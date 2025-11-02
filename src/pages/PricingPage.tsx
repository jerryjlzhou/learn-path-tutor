import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function PricingPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // Check if user is signed in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsSignedIn(!!user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsSignedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);
  const pricingPlans = [
    {
      name: 'Online Sessions',
      price: '$60',
      period: 'per hour',
      description: 'Perfect for flexible learning from anywhere',
      features: [
        '1-on-1 personalized tutoring via Zoom with Face camera',
        'iPad screen share for worked explanations',
        'Session recordings available',
        'Custom HSC / Selective / OC Learning material',
        'Comprehensive resources and past papers available',
        'Unlimited Homework support between lessons',
        'Flexible scheduling that suits you',
        'Progress tracking and weekly parent feedback',
      ],
      popular: true,
      mode: 'online'
    },
    {
      name: 'In-Person Sessions',
      price: '$70',
      period: 'per hour',
      description: 'Face-to-face learning for maximum engagement',
      features: [
        '1-on-1 face to face learning',
        'Your choice of location in Sydney (Home / Library, etc)',
        'Large physical whiteboard provided for interactive working',
        'Custom HSC / Selective / OC Learning material',
        'Comprehensive resources and past papers available',
        'Unlimited Homework support between lessons',
        'Flexible scheduling that suits you',
        'Progress tracking and weekly parent feedback',
      ],
      popular: true,
      mode: 'in-person'
    }
  ];

  return (
    <Layout>
      <div className="container py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose between online or in-person tutoring sessions. Both options include the same high-quality, 
              personalized education experience.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative shadow-medium hover:shadow-strong transition-smooth ${
                  plan.popular ? 'border-2 border-primary' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1">
                    Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3 pt-4">
                    <Link to={`/booking?mode=${plan.mode}`}>
                      <Button 
                        className="w-full" 
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        Book {plan.name}
                      </Button>
                    </Link>
                    {!isSignedIn && (
                      <Link to={`/booking?trial=true&mode=${plan.mode}`}>
                        <Button variant="ghost" className="w-full mt-2">
                          Try Free Session
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Information */}
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Free Trial Available</h3>
              <p className="text-sm text-muted-foreground">
                Try our service with a complimentary 60-minute session for first-time students
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Flexible Cancellation</h3>
              <p className="text-sm text-muted-foreground">
                Cancel or reschedule sessions anytime with no charge
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Package Deals</h3>
              <p className="text-sm text-muted-foreground">
                Contact us for discounted rates on bulk session packages and long-term commitments
              </p>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <Card className="p-6">
                <h3 className="font-semibold mb-3">What's the difference between online and in-person sessions?</h3>
                <p className="text-sm text-muted-foreground">
                  Both offer the same quality of education. Online sessions provide flexibility and convenience, 
                  while in-person sessions offer direct face-to-face interaction and hands-on learning materials.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-3">Can I switch between online and in-person?</h3>
                <p className="text-sm text-muted-foreground">
                  Absolutely! You can book different session types based on your schedule and learning preferences. 
                  Just select your preferred mode when booking each session.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-3">How long are the sessions?</h3>
                <p className="text-sm text-muted-foreground">
                  Standard sessions are 60 minutes long. This provides enough time for comprehensive learning 
                  while maintaining focus and engagement throughout the session.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-3">What subjects do you cover?</h3>
                <p className="text-sm text-muted-foreground">
                  I specialize in OC & Selective exam preparation, High School Mathematics, and English. 
                  I cover years 3-12 and can adapt to specific curriculum requirements.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}