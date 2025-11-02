import { timeToMinutes, formatTime } from './timeUtils';

export interface TimeValidationError {
  title: string;
  description: string;
}

export interface TimeValidationOptions {
  slotStartTime: string;
  slotEndTime: string;
  selectedStartTime: string;
  selectedEndTime: string;
  minDurationMinutes?: number;
}

/**
 * Validate time selection for booking
 * @param options - Validation options
 * @returns Error object if validation fails, null if valid
 */
export function validateBookingTimes(
  options: TimeValidationOptions
): TimeValidationError | null {
  const {
    slotStartTime,
    slotEndTime,
    selectedStartTime,
    selectedEndTime,
    minDurationMinutes = 60
  } = options;

  if (!selectedStartTime || !selectedEndTime) {
    return {
      title: "Time not selected",
      description: "Please select both start and end times"
    };
  }

  const slotStart = timeToMinutes(slotStartTime);
  const slotEnd = timeToMinutes(slotEndTime);
  const selectedStart = timeToMinutes(selectedStartTime);
  const selectedEnd = timeToMinutes(selectedEndTime);

  // Check if start time is within slot bounds
  if (selectedStart < slotStart) {
    return {
      title: "Invalid start time",
      description: `Start time must be at or after ${formatTime(slotStartTime)}`
    };
  }

  // Check if end time is within slot bounds
  if (selectedEnd > slotEnd) {
    return {
      title: "Invalid end time",
      description: `End time must be at or before ${formatTime(slotEndTime)}`
    };
  }

  // Check if end time is after start time
  if (selectedEnd <= selectedStart) {
    return {
      title: "Invalid time range",
      description: "End time must be after start time"
    };
  }

  // Check minimum duration
  const duration = selectedEnd - selectedStart;
  if (duration < minDurationMinutes) {
    return {
      title: "Minimum duration not met",
      description: `Lesson must be at least ${minDurationMinutes / 60} hour${minDurationMinutes !== 60 ? 's' : ''} long`
    };
  }

  return null;
}
