import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { calculateDuration } from './timeUtils';
import { calculateSessionPrice, type SessionMode } from './pricing';

interface BookingData {
  selectedSlot: {
    id: string;
    date: string;
    mode: SessionMode;
    location?: string;
  };
  customStartTime: string;
  customEndTime: string;
  userId: string;
  paymentMethod: 'stripe' | 'later';
  notes: string;
}

interface Booking {
  id: string;
  user_id: string;
  start_datetime: string;
  end_datetime: string;
  duration_minutes: number;
  mode: SessionMode;
  status: string;
  price_cents: number;
  payment_status: string;
  location: string | null;
  notes: string | null;
  is_free_trial: boolean;
}

interface BookingResult {
  booking: Booking;
  totalPrice: number;
}

/**
 * Creates a booking in the database
 */
export async function createBooking(data: BookingData): Promise<BookingResult> {
  const { selectedSlot, customStartTime, customEndTime, userId, paymentMethod, notes } = data;
  
  const duration = calculateDuration(customStartTime, customEndTime);
  const totalPrice = calculateSessionPrice(selectedSlot.mode, duration);
  
  // Create start and end datetime using custom times (Australia/Sydney timezone)
  const startDateTime = new Date(`${selectedSlot.date}T${customStartTime}+11:00`);
  const endDateTime = new Date(`${selectedSlot.date}T${customEndTime}+11:00`);

  const bookingData = {
    user_id: userId,
    start_datetime: startDateTime.toISOString(),
    end_datetime: endDateTime.toISOString(),
    duration_minutes: duration,
    mode: selectedSlot.mode,
    status: 'pending',
    price_cents: totalPrice,
    payment_status: paymentMethod === 'stripe' ? 'pending' : 'unpaid',
    location: selectedSlot.location || null,
    notes: notes || null,
    is_free_trial: false,
  };

  const { data: createdBooking, error: bookingError } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single();

  if (bookingError) throw bookingError;
  if (!createdBooking) throw new Error('Failed to create booking');

  return {
    booking: createdBooking as Booking,
    totalPrice,
  };
}

interface NotificationPayload {
  studentEmail: string;
  studentName: string;
  adminEmail: string;
  bookingDetails: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    mode: SessionMode;
    location?: string;
    price: number;
    paymentStatus: string;
  };
}

/**
 * Sends booking notification emails to student and admin
 */
export async function sendBookingNotifications(
  booking: Booking,
  selectedSlot: { mode: SessionMode; location?: string; date: string },
  customStartTime: string,
  customEndTime: string,
  totalPrice: number,
  paymentMethod: 'stripe' | 'later'
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get user profile for notifications
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .single();

  const startDateTime = new Date(`${selectedSlot.date}T${customStartTime}`);
  const endDateTime = new Date(`${selectedSlot.date}T${customEndTime}`);
  const duration = calculateDuration(customStartTime, customEndTime);

  const adminEmail = 'jerry.zhou25@gmail.com';

  const notificationPayload: NotificationPayload = {
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
      price: totalPrice,
      paymentStatus: paymentMethod === 'stripe' ? 'pending' : 'unpaid',
    },
  };

  const { error: emailError } = await supabase.functions.invoke('send-booking-notification', {
    body: notificationPayload,
  });

  if (emailError) {
    console.error('Error sending notification emails:', emailError);
  }
}

/**
 * Creates a Stripe checkout session for payment
 */
export async function createStripeCheckout(bookingId: string, amount: number): Promise<string | null> {
  const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-booking-checkout', {
    body: {
      bookingId,
      amount,
    }
  });

  if (checkoutError) throw checkoutError;
  
  return checkoutData?.url || null;
}
