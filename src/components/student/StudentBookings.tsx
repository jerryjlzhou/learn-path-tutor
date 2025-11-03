import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Monitor, DollarSign, XCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { formatPrice } from '@/lib/pricing';

type Booking = Tables<'bookings'>;

export function StudentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
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

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
      });

      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Cancellation failed",
        description: "There was a problem cancelling your booking.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      completed: 'outline',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      paid: 'default',
      pending: 'secondary',
      unpaid: 'outline',
      refunded: 'destructive',
    };
    return <Badge variant={variants[paymentStatus] || 'outline'}>{paymentStatus}</Badge>;
  };

  const upcomingBookings = bookings.filter(
    b => new Date(b.start_datetime) > new Date() && b.status !== 'cancelled'
  );
  const pastBookings = bookings.filter(
    b => new Date(b.start_datetime) <= new Date() || b.status === 'cancelled'
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Sessions ({upcomingBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No upcoming sessions. Book your next lesson to get started!
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {format(new Date(booking.start_datetime), 'EEEE, MMMM d, yyyy')}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(new Date(booking.start_datetime), 'h:mm a')} -{' '}
                              {format(new Date(booking.end_datetime), 'h:mm a')}
                            </span>
                          </div>
                          <span>({booking.duration_minutes} min)</span>
                        </div>
                      </div>
                      {booking.status === 'pending' && (
                        <Button
                          variant="destructiveHover"
                          size="sm"
                          className="text-destructive hover:text-white"
                          onClick={() => setCancellingId(booking.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        {booking.mode === 'online' ? (
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">
                          {booking.mode === 'online' ? 'Online' : 'In-Person'}
                        </span>
                      </div>
                      {booking.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{booking.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatPrice(booking.price_cents)} AUD
                        </span>
                        {getPaymentStatusBadge(booking.payment_status)}
                      </div>
                    </div>

                    {booking.notes && (
                      <>
                        <Separator className="my-4" />
                        <div className="text-sm">
                          <p className="font-semibold mb-1">Notes:</p>
                          <p className="text-muted-foreground">{booking.notes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Past Sessions ({pastBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="border opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {format(new Date(booking.start_datetime), 'MMM d, yyyy')}
                          </span>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(booking.start_datetime), 'h:mm a')} -{' '}
                            {format(new Date(booking.end_datetime), 'h:mm a')}
                          </span>
                          <span>• {booking.duration_minutes} min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {booking.mode === 'online' ? (
                          <Monitor className="h-3 w-3" />
                        ) : (
                          <MapPin className="h-3 w-3" />
                        )}
                        <span>{booking.mode === 'online' ? 'Online' : 'In-Person'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancellingId && handleCancelBooking(cancellingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
