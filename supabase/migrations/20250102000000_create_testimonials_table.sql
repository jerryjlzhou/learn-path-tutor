-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  student TEXT NOT NULL,
  school TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read approved testimonials
CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials
  FOR SELECT
  USING (is_approved = true);

-- Create policy to allow anyone to insert testimonials (they will be pending approval)
CREATE POLICY "Anyone can submit testimonials"
  ON public.testimonials
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow authenticated users to update their own testimonials
CREATE POLICY "Admins can update testimonials"
  ON public.testimonials
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create policy to allow admins to delete testimonials
CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create index for faster queries
CREATE INDEX idx_testimonials_approved ON public.testimonials(is_approved);
CREATE INDEX idx_testimonials_created_at ON public.testimonials(created_at);
