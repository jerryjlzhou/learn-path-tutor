import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Gift } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { getHourlyRate, isValidSessionMode, type SessionMode } from '@/lib/pricing';

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const isFreeTrial = searchParams.get('trial') === 'true';
  const modeParam = searchParams.get('mode');
  const mode: SessionMode = isValidSessionMode(modeParam) ? modeParam : 'online';
  
  const hourlyRate = getHourlyRate(mode);
  const modeDisplay = mode === 'online' ? 'Online' : 'In-Person';

  return (
    <Layout>
      <div className="container py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isFreeTrial ? 'Book Your Free Trial' : 'Book a Session'}
            </h1>
            {isFreeTrial && (
              <Badge variant="secondary" className="mb-4">
                <Gift className="h-4 w-4 mr-2" />
                Free 60-minute trial session
              </Badge>
            )}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isFreeTrial 
                ? 'Experience our personalized teaching approach with a complimentary session'
                : 'Schedule your tutoring session with flexible timing options'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">60 minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{modeDisplay} Session</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">Price</p>
                    <p className="text-sm text-muted-foreground">
                      {isFreeTrial ? 'Free Trial' : `$${hourlyRate} AUD/hour`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Select Time & Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Booking system coming soon!
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    For now, please contact us directly to schedule your session.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="mailto:contact@example.com">
                      Contact via Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

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