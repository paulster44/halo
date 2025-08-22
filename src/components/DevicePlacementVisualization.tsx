import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Image, 
  Download, 
  Zap, 
  Settings, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Wrench,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  optimizeDevicePlacement, 
  PlacementAnalysisResult 
} from '../lib/devicePlacement'
import { 
  generateFloorplanWithDevices,
  OverlayGenerationOptions
} from '../lib/imageGeneration'
import {
  generateRackConfiguration,
  generateInstallationGuide,
  generateRackDiagramSVG,
  RackConfiguration,
  InstallationGuide
} from '../lib/rackDiagram'

interface DevicePlacementVisualizationProps {
  devices: Array<{deviceName: string, category: string, quantity: number}>
  floorPlanAnalysis: any
  floorPlanUrl: string
  userPreferences: any
  automationTier: string
  imageDimensions?: {width: number, height: number}
}

const DevicePlacementVisualization: React.FC<DevicePlacementVisualizationProps> = ({
  devices,
  floorPlanAnalysis,
  floorPlanUrl,
  userPreferences,
  automationTier,
  imageDimensions = {width: 800, height: 600}
}) => {
  const [placementResult, setPlacementResult] = useState<PlacementAnalysisResult | null>(null)
  const [rackConfig, setRackConfig] = useState<RackConfiguration | null>(null)
  const [installationGuide, setInstallationGuide] = useState<InstallationGuide | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [rackDiagramSvg, setRackDiagramSvg] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCoverage, setShowCoverage] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [activeTab, setActiveTab] = useState('placement')

  // Generate placement analysis on component mount
  useEffect(() => {
    if (devices.length > 0) {
      const result = optimizeDevicePlacement(
        devices.map(d => ({device_name: d.deviceName, category: d.category, quantity: d.quantity})),
        floorPlanAnalysis,
        userPreferences,
        imageDimensions
      )
      setPlacementResult(result)

      // Generate rack configuration
      const rack = generateRackConfiguration(
        devices.map(d => ({device_name: d.deviceName, category: d.category, quantity: d.quantity})), 
        automationTier
      )
      setRackConfig(rack)

      // Generate installation guide
      const guide = generateInstallationGuide(
        devices.map(d => ({device_name: d.deviceName, category: d.category, quantity: d.quantity})), 
        rack, 
        automationTier
      )
      setInstallationGuide(guide)

      // Generate rack diagram SVG
      const rackSvg = generateRackDiagramSVG(rack)
      setRackDiagramSvg(rackSvg)
    }
  }, [devices, floorPlanAnalysis, userPreferences, automationTier, imageDimensions])

  // Generate floorplan with device overlays
  const handleGenerateVisualization = async () => {
    if (!placementResult || !floorPlanUrl) return

    setIsGenerating(true)
    try {
      const options: OverlayGenerationOptions = {
        showCoverage,
        showLabels,
        imageQuality: 0.9,
        outputFormat: 'png'
      }

      const { imageUrl } = await generateFloorplanWithDevices(
        floorPlanUrl,
        placementResult.placements,
        options
      )

      setGeneratedImageUrl(imageUrl)
    } catch (error) {
      console.error('Failed to generate visualization:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Download generated image
  const handleDownloadImage = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a')
      link.href = generatedImageUrl
      link.download = 'floorplan-with-devices.png'
      link.click()
    }
  }

  // Download installation guide
  const handleDownloadGuide = () => {
    if (installationGuide) {
      const guideText = generateInstallationGuideText(installationGuide)
      const blob = new Blob([guideText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'installation-guide.txt'
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  if (!placementResult) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Zap className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Device Placement Analysis</h3>
          <p className="text-gray-600">Calculating optimal positions and generating installation documentation...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Analysis Results */}
      <Card className="border-2 border-green-300 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Device Placement Analysis Complete</span>
          </CardTitle>
          <CardDescription>
            Optimized placement for {placementResult.placements.length} devices with {placementResult.coverage_analysis.total_coverage_percent}% coverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{placementResult.placements.length}</div>
              <div className="text-sm text-gray-600">Devices Placed</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{placementResult.coverage_analysis.total_coverage_percent}%</div>
              <div className="text-sm text-gray-600">Area Coverage</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{rackConfig?.devices.length || 0}</div>
              <div className="text-sm text-gray-600">Rack Components</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="placement">Device Placement</TabsTrigger>
          <TabsTrigger value="visualization">Floorplan Visualization</TabsTrigger>
          <TabsTrigger value="rack">Rack Diagram</TabsTrigger>
          <TabsTrigger value="installation">Installation Guide</TabsTrigger>
        </TabsList>

        {/* Device Placement Tab */}
        <TabsContent value="placement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimized Device Positions</CardTitle>
              <CardDescription>
                Each device has been positioned for optimal performance, coverage, and installation efficiency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {placementResult.placements.map((placement) => (
                  <div key={placement.device_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{placement.device_name}</div>
                      <div className="text-sm text-gray-600">{placement.position.placement_reasoning}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Position: ({Math.round(placement.position.x)}, {Math.round(placement.position.y)})
                        {placement.position.room_id && ` • Room: ${placement.position.room_id}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">{placement.category}</Badge>
                      {placement.coverage_area && (
                        <div className="text-xs text-gray-500">
                          Coverage: {Math.round(placement.coverage_area.radius / 12)}ft radius
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optimization Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Placement Optimization Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {placementResult.optimization_summary.map((summary, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{summary}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Floorplan Visualization Tab */}
        <TabsContent value="visualization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="w-5 h-5 text-blue-600" />
                <span>Floorplan with Device Overlay</span>
              </CardTitle>
              <CardDescription>
                Generate a visual representation of your floorplan with device icons and coverage areas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Visualization Options */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCoverage(!showCoverage)}
                      className="flex items-center space-x-2"
                    >
                      {showCoverage ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span>Coverage Areas</span>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLabels(!showLabels)}
                      className="flex items-center space-x-2"
                    >
                      {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span>Device Labels</span>
                    </Button>
                  </div>
                  <Button
                    onClick={handleGenerateVisualization}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? (
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Image className="w-4 h-4 mr-2" />
                    )}
                    Generate Visualization
                  </Button>
                </div>

                {/* Generated Image Display */}
                {generatedImageUrl && (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <img 
                        src={generatedImageUrl} 
                        alt="Floorplan with device overlay" 
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={handleDownloadImage}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Image</span>
                      </Button>
                    </div>
                  </div>
                )}

                {!generatedImageUrl && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Click "Generate Visualization" to create your floorplan with device overlay</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rack Diagram Tab */}
        <TabsContent value="rack" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>Equipment Rack Layout</span>
              </CardTitle>
              <CardDescription>
                Professional rack configuration for all network and central equipment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rackDiagramSvg && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div 
                      className="border rounded-lg bg-white p-4"
                      dangerouslySetInnerHTML={{ __html: rackDiagramSvg }}
                    />
                  </div>
                  
                  {/* Rack Specifications */}
                  {rackConfig && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Power Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Power:</span>
                            <span className="font-semibold">{rackConfig.powerRequirements.totalWatts}W</span>
                          </div>
                          <div className="flex justify-between">
                            <span>UPS Recommended:</span>
                            <span className={rackConfig.powerRequirements.upsRecommended ? 'text-red-600' : 'text-green-600'}>
                              {rackConfig.powerRequirements.upsRecommended ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 pt-2">
                            {rackConfig.powerRequirements.circuitRequirements}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Cooling Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span>Airflow Needed:</span>
                            <span className="font-semibold">{rackConfig.coolingRequirements.cfmRequired} CFM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Temperature:</span>
                            <span className="font-semibold">{rackConfig.coolingRequirements.temperatureRange}</span>
                          </div>
                          <div className="text-sm text-gray-600 pt-2">
                            {rackConfig.coolingRequirements.ventilation.map((req, index) => (
                              <div key={index}>• {req}</div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Installation Guide Tab */}
        <TabsContent value="installation" className="space-y-6">
          {installationGuide && (
            <>
              {/* Guide Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    <span>{installationGuide.projectName}</span>
                  </CardTitle>
                  <CardDescription>
                    Professional installation guide with step-by-step instructions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-lg font-semibold">{Math.round(installationGuide.totalTime / 60)}h</div>
                      <div className="text-sm text-gray-600">Estimated Time</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Settings className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-lg font-semibold">{installationGuide.steps.length}</div>
                      <div className="text-sm text-gray-600">Installation Steps</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-lg font-semibold">{installationGuide.difficultyLevel}</div>
                      <div className="text-sm text-gray-600">Difficulty Level</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handleDownloadGuide}
                      className="flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download Full Guide</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Installation Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Installation Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {installationGuide.steps.map((step, index) => (
                      <div key={step.id} className="flex space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{step.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span>⏱ {step.estimatedTime} min</span>
                            <span>🔧 {step.tools.slice(0, 2).join(', ')}{step.tools.length > 2 ? '...' : ''}</span>
                            <Badge variant="outline" className="text-xs">{step.category}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Safety Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Safety Requirements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {installationGuide.safetyRequirements.map((requirement, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Generate installation guide as downloadable text
function generateInstallationGuideText(guide: InstallationGuide): string {
  let text = `${guide.projectName}\n`
  text += `${'='.repeat(guide.projectName.length)}\n\n`
  
  text += `Estimated Installation Time: ${Math.round(guide.totalTime / 60)} hours\n`
  text += `Difficulty Level: ${guide.difficultyLevel}\n\n`
  
  text += `SAFETY REQUIREMENTS:\n`
  guide.safetyRequirements.forEach(req => {
    text += `- ${req}\n`
  })
  text += '\n'
  
  text += `REQUIRED TOOLS:\n`
  guide.requiredTools.forEach(tool => {
    text += `- ${tool}\n`
  })
  text += '\n'
  
  text += `INSTALLATION STEPS:\n`
  guide.steps.forEach((step, index) => {
    text += `\n${index + 1}. ${step.title}\n`
    text += `   Category: ${step.category}\n`
    text += `   Time: ${step.estimatedTime} minutes\n`
    text += `   Description: ${step.description}\n`
    text += `   Tools: ${step.tools.join(', ')}\n`
    text += `   Materials: ${step.materials.join(', ')}\n`
    text += `   Safety: ${step.safety.join('; ')}\n`
  })
  
  text += '\n\nTROUBLESHOOTING:\n'
  guide.troubleshooting.forEach(item => {
    text += `\nProblem: ${item.problem}\n`
    text += 'Solutions:\n'
    item.solutions.forEach(solution => {
      text += `- ${solution}\n`
    })
  })
  
  return text
}

export default DevicePlacementVisualization