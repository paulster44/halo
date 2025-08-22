import { AutomationTier } from '../components/TierSelector'
import { UserPreference } from '../components/UserPreferences'

// Device calculation results
export interface CalculatedDevice {
  deviceSpecId: number
  quantity: number
  priority: 'high' | 'medium' | 'low'
  placementReason: string
  category: string
  deviceName: string
}

export interface DeviceCalculationResult {
  devices: CalculatedDevice[]
  totalDevices: number
  estimatedCost: number
  rationale: string[]
}

// Floor plan analysis structure
interface FloorPlanAnalysis {
  rooms_detected?: any[]
  doors_detected?: any[]
  windows_detected?: any[]
  walls_detected?: any[]
  dimensions?: {
    total_sqft?: number
    perimeter_feet?: number
  }
}

// Device specifications for calculation
interface DeviceSpec {
  id: number
  category_id: number
  device_name: string
  coverage_area_sqft?: number
  coverage_radius_feet?: number
  device_categories: {
    name: string
    icon_name: string
  }
}

/**
 * Main function to calculate devices based on tier and floor plan analysis
 */
export function calculateDevicesForTier(
  tier: AutomationTier,
  floorPlanAnalysis: FloorPlanAnalysis | null,
  userPreferences: UserPreference,
  deviceSpecs: DeviceSpec[]
): DeviceCalculationResult {
  const result: DeviceCalculationResult = {
    devices: [],
    totalDevices: 0,
    estimatedCost: 0,
    rationale: []
  }

  // Extract floor plan metrics
  const rooms = floorPlanAnalysis?.rooms_detected || []
  const doors = floorPlanAnalysis?.doors_detected || []
  const windows = floorPlanAnalysis?.windows_detected || []
  const sqft = floorPlanAnalysis?.dimensions?.total_sqft || 2000
  const perimeter = floorPlanAnalysis?.dimensions?.perimeter_feet || 200

  // Count different room types
  const roomCount = Math.max(rooms.length, 5) // Minimum 5 rooms
  const entryPoints = doors.length + windows.length
  const exteriorDoors = Math.max(Math.floor(doors.length * 0.3), 1) // Estimate exterior doors

  result.rationale.push(`Floor Plan Analysis: ${roomCount} rooms, ${Math.round(sqft)} sq ft, ${entryPoints} entry points`)
  result.rationale.push(`Selected Tier: ${tier.name} (${tier.description})`)

  // Calculate devices by category based on tier
  if (tier.deviceCategories.wifi.included) {
    const wifiDevices = calculateWiFiDevices(sqft, rooms, deviceSpecs)
    result.devices.push(...wifiDevices.devices)
    result.rationale.push(...wifiDevices.rationale)
  }

  if (tier.deviceCategories.security.included) {
    const securityDevices = calculateSecurityDevices(tier.id, roomCount, exteriorDoors, deviceSpecs)
    result.devices.push(...securityDevices.devices)
    result.rationale.push(...securityDevices.rationale)
  }

  if (tier.deviceCategories.switches.included) {
    const switchDevices = calculateSwitchDevices(roomCount, tier.id, deviceSpecs)
    result.devices.push(...switchDevices.devices)
    result.rationale.push(...switchDevices.rationale)
  }

  if (tier.deviceCategories.cameras.included) {
    const cameraDevices = calculateCameraDevices(tier.id, exteriorDoors, roomCount, deviceSpecs)
    result.devices.push(...cameraDevices.devices)
    result.rationale.push(...cameraDevices.rationale)
  }

  if (tier.deviceCategories.sensors.included) {
    const sensorDevices = calculateSensorDevices(tier.id, entryPoints, roomCount, deviceSpecs)
    result.devices.push(...sensorDevices.devices)
    result.rationale.push(...sensorDevices.rationale)
  }

  if (tier.deviceCategories.environmental.included) {
    const envDevices = calculateEnvironmentalDevices(tier.id, roomCount, sqft, deviceSpecs)
    result.devices.push(...envDevices.devices)
    result.rationale.push(...envDevices.rationale)
  }

  if (tier.deviceCategories.entertainment.included) {
    const entertainmentDevices = calculateEntertainmentDevices(tier.id, userPreferences, roomCount, deviceSpecs)
    result.devices.push(...entertainmentDevices.devices)
    result.rationale.push(...entertainmentDevices.rationale)
  }

  if (tier.deviceCategories.comfort.included) {
    const comfortDevices = calculateComfortDevices(tier.id, roomCount, windows.length, deviceSpecs)
    result.devices.push(...comfortDevices.devices)
    result.rationale.push(...comfortDevices.rationale)
  }

  // Always include central equipment
  const equipmentDevices = calculateCentralEquipment(tier.id, result.devices.length, deviceSpecs)
  result.devices.push(...equipmentDevices.devices)
  result.rationale.push(...equipmentDevices.rationale)

  // Calculate totals
  result.totalDevices = result.devices.reduce((sum, d) => sum + d.quantity, 0)
  result.estimatedCost = estimateProjectCost(tier, result.totalDevices, sqft)

  return result
}

