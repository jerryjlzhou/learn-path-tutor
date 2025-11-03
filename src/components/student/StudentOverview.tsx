import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar, Clock, TrendingUp, Star } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Booking = Tables<'bookings'>;

export function StudentOverview() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadBookings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('start_datetime', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: "Error loading bookings",
        description: "There was a problem loading your bookings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const upcomingBookings = bookings.filter(
    b => new Date(b.start_datetime) > new Date() && b.status !== 'cancelled'
  );

  const completedBookings = bookings.filter(b => b.status === 'completed');

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingBookings.length === 1 ? 'session' : 'sessions'} scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              total {completedBookings.length === 1 ? 'lesson' : 'lessons'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ready to boost your learning? Book your next tutoring session now.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              size="lg" 
              onClick={() => navigate('/booking')}
              className="w-full sm:w-auto h-12 sm:h-10 text-base"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book Your Next Lesson
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/submit-review')}
              className="w-full sm:w-auto h-12 sm:h-10 text-base"
            >
              <Star className="h-5 w-5 mr-2" />
              Leave a Review
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Upcoming Session */}
      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Next Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const nextBooking = upcomingBookings[0];
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">
                        {format(new Date(nextBooking.start_datetime), 'EEEE, MMMM d')}
                      </p>
                      <p className="text-muted-foreground">
                        {format(new Date(nextBooking.start_datetime), 'h:mm a')} -{' '}
                        {format(new Date(nextBooking.end_datetime), 'h:mm a')}
                      </p>
                    </div>
                    <Badge>{nextBooking.mode === 'online' ? 'Online' : 'In-Person'}</Badge>
                  </div>
                  {nextBooking.location && (
                    <p className="text-sm text-muted-foreground">
                      📍 {nextBooking.location}
                    </p>
                  )}
                  {nextBooking.notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-semibold mb-1">Your Notes:</p>
                      <p className="text-sm text-muted-foreground">{nextBooking.notes}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {upcomingBookings.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any sessions scheduled yet. Book your first lesson to get started!
            </p>
            <Button onClick={() => navigate('/booking')}>
              Schedule a Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
