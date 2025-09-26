import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Calendar, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Settings,
  Clock,
  MapPin,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AvailabilityManager } from '@/components/admin/AvailabilityManager';
import { ForumManager } from '@/components/admin/ForumManager';
import { StudentManager } from '@/components/admin/StudentManager';
import { BookingManager } from '@/components/admin/BookingManager';
import { ProfileSettings } from '@/components/admin/ProfileSettings';
import { StudentMessages } from '@/components/student/StudentMessages';

export function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate('/auth');
        return;
      }

      setUser(user);

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile.",
          variant: "destructive",
        });
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !profile) {
    return (
      <Layout>
        <div className="container py-20">
          <Card>
            <CardContent className="p-8 text-center">
              <p>Please sign in to access your profile.</p>
              <Button onClick={() => navigate('/auth')} className="mt-4">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const isAdmin = profile.role === 'admin';

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                    <Badge variant={isAdmin ? 'default' : 'secondary'}>
                      {profile.role}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{user.email}</p>
                  {profile.school && (
                    <p className="text-sm text-muted-foreground">
                      {profile.school} • Year {profile.year_level}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Tabs */}
          {isAdmin ? (
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="dashboard">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="availability">
                  <Calendar className="h-4 w-4 mr-2" />
                  Availability
                </TabsTrigger>
                <TabsTrigger value="bookings">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Bookings
                </TabsTrigger>
                <TabsTrigger value="forums">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="students">
                  <Users className="h-4 w-4 mr-2" />
                  Students
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <AdminDashboard />
              </TabsContent>

              <TabsContent value="availability">
                <AvailabilityManager />
              </TabsContent>

              <TabsContent value="bookings">
                <BookingManager />
              </TabsContent>

              <TabsContent value="forums">
                <ForumManager />
              </TabsContent>

              <TabsContent value="students">
                <StudentManager />
              </TabsContent>

              <TabsContent value="settings">
                <ProfileSettings profile={profile} onUpdate={checkUser} />
              </TabsContent>
            </Tabs>
          ) : (
            /* Student Profile */
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">
                  <User className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="bookings">
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Bookings
                </TabsTrigger>
                <TabsTrigger value="messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-muted-foreground">
                        Welcome to your student dashboard. Here you can view your bookings and manage your profile.
                      </p>
                      
                      {/* Quick Action Button */}
                      <div className="flex justify-center">
                        <Button 
                          size="lg" 
                          onClick={() => navigate('/booking')}
                          className="text-lg px-8 py-6"
                        >
                          <Calendar className="h-5 w-5 mr-3" />
                          Book Your Next Lesson
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle>My Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Your upcoming and past tutoring sessions will appear here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages">
                <StudentMessages />
              </TabsContent>

              <TabsContent value="settings">
                <ProfileSettings profile={profile} onUpdate={checkUser} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </Layout>
  );
}