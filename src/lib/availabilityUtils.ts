import { supabase } from '@/integrations/supabase/client';
import { timeToMinutes } from './timeUtils';
import type { SessionMode } from './pricing';

interface AvailabilitySlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  mode: SessionMode;
  location?: string;
  is_booked: boolean;
}

interface UpdateAvailabilityParams {
  selectedSlot: AvailabilitySlot;
  customStartTime: string;
  customEndTime: string;
}

/**
 * Updates availability slots after a booking is made.
 * - For in-person sessions: deletes the entire slot
 * - For online sessions: splits the slot or deletes if fully booked
 */
export async function updateAvailabilityAfterBooking({
  selectedSlot,
  customStartTime,
  customEndTime,
}: UpdateAvailabilityParams): Promise<void> {
  if (selectedSlot.mode === 'in-person') {
    // For in-person sessions, delete the entire slot
    await supabase
      .from('availability')
      .delete()
      .eq('id', selectedSlot.id);
  } else {
    // For online sessions, split the slot or delete if fully booked
    const slotStart = timeToMinutes(selectedSlot.start_time);
    const slotEnd = timeToMinutes(selectedSlot.end_time);
    const bookedStart = timeToMinutes(customStartTime);
    const bookedEnd = timeToMinutes(customEndTime);

    const isFullyBooked = bookedStart === slotStart && bookedEnd === slotEnd;

    if (isFullyBooked) {
      // Delete the slot if the entire time is booked
      await supabase
        .from('availability')
        .delete()
        .eq('id', selectedSlot.id);
    } else {
      // Delete the original slot
      await supabase
        .from('availability')
        .delete()
        .eq('id', selectedSlot.id);

      // Create new slots for remaining time
      const newSlots = [];

      // Add slot before booking if there's time
      if (slotStart < bookedStart) {
        newSlots.push({
          date: selectedSlot.date,
          start_time: selectedSlot.start_time,
          end_time: customStartTime,
          mode: selectedSlot.mode,
          location: selectedSlot.location,
          is_booked: false,
        });
      }

      // Add slot after booking if there's time
      if (bookedEnd < slotEnd) {
        newSlots.push({
          date: selectedSlot.date,
          start_time: customEndTime,
          end_time: selectedSlot.end_time,
          mode: selectedSlot.mode,
          location: selectedSlot.location,
          is_booked: false,
        });
      }

      // Insert new slots if any
      if (newSlots.length > 0) {
        await supabase
          .from('availability')
          .insert(newSlots);
      }
    }
  }
}

/**
 * Loads available slots from the database
 */
export async function loadAvailableSlots(): Promise<AvailabilitySlot[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('is_booked', false)
    .gte('date', today)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;

  return (data || []).map(slot => ({
    ...slot,
    mode: slot.mode as SessionMode,
  }));
}
