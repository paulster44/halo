CREATE TABLE placement_projects (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    floor_plan_id INTEGER NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    selected_devices JSONB,
    placement_constraints JSONB,
    optimization_preferences JSONB,
    total_budget DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);