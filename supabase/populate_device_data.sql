-- Insert device categories
INSERT INTO device_categories (name, description, icon_name, color_code) VALUES
('WiFi Infrastructure', 'WiFi access points and network equipment for connectivity coverage', 'wifi', '#3B82F6'),
('Security Cameras', 'Video surveillance cameras for monitoring and security', 'camera', '#EF4444'),
('Entertainment Systems', 'Smart TVs, speakers, and audio/video equipment', 'speaker', '#8B5CF6'),
('Security Devices', 'Motion detectors, door sensors, smart locks, and access control', 'shield', '#F59E0B'),
('Smart Doorbells', 'Video doorbells with motion detection and two-way audio', 'doorbell', '#10B981'),
('Window Treatments', 'Motorized blinds, shades, and automated window controls', 'window', '#6B7280'),
('Central Equipment', 'Equipment racks, power distribution, and infrastructure', 'server', '#1F2937'),
('Environmental Controls', 'Thermostats, smoke detectors, and environmental monitoring', 'thermometer', '#EC4899');

-- Insert WiFi access point specifications
INSERT INTO device_specifications (
    category_id, device_name, description, coverage_area_sqft, coverage_radius_feet,
    mounting_height_min_feet, mounting_height_max_feet, mounting_height_optimal_feet,
    power_consumption_watts, voltage_requirements, interference_frequency_ghz,
    installation_constraints, environmental_requirements, technical_specs, placement_rules
) VALUES (
    1, 'Indoor WiFi Access Point', 'Standard indoor WiFi 6 access point with internal antennas',
    1963, 25, 9, 15, 12, 25, '802.3at PoE+', 2.4,
    'Ceiling mounting preferred. Avoid metal, glass, concrete surfaces. Maintain line of sight to other APs.',
    'Indoor use only. Operating temperature: 0°C to 40°C',
    '{"wifi_standard": "WiFi 6 (802.11ax)", "max_clients": 200, "antennas": "internal", "poe_required": true}',
    '{"optimal_spacing_feet": 40, "min_separation_feet": 32, "coverage_pattern": "omnidirectional", "inter_ap_distance_meters": 12}'
);

-- Insert security camera specifications
INSERT INTO device_specifications (
    category_id, device_name, description, coverage_area_sqft, field_of_view_degrees,
    mounting_height_min_feet, mounting_height_max_feet, mounting_height_optimal_feet,
    power_consumption_watts, voltage_requirements, detection_range_feet,
    installation_constraints, environmental_requirements, technical_specs, placement_rules
) VALUES 
(
    2, 'Standard Security Camera', 'Fixed lens security camera with night vision',
    600, 80, 6, 12, 8, 12, '12V DC or PoE', 25,
    'Wall or ceiling mount. Angle slightly downward. Avoid direct sunlight.',
    'IP65 rated for outdoor use. Operating temperature: -20°C to 45°C',
    '{"resolution": "1080p", "night_vision": true, "infrared_range_feet": 30, "weatherproof": true}',
    '{"viewing_angle_optimal": 80, "blind_spot_elimination": "corner_placement", "overlap_required": true}'
),
(
    2, 'Wide-Angle Security Camera', 'Wide field of view camera for comprehensive area coverage',
    1200, 130, 8, 15, 10, 15, '12V DC or PoE', 35,
    'Corner mounting recommended. Position to minimize blind spots.',
    'IP65 rated for outdoor use. Operating temperature: -20°C to 45°C',
    '{"resolution": "4K", "night_vision": true, "infrared_range_feet": 40, "weatherproof": true}',
    '{"viewing_angle_optimal": 130, "coverage_type": "area_surveillance", "corner_positioning": true}'
);

