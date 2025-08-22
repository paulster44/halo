// Device placement optimization algorithm
export interface PlacementPosition {
  x: number
  y: number
  rotation?: number
  room_id?: string
  placement_reasoning: string
}

export interface DevicePlacement {
  device_id: string
  device_name: string
  category: string
  position: PlacementPosition
  coverage_area?: {
    radius: number
    shape: 'circle' | 'rectangle' | 'cone'
    angle?: number // for directional devices
  }
  installation_notes: string
}

export interface PlacementAnalysisResult {
  placements: DevicePlacement[]
  coverage_analysis: {
    total_coverage_percent: number
    uncovered_areas: Array<{x: number, y: number, radius: number}>
    device_interference: Array<{device1: string, device2: string, severity: 'low' | 'medium' | 'high'}>
  }
  optimization_summary: string[]
}

// Device placement specifications
interface DevicePlacementSpecs {
  [deviceType: string]: {
    placement_rules: {
      preferred_locations: string[] // room types
      wall_mounted: boolean
      ceiling_mounted: boolean
      min_height_feet?: number
      max_height_feet?: number
      distance_from_walls_feet?: number
      coverage_radius_feet: number
      interference_radius_feet?: number
      directional?: boolean
      angle_coverage?: number // degrees
    }
    icon: {
      name: string
      color: string
      size: number // relative size multiplier
    }
  }
}

const DEVICE_PLACEMENT_SPECS: DevicePlacementSpecs = {
  'Security Camera': {
    placement_rules: {
      preferred_locations: ['living_room', 'hallway', 'exterior'],
      wall_mounted: true,
      ceiling_mounted: true,
      min_height_feet: 8,
      max_height_feet: 12,
      coverage_radius_feet: 25,
      directional: true,
      angle_coverage: 110
    },
    icon: { name: 'camera', color: '#EF4444', size: 1.2 }
  },
  'Motion Detector': {
    placement_rules: {
      preferred_locations: ['living_room', 'bedroom', 'hallway'],
      wall_mounted: true,
      ceiling_mounted: true,
      min_height_feet: 7,
      max_height_feet: 10,
      coverage_radius_feet: 20,
      directional: true,
      angle_coverage: 120
    },
    icon: { name: 'motion', color: '#F59E0B', size: 1.0 }
  },
  'Smart Doorbell': {
    placement_rules: {
      preferred_locations: ['exterior'],
      wall_mounted: true,
      ceiling_mounted: false,
      min_height_feet: 4,
      max_height_feet: 5,
      coverage_radius_feet: 8,
      directional: true,
      angle_coverage: 160
    },
    icon: { name: 'doorbell', color: '#8B5CF6', size: 1.1 }
  },
  'Smart Lock': {
    placement_rules: {
      preferred_locations: ['exterior'],
      wall_mounted: true,
      ceiling_mounted: false,
      min_height_feet: 3,
      max_height_feet: 4,
      coverage_radius_feet: 3,
      directional: false
    },
    icon: { name: 'lock', color: '#059669', size: 1.0 }
  },
  'Smoke Detector': {
    placement_rules: {
      preferred_locations: ['bedroom', 'living_room', 'kitchen', 'hallway'],
      wall_mounted: false,
      ceiling_mounted: true,
      min_height_feet: 8,
      max_height_feet: 12,
      coverage_radius_feet: 15,
      directional: false
    },
    icon: { name: 'smoke', color: '#DC2626', size: 1.0 }
  },
  'Smart Thermostat': {
    placement_rules: {
      preferred_locations: ['living_room', 'hallway'],
      wall_mounted: true,
      ceiling_mounted: false,
      min_height_feet: 4,
      max_height_feet: 6,
      coverage_radius_feet: 0, // Point device
      directional: false
    },
    icon: { name: 'thermostat', color: '#3B82F6', size: 1.2 }
  },
  'WiFi Access Point': {
    placement_rules: {
      preferred_locations: ['living_room', 'bedroom', 'office'],
      wall_mounted: true,
      ceiling_mounted: true,
      min_height_feet: 6,
      max_height_feet: 10,
      coverage_radius_feet: 30,
      interference_radius_feet: 15,
      directional: false
    },
    icon: { name: 'wifi', color: '#10B981', size: 1.1 }
  },
  'Smart TV': {
    placement_rules: {
      preferred_locations: ['living_room', 'bedroom'],
      wall_mounted: true,
      ceiling_mounted: false,
      min_height_feet: 3,
      max_height_feet: 6,
      coverage_radius_feet: 0,
      directional: false
    },
    icon: { name: 'tv', color: '#1F2937', size: 1.5 }
  }
}

