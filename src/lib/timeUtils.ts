/**
 * Converts 24-hour time format (HH:MM) to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (e.g., "14:30")
 * @returns Time in 12-hour format (e.g., "2:30 PM") or empty string if invalid
 */
export function format24To12Hour(time24: string): string {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const hour12 = hour % 12 || 12;
  const period = hour >= 12 ? 'PM' : 'AM';
  
  return `${hour12}:${minutes} ${period}`;
}

/**
 * Converts 12-hour time format with AM/PM to 24-hour format
 * @param time12 - Time in 12-hour format (e.g., "2:30 PM")
 * @returns Time in 24-hour format (e.g., "14:30")
 */
export function format12To24Hour(time12: string): string {
  const [time, period] = time12.split(' ');
  const [hour, minute] = time.split(':');
  let hour24 = parseInt(hour);
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${String(hour24).padStart(2, '0')}:${minute}`;
}

/**
 * Generates an array of time options in 12-hour format
 * @param startHour - Starting hour in 24-hour format (default: 10 for 10:00 AM)
 * @param intervalMinutes - Interval between times in minutes (default: 30)
 * @param totalSlots - Total number of time slots to generate (default: 29 for ~14 hours)
 * @returns Array of time strings in 12-hour format
 */
export function generateTimeOptions(
  startHour: number = 10,
  intervalMinutes: number = 30,
  totalSlots: number = 29
): string[] {
  const startMinutes = startHour * 60;
  
  return Array.from({ length: totalSlots }, (_, i) => {
    const totalMinutes = startMinutes + (i * intervalMinutes);
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const hours12 = hours24 % 12 || 12;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    
    return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
  });
}

/**
 * Format a time string (HH:MM:SS or HH:MM) to 12-hour format with am/pm
 * @param timeString - Time string in 24-hour format (e.g., "14:30:00" or "14:30")
 * @returns Formatted time string (e.g., "2:30 pm")
 */
export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for midnight
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Generate time options in specified minute increments for full 24-hour day
 * @param incrementMinutes - Minutes between each time option (default: 15)
 * @returns Array of time strings in HH:MM:SS format
 */
export function generateFullDayTimeOptions(incrementMinutes: number = 15): string[] {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += incrementMinutes) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      times.push(timeString);
    }
  }
  return times;
}

/**
 * Convert time string to total minutes since midnight
 * @param timeString - Time string in HH:MM:SS or HH:MM format
 * @returns Total minutes since midnight
 */
export function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string
 * @param minutes - Total minutes since midnight
 * @returns Time string in HH:MM:SS format
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
}

/**
 * Calculate duration in minutes between two times
 * @param startTime - Start time string
 * @param endTime - End time string
 * @returns Duration in minutes
 */
export function calculateDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

/**
 * Calculate end time given a start time and duration
 * @param startTime - Start time string
 * @param durationMinutes - Duration in minutes
 * @param maxEndTime - Optional maximum end time (slot boundary)
 * @returns End time string in HH:MM:SS format
 */
export function calculateEndTime(
  startTime: string, 
  durationMinutes: number, 
  maxEndTime?: string
): string {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  
  // If maxEndTime is provided, cap the end time
  if (maxEndTime) {
    const maxEndMinutes = timeToMinutes(maxEndTime);
    const actualEndMinutes = Math.min(endMinutes, maxEndMinutes);
    return minutesToTimeString(actualEndMinutes);
  }
  
  return minutesToTimeString(endMinutes);
}