-- Insert smart TV and speaker specifications
INSERT INTO device_specifications (
    category_id, device_name, description, mounting_height_min_feet, mounting_height_max_feet,
    mounting_height_optimal_feet, power_consumption_watts, voltage_requirements,
    installation_constraints, environmental_requirements, technical_specs, placement_rules
) VALUES 
(
    3, '50-inch Smart TV', 'Smart TV with optimal viewing distance calculations',
    4, 8, 5.5, 150, '120V AC',
    'Eye-level mounting. Center to bottom third viewing angle. Max 15° viewing angle.',
    'Indoor use. Avoid direct sunlight. Adequate ventilation required.',
    '{"screen_size_inches": 50, "optimal_viewing_distance_feet": 7, "max_viewing_angle": 15}',
    '{"thx_viewing_formula": "size/0.84", "eye_level_mounting": true, "viewing_distance_range_feet": [5, 8]}'
),
(
    3, 'Home Theater Speaker System', 'Surround sound speaker placement for optimal acoustics',
    2, 10, 6, 100, '120V AC',
    'Tweeters at ear level when seated. Equal spacing triangle formation.',
    'Indoor use. Room acoustics consideration required.',
    '{"speaker_type": "surround", "channels": "5.1", "frequency_range": "20Hz-20kHz"}',
    '{"ear_level_positioning": true, "triangle_formation": true, "wall_distance_impact": "bass_reinforcement"}'
);

-- Insert security device specifications  
INSERT INTO device_specifications (
    category_id, device_name, description, coverage_area_sqft, detection_range_feet,
    mounting_height_min_feet, mounting_height_max_feet, mounting_height_optimal_feet,
    power_consumption_watts, voltage_requirements, installation_constraints,
    environmental_requirements, technical_specs, placement_rules
) VALUES 
(
    4, 'PIR Motion Detector', 'Passive infrared motion detector with pet immunity',
    1520, 40, 6, 8, 7, 5, '3V DC Battery',
    'Avoid direct sunlight, air vents, heat sources. Corner placement optimal.',
    'Indoor use only. Operating temperature: 0°C to 40°C',
    '{"detection_technology": "PIR", "pet_immunity_lbs": 85, "battery_life_years": 7, "wireless_range_feet": 60}',
    '{"cone_pattern": true, "pet_immunity_height_dependent": true, "blind_spot_below_sensor": true}'
),
(
    4, 'Door/Window Sensor', 'Magnetic contact sensor for entry point monitoring',
    null, null, null, null, null, 2, '3V DC Battery',
    'Peel and stick mounting. Align magnetic components within 0.5 inches.',
    'Indoor use only. Avoid moisture exposure.',
    '{"technology": "magnetic_contact", "battery_life_years": 10, "wireless_range_feet": 60, "size_inches": "1.25x1.5x0.62"}',
    '{"alignment_critical": true, "gap_tolerance_inches": 0.5, "moisture_sensitive": true}'
),
(
    4, 'Smart Lock', 'Electronic deadbolt with smartphone control',
    null, null, null, null, null, 15, '4 AA Batteries',
    'Single-cylinder deadbolt compatibility required. Door thickness 1.375-1.75 inches.',
    'IP65 rated for exterior use. Operating temperature: -20°C to 60°C',
    '{"lock_type": "deadbolt", "battery_life_months": 12, "connectivity": "WiFi+Bluetooth", "weather_rating": "IP65"}',
    '{"door_thickness_range_inches": [1.375, 1.75], "deadbolt_compatibility": "single_cylinder", "professional_install_recommended": true}'
);

-- Insert smart doorbell specifications
INSERT INTO device_specifications (
    category_id, device_name, description, field_of_view_degrees, detection_range_feet,
    mounting_height_min_feet, mounting_height_max_feet, mounting_height_optimal_feet,
    power_consumption_watts, voltage_requirements, installation_constraints,
    environmental_requirements, technical_specs, placement_rules
) VALUES (
    5, 'Smart Video Doorbell', 'HD video doorbell with motion detection and two-way audio',
    135, 23, 3.3, 4, 4, 12, '16-24 VAC or Battery',
    'Existing doorbell wiring preferred. Hardwired installation requires 40VA transformer.',
    'Outdoor rated. Operating temperature: -4°F to 113°F',
    '{"resolution": "1080p", "night_vision": true, "battery_life_years": 2, "infrared_led": "850nm", "vertical_fov": 80}',
    '{"facial_recognition_optimal": true, "package_monitoring": true, "visitor_accessibility": true, "downward_tilt_degrees": 10}'
);