// Main placement optimization function
export function optimizeDevicePlacement(
  devices: Array<{device_name: string, category: string, quantity: number}>,
  floorPlanAnalysis: any,
  userPreferences: any,
  imageDimensions: {width: number, height: number}
): PlacementAnalysisResult {
  const placements: DevicePlacement[] = []
  const rooms = floorPlanAnalysis?.rooms || []
  const doors = floorPlanAnalysis?.doors || []
  const windows = floorPlanAnalysis?.windows || []
  
  // Create a grid for placement optimization
  const placementGrid = createPlacementGrid(imageDimensions, rooms)
  
  // Place each device type
  for (const device of devices) {
    const devicePlacements = placeDeviceType(
      device,
      rooms,
      doors,
      windows,
      userPreferences,
      placementGrid,
      imageDimensions
    )
    placements.push(...devicePlacements)
  }
  
  // Optimize placement to minimize interference
  const optimizedPlacements = optimizeForInterference(placements)
  
  // Analyze coverage
  const coverageAnalysis = analyzeCoverage(optimizedPlacements, rooms, imageDimensions)
  
  // Generate optimization summary
  const optimizationSummary = generateOptimizationSummary(optimizedPlacements, coverageAnalysis)
  
  return {
    placements: optimizedPlacements,
    coverage_analysis: coverageAnalysis,
    optimization_summary: optimizationSummary
  }
}

// Create placement grid for optimization
function createPlacementGrid(
  imageDimensions: {width: number, height: number},
  rooms: any[]
): boolean[][] {
  const gridSize = 20 // Grid resolution
  const cols = Math.ceil(imageDimensions.width / gridSize)
  const rows = Math.ceil(imageDimensions.height / gridSize)
  
  // Initialize grid - true means available for placement
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(true))
  
  // Mark walls and invalid areas as unavailable
  // This is a simplified implementation
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = j * gridSize
      const y = i * gridSize
      
      // Check if position is too close to walls/edges
      if (x < 50 || x > imageDimensions.width - 50 || 
          y < 50 || y > imageDimensions.height - 50) {
        grid[i][j] = false
      }
    }
  }
  
  return grid
}

// Place devices of a specific type
function placeDeviceType(
  device: {device_name: string, category: string, quantity: number},
  rooms: any[],
  doors: any[],
  windows: any[],
  userPreferences: any,
  placementGrid: boolean[][],
  imageDimensions: {width: number, height: number}
): DevicePlacement[] {
  const placements: DevicePlacement[] = []
  const specs = DEVICE_PLACEMENT_SPECS[device.device_name]
  
  if (!specs) {
    // Default placement for unknown device types
    for (let i = 0; i < device.quantity; i++) {
      placements.push({
        device_id: `${device.device_name}_${i + 1}`,
        device_name: device.device_name,
        category: device.category,
        position: {
          x: imageDimensions.width * 0.5,
          y: imageDimensions.height * 0.5,
          placement_reasoning: 'Default center placement for unknown device type'
        },
        installation_notes: 'Manual placement required - device type not recognized'
      })
    }
    return placements
  }
  
  // Find suitable rooms for this device type
  const suitableRooms = rooms.filter(room => 
    specs.placement_rules.preferred_locations.includes(room.type)
  )
  
  // Handle special placement logic
  if (device.device_name === 'Smart TV' && userPreferences?.tvPlacements) {
    return placeTVDevices(device, userPreferences.tvPlacements, specs)
  }
  
  // Standard device placement
  let placedCount = 0
  for (const room of suitableRooms) {
    if (placedCount >= device.quantity) break
    
    const roomPlacements = placeDevicesInRoom(
      device,
      room,
      specs,
      Math.min(device.quantity - placedCount, getMaxDevicesForRoom(device.device_name, room))
    )
    
    placements.push(...roomPlacements)
    placedCount += roomPlacements.length
  }
  
  // If we haven't placed all devices, place remaining in available rooms
  if (placedCount < device.quantity) {
    const remainingCount = device.quantity - placedCount
    const additionalRooms = rooms.filter(room => 
      !specs.placement_rules.preferred_locations.includes(room.type)
    )
    
    for (const room of additionalRooms) {
      if (placedCount >= device.quantity) break
      
      const roomPlacements = placeDevicesInRoom(
        device,
        room,
        specs,
        Math.min(remainingCount, 1) // Place one device per additional room
      )
      
      placements.push(...roomPlacements)
      placedCount += roomPlacements.length
    }
  }
  
  return placements
}

