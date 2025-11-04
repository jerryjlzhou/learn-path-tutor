import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon, Clock, MapPin, Monitor, CreditCard, Banknote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { calculateSessionPrice, formatPrice, getHourlyRate, type SessionMode } from '@/lib/pricing';
import { 
  formatTime, 
  generateFullDayTimeOptions, 
  timeToMinutes, 
  calculateDuration,
  calculateEndTime
} from '@/lib/timeUtils';
import { validateBookingTimes } from '@/lib/bookingValidation';
import { loadAvailableSlots, updateAvailabilityAfterBooking } from '@/lib/availabilityUtils';
import { createBooking, sendBookingNotifications, createStripeCheckout } from '@/lib/bookingUtils';

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
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [customStartTime, setCustomStartTime] = useState<string>('');
  const [customEndTime, setCustomEndTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'later'>('stripe');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const loadSlots = useCallback(async () => {
    try {
      const slots = await loadAvailableSlots();
      setAvailableSlots(slots);
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
    loadSlots();
  }, [loadSlots]);

  // Validate time selection with toast notifications
  const validateTimes = () => {
    if (!selectedSlot || !customStartTime || !customEndTime) return false;

    const validationError = validateBookingTimes({
      slotStartTime: selectedSlot.start_time,
      slotEndTime: selectedSlot.end_time,
      selectedStartTime: customStartTime,
      selectedEndTime: customEndTime,
      minDurationMinutes: 60
    });

    if (validationError) {
      toast({
        title: validationError.title,
        description: validationError.description,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const calculateTotalPrice = () => {
    if (!selectedSlot || !customStartTime || !customEndTime) return 0;
    const duration = calculateDuration(customStartTime, customEndTime);
    return calculateSessionPrice(selectedSlot.mode, duration);
  };

  // Reset custom times when slot changes
  useEffect(() => {
    if (selectedSlot) {
      setCustomStartTime(selectedSlot.start_time);
      // Set end time to 1 hour after start time
      const endTime = calculateEndTime(selectedSlot.start_time, 60, selectedSlot.end_time);
      setCustomEndTime(endTime);
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
      const duration = calculateDuration(customStartTime, customEndTime);
      const totalPrice = calculateSessionPrice(selectedSlot.mode, duration);

      if (paymentMethod === 'stripe') {
        // For card payment: Redirect to Stripe checkout with booking details
        // Booking will be created via webhook after successful payment
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-booking-checkout', {
          body: {
            bookingDetails: {
              userId: user.id,
              slotId: selectedSlot.id,
              slotDate: selectedSlot.date,
              slotMode: selectedSlot.mode,
              slotLocation: selectedSlot.location,
              startTime: customStartTime,
              endTime: customEndTime,
              duration: duration,
              notes: notes,
              amount: totalPrice,
            }
          }
        });

        if (checkoutError) throw checkoutError;
        
        if (checkoutData?.url) {
          // Redirect to Stripe Checkout
          window.location.href = checkoutData.url;
        }
      } else {
        // For "Pay Later": Create booking immediately
        const { booking, totalPrice: price } = await createBooking({
          selectedSlot,
          customStartTime,
          customEndTime,
          userId: user.id,
          paymentMethod,
          notes,
        });

        // Update availability slots (split or delete)
        await updateAvailabilityAfterBooking({
          selectedSlot,
          customStartTime,
          customEndTime,
        });

        // Send notification emails
        await sendBookingNotifications(
          booking,
          selectedSlot,
          customStartTime,
          customEndTime,
          price,
          paymentMethod
        );

        // Reload available slots and reset form
        await loadSlots();
        setSelectedSlot(null);
        setCustomStartTime('');
        setCustomEndTime('');
        setNotes('');

        toast({
          title: "Booking confirmed!",
          description: "Your lesson has been booked. Payment details will be sent separately.",
        });

        // Redirect to bookings page
        setTimeout(() => {
          navigate('/profile?tab=bookings');
        }, 1500);
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
                    {generateFullDayTimeOptions(30)
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
                    {generateFullDayTimeOptions(30)
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
                  {(() => {
                    const duration = calculateDuration(customStartTime, customEndTime);
                    if (duration >= 60) {
                      const hours = Math.floor(duration / 60);
                      const mins = duration % 60;
                      return (
                        <>
                          {hours} hour{hours !== 1 ? 's' : ''}{' '}
                          {mins > 0 && `${mins} minutes`}
                        </>
                      );
                    }
                    return <span className="text-destructive">{duration} minutes (minimum 1 hour required)</span>;
                  })()}
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
                    (() => {
                      const duration = calculateDuration(customStartTime, customEndTime);
                      const hours = Math.floor(duration / 60);
                      const mins = duration % 60;
                      return (
                        <>
                          {hours} hour{hours !== 1 ? 's' : ''}{' '}
                          {mins > 0 && `${mins} min`}
                        </>
                      );
                    })()
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