-- Insert motorized window treatment specifications
INSERT INTO device_specifications (
    category_id, device_name, description, power_consumption_watts, voltage_requirements,
    installation_constraints, environmental_requirements, technical_specs, placement_rules
) VALUES 
(
    6, 'AC Motorized Blinds', 'AC-powered motorized window blinds with smart home integration',
    22, '120V AC', 
    'Motor housing typically left-side mounted. Requires 8-hour initial battery charging.',
    'Indoor use only. Avoid moisture exposure. Quiet operation <38dB.',
    '{"torque_nm": 1.1, "speed_rpm": 30, "noise_level_db": 38, "smart_hub_required": true, "voice_control": true}',
    '{"motor_position": "left_side", "bracket_types": ["motor_end", "pin_end"], "track_weight_support": true}'
),
(
    6, 'Battery Motorized Shades', 'Battery-powered motorized shades for wireless operation',
    10, '12V DC Battery',
    'Battery charging required before installation. Pin-end bracket support needed.',
    'Indoor use only. Temperature stable environment preferred.',
    '{"torque_nm": 0.8, "speed_rpm": 30, "noise_level_db": 38, "battery_rechargeable": true, "remote_channels": 16}',
    '{"wireless_operation": true, "battery_life_cycles": 1000, "programming_required": true}'
);

-- Insert central equipment specifications
INSERT INTO device_specifications (
    category_id, device_name, description, power_consumption_watts, voltage_requirements,
    installation_constraints, environmental_requirements, technical_specs, placement_rules
) VALUES (
    7, 'Equipment Rack Cabinet', 'Central equipment rack for home automation infrastructure',
    500, '120V AC',
    'Adequate ventilation required. Bottom-to-top airflow pattern. Cable management essential.',
    'Indoor use. Maximum ambient temperature 85°F (29°C). Humidity control recommended.',
    '{"rack_units": 42, "max_load_lbs": 2000, "ventilation_cfm": 200, "cable_management": true, "pdu_slots": 8}',
    '{"thermal_management_critical": true, "airflow_pattern": "bottom_to_top", "heat_load_calculation_required": true, "safety_margin_percent": 20}'
);

-- Insert environmental control specifications
INSERT INTO device_specifications (
    category_id, device_name, description, coverage_area_sqft, mounting_height_min_feet,
    mounting_height_max_feet, mounting_height_optimal_feet, power_consumption_watts,
    voltage_requirements, installation_constraints, environmental_requirements, technical_specs, placement_rules
) VALUES 
(
    8, 'Smart Thermostat', 'WiFi-enabled programmable thermostat with smartphone control',
    2500, 4, 6, 5, 8, '24V AC',
    'C-wire (common wire) required for continuous power. Replace existing thermostat location.',
    'Indoor use only. Avoid direct sunlight, heat sources, drafts.',
    '{"stages_heating": 3, "stages_cooling": 2, "wifi_required": true, "c_wire_required": true, "voice_control": true}',
    '{"existing_location_required": true, "hvac_compatibility_check": true, "zone_control_capable": true}'
),
(
    8, 'Smoke Detector', 'Photoelectric smoke detector with smart home integration',
    400, 8, 12, 10, 3, '9V Battery',
    'Ceiling mounting required. 4 inches from walls. Avoid kitchens, bathrooms, garages.',
    'Indoor use. Temperature range: 40°F to 100°F. Humidity <85% RH.',
    '{"detection_type": "photoelectric", "battery_life_years": 10, "interconnect_wireless": true, "test_button": true}',
    '{"nfpa_compliance": true, "ceiling_mount_required": true, "wall_clearance_inches": 4, "avoid_humidity_areas": true}'
),
(
    8, 'Smart Light Switch', 'WiFi-enabled smart switch with dimming capability',
    null, null, null, null, 5, '120V AC',
    'Neutral wire required. Single-pole or 3-way configurations. Professional installation recommended.',
    'Indoor use only. Standard wall box mounting.',
    '{"dimming_capable": true, "wifi_builtin": true, "neutral_wire_required": true, "load_capacity_watts": 600}',
    '{"electrical_safety_critical": true, "neutral_wire_mandatory": true, "load_compatibility_check": true}'
);