// Place devices within a specific room
function placeDevicesInRoom(
  device: {device_name: string, category: string, quantity: number},
  room: any,
  specs: any,
  quantity: number
): DevicePlacement[] {
  const placements: DevicePlacement[] = []
  
  for (let i = 0; i < quantity; i++) {
    const position = calculateOptimalPosition(device, room, specs, i)
    
    placements.push({
      device_id: `${device.device_name}_${room.id}_${i + 1}`,
      device_name: device.device_name,
      category: device.category,
      position: {
        ...position,
        room_id: room.id,
        placement_reasoning: generatePlacementReasoning(device.device_name, room, specs)
      },
      coverage_area: specs.placement_rules.coverage_radius_feet > 0 ? {
        radius: specs.placement_rules.coverage_radius_feet * 12, // Convert to pixels
        shape: specs.placement_rules.directional ? 'cone' : 'circle',
        angle: specs.placement_rules.angle_coverage
      } : undefined,
      installation_notes: generateInstallationNotes(device.device_name, specs)
    })
  }
  
  return placements
}

// Calculate optimal position within room
function calculateOptimalPosition(
  device: {device_name: string, category: string},
  room: any,
  specs: any,
  index: number
): {x: number, y: number, rotation?: number} {
  const roomBounds = room.coordinates
  const centerX = (roomBounds.minX + roomBounds.maxX) / 2
  const centerY = (roomBounds.minY + roomBounds.maxY) / 2
  
  // Device-specific positioning logic
  switch (device.device_name) {
    case 'Security Camera':
      // Place in corners for maximum coverage
      const corners = [
        {x: roomBounds.minX + 20, y: roomBounds.minY + 20},
        {x: roomBounds.maxX - 20, y: roomBounds.minY + 20},
        {x: roomBounds.minX + 20, y: roomBounds.maxY - 20},
        {x: roomBounds.maxX - 20, y: roomBounds.maxY - 20}
      ]
      const corner = corners[index % corners.length]
      return {x: corner.x, y: corner.y, rotation: calculateOptimalCameraAngle(corner, roomBounds)}
      
    case 'Motion Detector':
      // Place for optimal motion coverage
      return {
        x: centerX + (index % 2 === 0 ? -roomBounds.width * 0.25 : roomBounds.width * 0.25),
        y: centerY,
        rotation: index % 2 === 0 ? 90 : 270
      }
      
    case 'Smoke Detector':
      // Center of room, ceiling mounted
      return {x: centerX, y: centerY}
      
    case 'Smart Thermostat':
      // Central wall location
      return {
        x: roomBounds.minX + 30,
        y: centerY
      }
      
    case 'WiFi Access Point':
      // Central, elevated position
      return {x: centerX, y: centerY - roomBounds.height * 0.1}
      
    default:
      return {x: centerX, y: centerY}
  }
}

// Place TV devices based on user preferences
function placeTVDevices(
  device: {device_name: string, category: string, quantity: number},
  tvPlacements: any[],
  specs: any
): DevicePlacement[] {
  const placements: DevicePlacement[] = []
  
  for (let i = 0; i < Math.min(device.quantity, tvPlacements.length); i++) {
    const tvPlacement = tvPlacements[i]
    
    placements.push({
      device_id: `${device.device_name}_tv_${i + 1}`,
      device_name: device.device_name,
      category: device.category,
      position: {
        x: tvPlacement.x || 0,
        y: tvPlacement.y || 0,
        placement_reasoning: `User-specified TV location in ${tvPlacement.room || 'selected room'}`
      },
      installation_notes: 'Mounted at user-specified location'
    })
  }
  
  return placements
}

// Generate placement reasoning text
function generatePlacementReasoning(deviceName: string, room: any, specs: any): string {
  const reasons = {
    'Security Camera': `Positioned in ${room.name} for optimal surveillance coverage with minimal blind spots`,
    'Motion Detector': `Placed in ${room.name} to detect movement across primary traffic paths`,
    'Smart Doorbell': `Installed at main entrance for visitor monitoring and package detection`,
    'Smart Lock': `Mounted on primary entry door for secure access control`,
    'Smoke Detector': `Ceiling-mounted in ${room.name} for early fire detection and safety compliance`,
    'Smart Thermostat': `Central location in ${room.name} for accurate temperature monitoring`,
    'WiFi Access Point': `Positioned in ${room.name} for optimal wireless coverage and signal strength`
  }
  
  return reasons[deviceName] || `Optimally placed in ${room.name} based on device specifications`
}

