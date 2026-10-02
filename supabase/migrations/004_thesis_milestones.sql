-- Migration 004: Thesis Milestones table
-- Run this fourth in Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS public.thesis_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_num INTEGER NOT NULL,
    due_date TIMESTAMPTZ DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, title)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_thesis_milestones_user_id ON public.thesis_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_thesis_milestones_order ON public.thesis_milestones(user_id, order_num);

-- Enable RLS
ALTER TABLE public.thesis_milestones ENABLE ROW LEVEL SECURITY;

-- Users can only see their own milestones
CREATE POLICY "Users can view own thesis milestones"
    ON public.thesis_milestones FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can insert their own milestones
CREATE POLICY "Users can insert own thesis milestones"
    ON public.thesis_milestones FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own milestones
CREATE POLICY "Users can update own thesis milestones"
    ON public.thesis_milestones FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own milestones
CREATE POLICY "Users can delete own thesis milestones"
    ON public.thesis_milestones FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role full access to thesis_milestones"
    ON public.thesis_milestones FOR ALL
    TO service_role
    USING (true);