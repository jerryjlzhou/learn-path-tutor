import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format24To12Hour, format12To24Hour, generateTimeOptions } from '@/lib/timeUtils';

interface TimeSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  startHour?: number;
  intervalMinutes?: number;
  totalSlots?: number;
}

export function TimeSelect({
  label,
  value,
  onChange,
  placeholder = 'Select time',
  startHour = 8,
  intervalMinutes = 30,
  totalSlots = 31,
}: TimeSelectProps) {
  const timeOptions = generateTimeOptions(startHour, intervalMinutes, totalSlots);
  
  const displayValue = value ? format24To12Hour(value) : '';
  
  const handleChange = (time12: string) => {
    const time24 = format12To24Hour(time12);
    onChange(time24);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={displayValue} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background">
          {timeOptions.map((time, index) => (
            <SelectItem key={index} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
