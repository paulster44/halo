CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    floorplan_image_url TEXT,
    floorplan_width INTEGER,
    floorplan_height INTEGER,
    devices JSONB DEFAULT '[]'::jsonb,
    analysis_results JSONB,
    rack_diagram_url TEXT,
    installation_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc',
    NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc',
    NOW())
);