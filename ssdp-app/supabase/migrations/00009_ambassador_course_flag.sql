-- Add flag to identify the ambassador training course
-- Replaces fragile string matching on course title

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_ambassador_course boolean DEFAULT false;
