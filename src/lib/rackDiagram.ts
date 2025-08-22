// Rack diagram generation and installation instructions
export interface RackDevice {
  id: string
  name: string
  type: 'router' | 'switch' | 'hub' | 'modem' | 'ups' | 'patch_panel' | 'server' | 'nas'
  rackUnits: number // Height in rack units (1U = 1.75 inches)
  powerConsumption: number // Watts
  connections: Array<{
    type: 'ethernet' | 'power' | 'coax' | 'fiber'
    count: number
    speed?: string // For network connections
  }>
  cooling: 'passive' | 'active'
  depth: number // inches
}

export interface RackConfiguration {
  rackHeight: number // Total rack units (typically 42U)
  devices: Array<{
    device: RackDevice
    position: number // Starting rack unit (1-based)
    orientation: 'front' | 'back'
  }>
  powerRequirements: {
    totalWatts: number
    upsRecommended: boolean
    circuitRequirements: string
  }
  coolingRequirements: {
    cfmRequired: number
    temperatureRange: string
    ventilation: string[]
  }
}

export interface InstallationStep {
  id: string
  category: 'preparation' | 'mounting' | 'wiring' | 'configuration' | 'testing'
  title: string
  description: string
  tools: string[]
  materials: string[]
  estimatedTime: number // minutes
  safety: string[]
  images?: string[]
  dependencies?: string[] // Other step IDs that must be completed first
}

export interface InstallationGuide {
  projectName: string
  totalTime: number // minutes
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  requiredTools: string[]
  safetyRequirements: string[]
  steps: InstallationStep[]
  troubleshooting: Array<{
    problem: string
    solutions: string[]
  }>
  warrantyInfo: string[]
}

// Standard rack devices database
const RACK_DEVICE_SPECS: Record<string, RackDevice> = {
  'Main Router': {
    id: 'main_router',
    name: 'Main Router',
    type: 'router',
    rackUnits: 1,
    powerConsumption: 50,
    connections: [
      { type: 'ethernet', count: 8, speed: '1Gbps' },
      { type: 'power', count: 1 }
    ],
    cooling: 'active',
    depth: 12
  },
  'Network Switch': {
    id: 'network_switch',
    name: '24-Port Gigabit Switch',
    type: 'switch',
    rackUnits: 1,
    powerConsumption: 75,
    connections: [
      { type: 'ethernet', count: 24, speed: '1Gbps' },
      { type: 'power', count: 1 }
    ],
    cooling: 'active',
    depth: 14
  },
  'PoE Switch': {
    id: 'poe_switch',
    name: '16-Port PoE+ Switch',
    type: 'switch',
    rackUnits: 1,
    powerConsumption: 150,
    connections: [
      { type: 'ethernet', count: 16, speed: '1Gbps' },
      { type: 'power', count: 1 }
    ],
    cooling: 'active',
    depth: 14
  },
  'Patch Panel': {
    id: 'patch_panel',
    name: '24-Port Cat6 Patch Panel',
    type: 'patch_panel',
    rackUnits: 1,
    powerConsumption: 0,
    connections: [
      { type: 'ethernet', count: 24 }
    ],
    cooling: 'passive',
    depth: 4
  },
  'UPS Battery': {
    id: 'ups_battery',
    name: '1500VA UPS',
    type: 'ups',
    rackUnits: 2,
    powerConsumption: -900, // Provides power
    connections: [
      { type: 'power', count: 8 }
    ],
    cooling: 'active',
    depth: 16
  },
  'NVR Server': {
    id: 'nvr_server',
    name: 'Network Video Recorder',
    type: 'server',
    rackUnits: 2,
    powerConsumption: 200,
    connections: [
      { type: 'ethernet', count: 2, speed: '1Gbps' },
      { type: 'power', count: 1 }
    ],
    cooling: 'active',
    depth: 20
  }
}

