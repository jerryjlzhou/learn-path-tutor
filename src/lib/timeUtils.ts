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
