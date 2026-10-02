-- Migration 003: Semesters table
-- Run this third in Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    year TEXT NOT NULL,
    term TEXT NOT NULL CHECK (term IN ('first', 'second', 'summer')),
    target_courses INTEGER DEFAULT 4 CHECK (target_courses BETWEEN 1 AND 5),
    target_credits INTEGER DEFAULT 12 CHECK (target_credits BETWEEN 3 AND 15),
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
    gpa NUMERIC(3,2) DEFAULT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, year, term)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_semesters_user_id ON public.semesters(user_id);
CREATE INDEX IF NOT EXISTS idx_semesters_year_term ON public.semesters(year, term);

-- Enable RLS
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;

-- Users can only see their own semesters
CREATE POLICY "Users can view own semesters"
    ON public.semesters FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can insert their own semesters
CREATE POLICY "Users can insert own semesters"
    ON public.semesters FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own semesters
CREATE POLICY "Users can update own semesters"
    ON public.semesters FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own semesters
CREATE POLICY "Users can delete own semesters"
    ON public.semesters FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role full access to semesters"
    ON public.semesters FOR ALL
    TO service_role
    USING (true);