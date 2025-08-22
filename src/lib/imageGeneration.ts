// Image generation and device overlay system
export interface DeviceIcon {
  name: string
  color: string
  size: number
  svg: string
}

export interface OverlayGenerationOptions {
  showCoverage: boolean
  showLabels: boolean
  imageQuality: number
  outputFormat: 'png' | 'jpeg'
}

// Device icon library
const DEVICE_ICONS: Record<string, DeviceIcon> = {
  camera: {
    name: 'Security Camera',
    color: '#EF4444',
    size: 1.2,
    svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 2v-7l-4 2z"/>
    </svg>`
  },
  motion: {
    name: 'Motion Detector',
    color: '#F59E0B',
    size: 1.0,
    svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`
  },
  doorbell: {
    name: 'Smart Doorbell',
    color: '#8B5CF6',
    size: 1.1,
    svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>`
  },
  lock: {
    name: 'Smart Lock',
    color: '#059669',
    size: 1.0,
    svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>`
  },
  smoke: {
    name: 'Smoke Detector',
    color: '#DC2626',
    size: 1.0,
    svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>`
  },
  thermostat: {
    name: 'Smart Thermostat',
    color: '#3B82F6',
    size: 1.2,
    svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-2V5c0-.55.45-1 1-1s1 .45 1 1v6h-2z"/>
    </svg>`
  },
  wifi: {
    name: 'WiFi Access Point',
    color: '#10B981',
    size: 1.1,
    svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
    </svg>`
  },
  tv: {
    name: 'Smart TV',
    color: '#1F2937',
    size: 1.5,
    svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 3H3c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h5l-1 1v2h8v-2l-1-1h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H3V5h18v11z"/>
    </svg>`
  }
}

// Generate floorplan with device overlays
export async function generateFloorplanWithDevices(
  originalImageUrl: string,
  devicePlacements: Array<{
    device_name: string
    position: {x: number, y: number, rotation?: number}
    coverage_area?: {radius: number, shape: string, angle?: number}
  }>,
  options: OverlayGenerationOptions = {
    showCoverage: true,
    showLabels: true,
    imageQuality: 0.9,
    outputFormat: 'png'
  }
): Promise<{imageUrl: string, downloadUrl: string}> {
  
  // Load the original image
  const originalImage = await loadImage(originalImageUrl)
  
  // Create canvas for compositing
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  // Set canvas size to match original image
  canvas.width = originalImage.width
  canvas.height = originalImage.height
  
  // Draw original floorplan
  ctx.drawImage(originalImage, 0, 0)
  
  // Draw coverage areas first (behind devices)
  if (options.showCoverage) {
    drawCoverageAreas(ctx, devicePlacements)
  }
  
  // Draw device icons
  await drawDeviceIcons(ctx, devicePlacements, options.showLabels)
  
  // Convert canvas to blob
  const blob = await canvasToBlob(canvas, options.outputFormat, options.imageQuality)
  
  // Create object URLs
  const imageUrl = URL.createObjectURL(blob)
  const downloadUrl = await createDownloadUrl(blob, 'floorplan-with-devices')
  
  return { imageUrl, downloadUrl }
}

// Load image from URL
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}