// Generate rack configuration based on devices
export function generateRackConfiguration(
  devices: Array<{device_name: string, category: string, quantity: number}>,
  automationTier: string
): RackConfiguration {
  const rackDevices: Array<{device: RackDevice, position: number, orientation: 'front' | 'back'}> = []
  let currentPosition = 1
  
  // Determine required rack equipment based on devices
  const networkDeviceCount = devices.reduce((count, device) => {
    if (device.device_name.includes('WiFi') || 
        device.device_name.includes('Security') ||
        device.device_name.includes('Smart')) {
      return count + device.quantity
    }
    return count
  }, 0)
  
  // Add UPS at bottom (most stable position)
  rackDevices.push({
    device: RACK_DEVICE_SPECS['UPS Battery'],
    position: currentPosition,
    orientation: 'front'
  })
  currentPosition += RACK_DEVICE_SPECS['UPS Battery'].rackUnits
  
  // Add main router
  rackDevices.push({
    device: RACK_DEVICE_SPECS['Main Router'],
    position: currentPosition,
    orientation: 'front'
  })
  currentPosition += RACK_DEVICE_SPECS['Main Router'].rackUnits
  
  // Add switches based on device count
  if (networkDeviceCount > 8) {
    // Add PoE switch for powered devices
    rackDevices.push({
      device: RACK_DEVICE_SPECS['PoE Switch'],
      position: currentPosition,
      orientation: 'front'
    })
    currentPosition += RACK_DEVICE_SPECS['PoE Switch'].rackUnits
    
    // Add additional switch if needed
    if (networkDeviceCount > 16) {
      rackDevices.push({
        device: RACK_DEVICE_SPECS['Network Switch'],
        position: currentPosition,
        orientation: 'front'
      })
      currentPosition += RACK_DEVICE_SPECS['Network Switch'].rackUnits
    }
  }
  
  // Add patch panel for organization
  rackDevices.push({
    device: RACK_DEVICE_SPECS['Patch Panel'],
    position: currentPosition,
    orientation: 'front'
  })
  currentPosition += RACK_DEVICE_SPECS['Patch Panel'].rackUnits
  
  // Add NVR if security cameras are present
  const hasCameras = devices.some(device => 
    device.device_name.includes('Camera') || device.device_name.includes('Security')
  )
  
  if (hasCameras || automationTier === 'advanced') {
    rackDevices.push({
      device: RACK_DEVICE_SPECS['NVR Server'],
      position: currentPosition,
      orientation: 'front'
    })
    currentPosition += RACK_DEVICE_SPECS['NVR Server'].rackUnits
  }
  
  // Calculate power requirements
  const totalWatts = rackDevices.reduce((total, rackDevice) => {
    return total + Math.max(0, rackDevice.device.powerConsumption)
  }, 0)
  
  // Calculate cooling requirements
  const cfmRequired = Math.ceil(totalWatts / 3.41) // BTU/hr to CFM approximation
  
  return {
    rackHeight: 42, // Standard rack height
    devices: rackDevices,
    powerRequirements: {
      totalWatts,
      upsRecommended: totalWatts > 500,
      circuitRequirements: totalWatts > 1800 ? '20A dedicated circuit' : '15A circuit sufficient'
    },
    coolingRequirements: {
      cfmRequired,
      temperatureRange: '65-75°F (18-24°C)',
      ventilation: [
        'Ensure adequate airflow front-to-back',
        'Maintain 6-inch clearance at front and rear',
        cfmRequired > 100 ? 'Consider rack-mounted cooling fans' : 'Natural convection sufficient'
      ]
    }
  }
}

