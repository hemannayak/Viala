-- VIALA Supabase Demo Requests Schema & RLS Setup
-- Copy and paste this script into your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql) and click "Run".

-- 1. Create the demo_requests table if it does not exist
CREATE TABLE IF NOT EXISTS public.demo_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  phone TEXT,
  organization_name TEXT NOT NULL,
  organization_type TEXT,
  locations TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy: Enable insert access for anonymous users (so the Book a Demo public form works)
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.demo_requests;
CREATE POLICY "Enable insert for anonymous users"
ON public.demo_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- 4. Create Policy: Enable all operations for authenticated users (so admin/dashboard can read/manage them)
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.demo_requests;
CREATE POLICY "Enable all operations for authenticated users"
ON public.demo_requests
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Enable real-time updates for demo_requests (optional but recommended)
ALTER PUBLICATION supabase_realtime ADD TABLE public.demo_requests;