/**
 * Calculate WiFi access points based on coverage needs
 */
function calculateWiFiDevices(sqft: number, rooms: any[], deviceSpecs: DeviceSpec[]) {
  const wifiSpecs = deviceSpecs.filter(d => d.device_categories.icon_name === 'wifi')
  const accessPoint = wifiSpecs.find(d => d.device_name.toLowerCase().includes('access point')) ||
                     wifiSpecs.find(d => d.device_name.toLowerCase().includes('wifi')) ||
                     wifiSpecs[0]

  if (!accessPoint) {
    return { devices: [], rationale: [] }
  }

  // Calculate based on coverage area
  const coveragePerAP = accessPoint.coverage_area_sqft || 1500
  const apCount = Math.max(1, Math.ceil(sqft / coveragePerAP))
  
  // Ensure minimum coverage for multi-story or large homes
  const finalCount = Math.max(apCount, Math.min(2, Math.ceil(rooms.length / 4)))

  return {
    devices: [{
      deviceSpecId: accessPoint.id,
      quantity: finalCount,
      priority: 'high' as const,
      placementReason: `Coverage optimization for ${Math.round(sqft)} sq ft`,
      category: accessPoint.device_categories.name,
      deviceName: accessPoint.device_name
    }],
    rationale: [`WiFi Coverage: ${finalCount} access points for ${Math.round(sqft)} sq ft (${Math.round(coveragePerAP)} sq ft per AP)`]
  }
}

/**
 * Calculate security devices (smoke detectors, door sensors, etc.)
 */
function calculateSecurityDevices(tierLevel: string, roomCount: number, exteriorDoors: number, deviceSpecs: DeviceSpec[]) {
  const devices: CalculatedDevice[] = []
  const rationale: string[] = []

  // Smoke detectors (required by code)
  const smokeDetector = deviceSpecs.find(d => d.device_name.toLowerCase().includes('smoke'))
  if (smokeDetector) {
    const smokeCount = Math.max(roomCount, 3) // At least one per room, minimum 3
    devices.push({
      deviceSpecId: smokeDetector.id,
      quantity: smokeCount,
      priority: 'high' as const,
      placementReason: 'Fire safety code compliance',
      category: smokeDetector.device_categories.name,
      deviceName: smokeDetector.device_name
    })
    rationale.push(`Smoke Detectors: ${smokeCount} units for fire safety compliance`)
  }

  // Door/Window sensors
  const doorSensor = deviceSpecs.find(d => d.device_name.toLowerCase().includes('door') && d.device_name.toLowerCase().includes('sensor'))
  if (doorSensor) {
    const sensorCount = tierLevel === 'basic' ? exteriorDoors : exteriorDoors + 2 // Include some windows for higher tiers
    devices.push({
      deviceSpecId: doorSensor.id,
      quantity: sensorCount,
      priority: 'high' as const,
      placementReason: 'Entry point monitoring',
      category: doorSensor.device_categories.name,
      deviceName: doorSensor.device_name
    })
    rationale.push(`Entry Sensors: ${sensorCount} sensors for doors and key windows`)
  }

  // Smart doorbell
  const doorbell = deviceSpecs.find(d => d.device_name.toLowerCase().includes('doorbell'))
  if (doorbell) {
    devices.push({
      deviceSpecId: doorbell.id,
      quantity: 1,
      priority: 'high' as const,
      placementReason: 'Front door security and communication',
      category: doorbell.device_categories.name,
      deviceName: doorbell.device_name
    })
    rationale.push('Smart Doorbell: 1 unit at main entrance')
  }

  return { devices, rationale }
}

/**
 * Calculate smart switches and dimmers
 */
function calculateSwitchDevices(roomCount: number, tierLevel: string, deviceSpecs: DeviceSpec[]) {
  const switchSpecs = deviceSpecs.filter(d => d.device_name.toLowerCase().includes('switch'))
  const smartSwitch = switchSpecs.find(d => d.device_name.toLowerCase().includes('smart')) || switchSpecs[0]
  
  if (!smartSwitch) {
    return { devices: [], rationale: [] }
  }

  // Estimate switches per room (typically 2-3 switches per room)
  const switchesPerRoom = tierLevel === 'advanced' ? 3 : tierLevel === 'intermediate' ? 2.5 : 2
  const switchCount = Math.ceil(roomCount * switchesPerRoom)

  return {
    devices: [{
      deviceSpecId: smartSwitch.id,
      quantity: switchCount,
      priority: 'medium' as const,
      placementReason: 'Complete lighting control automation',
      category: smartSwitch.device_categories.name,
      deviceName: smartSwitch.device_name
    }],
    rationale: [`Smart Switches: ${switchCount} switches (${switchesPerRoom} avg per room)`]
  }
}