// Generate installation guide
export function generateInstallationGuide(
  devices: Array<{device_name: string, category: string, quantity: number}>,
  rackConfig: RackConfiguration,
  automationTier: string
): InstallationGuide {
  const steps: InstallationStep[] = []
  let stepId = 1
  
  // Preparation steps
  steps.push({
    id: `step_${stepId++}`,
    category: 'preparation',
    title: 'Site Survey and Preparation',
    description: 'Assess installation location, verify power availability, and prepare workspace.',
    tools: ['Measuring tape', 'Stud finder', 'Level', 'Voltage tester'],
    materials: [],
    estimatedTime: 30,
    safety: [
      'Turn off power at breaker before any electrical work',
      'Verify circuits with voltage tester',
      'Ensure adequate lighting in work area'
    ]
  })
  
  steps.push({
    id: `step_${stepId++}`,
    category: 'preparation',
    title: 'Rack Installation',
    description: 'Mount equipment rack and verify stability.',
    tools: ['Drill', 'Level', 'Socket wrench set', 'Anchors'],
    materials: ['Equipment rack', 'Mounting hardware', 'Cable management'],
    estimatedTime: 60,
    safety: [
      'Use proper lifting techniques - get assistance for heavy racks',
      'Ensure rack is level and securely mounted',
      'Verify weight capacity before loading equipment'
    ]
  })
  
  // Device mounting steps
  for (const rackDevice of rackConfig.devices) {
    steps.push({
      id: `step_${stepId++}`,
      category: 'mounting',
      title: `Install ${rackDevice.device.name}`,
      description: `Mount ${rackDevice.device.name} in rack position ${rackDevice.position}U.`,
      tools: ['Rack screws', 'Screwdriver', 'Cable ties'],
      materials: [rackDevice.device.name, 'Rack mounting ears', 'Power cable'],
      estimatedTime: 15,
      safety: [
        'Ensure device is powered off during installation',
        'Support device weight while securing',
        'Check that cooling vents are not obstructed'
      ]
    })
  }
  
  // Wiring steps
  steps.push({
    id: `step_${stepId++}`,
    category: 'wiring',
    title: 'Power Distribution',
    description: 'Connect all devices to UPS and verify power distribution.',
    tools: ['Wire strippers', 'Label maker', 'Voltage tester'],
    materials: ['Power cables', 'Power strips', 'Cable labels'],
    estimatedTime: 45,
    safety: [
      'Turn off UPS before connecting devices',
      'Verify voltage compatibility',
      'Do not exceed UPS capacity',
      'Label all power connections'
    ]
  })
  
  steps.push({
    id: `step_${stepId++}`,
    category: 'wiring',
    title: 'Network Cabling',
    description: 'Connect all network devices and run cables to device locations.',
    tools: ['Cable tester', 'Crimping tool', 'Fish tape'],
    materials: ['Ethernet cables', 'RJ45 connectors', 'Cable conduit'],
    estimatedTime: 120,
    safety: [
      'Test all cables before permanent installation',
      'Maintain proper bend radius for cables',
      'Secure cables to prevent damage',
      'Label all network connections'
    ]
  })
  
  // Device-specific installation steps
  const deviceSteps = generateDeviceInstallationSteps(devices)
  steps.push(...deviceSteps.map(step => ({...step, id: `step_${stepId++}`})))
  
  // Configuration steps
  steps.push({
    id: `step_${stepId++}`,
    category: 'configuration',
    title: 'Network Configuration',
    description: 'Configure router, switches, and network settings.',
    tools: ['Laptop', 'Ethernet cable'],
    materials: ['Configuration documentation'],
    estimatedTime: 60,
    safety: [
      'Document all configuration changes',
      'Create backup of settings',
      'Test connectivity at each step'
    ]
  })
  
  steps.push({
    id: `step_${stepId++}`,
    category: 'configuration',
    title: 'Device Pairing and Setup',
    description: 'Add all smart devices to the home automation system.',
    tools: ['Smartphone', 'Tablet'],
    materials: ['Device manuals', 'Account credentials'],
    estimatedTime: 90,
    safety: [
      'Use strong, unique passwords',
      'Enable two-factor authentication',
      'Keep firmware updated'
    ]
  })
  
  // Testing steps
  steps.push({
    id: `step_${stepId++}`,
    category: 'testing',
    title: 'System Testing',
    description: 'Verify all devices are functioning and communicating properly.',
    tools: ['Network scanner', 'Testing checklist'],
    materials: [],
    estimatedTime: 45,
    safety: [
      'Test all safety devices (smoke detectors, security)',
      'Verify backup power systems',
      'Document any issues found'
    ]
  })
  
  steps.push({
    id: `step_${stepId++}`,
    category: 'testing',
    title: 'User Training and Documentation',
    description: 'Train users and provide system documentation.',
    tools: ['User manuals', 'Quick reference guides'],
    materials: ['System passwords', 'Emergency contacts'],
    estimatedTime: 30,
    safety: [
      'Provide emergency procedures',
      'Review system capabilities and limitations',
      'Schedule follow-up support'
    ]
  })
  
  const totalTime = steps.reduce((total, step) => total + step.estimatedTime, 0)
  const requiredTools = [...new Set(steps.flatMap(step => step.tools))]
  
  return {
    projectName: `${automationTier.charAt(0).toUpperCase() + automationTier.slice(1)} Home Automation Installation`,
    totalTime,
    difficultyLevel: getDifficultyLevel(devices.length, automationTier),
    requiredTools,
    safetyRequirements: [
      'Licensed electrician required for new circuit installation',
      'Follow local electrical codes and obtain permits',
      'Use proper PPE when working with electrical systems',
      'Test all safety devices before declaring system operational'
    ],
    steps,
    troubleshooting: generateTroubleshootingGuide(devices),
    warrantyInfo: [
      'Keep all device receipts and warranty information',
      'Register devices with manufacturers for warranty coverage',
      'Document installation dates for warranty tracking',
      'Schedule periodic maintenance to maintain warranty coverage'
    ]
  }
}

