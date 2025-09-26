-- Add mode column to availability table to distinguish between online and in-person slots
ALTER TABLE public.availability 
ADD COLUMN mode text NOT NULL DEFAULT 'online' CHECK (mode IN ('online', 'in-person'));

-- Add location column to availability for in-person sessions  
ALTER TABLE public.availability 
ADD COLUMN location text;

-- Update RLS policies to include the new fields
-- The existing policies should still work, but let's make sure they're comprehensive

-- Add index for better performance when querying available slots
CREATE INDEX IF NOT EXISTS idx_availability_date_time ON public.availability(date, start_time) WHERE NOT is_booked;