import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, BarChart3, MapPin, Settings, Cpu, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import AutoDeviceDisplay from '../components/AutoDeviceDisplay'
import DevicePlacementVisualization from '../components/DevicePlacementVisualization'
import { calculateDevicesForTier, DeviceCalculationResult } from '../lib/deviceCalculator'
import { supabase } from '../lib/supabase'

const ProjectPage: React.FC = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { projectData, floorPlan } = location.state || {}
  
  const [calculationResult, setCalculationResult] = useState<DeviceCalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(true)
  const [analysisStep, setAnalysisStep] = useState('calculating')

  // Fetch device specifications for calculation - production ready (no mock fallback)
  const { data: deviceSpecs = [], error: deviceSpecsError, isLoading: deviceSpecsLoading } = useQuery({
    queryKey: ['device-specifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('device_specifications')
        .select('*, device_categories(name, icon_name)')
      
      if (error) {
        console.error('Failed to fetch device specs from database:', error)
        throw new Error('Failed to load device specifications. Please try again or contact support.')
      }
      
      if (!data || data.length === 0) {
        throw new Error('No device specifications found in database. Please contact support.')
      }
      
      return data
    },
    retry: 3,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Calculate devices automatically when component mounts
  useEffect(() => {
    if (deviceSpecsError) {
      setAnalysisStep('error')
      setIsCalculating(false)
      return
    }
    
    if (deviceSpecsLoading) {
      setAnalysisStep('loading-specs')
      setIsCalculating(true)
      return
    }
    
    if (projectData?.automation_tier && projectData?.tier_details && deviceSpecs.length > 0) {
      setIsCalculating(true)
      setAnalysisStep('calculating')
      
      // Simulate analysis delay for better UX
      setTimeout(() => {
        try {
          const result = calculateDevicesForTier(
            projectData.tier_details,
            floorPlan?.analysis_results || null,
            projectData.user_preferences || {},
            deviceSpecs
          )
          
          setCalculationResult(result)
          setAnalysisStep('complete')
        } catch (error) {
          console.error('Device calculation failed:', error)
          setAnalysisStep('error')
        }
        setIsCalculating(false)
      }, 2000)
    }
  }, [projectData, floorPlan, deviceSpecs, deviceSpecsError, deviceSpecsLoading])

  const handleBackToHome = () => {
    navigate('/dashboard')
  }

  const getAnalysisStatusIcon = () => {
    switch (analysisStep) {
      case 'loading-specs':
        return <Cpu className="w-8 h-8 text-orange-600 animate-spin" />
      case 'calculating':
        return <Cpu className="w-8 h-8 text-blue-600 animate-spin" />
      case 'complete':
        return <Zap className="w-8 h-8 text-green-600" />
      case 'error':
        return <Settings className="w-8 h-8 text-red-600" />
      default:
        return <Zap className="w-8 h-8 text-blue-600" />
    }
  }

  const getAnalysisStatusText = () => {
    switch (analysisStep) {
      case 'loading-specs':
        return 'Loading Device Specifications...'
      case 'calculating':
        return 'Calculating Optimal Device Configuration...'
      case 'complete':
        return 'Intelligent Automation Design Complete'
      case 'error':
        return deviceSpecsError ? 'Database Connection Error' : 'Analysis Error - Please Try Again'
      default:
        return 'Preparing Analysis...'
    }
  }

  const getAnalysisStatusDescription = () => {
    switch (analysisStep) {
      case 'loading-specs':
        return 'Fetching the latest device specifications from our database to ensure accurate recommendations.'
      case 'calculating':
        return `Analyzing your ${projectData?.tier_details?.name} tier selection and ${floorPlan?.title} floor plan to determine optimal device placement.`
      case 'complete':
        return 'Your intelligent home automation system has been designed with automatic device selection and placement optimization.'
      case 'error':
        return deviceSpecsError 
          ? 'Unable to load device specifications from the database. Please check your connection and try again, or contact support if the issue persists.'
          : 'There was an error calculating your device configuration. Please check your inputs and try again.'
      default:
        return 'Initializing the analysis engine...'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleBackToHome}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {projectData?.project_name || 'New Project'}
                </h1>
                <div className="flex items-center space-x-2">
                  {projectData?.automation_tier && (
                    <Badge className="bg-blue-500 text-white">
                      {projectData.tier_details?.name}
                    </Badge>
                  )}
                  <p className="text-sm text-gray-600">Intelligent device placement optimization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analysis Status */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {getAnalysisStatusIcon()}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {getAnalysisStatusText()}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {getAnalysisStatusDescription()}
          </p>
        </div>

        {/* Project Configuration Summary */}
        {projectData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-blue-600" />
                <span>Project Configuration</span>
              </CardTitle>
              <CardDescription>Review your intelligent automation design setup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-600">Project Name</span>
                  <p className="text-lg font-semibold text-gray-900">{projectData.project_name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-600">Automation Tier</span>
                  <p className="text-lg font-semibold text-blue-600">{projectData.tier_details?.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-600">Floor Plan</span>
                  <p className="text-lg font-semibold text-gray-900">{floorPlan?.title}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-600">TV Locations</span>
                  <p className="text-lg font-semibold text-gray-900">
                    {projectData.user_preferences?.tvPlacements?.length || 0} configured
                  </p>
                </div>
              </div>
              
              {projectData.description && (
                <div className="mt-4 pt-4 border-t">
                  <span className="text-sm font-medium text-gray-600">Description</span>
                  <p className="text-gray-900 mt-1">{projectData.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Automatic Device Configuration Results */}
        {calculationResult && projectData?.tier_details && (
          <AutoDeviceDisplay 
            calculationResult={calculationResult}
            tier={projectData.tier_details}
            isLoading={isCalculating}
          />
        )}

        {/* Device Placement and Visualization */}
        {calculationResult && projectData?.tier_details && floorPlan && (
          <DevicePlacementVisualization
            devices={calculationResult.devices}
            floorPlanAnalysis={floorPlan.analysis_results}
            floorPlanUrl={floorPlan.url}
            userPreferences={projectData.user_preferences}
            automationTier={projectData.automation_tier}
            imageDimensions={{width: 800, height: 600}}
          />
        )}

        {/* Loading State */}
        {isCalculating && (
          <Card>
            <CardContent className="text-center py-12">
              <Cpu className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Your Home</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Our AI is analyzing your floor plan and tier selection to determine the optimal 
                device configuration for your home automation system.
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Error State */}
        {analysisStep === 'error' && (
          <Card className="border-red-200">
            <CardContent className="text-center py-12">
              <Settings className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Error</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                We encountered an error while calculating your device configuration. 
                Please check your inputs and try again.
              </p>
              <Button onClick={handleBackToHome} variant="outline">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default ProjectPage