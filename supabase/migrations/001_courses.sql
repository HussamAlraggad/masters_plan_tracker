-- Migration 001: Courses table
-- Run this first in Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 3,
    category TEXT NOT NULL CHECK (category IN ('mandatory', 'elective', 'thesis')),
    prerequisites TEXT[] DEFAULT '{}',
    semester_offered TEXT[] DEFAULT '{}',
    track TEXT NOT NULL CHECK (track IN ('thesis', 'comprehensive')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_active ON public.courses(active);
CREATE INDEX IF NOT EXISTS idx_courses_track ON public.courses(track);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Courses are readable by all authenticated users
CREATE POLICY "Courses are viewable by authenticated users"
    ON public.courses FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can modify courses (seeding)
CREATE POLICY "Courses are modifiable by service role only"
    ON public.courses FOR ALL
    TO service_role
    USING (true);