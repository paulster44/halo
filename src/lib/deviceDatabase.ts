// Mock device database for calculation when real database is not available
// This provides fallback device specifications for the calculation engine

export const mockDeviceDatabase = [
  // WiFi Category (ID: 1)
  {
    id: 1,
    category_id: 1,
    device_name: 'WiFi 6 Access Point',
    description: 'High-performance wireless access point with WiFi 6 support',
    coverage_area_sqft: 1500,
    coverage_radius_feet: 50,
    power_consumption_watts: 25,
    device_categories: { name: 'WiFi Networking', icon_name: 'wifi' }
  },
  {
    id: 2,
    category_id: 1, 
    device_name: 'Mesh WiFi Node',
    description: 'Mesh network node for extended coverage',
    coverage_area_sqft: 1200,
    coverage_radius_feet: 40,
    power_consumption_watts: 15,
    device_categories: { name: 'WiFi Networking', icon_name: 'wifi' }
  },

  // Security Category (ID: 2)
  {
    id: 10,
    category_id: 2,
    device_name: 'Smart Smoke Detector',
    description: 'Intelligent smoke and carbon monoxide detector',
    coverage_radius_feet: 20,
    power_consumption_watts: 5,
    device_categories: { name: 'Security & Safety', icon_name: 'shield' }
  },
  {
    id: 11,
    category_id: 2,
    device_name: 'Door/Window Sensor',
    description: 'Wireless magnetic contact sensor',
    detection_range_feet: 1,
    power_consumption_watts: 1,
    device_categories: { name: 'Security & Safety', icon_name: 'shield' }
  },
  {
    id: 12,
    category_id: 2,
    device_name: 'Smart Doorbell',
    description: 'Video doorbell with two-way communication',
    field_of_view_degrees: 180,
    power_consumption_watts: 8,
    device_categories: { name: 'Security & Safety', icon_name: 'doorbell' }
  },
  {
    id: 13,
    category_id: 2,
    device_name: 'Motion Detector',
    description: 'PIR motion sensor for automation and security',
    coverage_radius_feet: 25,
    detection_range_feet: 30,
    power_consumption_watts: 3,
    device_categories: { name: 'Security & Safety', icon_name: 'shield' }
  },

  // Smart Switches Category (ID: 3)
  {
    id: 20,
    category_id: 3,
    device_name: 'Smart Light Switch',
    description: 'WiFi-enabled smart switch with dimming capability',
    power_consumption_watts: 5,
    device_categories: { name: 'Smart Switches', icon_name: 'layers' }
  },
  {
    id: 21,
    category_id: 3,
    device_name: 'Smart Dimmer Switch',
    description: 'Intelligent dimmer switch with scheduling',
    power_consumption_watts: 5,
    device_categories: { name: 'Smart Switches', icon_name: 'layers' }
  },

  // Cameras Category (ID: 4)
  {
    id: 30,
    category_id: 4,
    device_name: 'Outdoor Security Camera',
    description: '4K outdoor camera with night vision',
    field_of_view_degrees: 110,
    coverage_radius_feet: 40,
    power_consumption_watts: 12,
    device_categories: { name: 'Security Cameras', icon_name: 'camera' }
  },
  {
    id: 31,
    category_id: 4,
    device_name: 'Indoor Security Camera',
    description: '1080p indoor camera with pan/tilt',
    field_of_view_degrees: 120,
    coverage_radius_feet: 25,
    power_consumption_watts: 8,
    device_categories: { name: 'Security Cameras', icon_name: 'camera' }
  },

  // Environmental Category (ID: 5)
  {
    id: 40,
    category_id: 5,
    device_name: 'Smart Thermostat',
    description: 'Intelligent climate control with learning capabilities',
    coverage_area_sqft: 1500,
    power_consumption_watts: 10,
    device_categories: { name: 'Environmental Controls', icon_name: 'thermometer' }
  },
  {
    id: 41,
    category_id: 5,
    device_name: 'Temperature Sensor',
    description: 'Wireless temperature and humidity sensor',
    coverage_radius_feet: 15,
    power_consumption_watts: 2,
    device_categories: { name: 'Environmental Controls', icon_name: 'thermometer' }
  },

  // Entertainment Category (ID: 6)
  {
    id: 50,
    category_id: 6,
    device_name: 'In-Wall Speaker',
    description: 'Architectural speaker for multi-room audio',
    coverage_radius_feet: 15,
    power_consumption_watts: 50,
    device_categories: { name: 'Entertainment', icon_name: 'speaker' }
  },
  {
    id: 51,
    category_id: 6,
    device_name: 'Entertainment Hub',
    description: 'Central hub for TV and audio distribution',
    power_consumption_watts: 25,
    device_categories: { name: 'Entertainment', icon_name: 'speaker' }
  },
  {
    id: 52,
    category_id: 6,
    device_name: 'Audio Hub',
    description: 'Multi-zone audio controller and amplifier',
    power_consumption_watts: 100,
    device_categories: { name: 'Entertainment', icon_name: 'speaker' }
  },

  // Window Treatments Category (ID: 7)
  {
    id: 60,
    category_id: 7,
    device_name: 'Motorized Blinds',
    description: 'Automated window blinds with smart control',
    power_consumption_watts: 15,
    device_categories: { name: 'Window Treatments', icon_name: 'window' }
  },
  {
    id: 61,
    category_id: 7,
    device_name: 'Smart Shades',
    description: 'Intelligent roller shades with scheduling',
    power_consumption_watts: 12,
    device_categories: { name: 'Window Treatments', icon_name: 'window' }
  },

  // Central Equipment Category (ID: 8)
  {
    id: 70,
    category_id: 8,
    device_name: 'Equipment Rack',
    description: 'Central networking and automation equipment rack',
    power_consumption_watts: 200,
    device_categories: { name: 'Central Equipment', icon_name: 'server' }
  },
  {
    id: 71,
    category_id: 8,
    device_name: 'Network Switch',
    description: 'Managed Ethernet switch for device connectivity',
    power_consumption_watts: 30,
    device_categories: { name: 'Central Equipment', icon_name: 'server' }
  },
  {
    id: 72,
    category_id: 8,
    device_name: 'Automation Hub',
    description: 'Central automation controller and hub',
    power_consumption_watts: 15,
    device_categories: { name: 'Central Equipment', icon_name: 'server' }
  }
]

export const mockDeviceCategories = [
  { id: 1, name: 'WiFi Networking', icon_name: 'wifi', color_code: '#3B82F6' },
  { id: 2, name: 'Security & Safety', icon_name: 'shield', color_code: '#EF4444' },
  { id: 3, name: 'Smart Switches', icon_name: 'layers', color_code: '#10B981' },
  { id: 4, name: 'Security Cameras', icon_name: 'camera', color_code: '#8B5CF6' },
  { id: 5, name: 'Environmental Controls', icon_name: 'thermometer', color_code: '#F59E0B' },
  { id: 6, name: 'Entertainment', icon_name: 'speaker', color_code: '#EC4899' },
  { id: 7, name: 'Window Treatments', icon_name: 'window', color_code: '#6B7280' },
  { id: 8, name: 'Central Equipment', icon_name: 'server', color_code: '#1F2937' }
]
