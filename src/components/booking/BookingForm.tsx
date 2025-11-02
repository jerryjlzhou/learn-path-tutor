import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon, Clock, MapPin, Monitor, CreditCard, Banknote } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, addHours, parseISO } from 'date-fns';
import { calculateSessionPrice, formatPrice, getHourlyRate, type SessionMode } from '@/lib/pricing';

interface AvailabilitySlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  mode: SessionMode;
  location?: string;
  is_booked: boolean;
}

interface BookingFormProps {
  preselectedMode?: SessionMode;
}

export function BookingForm({ preselectedMode }: BookingFormProps) {
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [customStartTime, setCustomStartTime] = useState<string>('');
  const [customEndTime, setCustomEndTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'later'>('stripe');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const loadAvailableSlots = useCallback(async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('is_booked', false)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      setAvailableSlots((data || []).map(slot => ({
        ...slot,
        mode: slot.mode as SessionMode
      })));
    } catch (error) {
      console.error('Error loading available slots:', error);
      toast({
        title: "Error loading availability",
        description: "Could not load available time slots.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAvailableSlots();
  }, [loadAvailableSlots]);

  const formatTime = (timeString: string) => {
    // Parse time string (e.g., "14:30:00" or "14:30")
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for midnight
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Generate time options in 30-minute increments
  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        times.push(timeString);
      }
    }
    return times;
  };

  // Convert time string to minutes for comparison
  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Calculate duration in minutes
  const calculateDuration = () => {
    if (!customStartTime || !customEndTime) return 0;
    return timeToMinutes(customEndTime) - timeToMinutes(customStartTime);
  };

  // Validate time selection
  const validateTimes = () => {
    if (!selectedSlot || !customStartTime || !customEndTime) return false;

    const slotStart = timeToMinutes(selectedSlot.start_time);
    const slotEnd = timeToMinutes(selectedSlot.end_time);
    const selectedStart = timeToMinutes(customStartTime);
    const selectedEnd = timeToMinutes(customEndTime);

    // Check if start time is within slot bounds
    if (selectedStart < slotStart) {
      toast({
        title: "Invalid start time",
        description: `Start time must be at or after ${formatTime(selectedSlot.start_time)}`,
        variant: "destructive",
      });
      return false;
    }

    // Check if end time is within slot bounds
    if (selectedEnd > slotEnd) {
      toast({
        title: "Invalid end time",
        description: `End time must be at or before ${formatTime(selectedSlot.end_time)}`,
        variant: "destructive",
      });
      return false;
    }

    // Check if end time is after start time
    if (selectedEnd <= selectedStart) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return false;
    }

    // Check minimum duration (1 hour = 60 minutes)
    const duration = selectedEnd - selectedStart;
    if (duration < 60) {
      toast({
        title: "Minimum duration not met",
        description: "Lesson must be at least 1 hour long",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const calculateTotalPrice = () => {
    if (!selectedSlot || !customStartTime || !customEndTime) return 0;
    const duration = calculateDuration();
    return calculateSessionPrice(selectedSlot.mode, duration);
  };

  // Reset custom times when slot changes
  useEffect(() => {
    if (selectedSlot) {
      setCustomStartTime(selectedSlot.start_time);
      setCustomEndTime(selectedSlot.end_time);
    }
  }, [selectedSlot]);

  const handleBooking = async () => {
    if (!selectedSlot) {
      toast({
        title: "No slot selected",
        description: "Please select an available time slot.",
        variant: "destructive",
      });
      return;
    }

    if (!validateTimes()) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to make a booking.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const duration = calculateDuration();
      
      // Create start and end datetime using custom times
      const startDateTime = new Date(`${selectedSlot.date}T${customStartTime}`);
      const endDateTime = new Date(`${selectedSlot.date}T${customEndTime}`);

      const bookingData = {
        user_id: user.id,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        duration_minutes: duration,
        mode: selectedSlot.mode,
        status: 'pending',
        price_cents: calculateTotalPrice(),
        payment_status: paymentMethod === 'stripe' ? 'pending' : 'unpaid',
        location: selectedSlot.location || null,
        notes: notes || null,
        is_free_trial: false
      };

      // Create booking first
      const { data: createdBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) throw bookingError;
      if (!createdBooking) throw new Error('Failed to create booking');

      // Mark slot as booked
      await supabase
        .from('availability')
        .update({ is_booked: true })
        .eq('id', selectedSlot.id);

      // Get user profile for notifications
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      // Use hardcoded admin email (or you could store this in a config)
      const adminEmail = 'jerry.zhou25@gmail.com';

      // Send email notifications
      const notificationPayload = {
        studentEmail: user.email || '',
        studentName: userProfile?.full_name || 'Student',
        adminEmail,
        bookingDetails: {
          date: format(startDateTime, 'MMMM d, yyyy'),
          startTime: format(startDateTime, 'h:mm a'),
          endTime: format(endDateTime, 'h:mm a'),
          duration: duration,
          mode: selectedSlot.mode,
          location: selectedSlot.location,
          price: calculateTotalPrice(),
          paymentStatus: paymentMethod === 'stripe' ? 'pending' : 'unpaid',
        },
      };

      const { error: emailError } = await supabase.functions.invoke('send-booking-notification', {
        body: notificationPayload,
      });

      if (emailError) {
        console.error('Error sending notification emails:', emailError);
      }

      if (paymentMethod === 'stripe') {
        // Create Stripe checkout session
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-booking-checkout', {
          body: {
            bookingId: createdBooking.id,
            amount: calculateTotalPrice(),
          }
        });

        if (checkoutError) throw checkoutError;
        
        // Redirect to Stripe Checkout
        if (checkoutData?.url) {
          window.open(checkoutData.url, '_blank');
          toast({
            title: "Redirecting to payment",
            description: "You'll be redirected to Stripe to complete your payment.",
          });
        }
      } else {
        toast({
          title: "Booking confirmed!",
          description: "Your lesson has been booked. Payment details will be sent separately.",
        });

        // Reset form
        setSelectedSlot(null);
        setCustomStartTime('');
        setCustomEndTime('');
        setNotes('');
        loadAvailableSlots();
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking failed",
        description: "There was a problem creating your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const groupedSlots = availableSlots.reduce((acc, slot) => {
    if (preselectedMode && slot.mode !== preselectedMode) return acc;
    
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Available Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedSlots).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No available time slots at the moment.
              </p>
              <p className="text-sm text-muted-foreground">
                Please check back later or contact us directly to schedule a session.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSlots)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, slots]) => (
                  <div key={date} className="space-y-3">
                    <h3 className="font-semibold">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {slots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedSlot?.id === slot.id ? "defaultOutline" : "accentOutline"}
                          className="p-4 h-auto justify-start"
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <div className="flex flex-col items-start gap-2 w-full">
                            <div className="flex items-center gap-2">
                              {slot.mode === 'online' ? (
                                <Monitor className="h-4 w-4" />
                              ) : (
                                <MapPin className="h-4 w-4" />
                              )}
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={slot.mode === 'online' ? "default" : "secondary"}>
                                {slot.mode === 'online' ? 'Online' : 'In-Person'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                ${getHourlyRate(slot.mode)}/hr
                              </Badge>
                            </div>
                            {slot.location && (
                              <p className="text-xs text-muted-foreground">
                                📍 {slot.location}
                              </p>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details */}
      {selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Start Time</Label>
                <Select value={customStartTime} onValueChange={setCustomStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent className='bg-background'>
                    {generateTimeOptions()
                      .filter(time => {
                        const timeMinutes = timeToMinutes(time);
                        const slotStart = timeToMinutes(selectedSlot.start_time);
                        const slotEnd = timeToMinutes(selectedSlot.end_time);
                        return timeMinutes >= slotStart && timeMinutes < slotEnd;
                      })
                      .map(time => (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>End Time</Label>
                <Select value={customEndTime} onValueChange={setCustomEndTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent className='bg-background'>
                    {generateTimeOptions()
                      .filter(time => {
                        const timeMinutes = timeToMinutes(time);
                        const slotStart = timeToMinutes(selectedSlot.start_time);
                        const slotEnd = timeToMinutes(selectedSlot.end_time);
                        return timeMinutes > slotStart && timeMinutes <= slotEnd;
                      })
                      .map(time => (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration Display */}
            {customStartTime && customEndTime && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold">Session Duration:</span>{' '}
                  {calculateDuration() >= 60 ? (
                    <>
                      {Math.floor(calculateDuration() / 60)} hour{Math.floor(calculateDuration() / 60) !== 1 ? 's' : ''}{' '}
                      {calculateDuration() % 60 > 0 && `${calculateDuration() % 60} minutes`}
                    </>
                  ) : (
                    <span className="text-destructive">{calculateDuration()} minutes (minimum 1 hour required)</span>
                  )}
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any specific topics you'd like to focus on or questions you have..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Payment Method */}
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value: 'stripe' | 'later') => setPaymentMethod(value)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      Pay now with card (Stripe)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="later" id="later" />
                    <Label htmlFor="later" className="flex items-center gap-2 cursor-pointer">
                      <Banknote className="h-4 w-4" />
                      Pay later (Cash/Bank Transfer)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </>

            {/* Price Summary */}
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Session Duration:</span>
                <span>
                  {customStartTime && customEndTime ? (
                    <>
                      {Math.floor(calculateDuration() / 60)} hour{Math.floor(calculateDuration() / 60) !== 1 ? 's' : ''}{' '}
                      {calculateDuration() % 60 > 0 && `${calculateDuration() % 60} min`}
                    </>
                  ) : (
                    'Not set'
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Hourly Rate ({selectedSlot.mode}):</span>
                <span>${getHourlyRate(selectedSlot.mode)} AUD</span>
              </div>
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total:</span>
                <span>{formatPrice(calculateTotalPrice())} AUD</span>
              </div>
            </div>

            {/* Book Button */}
            <Button 
              onClick={handleBooking} 
              disabled={submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                "Processing..."
              ) : paymentMethod === 'stripe' ? (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4 mr-2" />
                  Book Session (Pay Later)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}