import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Gift, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { BookingForm } from '@/components/booking/BookingForm';
import { getHourlyRate, isValidSessionMode, type SessionMode } from '@/lib/pricing';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isFreeTrial = searchParams.get('trial') === 'true';
  const modeParam = searchParams.get('mode');
  const mode: SessionMode | undefined = isValidSessionMode(modeParam) ? modeParam : undefined;

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show contact prompt for non-logged-in users
  if (!user) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-primary/20">
              <CardContent className="p-12 text-center">
                <Gift className="h-16 w-16 text-primary mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">First time?</h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Contact me directly to organize your first lesson free!
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/contact')}
                  className="gap-2"
                >
                  <Mail className="h-5 w-5" />
                  Contact Me
                </Button>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/auth')}
                  >
                    Already registered? Sign in
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold">
                {isFreeTrial ? 'Book Your Free Trial' : 'Book a Session'}
              </h1>
            </div>
            {isFreeTrial && (
              <Badge variant="secondary" className="mb-4">
                <Gift className="h-4 w-4 mr-2" />
                Free 60-minute trial session
              </Badge>
            )}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isFreeTrial 
                ? 'Experience our personalized teaching approach with a complimentary session'
                : 'Schedule your tutoring session with flexible timing and payment options'
              }
            </p>
          </div>

          {/* Booking Form */}
          <BookingForm isFreeTrial={isFreeTrial} preselectedMode={mode} />

          {/* Free Trial Benefits */}
          {isFreeTrial && (
            <Card className="mt-8 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Gift className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Free Trial Benefits</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Full 60-minute personalized session</li>
                      <li>• Assessment of current learning level</li>
                      <li>• Customized learning plan discussion</li>
                      <li>• No payment required upfront</li>
                      <li>• Limited to first-time students only</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}