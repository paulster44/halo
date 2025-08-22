import React, { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Image, Circle, Rect, Text, Group, Line } from 'react-konva'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info,
  Wifi,
  Camera,
  Shield,
  Lightbulb,
  Server
} from 'lucide-react'
import Konva from 'konva'
import toast from 'react-hot-toast'

interface DevicePlacement {
  id: string
  deviceName: string
  category: string
  quantity: number
  position: { x: number; y: number }
  coverage?: {
    type: 'circle' | 'rectangle'
    radius?: number
    width?: number
    height?: number
  }
  iconType: string
}

interface FloorPlanVisualizationProps {
  floorPlanImageUrl: string
  devicePlacements: DevicePlacement[]
  equipmentRack?: {
    position: { x: number; y: number }
    connections: string[] // Device IDs connected to this rack
  }
  onDeviceClick?: (device: DevicePlacement) => void
  readonly?: boolean
}

const FloorPlanVisualization: React.FC<FloorPlanVisualizationProps> = ({
  floorPlanImageUrl,
  devicePlacements,
  equipmentRack,
  onDeviceClick,
  readonly = false
}) => {
  const stageRef = useRef<Konva.Stage>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const [selectedDevice, setSelectedDevice] = useState<DevicePlacement | null>(null)
  const [showCoverage, setShowCoverage] = useState(true)
  const [showWiring, setShowWiring] = useState(true)

  // Load floor plan image
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImage(img)
      // Auto-fit the image to stage
      const imageAspectRatio = img.width / img.height
      const stageAspectRatio = stageSize.width / stageSize.height
      
      if (imageAspectRatio > stageAspectRatio) {
        setScale(stageSize.width / img.width)
      } else {
        setScale(stageSize.height / img.height)
      }
    }
    img.src = floorPlanImageUrl
  }, [floorPlanImageUrl, stageSize])

  // Device icon components
  const getDeviceIcon = (iconType: string, x: number, y: number, selected: boolean) => {
    const colors = {
      wifi: '#3B82F6',
      camera: '#EF4444', 
      security: '#F59E0B',
      lighting: '#10B981',
      entertainment: '#8B5CF6',
      environmental: '#06B6D4',
      equipment: '#6B7280'
    }
    
    const color = colors[iconType as keyof typeof colors] || '#6B7280'
    const size = selected ? 16 : 12
    
    return (
      <Group x={x} y={y}>
        <Circle
          radius={size}
          fill={color}
          stroke={selected ? '#1F2937' : '#FFFFFF'}
          strokeWidth={2}
          shadowColor="black"
          shadowBlur={4}
          shadowOffset={{ x: 2, y: 2 }}
          shadowOpacity={0.3}
        />
        <Text
          text={getIconSymbol(iconType)}
          fontSize={size * 0.8}
          fill="white"
          align="center"
          verticalAlign="middle"
          offsetX={size * 0.25}
          offsetY={size * 0.25}
        />
      </Group>
    )
  }

  const getIconSymbol = (iconType: string) => {
    const symbols = {
      wifi: 'W',
      camera: 'C',
      security: 'S',
      lighting: 'L',
      entertainment: 'E',
      environmental: 'T',
      equipment: 'R'
    }
    return symbols[iconType as keyof typeof symbols] || '?'
  }

  // Coverage area rendering
  const renderCoverageArea = (device: DevicePlacement) => {
    if (!showCoverage || !device.coverage) return null
    
    const { position, coverage } = device
    const opacity = 0.2
    const strokeOpacity = 0.5
    
    if (coverage.type === 'circle' && coverage.radius) {
      return (
        <Circle
          x={position.x}
          y={position.y}
          radius={coverage.radius * scale}
          fill="#3B82F6"
          opacity={opacity}
          stroke="#3B82F6"
          strokeWidth={2}
          strokeOpacity={strokeOpacity}
          dash={[5, 5]}
        />
      )
    }
    
    if (coverage.type === 'rectangle' && coverage.width && coverage.height) {
      return (
        <Rect
          x={position.x - (coverage.width * scale) / 2}
          y={position.y - (coverage.height * scale) / 2}
          width={coverage.width * scale}
          height={coverage.height * scale}
          fill="#3B82F6"
          opacity={opacity}
          stroke="#3B82F6"
          strokeWidth={2}
          strokeOpacity={strokeOpacity}
          dash={[5, 5]}
        />
      )
    }
    
    return null
  }

  // Wiring connections
  const renderWiringConnections = () => {
    if (!showWiring || !equipmentRack) return null
    
    return devicePlacements.map((device) => {
      if (!equipmentRack.connections.includes(device.id)) return null
      
      return (
        <Line
          key={`wire-${device.id}`}
          points={[
            device.position.x,
            device.position.y,
            equipmentRack.position.x,
            equipmentRack.position.y
          ]}
          stroke="#6B7280"
          strokeWidth={1}
          dash={[3, 3]}
          opacity={0.6}
        />
      )
    })
  }

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.2))
  }

  const handleResetView = () => {
    if (image) {
      const imageAspectRatio = image.width / image.height
      const stageAspectRatio = stageSize.width / stageSize.height
      
      if (imageAspectRatio > stageAspectRatio) {
        setScale(stageSize.width / image.width)
      } else {
        setScale(stageSize.height / image.height)
      }
    }
  }

  // Export functionality
  const handleExportPNG = () => {
    const stage = stageRef.current
    if (!stage) return
    
    const dataURL = stage.toDataURL({ mimeType: 'image/png', quality: 1 })
    const link = document.createElement('a')
    link.download = 'floor-plan-visualization.png'
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Floor plan exported as PNG')
  }

  const handleExportPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default
      const stage = stageRef.current
      if (!stage) return
      
      const dataURL = stage.toDataURL({ mimeType: 'image/jpeg', quality: 0.9 })
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      // Add title
      pdf.setFontSize(20)
      pdf.text('Home Automation Floor Plan', 20, 20)
      
      // Add image
      pdf.addImage(dataURL, 'JPEG', 20, 30, 250, 180)
      
      // Add device legend
      pdf.setFontSize(12)
      pdf.text('Device Legend:', 20, 220)
      
      let yPos = 230
      const deviceTypes = [...new Set(devicePlacements.map(d => d.category))]
      deviceTypes.forEach((type, index) => {
        const count = devicePlacements.filter(d => d.category === type).length
        pdf.text(`${type}: ${count} devices`, 20, yPos + (index * 8))
      })
      
      pdf.save('floor-plan-analysis.pdf')
      toast.success('Floor plan exported as PDF')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Failed to export PDF')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span>Interactive Floor Plan</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {/* View Controls */}
            <div className="flex items-center space-x-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCoverage(!showCoverage)}
                className={showCoverage ? 'bg-blue-100 text-blue-700' : ''}
              >
                Coverage
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWiring(!showWiring)}
                className={showWiring ? 'bg-green-100 text-green-700' : ''}
              >
                Wiring
              </Button>
            </div>
            
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 border rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2">{Math.round(scale * 100)}%</span>
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleResetView}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Export Controls */}
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={handleExportPNG}>
                <Download className="w-4 h-4 mr-1" />
                PNG
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            className="border border-gray-200 rounded-lg bg-white"
          >
            <Layer>
              {/* Floor plan image */}
              {image && (
                <Image
                  image={image}
                  scaleX={scale}
                  scaleY={scale}
                />
              )}
              
              {/* Coverage areas (rendered first, so they appear behind devices) */}
              {devicePlacements.map((device) => renderCoverageArea(device))}
              
              {/* Wiring connections */}
              {renderWiringConnections()}
              
              {/* Equipment rack */}
              {equipmentRack && (
                <Group>
                  <Rect
                    x={equipmentRack.position.x - 20}
                    y={equipmentRack.position.y - 30}
                    width={40}
                    height={60}
                    fill="#374151"
                    stroke="#1F2937"
                    strokeWidth={2}
                    cornerRadius={4}
                  />
                  <Text
                    x={equipmentRack.position.x}
                    y={equipmentRack.position.y + 40}
                    text="Equipment Rack"
                    fontSize={10}
                    fill="#374151"
                    align="center"
                    offsetX={25}
                  />
                </Group>
              )}
              
              {/* Device icons */}
              {devicePlacements.map((device) => (
                <Group
                  key={device.id}
                  onClick={() => {
                    setSelectedDevice(device)
                    onDeviceClick?.(device)
                  }}
                  onMouseEnter={(e) => {
                    e.target.getStage().container().style.cursor = 'pointer'
                  }}
                  onMouseLeave={(e) => {
                    e.target.getStage().container().style.cursor = 'default'
                  }}
                >
                  {getDeviceIcon(
                    device.iconType,
                    device.position.x,
                    device.position.y,
                    selectedDevice?.id === device.id
                  )}
                </Group>
              ))}
            </Layer>
          </Stage>
          
          {/* Device info panel */}
          {selectedDevice && (
            <div className="absolute top-4 right-4 w-64">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{selectedDevice.deviceName}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <Badge className="text-xs">{selectedDevice.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span>{selectedDevice.quantity}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDevice(null)}
                    className="w-full mt-3"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Device Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { type: 'wifi', label: 'WiFi', icon: Wifi, color: '#3B82F6' },
              { type: 'camera', label: 'Camera', icon: Camera, color: '#EF4444' },
              { type: 'security', label: 'Security', icon: Shield, color: '#F59E0B' },
              { type: 'lighting', label: 'Lighting', icon: Lightbulb, color: '#10B981' },
              { type: 'entertainment', label: 'Entertainment', icon: Server, color: '#8B5CF6' },
              { type: 'environmental', label: 'Climate', icon: Server, color: '#06B6D4' },
              { type: 'equipment', label: 'Equipment', icon: Server, color: '#6B7280' }
            ].map((item) => {
              const Icon = item.icon
              const count = devicePlacements.filter(d => d.iconType === item.type).length
              return (
                <div key={item.type} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{item.label} ({count})</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FloorPlanVisualization
