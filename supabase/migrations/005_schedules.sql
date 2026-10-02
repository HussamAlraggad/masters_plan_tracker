-- Migration 005: Schedules table (for HU class schedule data)
-- Run this fifth in Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT NOT NULL REFERENCES public.courses(course_id) ON DELETE CASCADE,
    year TEXT NOT NULL,
    term TEXT NOT NULL CHECK (term IN ('first', 'second', 'summer')),
    section TEXT NOT NULL,
    instructor TEXT DEFAULT '',
    time TEXT NOT NULL,
    location TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, year, term, section)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schedules_course_id ON public.schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_schedules_year_term ON public.schedules(year, term);

-- Enable RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Schedules are readable by all authenticated users
CREATE POLICY "Schedules are viewable by authenticated users"
    ON public.schedules FOR SELECT
    TO authenticated
    USING (true);

-- Service role can modify schedules (scraper)
CREATE POLICY "Schedules are modifiable by service role only"
    ON public.schedules FOR ALL
    TO service_role
    USING (true);