// Draw coverage areas
function drawCoverageAreas(
  ctx: CanvasRenderingContext2D,
  devicePlacements: Array<{
    device_name: string
    position: {x: number, y: number, rotation?: number}
    coverage_area?: {radius: number, shape: string, angle?: number}
  }>
) {
  ctx.save()
  
  for (const device of devicePlacements) {
    if (!device.coverage_area || device.coverage_area.radius <= 0) continue
    
    const {x, y} = device.position
    const {radius, shape, angle} = device.coverage_area
    
    // Get device color with transparency
    const deviceIcon = getDeviceIcon(device.device_name)
    const color = hexToRgba(deviceIcon.color, 0.1)
    
    ctx.fillStyle = color
    ctx.strokeStyle = hexToRgba(deviceIcon.color, 0.3)
    ctx.lineWidth = 2
    
    if (shape === 'circle') {
      // Draw circular coverage
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    } else if (shape === 'cone' && angle) {
      // Draw directional cone coverage
      const rotation = (device.position.rotation || 0) * Math.PI / 180
      const startAngle = rotation - (angle * Math.PI / 360)
      const endAngle = rotation + (angle * Math.PI / 360)
      
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.arc(x, y, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }
  
  ctx.restore()
}

// Draw device icons
async function drawDeviceIcons(
  ctx: CanvasRenderingContext2D,
  devicePlacements: Array<{
    device_name: string
    position: {x: number, y: number, rotation?: number}
  }>,
  showLabels: boolean
) {
  ctx.save()
  
  for (const device of devicePlacements) {
    const {x, y, rotation = 0} = device.position
    const deviceIcon = getDeviceIcon(device.device_name)
    const iconSize = 24 * deviceIcon.size
    
    // Save context for rotation
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation * Math.PI / 180)
    
    // Draw icon background circle
    ctx.fillStyle = 'white'
    ctx.strokeStyle = deviceIcon.color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, iconSize / 2 + 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    // Draw device icon
    await drawSVGIcon(ctx, deviceIcon, iconSize)
    
    ctx.restore()
    
    // Draw label if enabled
    if (showLabels) {
      drawDeviceLabel(ctx, device.device_name, x, y + iconSize / 2 + 8)
    }
  }
  
  ctx.restore()
}

// Draw SVG icon on canvas
async function drawSVGIcon(
  ctx: CanvasRenderingContext2D,
  deviceIcon: DeviceIcon,
  size: number
) {
  // Create SVG with proper color
  const svgString = deviceIcon.svg.replace('currentColor', deviceIcon.color)
  const svgData = `data:image/svg+xml;base64,${btoa(svgString)}`
  
  try {
    const img = await loadImage(svgData)
    ctx.drawImage(img, -size/2, -size/2, size, size)
  } catch (error) {
    // Fallback: draw simple circle if SVG fails
    ctx.fillStyle = deviceIcon.color
    ctx.beginPath()
    ctx.arc(0, 0, size/3, 0, 2 * Math.PI)
    ctx.fill()
  }
}

// Draw device label
function drawDeviceLabel(
  ctx: CanvasRenderingContext2D,
  deviceName: string,
  x: number,
  y: number
) {
  ctx.save()
  
  // Set text style
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'center'
  ctx.fillStyle = 'white'
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 3
  
  // Draw text outline
  ctx.strokeText(deviceName, x, y)
  // Draw text fill
  ctx.fillText(deviceName, x, y)
  
  ctx.restore()
}

// Get device icon or fallback
function getDeviceIcon(deviceName: string): DeviceIcon {
  // Try to find icon by device name
  for (const [key, icon] of Object.entries(DEVICE_ICONS)) {
    if (deviceName.toLowerCase().includes(key) || icon.name === deviceName) {
      return icon
    }
  }
  
  // Fallback icon
  return {
    name: deviceName,
    color: '#6B7280',
    size: 1.0,
    svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>`
  }
}

// Convert hex color to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Convert canvas to blob
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg',
  quality: number
): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      format === 'png' ? 'image/png' : 'image/jpeg',
      quality
    )
  })
}

// Create download URL
async function createDownloadUrl(blob: Blob, filename: string): Promise<string> {
  // In a real implementation, this would upload to cloud storage
  // For now, return the blob URL
  return URL.createObjectURL(blob)
}

// Generate image metadata
export function generateImageMetadata(
  devicePlacements: Array<{device_name: string, position: any}>
) {
  return {
    generatedAt: new Date().toISOString(),
    deviceCount: devicePlacements.length,
    devices: devicePlacements.map(d => ({
      name: d.device_name,
      position: d.position
    })),
    version: '1.0'
  }
}