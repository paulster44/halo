import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Download, 
  Zap, 
  Cable, 
  Server, 
  Wifi, 
  Monitor,
  HardDrive,
  Router,
  Info,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface RackEquipment {
  id: string
  name: string
  type: 'switch' | 'router' | 'panel' | 'ups' | 'server' | 'modem' | 'poe'
  rackUnits: number
  position: number // Starting rack unit position
  powerConsumption: number // Watts
  ports?: number
  specifications: string[]
  connections: {
    deviceId: string
    deviceName: string
    cableType: string
    portNumber?: number
  }[]
}

interface WiringDiagram {
  cableRuns: {
    id: string
    from: { device: string; port?: string }
    to: { device: string; port?: string }
    cableType: string
    length: number
    route: string[]
  }[]
  conduitRuns: {
    id: string
    path: string[]
    cableCount: number
    conduitSize: string
  }[]
}

interface EquipmentRackDiagramProps {
  rackName: string
  rackUnits: number
  equipment: RackEquipment[]
  wiringDiagram: WiringDiagram
  powerRequirements: {
    totalPower: number
    availablePower: number
    redundancy: boolean
  }
  installationNotes: string[]
}

const EquipmentRackDiagram: React.FC<EquipmentRackDiagramProps> = ({
  rackName,
  rackUnits,
  equipment,
  wiringDiagram,
  powerRequirements,
  installationNotes
}) => {
  const [activeTab, setActiveTab] = useState<'rack' | 'wiring' | 'power' | 'installation'>('rack')

  const getEquipmentIcon = (type: string) => {
    const icons = {
      switch: Wifi,
      router: Router,
      panel: Cable,
      ups: Zap,
      server: Server,
      modem: HardDrive,
      poe: Monitor
    }
    return icons[type as keyof typeof icons] || Server
  }

  const getEquipmentColor = (type: string) => {
    const colors = {
      switch: '#3B82F6',
      router: '#10B981',
      panel: '#F59E0B',
      ups: '#EF4444',
      server: '#8B5CF6',
      modem: '#06B6D4',
      poe: '#84CC16'
    }
    return colors[type as keyof typeof colors] || '#6B7280'
  }

  const getCableColor = (cableType: string) => {
    const colors = {
      'Cat6': '#3B82F6',
      'Cat6A': '#1D4ED8',
      'Fiber': '#F59E0B',
      'Coax': '#6B7280',
      'Power': '#EF4444'
    }
    return colors[cableType as keyof typeof colors] || '#6B7280'
  }

  const generateInstallationPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Title
      pdf.setFontSize(20)
      pdf.text('Equipment Rack Installation Guide', 20, 20)
      
      pdf.setFontSize(14)
      pdf.text(`Rack: ${rackName}`, 20, 35)
      pdf.text(`Rack Units: ${rackUnits}U`, 20, 45)
      
      // Equipment List
      pdf.setFontSize(16)
      pdf.text('Equipment List:', 20, 65)
      
      let yPos = 75
      equipment.forEach((item, index) => {
        pdf.setFontSize(12)
        pdf.text(`${index + 1}. ${item.name}`, 25, yPos)
        pdf.text(`   Position: ${item.position}U (${item.rackUnits}U height)`, 25, yPos + 8)
        pdf.text(`   Power: ${item.powerConsumption}W`, 25, yPos + 16)
        if (item.ports) {
          pdf.text(`   Ports: ${item.ports}`, 25, yPos + 24)
        }
        yPos += 35
      })
      
      // Power Requirements
      pdf.setFontSize(16)
      pdf.text('Power Requirements:', 20, yPos + 20)
      yPos += 30
      
      pdf.setFontSize(12)
      pdf.text(`Total Power Consumption: ${powerRequirements.totalPower}W`, 25, yPos)
      pdf.text(`Available Power: ${powerRequirements.availablePower}W`, 25, yPos + 8)
      pdf.text(`Power Redundancy: ${powerRequirements.redundancy ? 'Yes' : 'No'}`, 25, yPos + 16)
      yPos += 35
      
      // Installation Notes
      if (installationNotes.length > 0) {
        pdf.setFontSize(16)
        pdf.text('Installation Notes:', 20, yPos)
        yPos += 15
        
        installationNotes.forEach((note, index) => {
          pdf.setFontSize(12)
          pdf.text(`${index + 1}. ${note}`, 25, yPos)
          yPos += 10
        })
      }
      
      pdf.save(`${rackName}-installation-guide.pdf`)
      toast.success('Installation guide exported as PDF')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    }
  }

  const renderRackDiagram = () => {
    const rackHeight = rackUnits * 30 // 30px per rack unit
    const rackWidth = 400
    
    return (
      <div className="relative">
        <svg width={rackWidth + 100} height={rackHeight + 100} className="border border-gray-300 rounded-lg bg-gray-50">
          {/* Rack frame */}
          <rect 
            x={50} 
            y={50} 
            width={rackWidth} 
            height={rackHeight} 
            fill="#F3F4F6" 
            stroke="#374151" 
            strokeWidth={3}
          />
          
          {/* Rack unit markers */}
          {Array.from({ length: rackUnits }, (_, i) => (
            <g key={i}>
              <line 
                x1={50} 
                y1={50 + (i * 30)} 
                x2={50 + rackWidth} 
                y2={50 + (i * 30)} 
                stroke="#9CA3AF" 
                strokeWidth={1}
                strokeDasharray="2,2"
              />
              <text 
                x={40} 
                y={50 + (i * 30) + 20} 
                fontSize={10} 
                fill="#6B7280" 
                textAnchor="end"
              >
                {rackUnits - i}
              </text>
            </g>
          ))}
          
          {/* Equipment */}
          {equipment.map((item) => {
            const y = 50 + ((rackUnits - item.position - item.rackUnits + 1) * 30)
            const height = item.rackUnits * 30 - 4
            const Icon = getEquipmentIcon(item.type)
            
            return (
              <g key={item.id}>
                <rect 
                  x={55} 
                  y={y + 2} 
                  width={rackWidth - 10} 
                  height={height} 
                  fill={getEquipmentColor(item.type)}
                  stroke="#1F2937"
                  strokeWidth={1}
                  rx={2}
                />
                <text 
                  x={65} 
                  y={y + height/2 + 4} 
                  fontSize={12} 
                  fill="white" 
                  fontWeight="bold"
                >
                  {item.name}
                </text>
                <text 
                  x={rackWidth + 35} 
                  y={y + height/2 + 4} 
                  fontSize={10} 
                  fill="#6B7280"
                >
                  {item.powerConsumption}W
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  const renderWiringDiagram = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Cable Runs</h4>
        <div className="space-y-2">
          {wiringDiagram.cableRuns.map((cable) => (
            <div key={cable.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getCableColor(cable.cableType) }}
                />
                <div>
                  <div className="font-medium">{cable.from.device} → {cable.to.device}</div>
                  <div className="text-sm text-gray-600">
                    {cable.cableType} • {cable.length}ft
                    {cable.from.port && ` • Port ${cable.from.port}`}
                  </div>
                </div>
              </div>
              <Badge variant="outline">{cable.cableType}</Badge>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Conduit Runs</h4>
        <div className="space-y-2">
          {wiringDiagram.conduitRuns.map((conduit) => (
            <div key={conduit.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Conduit {conduit.id}</div>
                <Badge>{conduit.conduitSize}</Badge>
              </div>
              <div className="text-sm text-gray-600">
                Route: {conduit.path.join(' → ')}
              </div>
              <div className="text-sm text-gray-600">
                Cable Count: {conduit.cableCount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPowerAnalysis = () => {
    const powerUtilization = (powerRequirements.totalPower / powerRequirements.availablePower) * 100
    const isOverCapacity = powerUtilization > 80
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Consumption</p>
                  <p className="text-2xl font-bold text-gray-900">{powerRequirements.totalPower}W</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Power</p>
                  <p className="text-2xl font-bold text-gray-900">{powerRequirements.availablePower}W</p>
                </div>
                <Server className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utilization</p>
                  <p className={`text-2xl font-bold ${isOverCapacity ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.round(powerUtilization)}%
                  </p>
                </div>
                {isOverCapacity ? (
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                ) : (
                  <Info className="w-8 h-8 text-green-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {isOverCapacity && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Power Capacity Warning</h4>
                <p className="text-red-700 text-sm mt-1">
                  Power utilization exceeds 80%. Consider upgrading UPS capacity or reducing equipment load.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Equipment Power Breakdown</h4>
          <div className="space-y-2">
            {equipment.map((item) => {
              const percentage = (item.powerConsumption / powerRequirements.totalPower) * 100
              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: getEquipmentColor(item.type) }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{item.powerConsumption}W</span>
                    <span className="text-sm text-gray-600 ml-2">({Math.round(percentage)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderInstallationGuide = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Installation Sequence</h4>
        <div className="space-y-3">
          {[
            'Install rack in designated location with proper ventilation',
            'Mount UPS in bottom rack positions for stability',
            'Install patch panels and switches in designated positions',
            'Route power cables and connect to UPS',
            'Run network cables through designated conduits',
            'Terminate cables at patch panels',
            'Connect equipment and test all connections',
            'Configure network settings and test connectivity',
            'Document all connections and cable runs',
            'Perform final system testing and certification'
          ].map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <span className="text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </div>
      
      {installationNotes.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Special Installation Notes</h4>
          <div className="space-y-2">
            {installationNotes.map((note, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span className="text-yellow-800 text-sm">{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-blue-600" />
            <span>{rackName} - Technical Specifications</span>
          </CardTitle>
          
          <Button onClick={generateInstallationPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Installation Guide
          </Button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b">
          {[
            { id: 'rack', label: 'Rack Layout' },
            { id: 'wiring', label: 'Wiring Diagram' },
            { id: 'power', label: 'Power Analysis' },
            { id: 'installation', label: 'Installation Guide' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {activeTab === 'rack' && renderRackDiagram()}
        {activeTab === 'wiring' && renderWiringDiagram()}
        {activeTab === 'power' && renderPowerAnalysis()}
        {activeTab === 'installation' && renderInstallationGuide()}
      </CardContent>
    </Card>
  )
}

export default EquipmentRackDiagram
