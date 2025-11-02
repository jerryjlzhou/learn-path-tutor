import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function SubmitReviewPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [reviewerType, setReviewerType] = useState<'student' | 'parent' | ''>('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const grades = [
    'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8',
    'Year 9', 'Year 10', 'Year 11', 'Year 12'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || !comment || !name || !reviewerType) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (reviewerType === 'student' && !grade) {
      toast({
        title: "Missing grade",
        description: "Please select your grade level.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const school = reviewerType === 'parent' ? 'Parent' : grade;

      const { error } = await supabase
        .from('testimonials')
        .insert({
          rating,
          comment,
          student: name,
          school,
          is_approved: false,
        });

      if (error) throw error;

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback. Your review will be visible soon.",
      });

      // Reset form
      setRating(0);
      setComment('');
      setName('');
      setReviewerType('');
      setGrade('');

      // Navigate back to home after a short delay
      setTimeout(() => {
        navigate('/#testimonials');
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error submitting review",
        description: "There was a problem submitting your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-20 bg-muted/30">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Leave a Review</CardTitle>
              <CardDescription>
                Share your experience and help others make informed decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div className="space-y-2">
                  <Label>Rating *</Label>
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i + 1)}
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            i < (hoverRating || rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review */}
                <div className="space-y-2">
                  <Label htmlFor="comment">Review *</Label>
                  <Textarea
                    id="comment"
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Reviewer Type */}
                <div className="space-y-2">
                  <Label>I am a *</Label>
                  <Select value={reviewerType} onValueChange={(value: 'student' | 'parent') => {
                    setReviewerType(value);
                    if (value === 'parent') {
                      setGrade('');
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reviewer type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Grade (only for students) */}
                {reviewerType === 'student' && (
                  <div className="space-y-2">
                    <Label>Grade *</Label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your grade" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {grades.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
