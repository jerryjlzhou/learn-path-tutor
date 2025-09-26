import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Calendar, Gift } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join hundreds of students who have improved their grades with personalized tutoring
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Free Trial CTA */}
            <Card className="shadow-medium hover:shadow-strong transition-smooth border-2 border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <Gift className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Free Trial Lesson</h3>
                  <p className="text-muted-foreground mb-6">
                    Experience our personalized teaching approach with a complimentary 60-minute session
                  </p>
                </div>
                <Link to="/booking?trial=true">
                  <Button size="lg" className="w-full">
                    Book Free Trial
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-3">
                  No payment required • Limited to first-time students
                </p>
              </CardContent>
            </Card>

            {/* Regular Booking CTA */}
            <Card className="shadow-medium hover:shadow-strong transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <Calendar className="h-12 w-12 text-secondary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Book a Session</h3>
                  <p className="text-muted-foreground mb-6">
                    Schedule your regular tutoring session from $60/hour (online) with flexible timing
                  </p>
                </div>
                <Link to="/booking">
                  <Button variant="outline" size="lg" className="w-full">
                    Schedule Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-3">
                  Online $60/hr • In-person $70/hr • Flexible cancellation
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Don't have an account yet?
            </p>
            <Link to="/auth?mode=signup">
              <Button variant="ghost" size="lg">
                Create Your Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}