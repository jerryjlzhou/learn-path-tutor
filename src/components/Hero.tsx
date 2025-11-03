import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, MapPin, Clock, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function Hero() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateAccount = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if user is already signed in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      toast({
        title: "You are already signed in!",
        description: "You already have an active account.",
      });
      return;
    }
    
    // If not signed in, navigate to signup
    navigate('/auth?mode=signup');
  };

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-10" />
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Private 1-on-1 Tutoring —{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Online or Face-to-Face
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            4 years experience • Years 3–12 • Specialising in HSC Maths and English, OC & Selective exams
            <br />
            <span className="text-lg">Online sessions from $60/hr • In-person sessions from $70/hr</span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/booking" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 shadow-medium transition-smooth">
                Book a Free Trial
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-6 transition-smooth"
              onClick={handleCreateAccount}
            >
              Create Account
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <Card className="p-4 text-center shadow-soft transition-smooth hover:shadow-medium">
              <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">4 Years Experience</p>
            </Card>
            <Card className="p-4 text-center shadow-soft transition-smooth hover:shadow-medium">
              <MapPin className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Online & In-Person</p>
            </Card>
            <Card className="p-4 text-center shadow-soft transition-smooth hover:shadow-medium">
              <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Flexible Scheduling</p>
            </Card>
            <Card className="p-4 text-center shadow-soft transition-smooth hover:shadow-medium">
              <Award className="h-8 w-8 text-primary-light mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Proven Results</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}