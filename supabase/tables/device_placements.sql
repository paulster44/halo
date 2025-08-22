CREATE TABLE device_placements (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    device_spec_id INTEGER NOT NULL,
    placement_x DECIMAL(10,4) NOT NULL,
    placement_y DECIMAL(10,4) NOT NULL,
    room_id VARCHAR(100),
    mounting_height_feet DECIMAL(5,2),
    rotation_degrees DECIMAL(5,2) DEFAULT 0,
    coverage_analysis JSONB,
    interference_analysis JSONB,
    optimization_score DECIMAL(5,4),
    placement_rationale TEXT,
    installation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);