/**
 * Calculate security cameras
 */
function calculateCameraDevices(tierLevel: string, exteriorDoors: number, roomCount: number, deviceSpecs: DeviceSpec[]) {
  const cameraSpecs = deviceSpecs.filter(d => d.device_categories.icon_name === 'camera')
  const outdoorCamera = cameraSpecs.find(d => d.device_name.toLowerCase().includes('outdoor')) || cameraSpecs[0]
  const indoorCamera = cameraSpecs.find(d => d.device_name.toLowerCase().includes('indoor')) || cameraSpecs[1] || cameraSpecs[0]
  
  const devices: CalculatedDevice[] = []
  const rationale: string[] = []

  if (outdoorCamera) {
    let outdoorCount = 0
    if (tierLevel === 'basic') outdoorCount = Math.max(2, exteriorDoors)
    else if (tierLevel === 'intermediate') outdoorCount = Math.max(3, exteriorDoors + 1)
    else outdoorCount = Math.max(4, exteriorDoors + 2)

    devices.push({
      deviceSpecId: outdoorCamera.id,
      quantity: outdoorCount,
      priority: 'high' as const,
      placementReason: 'Perimeter security monitoring',
      category: outdoorCamera.device_categories.name,
      deviceName: outdoorCamera.device_name
    })
    rationale.push(`Outdoor Cameras: ${outdoorCount} cameras for perimeter security`)
  }

  if (indoorCamera && (tierLevel === 'intermediate' || tierLevel === 'advanced')) {
    const indoorCount = tierLevel === 'advanced' ? Math.min(4, Math.ceil(roomCount / 3)) : Math.min(2, Math.ceil(roomCount / 4))
    
    devices.push({
      deviceSpecId: indoorCamera.id,
      quantity: indoorCount,
      priority: 'medium' as const,
      placementReason: 'Interior monitoring of common areas',
      category: indoorCamera.device_categories.name,
      deviceName: indoorCamera.device_name
    })
    rationale.push(`Indoor Cameras: ${indoorCount} cameras for common area monitoring`)
  }

  return { devices, rationale }
}

/**
 * Calculate motion and other sensors
 */
function calculateSensorDevices(tierLevel: string, entryPoints: number, roomCount: number, deviceSpecs: DeviceSpec[]) {
  const motionSensor = deviceSpecs.find(d => d.device_name.toLowerCase().includes('motion'))
  
  if (!motionSensor || tierLevel === 'basic') {
    return { devices: [], rationale: [] }
  }

  // Motion sensors for intermediate and advanced tiers
  const motionCount = tierLevel === 'advanced' ? Math.ceil(roomCount * 0.8) : Math.ceil(roomCount * 0.5)

  return {
    devices: [{
      deviceSpecId: motionSensor.id,
      quantity: motionCount,
      priority: 'medium' as const,
      placementReason: 'Automated lighting and security detection',
      category: motionSensor.device_categories.name,
      deviceName: motionSensor.device_name
    }],
    rationale: [`Motion Sensors: ${motionCount} sensors for automation and security`]
  }
}

/**
 * Calculate environmental devices (thermostats, etc.)
 */
function calculateEnvironmentalDevices(tierLevel: string, roomCount: number, sqft: number, deviceSpecs: DeviceSpec[]) {
  const thermostat = deviceSpecs.find(d => d.device_name.toLowerCase().includes('thermostat'))
  
  if (!thermostat) {
    return { devices: [], rationale: [] }
  }

  // Calculate number of zones
  let zoneCount = 1
  if (tierLevel === 'intermediate' && sqft > 2000) zoneCount = 2
  else if (tierLevel === 'advanced') zoneCount = Math.min(3, Math.ceil(sqft / 1500))

  return {
    devices: [{
      deviceSpecId: thermostat.id,
      quantity: zoneCount,
      priority: 'high' as const,
      placementReason: 'Climate control optimization',
      category: thermostat.device_categories.name,
      deviceName: thermostat.device_name
    }],
    rationale: [`Smart Thermostats: ${zoneCount} zones for climate control`]
  }
}

/**
 * Calculate entertainment devices based on user preferences
 */
