-- Migration: create_floor_plans_table
-- Created at: 1755823909

-- Create floor_plans table for storing uploaded floor plan images and analysis results
CREATE TABLE IF NOT EXISTS public.floor_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    image_width INTEGER,
    image_height INTEGER,
    analysis_status VARCHAR(50) DEFAULT 'pending',
    analysis_results JSONB,
    rooms_detected JSONB,
    walls_detected JSONB,
    doors_detected JSONB,
    windows_detected JSONB,
    dimensions JSONB,
    scale_pixels_per_foot DECIMAL(10,2),
    processing_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS floor_plans_user_id_idx ON public.floor_plans(user_id);
CREATE INDEX IF NOT EXISTS floor_plans_status_idx ON public.floor_plans(analysis_status);

-- Enable RLS (Row Level Security)
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own floor plans" ON public.floor_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own floor plans" ON public.floor_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own floor plans" ON public.floor_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own floor plans" ON public.floor_plans
    FOR DELETE USING (auth.uid() = user_id);;