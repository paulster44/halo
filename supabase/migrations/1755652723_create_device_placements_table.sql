-- Migration: create_device_placements_table
-- Created at: 1755652723

-- Create device placements table for visualization
CREATE TABLE IF NOT EXISTS public.device_placements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    device_spec_id INTEGER REFERENCES device_specifications(id),
    device_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    room_name TEXT,
    position_x DECIMAL(8,2), -- X coordinate on floor plan
    position_y DECIMAL(8,2), -- Y coordinate on floor plan
    mounting_height DECIMAL(5,2),
    coverage_area JSONB, -- Polygon or circle data for coverage visualization
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
    placement_reason TEXT,
    installation_notes TEXT,
    wiring_requirements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create equipment rack configurations table
CREATE TABLE IF NOT EXISTS public.equipment_racks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    rack_name TEXT NOT NULL,
    rack_type TEXT NOT NULL, -- 'small', 'medium', 'large'
    position_x DECIMAL(8,2), -- X coordinate on floor plan
    position_y DECIMAL(8,2), -- Y coordinate on floor plan
    rack_units INTEGER DEFAULT 12, -- Number of rack units available
    power_requirements DECIMAL(8,2), -- Total power consumption in watts
    equipment_list JSONB, -- List of equipment in each rack unit
    wiring_diagram JSONB, -- Wiring connections data
    installation_specs JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.device_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_racks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own device placements" ON device_placements FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Users can view own equipment racks" ON equipment_racks FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);;