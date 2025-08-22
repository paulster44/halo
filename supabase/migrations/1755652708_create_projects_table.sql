-- Migration: create_projects_table
-- Created at: 1755652708

-- Create projects table for user project management
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    description TEXT,
    floor_plan_url TEXT,
    floor_plan_analysis JSONB,
    automation_tier TEXT NOT NULL CHECK (automation_tier IN ('basic', 'intermediate', 'advanced')),
    tier_details JSONB,
    user_preferences JSONB,
    device_configuration JSONB,
    total_devices INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    project_status TEXT DEFAULT 'draft' CHECK (project_status IN ('draft', 'in_progress', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all projects" ON projects FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND user_role = 'admin'
    )
);;