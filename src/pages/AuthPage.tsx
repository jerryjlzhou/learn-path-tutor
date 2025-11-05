import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Update mode when URL parameter changes
  useEffect(() => {
    setMode(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
  }, [searchParams]);

  // Handle email confirmation tokens and prevent conflicting redirects
  useEffect(() => {
    (async () => {
      // Parse tokens from URL hash (Supabase appends these after confirm)
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');

      const hasTokenHash = !!(access_token && refresh_token);
      const hasVerifyParams = searchParams.has('token_hash') && (searchParams.get('type') === 'signup' || searchParams.get('type') === 'recovery' || searchParams.get('type') === 'email_change');

      // If tokens are present, set the session explicitly for reliability
      if (hasTokenHash && access_token && refresh_token) {
        try {
          await supabase.auth.setSession({ access_token, refresh_token });
        } catch (e) {
          // ignore; getUser check below will handle
        }
        // Clean the hash to avoid re-processing
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      // After handling tokens, if user is signed in and this is a confirmation redirect, go to profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user && (hasTokenHash || hasVerifyParams)) {
        toast({
          title: 'Email confirmed successfully!',
          description: 'Welcome to Jenius Education 🎓',
        });
        navigate('/profile', { replace: true });
        return;
      }

      // If user is already authenticated and not coming from a confirmation flow, optionally redirect
      if (user && !hasTokenHash && !hasVerifyParams) {
        // Keep user on the page if they intentionally opened /auth, or redirect to profile
        // Choose to redirect to profile for better UX
        navigate('/profile', { replace: true });
      }
    })();
  }, [navigate, searchParams, toast]);

  const validateForm = () => {
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    if (mode === 'signup') {
      if (!fullName) {
        toast({
          title: "Missing name",
          description: "Please enter your full name.",
          variant: "destructive",
        });
        return false;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Password mismatch",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        return false;
      }

      if (password.length < 8) {
        toast({
          title: "Password too short",
          description: "Password must be at least 8 characters long.",
          variant: "destructive",
        });
        return false;
      }

      if (!acceptTerms) {
        toast({
          title: "Terms required",
          description: "Please accept the terms and conditions.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: fullName,
            school,
            year_level: yearLevel,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile to determine redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        navigate('/profile');
      } else {
        navigate('/');
      }

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const yearLevels = [
    'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8',
    'Year 9', 'Year 10', 'Year 11', 'Year 12'
  ];

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </CardTitle>
          <CardDescription>
            {mode === 'signup' 
              ? 'Ready to be a Jenius? Join now!'
              : 'It\'s nice to see you again :)'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            if (mode === 'signup') {
              handleSignUp();
            } else {
              handleSignIn();
            }
          }}>
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="school">School (Optional)</Label>
                  <Input
                    id="school"
                    placeholder="Enter your school name"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearLevel">Year Level (Optional)</Label>
                  <Select value={yearLevel} onValueChange={setYearLevel} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year level" />
                    </SelectTrigger>
                    <SelectContent className='bg-background'>
                      {yearLevels.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Create a password (min 8 characters)' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    disabled={loading}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm cursor-pointer">
                    I accept the{' '}
                    <Link 
                      to="/legal" 
                      target="_blank"
                      className="text-primary hover:underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms & Privacy Policy
                    </Link>
                  </Label>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="h-auto p-0 font-semibold"
                  onClick={() => setMode('signin')}
                >
                  Sign in
                </Button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <Button
                  variant="link"
                  className="h-auto p-0 font-semibold"
                  onClick={() => setMode('signup')}
                >
                  Create account
                </Button>
              </p>
            )}
          </div>

          {mode === 'signin' && (
            <div className="text-center">
              <Link to="/forgot-password">
                <Button variant="link" className="text-sm text-muted-foreground">
                  Forgot your password?
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}