// Generate device-specific installation steps
function generateDeviceInstallationSteps(
  devices: Array<{device_name: string, category: string, quantity: number}>
): Omit<InstallationStep, 'id'>[] {
  const steps: Omit<InstallationStep, 'id'>[] = []
  
  for (const device of devices) {
    switch (device.device_name) {
      case 'Security Camera':
        steps.push({
          category: 'mounting',
          title: `Install Security Cameras (${device.quantity} units)`,
          description: 'Mount cameras at optimal viewing angles and heights.',
          tools: ['Drill', 'Level', 'Fish tape', 'Voltage tester'],
          materials: ['Camera mounts', 'Screws', 'Ethernet cables', 'Weatherproofing'],
          estimatedTime: 45 * device.quantity,
          safety: [
            'Use ladder safety procedures',
            'Ensure stable mounting surface',
            'Protect cables from weather exposure',
            'Test viewing angles before final mounting'
          ]
        })
        break
        
      case 'Smart Doorbell':
        steps.push({
          category: 'mounting',
          title: 'Install Smart Doorbell',
          description: 'Replace existing doorbell with smart doorbell system.',
          tools: ['Screwdriver', 'Wire strippers', 'Voltage tester'],
          materials: ['Doorbell transformer', 'Mounting screws', 'Wire nuts'],
          estimatedTime: 30,
          safety: [
            'Turn off power to doorbell circuit',
            'Verify voltage compatibility (typically 16-24VAC)',
            'Ensure transformer capacity is adequate',
            'Test installation before closing up walls'
          ]
        })
        break
        
      case 'Smart Thermostat':
        steps.push({
          category: 'mounting',
          title: 'Install Smart Thermostat',
          description: 'Replace existing thermostat with smart control unit.',
          tools: ['Screwdriver', 'Wire labels', 'Level'],
          materials: ['Wall plate', 'Wire nuts', 'C-wire adapter if needed'],
          estimatedTime: 45,
          safety: [
            'Turn off HVAC system power',
            'Label all wires before disconnection',
            'Verify HVAC compatibility',
            'Test system operation after installation'
          ]
        })
        break
        
      case 'Smoke Detector':
        steps.push({
          category: 'mounting',
          title: `Install Smoke Detectors (${device.quantity} units)`,
          description: 'Mount smart smoke detectors in optimal locations.',
          tools: ['Drill', 'Stud finder', 'Level'],
          materials: ['Mounting brackets', 'Screws', 'Batteries'],
          estimatedTime: 20 * device.quantity,
          safety: [
            'Follow local fire code requirements',
            'Test detection sensitivity',
            'Ensure proper spacing from walls and corners',
            'Verify interconnection with existing fire safety systems'
          ]
        })
        break
    }
  }
  
  return steps
}

// Determine installation difficulty
function getDifficultyLevel(
  deviceCount: number,
  automationTier: string
): 'beginner' | 'intermediate' | 'advanced' {
  if (automationTier === 'advanced' || deviceCount > 20) {
    return 'advanced'
  } else if (automationTier === 'intermediate' || deviceCount > 10) {
    return 'intermediate'
  }
  return 'beginner'
}

