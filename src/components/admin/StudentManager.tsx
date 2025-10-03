import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  BookOpen,
  MessageSquare,
  School
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  school?: string;
  year_level?: string;
  profile_picture_url?: string;
  created_at: string;
  bookings_count: number;
  total_spent: number;
  last_booking_date?: string;
}

export function StudentManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const loadStudents = async () => {
    try {
      // Get all student profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (profilesError) throw profilesError;

      // Get user emails from auth.users and booking statistics for each student
      const studentsWithStats = await Promise.all(
        (profilesData || []).map(async (profile) => {
          // Get bookings for this student
          const { data: bookings } = await supabase
            .from('bookings')
            .select('id, price_cents, status, start_datetime, payment_status')
            .eq('user_id', profile.user_id);

          const studentBookings = bookings || [];
          const completedBookings = studentBookings.filter(b => b.status === 'completed' && b.payment_status === 'paid');
          const totalSpent = completedBookings.reduce((sum, booking) => sum + (booking.price_cents || 0), 0);
          const lastBooking = studentBookings.length > 0 
            ? studentBookings.sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime())[0]
            : null;

          return {
            ...profile,
            email: 'Not available', // Simplified since email column doesn't exist in profiles
            bookings_count: studentBookings.length,
            total_spent: totalSpent,
            last_booking_date: lastBooking?.start_datetime,
          };
        })
      );

      setStudents(studentsWithStats);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error loading students",
        description: "There was a problem loading the student list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.school && student.school.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredStudents(filtered);
  };

  const formatPrice = (priceInCents: number): string => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Management ({students.length} students)
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Students List */}
      <Card>
        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No students found matching your search.' : 'No students found.'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredStudents.map((student) => (
                <div key={student.id} className="p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.profile_picture_url} />
                      <AvatarFallback>
                        {student.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{student.full_name}</h3>
                        <Badge variant="secondary">Student</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        {student.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{student.email}</span>
                          </div>
                        )}

                        {student.school && (
                          <div className="flex items-center gap-2">
                            <School className="h-4 w-4" />
                            <span>{student.school} - Year {student.year_level}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{student.bookings_count} bookings</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Joined {new Date(student.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Total Spent: <span className="font-medium text-foreground">
                              {formatPrice(student.total_spent)}
                            </span>
                          </span>
                          
                          {student.last_booking_date && (
                            <span className="text-muted-foreground">
                              Last Booking: <span className="font-medium text-foreground">
                                {new Date(student.last_booking_date).toLocaleDateString()}
                              </span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button variant="outline" size="sm">
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Bookings
                          </Button>
                        </div>
                      </div>
                    </div>
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