import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  student: string;
  school: string;
  is_approved: boolean;
  created_at: string;
}

export function ReviewsManager() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingReview, setDeletingReview] = useState<Testimonial | null>(null);
  const { toast } = useToast();

  const loadReviews = useCallback(async () => {
    try {
      console.log('Loading reviews from testimonials table...');
      const { data, error } = await supabase
        .from('testimonials' as any)
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Reviews data:', data);
      console.log('Reviews error:', error);

      if (error) throw error;
      setReviews((data as any) || []);
      console.log('Reviews state set:', (data as any) || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Error loading reviews",
        description: "There was a problem loading the reviews.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleApprove = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('testimonials' as any)
        .update({ is_approved: true })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Review approved",
        description: "The review is now visible on the website.",
      });

      loadReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      toast({
        title: "Error approving review",
        description: "There was a problem approving the review.",
        variant: "destructive",
      });
    }
  };

  const handleUnapprove = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('testimonials' as any)
        .update({ is_approved: false })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Review unapproved",
        description: "The review is now hidden from the website.",
      });

      loadReviews();
    } catch (error) {
      console.error('Error unapproving review:', error);
      toast({
        title: "Error unapproving review",
        description: "There was a problem unapproving the review.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingReview) return;

    try {
      const { error } = await supabase
        .from('testimonials' as any)
        .delete()
        .eq('id', deletingReview.id);

      if (error) throw error;

      toast({
        title: "Review deleted",
        description: "The review has been permanently deleted.",
      });

      setDeletingReview(null);
      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error deleting review",
        description: "There was a problem deleting the review.",
        variant: "destructive",
      });
    }
  };

  const pendingReviews = reviews.filter(r => !r.is_approved);
  const approvedReviews = reviews.filter(r => r.is_approved);

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
      {/* Pending Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending Reviews ({pendingReviews.length})</span>
            <Badge variant="secondary">{pendingReviews.length} awaiting approval</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending reviews at this time.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{review.student}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{review.school}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(review.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletingReview(review)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Approved Reviews ({approvedReviews.length})</span>
            <Badge variant="default">{approvedReviews.length} live on website</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedReviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No approved reviews yet.
            </p>
          ) : (
            <div className="space-y-4">
              {approvedReviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 space-y-3 bg-muted/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{review.student}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{review.school}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnapprove(review.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Unapprove
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletingReview(review)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingReview} onOpenChange={() => setDeletingReview(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review from {deletingReview?.student}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