// Generate troubleshooting guide
function generateTroubleshootingGuide(
  devices: Array<{device_name: string, category: string, quantity: number}>
) {
  const troubleshooting = [
    {
      problem: 'Device not connecting to network',
      solutions: [
        'Verify network credentials are correct',
        'Check device is within WiFi range',
        'Restart router and device',
        'Update device firmware',
        'Check for interference from other devices'
      ]
    },
    {
      problem: 'Intermittent connectivity issues',
      solutions: [
        'Check network bandwidth and usage',
        'Verify adequate WiFi coverage in device location',
        'Consider adding WiFi extender or mesh node',
        'Check for physical obstructions',
        'Update router firmware'
      ]
    },
    {
      problem: 'Device responds slowly or not at all',
      solutions: [
        'Check device power supply',
        'Verify network connection stability',
        'Restart the device',
        'Check mobile app for updates',
        'Reset device to factory defaults if necessary'
      ]
    }
  ]
  
  // Add device-specific troubleshooting
  if (devices.some(d => d.device_name.includes('Camera'))) {
    troubleshooting.push({
      problem: 'Security camera video quality issues',
      solutions: [
        'Check network bandwidth availability',
        'Adjust camera resolution settings',
        'Clean camera lens',
        'Verify adequate lighting conditions',
        'Check for network congestion'
      ]
    })
  }
  
  return troubleshooting
}

// Generate rack diagram as SVG
export function generateRackDiagramSVG(rackConfig: RackConfiguration): string {
  const rackWidth = 300
  const rackHeight = rackConfig.rackHeight * 15 // 15px per rack unit
  const margin = 50
  
  let svg = `<svg width="${rackWidth + margin * 2}" height="${rackHeight + margin * 2}" xmlns="http://www.w3.org/2000/svg">`
  
  // Draw rack frame
  svg += `<rect x="${margin}" y="${margin}" width="${rackWidth}" height="${rackHeight}" 
           fill="#f3f4f6" stroke="#374151" stroke-width="2"/>`
  
  // Draw rack units
  for (let i = 0; i < rackConfig.rackHeight; i++) {
    const y = margin + i * 15
    svg += `<line x1="${margin}" y1="${y}" x2="${margin + rackWidth}" y2="${y}" 
             stroke="#d1d5db" stroke-width="1"/>`
    
    // Add unit numbers
    svg += `<text x="${margin - 10}" y="${y + 12}" font-family="Arial" font-size="10" 
             text-anchor="end" fill="#6b7280">${rackConfig.rackHeight - i}</text>`
  }
  
  // Draw devices
  for (const rackDevice of rackConfig.devices) {
    const deviceY = margin + (rackConfig.rackHeight - rackDevice.position - rackDevice.device.rackUnits + 1) * 15
    const deviceHeight = rackDevice.device.rackUnits * 15
    
    // Device color based on type
    const deviceColors = {
      router: '#3b82f6',
      switch: '#10b981',
      ups: '#f59e0b',
      patch_panel: '#8b5cf6',
      server: '#ef4444',
      nas: '#06b6d4',
      hub: '#84cc16',
      modem: '#f97316'
    }
    
    const color = deviceColors[rackDevice.device.type] || '#6b7280'
    
    // Draw device
    svg += `<rect x="${margin + 10}" y="${deviceY}" width="${rackWidth - 20}" height="${deviceHeight - 2}" 
             fill="${color}" stroke="#374151" stroke-width="1" rx="3"/>`
    
    // Device label
    svg += `<text x="${margin + rackWidth / 2}" y="${deviceY + deviceHeight / 2}" 
             font-family="Arial" font-size="12" font-weight="bold" 
             text-anchor="middle" fill="white">${rackDevice.device.name}</text>`
    
    // Power indicator
    if (rackDevice.device.powerConsumption > 0) {
      svg += `<circle cx="${margin + rackWidth - 30}" cy="${deviceY + 10}" r="4" 
               fill="#22c55e" stroke="white" stroke-width="1"/>`
    }
  }
  
  // Add title
  svg += `<text x="${margin + rackWidth / 2}" y="${margin - 20}" 
           font-family="Arial" font-size="16" font-weight="bold" 
           text-anchor="middle" fill="#111827">Equipment Rack Layout</text>`
  
  // Add power info
  svg += `<text x="${margin}" y="${margin + rackHeight + 30}" 
           font-family="Arial" font-size="12" fill="#374151">
           Total Power: ${rackConfig.powerRequirements.totalWatts}W | 
           ${rackConfig.powerRequirements.circuitRequirements}</text>`
  
  svg += '</svg>'
  
  return svg
}