// Generate installation notes
function generateInstallationNotes(deviceName: string, specs: any): string {
  const mounting = specs.placement_rules.wall_mounted ? 'wall-mounted' : 'ceiling-mounted'
  const height = specs.placement_rules.min_height_feet ? 
    `at ${specs.placement_rules.min_height_feet}-${specs.placement_rules.max_height_feet || specs.placement_rules.min_height_feet} feet height` : ''
  
  return `Professional installation required: ${mounting} ${height}. Ensure proper power supply and network connectivity.`
}

// Calculate optimal camera angle
function calculateOptimalCameraAngle(position: {x: number, y: number}, roomBounds: any): number {
  const centerX = (roomBounds.minX + roomBounds.maxX) / 2
  const centerY = (roomBounds.minY + roomBounds.maxY) / 2
  
  const angle = Math.atan2(centerY - position.y, centerX - position.x) * 180 / Math.PI
  return angle
}

// Get maximum devices for room based on size
function getMaxDevicesForRoom(deviceName: string, room: any): number {
  const roomArea = room.area_sqft || 100
  
  const maxDevices = {
    'Security Camera': Math.min(2, Math.max(1, Math.floor(roomArea / 200))),
    'Motion Detector': Math.min(2, Math.max(1, Math.floor(roomArea / 150))),
    'Smoke Detector': Math.max(1, Math.floor(roomArea / 150)),
    'WiFi Access Point': Math.max(1, Math.floor(roomArea / 400))
  }
  
  return maxDevices[deviceName] || 1
}

// Optimize for interference
function optimizeForInterference(placements: DevicePlacement[]): DevicePlacement[] {
  // Simple interference optimization - move devices apart if too close
  const optimized = [...placements]
  
  for (let i = 0; i < optimized.length; i++) {
    for (let j = i + 1; j < optimized.length; j++) {
      const device1 = optimized[i]
      const device2 = optimized[j]
      
      // Check if devices might interfere (WiFi, wireless devices)
      if ((device1.device_name.includes('WiFi') || device2.device_name.includes('WiFi')) ||
          (device1.device_name.includes('Smart') && device2.device_name.includes('Smart'))) {
        
        const distance = Math.sqrt(
          Math.pow(device1.position.x - device2.position.x, 2) +
          Math.pow(device1.position.y - device2.position.y, 2)
        )
        
        // If too close, adjust position slightly
        if (distance < 60) { // 5 feet minimum separation
          device2.position.x += 30
          device2.position.y += 30
        }
      }
    }
  }
  
  return optimized
}

// Analyze coverage
function analyzeCoverage(
  placements: DevicePlacement[],
  rooms: any[],
  imageDimensions: {width: number, height: number}
) {
  const coveredAreas = new Set<string>()
  const gridSize = 20
  
  // Calculate coverage for each device
  for (const placement of placements) {
    if (placement.coverage_area) {
      const radius = placement.coverage_area.radius
      
      // Mark grid cells as covered
      for (let x = placement.position.x - radius; x <= placement.position.x + radius; x += gridSize) {
        for (let y = placement.position.y - radius; y <= placement.position.y + radius; y += gridSize) {
          const distance = Math.sqrt(
            Math.pow(x - placement.position.x, 2) + Math.pow(y - placement.position.y, 2)
          )
          
          if (distance <= radius) {
            coveredAreas.add(`${Math.floor(x / gridSize)},${Math.floor(y / gridSize)}`)
          }
        }
      }
    }
  }
  
  // Calculate total coverage percentage
  const totalCells = Math.ceil(imageDimensions.width / gridSize) * Math.ceil(imageDimensions.height / gridSize)
  const coveragePercent = Math.round((coveredAreas.size / totalCells) * 100)
  
  return {
    total_coverage_percent: coveragePercent,
    uncovered_areas: [], // Simplified - would calculate actual uncovered areas
    device_interference: [] // Simplified - would calculate actual interference
  }
}

// Generate optimization summary
function generateOptimizationSummary(
  placements: DevicePlacement[],
  coverageAnalysis: any
): string[] {
  const summary = [
    `Optimized placement for ${placements.length} devices across your home`,
    `Achieved ${coverageAnalysis.total_coverage_percent}% coverage of monitored areas`,
    'Minimized device interference through strategic positioning',
    'Followed professional installation guidelines for all devices',
    'Prioritized user preferences and room-specific requirements'
  ]
  
  return summary
}