function calculateEntertainmentDevices(tierLevel: string, userPreferences: UserPreference, roomCount: number, deviceSpecs: DeviceSpec[]) {
  const devices: CalculatedDevice[] = []
  const rationale: string[] = []

  // Audio system components
  const speaker = deviceSpecs.find(d => d.device_name.toLowerCase().includes('speaker'))
  const audioHub = deviceSpecs.find(d => d.device_name.toLowerCase().includes('audio') && d.device_name.toLowerCase().includes('hub'))

  if (userPreferences.audioPreferences.type !== 'stereo' && speaker) {
    let speakerCount = 0
    
    if (userPreferences.audioPreferences.type === 'whole-home') {
      speakerCount = Math.min(roomCount, 8)
    } else if (userPreferences.audioPreferences.type === 'zone-based') {
      speakerCount = userPreferences.audioPreferences.primaryRooms.length * 2
    } else if (userPreferences.audioPreferences.type === 'surround') {
      speakerCount = 5 // 5.1 system
    }

    if (speakerCount > 0) {
      devices.push({
        deviceSpecId: speaker.id,
        quantity: speakerCount,
        priority: 'medium' as const,
        placementReason: `${userPreferences.audioPreferences.type} audio system`,
        category: speaker.device_categories.name,
        deviceName: speaker.device_name
      })
      rationale.push(`Audio Speakers: ${speakerCount} speakers for ${userPreferences.audioPreferences.type} system`)
    }
  }

  // TV mounting and wiring (represented as entertainment hub)
  if (userPreferences.tvPlacements.length > 0) {
    const tvHub = deviceSpecs.find(d => d.device_name.toLowerCase().includes('entertainment') || d.device_name.toLowerCase().includes('tv'))
    
    if (tvHub) {
      devices.push({
        deviceSpecId: tvHub.id,
        quantity: userPreferences.tvPlacements.length,
        priority: 'high' as const,
        placementReason: 'TV mounting and connectivity',
        category: tvHub.device_categories.name,
        deviceName: tvHub.device_name
      })
      rationale.push(`TV Installation: ${userPreferences.tvPlacements.length} TV locations configured`)
    }
  }

  return { devices, rationale }
}

/**
 * Calculate comfort devices (window treatments, etc.)
 */
function calculateComfortDevices(tierLevel: string, roomCount: number, windowCount: number, deviceSpecs: DeviceSpec[]) {
  if (tierLevel === 'basic') {
    return { devices: [], rationale: [] }
  }

  const windowTreatment = deviceSpecs.find(d => d.device_name.toLowerCase().includes('blind') || d.device_name.toLowerCase().includes('shade'))
  
  if (!windowTreatment) {
    return { devices: [], rationale: [] }
  }

  // Automated window treatments for key rooms
  const treatmentCount = tierLevel === 'advanced' ? Math.min(windowCount, roomCount * 2) : Math.min(windowCount / 2, roomCount)

  return {
    devices: [{
      deviceSpecId: windowTreatment.id,
      quantity: Math.ceil(treatmentCount),
      priority: 'low' as const,
      placementReason: 'Automated privacy and light control',
      category: windowTreatment.device_categories.name,
      deviceName: windowTreatment.device_name
    }],
    rationale: [`Window Treatments: ${Math.ceil(treatmentCount)} automated blinds/shades`]
  }
}

/**
 * Calculate central equipment rack and hub devices
 */
function calculateCentralEquipment(tierLevel: string, totalDevices: number, deviceSpecs: DeviceSpec[]) {
  const equipmentRack = deviceSpecs.find(d => d.device_name.toLowerCase().includes('rack') || d.device_name.toLowerCase().includes('hub'))
  
  if (!equipmentRack) {
    return { devices: [], rationale: [] }
  }

  // One rack for smaller systems, larger rack for advanced systems
  const rackSize = tierLevel === 'advanced' ? 'Large' : tierLevel === 'intermediate' ? 'Medium' : 'Small'
  
  return {
    devices: [{
      deviceSpecId: equipmentRack.id,
      quantity: 1,
      priority: 'high' as const,
      placementReason: 'Central equipment and network hub',
      category: equipmentRack.device_categories.name,
      deviceName: equipmentRack.device_name
    }],
    rationale: [`Equipment Rack: 1 ${rackSize.toLowerCase()} rack for ${totalDevices} devices`]
  }
}

/**
 * Estimate total project cost based on tier and complexity
 */
function estimateProjectCost(tier: AutomationTier, deviceCount: number, sqft: number): number {
  // Base costs by tier
  const baseCosts = {
    basic: 2500,
    intermediate: 5000,
    advanced: 10000
  }

  const baseCost = baseCosts[tier.id] || 5000
  
  // Add cost per device
  const deviceCost = deviceCount * 150
  
  // Add cost per square foot for installation
  const installationCost = sqft * 1.5
  
  return Math.round(baseCost + deviceCost + installationCost)
}
