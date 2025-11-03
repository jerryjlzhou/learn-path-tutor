import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Users, 
  BookOpen, 
  Settings,
  TrendingUp,
  Star
} from 'lucide-react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AvailabilityManager } from '@/components/admin/AvailabilityManager';
import { StudentManager } from '@/components/admin/StudentManager';
import { BookingManager } from '@/components/admin/BookingManager';
import { ReviewsManager } from '@/components/admin/ReviewsManager';
import { ProfileSettings } from '@/components/admin/ProfileSettings';
import { StudentBookings } from '@/components/student/StudentBookings';
import { StudentOverview } from '@/components/student/StudentOverview';
import { Tables } from '@/integrations/supabase/types';
import { User as SupabaseUser } from '@supabase/supabase-js';

type Profile = Tables<'profiles'>;

export function ProfilePage() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<SupabaseUser>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const activeTab = searchParams.get('tab') || (profile?.role === 'admin' ? 'dashboard' : 'overview');

  const checkUser = useCallback(async () => {
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
  }, [navigate, toast]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

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
            <CardContent className="p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback className="text-xl sm:text-2xl">
                    {profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold">{profile.full_name}</h1>
                    <Badge variant={isAdmin ? 'default' : 'secondary'}>
                      {profile.role}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2 text-sm sm:text-base">{user.email}</p>
                  {profile.school && (
                    <p className="text-sm text-muted-foreground">
                      {profile.school} • {profile.year_level}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Tabs */}
          {isAdmin ? (
            <Tabs value={activeTab} onValueChange={(value) => navigate(`/profile?tab=${value}`)} className="space-y-6">
              <TabsList className="inline-flex lg:grid lg:grid-cols-6 h-auto w-full justify-start lg:justify-center overflow-x-auto overflow-y-hidden flex-nowrap rounded-lg bg-muted p-1">
                <TabsTrigger value="dashboard" className="whitespace-nowrap">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Dash</span>
                </TabsTrigger>
                <TabsTrigger value="availability" className="whitespace-nowrap">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Availability</span>
                  <span className="sm:hidden">Times</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="whitespace-nowrap">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Bookings
                </TabsTrigger>
                <TabsTrigger value="students" className="whitespace-nowrap">
                  <Users className="h-4 w-4 mr-2" />
                  Students
                </TabsTrigger>
                <TabsTrigger value="reviews" className="whitespace-nowrap">
                  <Star className="h-4 w-4 mr-2" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="settings" className="whitespace-nowrap">
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

              <TabsContent value="students">
                <StudentManager />
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewsManager />
              </TabsContent>

              <TabsContent value="settings">
                <ProfileSettings profile={profile} onUpdate={checkUser} />
              </TabsContent>
            </Tabs>
          ) : (
            /* Student Profile */
            <Tabs value={activeTab} onValueChange={(value) => navigate(`/profile?tab=${value}`)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="overview" className="whitespace-nowrap">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Home</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="whitespace-nowrap">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">My Bookings</span>
                  <span className="sm:hidden">Bookings</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="whitespace-nowrap">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <StudentOverview />
              </TabsContent>

              <TabsContent value="bookings">
                <StudentBookings />
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