import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Edit } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AvailabilitySlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
}

export function AvailabilityManager() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast({
        title: "Error loading availability",
        description: "There was a problem loading your availability slots.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast({
        title: "Missing information",
        description: "Please select a date and both start and end times.",
        variant: "destructive",
      });
      return;
    }

    if (startTime >= endTime) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('availability')
        .insert({
          date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime,
          is_booked: false,
        });

      if (error) throw error;

      toast({
        title: "Availability added",
        description: "Your availability slot has been added successfully.",
      });

      // Reset form
      setSelectedDate(undefined);
      setStartTime('');
      setEndTime('');
      
      // Reload availability
      loadAvailability();
    } catch (error) {
      console.error('Error adding availability:', error);
      toast({
        title: "Error adding availability",
        description: "There was a problem adding your availability slot.",
        variant: "destructive",
      });
    }
  };

  const handleEditSlot = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setSelectedDate(new Date(slot.date));
    setStartTime(slot.start_time);
    setEndTime(slot.end_time);
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot || !selectedDate || !startTime || !endTime) return;

    if (startTime >= endTime) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('availability')
        .update({
          date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime,
        })
        .eq('id', editingSlot.id);

      if (error) throw error;

      toast({
        title: "Availability updated",
        description: "Your availability slot has been updated successfully.",
      });

      // Reset form
      setEditingSlot(null);
      setSelectedDate(undefined);
      setStartTime('');
      setEndTime('');
      
      // Reload availability
      loadAvailability();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error updating availability",
        description: "There was a problem updating your availability slot.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: "Availability deleted",
        description: "Your availability slot has been deleted successfully.",
      });
      
      loadAvailability();
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast({
        title: "Error deleting availability",
        description: "There was a problem deleting your availability slot.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingSlot(null);
    setSelectedDate(undefined);
    setStartTime('');
    setEndTime('');
  };

  const groupedAvailability = availability.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  if (loading) {
    return (
      <div className="space-y-6">
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
      {/* Add/Edit Availability Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingSlot ? 'Edit Availability Slot' : 'Add New Availability Slot'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            {editingSlot ? (
              <>
                <Button onClick={handleUpdateSlot}>
                  Update Slot
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleAddSlot}>
                Add Availability Slot
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Your Availability Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedAvailability).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No availability slots added yet. Add your first slot above.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAvailability)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, slots]) => (
                  <div key={date} className="space-y-3">
                    <h3 className="font-semibold text-lg">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {slot.start_time} - {slot.end_time}
                              </p>
                              <Badge 
                                variant={slot.is_booked ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {slot.is_booked ? 'Booked' : 'Available'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSlot(slot)}
                              disabled={slot.is_booked}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSlot(slot.id)}
                              disabled={slot.is_booked}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}