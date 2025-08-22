import React, { useState } from 'react'
import { Upload, Zap, BarChart3, FileText, Cpu, Layers, Settings, CheckCircle, Star, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import FloorPlanUpload from '../components/FloorPlanUpload'
import TierSelector, { AutomationTier } from '../components/TierSelector'
import UserPreferences, { UserPreference } from '../components/UserPreferences'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import toast from 'react-hot-toast'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [floorPlan, setFloorPlan] = useState<any>(null)
  const [selectedTier, setSelectedTier] = useState<AutomationTier | null>(null)
  const [userPreferences, setUserPreferences] = useState<UserPreference>({
    tvPlacements: [],
    audioPreferences: {
      type: 'stereo',
      primaryRooms: [],
      qualityLevel: 'standard',
      outdoorAudio: false
    },
    roomPriorities: [],
    additionalRequests: ''
  })
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')

  const steps = [
    { id: 1, title: 'Upload Floor Plan', icon: Upload, description: 'Upload your architectural blueprint or floor plan' },
    { id: 2, title: 'Choose Automation Tier', icon: Star, description: 'Select your automation level and budget' },
    { id: 3, title: 'Set Preferences', icon: User, description: 'Configure TV, audio, and room preferences' },
    { id: 4, title: 'Configure Project', icon: Settings, description: 'Set project details and finalize setup' },
    { id: 5, title: 'Start Analysis', icon: Zap, description: 'Begin intelligent device placement optimization' }
  ]

  const features = [
    {
      icon: Cpu,
      title: 'AI-Powered Analysis',
      description: 'Advanced computer vision processes your floor plans to detect rooms, walls, doors, and windows with 90%+ accuracy using DeepLabv3+ architecture.'
    },
    {
      icon: Star,
      title: 'Intelligent Tier Selection',
      description: 'Choose from Basic, Intermediate, or Advanced automation tiers. Our system automatically selects and optimizes all required devices.'
    },
    {
      icon: BarChart3,
      title: 'Coverage Optimization',
      description: 'Intelligent algorithms optimize device placement for maximum coverage, minimal interference, and professional installation requirements.'
    },
    {
      icon: FileText,
      title: 'Installation Reports',
      description: 'Generate detailed reports with device lists, wiring diagrams, power requirements, and step-by-step installation guides.'
    }
  ]

  const handleFloorPlanUpload = (uploadedFloorPlan: any) => {
    setFloorPlan(uploadedFloorPlan)
    setCurrentStep(2)
  }

  const handleTierSelection = (tier: AutomationTier) => {
    setSelectedTier(tier)
  }

  const handleTierNext = () => {
    setCurrentStep(3)
  }

  const handlePreferencesNext = () => {
    setCurrentStep(4)
  }

  const handlePreferencesBack = () => {
    setCurrentStep(2)
  }

  const handleStartAnalysis = async () => {
    if (!floorPlan || !selectedTier || !projectName.trim()) {
      return
    }

    try {
      // Create project data with serializable tier details (no React components)
      const serializableTierDetails = {
        id: selectedTier.id,
        name: selectedTier.name,
        description: selectedTier.description,
        price: selectedTier.price,
        features: selectedTier.features,
        deviceCategories: selectedTier.deviceCategories,
        estimatedDevices: selectedTier.estimatedDevices
      }

      const projectData = {
        project_name: projectName,
        description: projectDescription,
        floor_plan_url: floorPlan.url || '',
        floor_plan_analysis: floorPlan.analysis_results || {},
        automation_tier: selectedTier.id,
        tier_details: serializableTierDetails,
        user_preferences: userPreferences,
        total_devices: 0, // Will be calculated in analysis
        estimated_cost: 0.00, // Will be calculated in analysis
        project_status: 'draft'
      }

      // Save project to database if user is authenticated
      let savedProject = null
      if (user) {
        const projectWithUser = {
          ...projectData,
          user_id: user.id
        }
        
        const { data, error } = await supabase
          .from('projects')
          .insert(projectWithUser as any)
          .select()
          .single()
        
        if (error) {
          console.error('Error saving project:', error)
          toast.error('Failed to save project')
        } else {
          savedProject = data
          toast.success('Project saved successfully')
        }
      }

      // Create serializable floor plan data
      const serializableFloorPlan = {
        id: floorPlan.id,
        title: floorPlan.title,
        url: floorPlan.url,
        analysis_results: floorPlan.analysis_results
      }

      // Navigate to project page for analysis
      const projectId = savedProject?.id || 'new'
      navigate(`/project/${projectId}`, { 
        state: { 
          projectData: savedProject || projectData, 
          floorPlan: serializableFloorPlan 
        } 
      })
    } catch (error) {
      console.error('Error starting analysis:', error)
      toast.error('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Home Automation Analyzer</h1>
                <p className="text-sm text-gray-600">Intelligent device placement optimization</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Intelligent Home Automation <span className="text-blue-600">Design & Placement</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your floor plans, choose your automation level, and get AI-powered automatic device selection 
            and placement optimization with professional installation guidance.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      isCompleted 
                        ? 'bg-green-600 border-green-600 text-white'
                        : isActive 
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 max-w-24 mt-1">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span>Upload Floor Plan</span>
                  </CardTitle>
                  <CardDescription>
                    Upload your architectural blueprint, floor plan, or hand-drawn sketch. 
                    Supports JPG, PNG, and PDF formats up to 50MB.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FloorPlanUpload onUploadComplete={handleFloorPlanUpload} />
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    <span>Choose Automation Tier</span>
                  </CardTitle>
                  <CardDescription>
                    Select your desired automation level. Our system will automatically determine and optimize 
                    the placement of all required devices based on your chosen tier.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TierSelector 
                    selectedTier={selectedTier?.id || null}
                    onTierSelect={handleTierSelection}
                    onNext={handleTierNext}
                    floorPlanAnalysis={floorPlan?.analysis_results}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Personal Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Configure your TV, audio, and room preferences. All other devices will be automatically 
                    selected and optimally placed based on your chosen tier.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserPreferences 
                    preferences={userPreferences}
                    onPreferencesChange={setUserPreferences}
                    onNext={handlePreferencesNext}
                    onBack={handlePreferencesBack}
                    floorPlanAnalysis={floorPlan?.analysis_results}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <span>Project Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Set up your project details and finalize your automation design.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter project name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Describe your home automation project..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(3)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(5)}
                      disabled={!projectName.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 5 && (
              <Card className="border-2 border-green-300 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    <span>Ready for Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Your intelligent automation design is configured and ready for AI-powered device placement optimization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2">Project Summary</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Name:</span> {projectName}</p>
                        <p><span className="font-medium">Floor Plan:</span> {floorPlan?.title}</p>
                        <p><span className="font-medium">Automation Tier:</span> {selectedTier?.name}</p>
                        <p><span className="font-medium">Estimated Devices:</span> {selectedTier?.estimatedDevices.min}-{selectedTier?.estimatedDevices.max} devices</p>
                        <p><span className="font-medium">TV Locations:</span> {userPreferences.tvPlacements.length} configured</p>
                        <p><span className="font-medium">Audio System:</span> {userPreferences.audioPreferences.type}</p>
                        {projectDescription && (
                          <p><span className="font-medium">Description:</span> {projectDescription}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(4)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleStartAnalysis}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Start Analysis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Information and Features */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Floor Plan</span>
                    <Badge variant={floorPlan ? "default" : "outline"}>
                      {floorPlan ? 'Uploaded' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Automation Tier</span>
                    <Badge variant={selectedTier ? "default" : "outline"}>
                      {selectedTier ? selectedTier.name : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Preferences</span>
                    <Badge variant={userPreferences.tvPlacements.length > 0 || userPreferences.audioPreferences.primaryRooms.length > 0 ? "default" : "outline"}>
                      {userPreferences.tvPlacements.length > 0 || userPreferences.audioPreferences.primaryRooms.length > 0 ? 'Configured' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Project Config</span>
                    <Badge variant={projectName.trim() ? "default" : "outline"}>
                      {projectName.trim() ? 'Configured' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <div key={index} className="flex space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{feature.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage