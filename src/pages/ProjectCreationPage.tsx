import React, { useState } from 'react'
import { Upload, Zap, BarChart3, FileText, Cpu, Layers, Settings, CheckCircle, Star, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createProject, testDatabaseConnection, ProjectInsert, supabase } from '../lib/supabase'
import FloorPlanUpload from '../components/FloorPlanUpload'
import TierSelector, { AutomationTier } from '../components/TierSelector'
import UserPreferences, { UserPreference } from '../components/UserPreferences'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { dbLogger } from '../lib/logger'
import toast from 'react-hot-toast'

const ProjectCreationPage: React.FC = () => {
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
    if (!floorPlan || !selectedTier || !projectName.trim() || !user) {
      toast.error('Please complete all required fields')
      return
    }

    try {
      dbLogger.info('Starting project creation flow', {
        projectName: projectName.trim(),
        userId: user.id,
        tier: selectedTier.id
      })
      
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

      const projectData: ProjectInsert = {
        project_name: projectName.trim(),
        description: projectDescription.trim() || null,
        floor_plan_url: floorPlan?.url || null,
        floor_plan_analysis: (floorPlan?.analysis_results || null) as any,
        automation_tier: selectedTier.id,
        tier_details: serializableTierDetails as any,
        user_preferences: userPreferences as any,
        total_devices: 0,
        estimated_cost: 0.00, // Ensure decimal format
        project_status: 'draft',
        user_id: user.id
      }

      dbLogger.debug('Project data prepared', {
        hasFloorPlan: !!floorPlan,
        tierDetails: serializableTierDetails
      })
      
      // Test database connection first
      dbLogger.debug('Testing database connection before project creation')
      const connectionTest = await testDatabaseConnection()
      
      if (!connectionTest.success) {
        dbLogger.error('Database connection test failed', {
          error: connectionTest.error
        })
        toast.error(`Database connection failed: ${connectionTest.error}`)
        return
      }
      
      dbLogger.debug('Database connection test successful')

      // Use enhanced project creation function
      dbLogger.info('Creating project in database')
      const { data, error } = await createProject(projectData)
      
      if (error) {
        dbLogger.error('Project creation failed', {
          error: error.message,
          code: error.code,
          details: error.details
        })
        toast.error(`Failed to save project: ${error.message || 'Unknown error'}`)
        return
      }

      if (!data) {
        dbLogger.error('No data returned from project creation')
        toast.error('Failed to create project - no data returned')
        return
      }

      dbLogger.info('Project created successfully', {
        projectId: data.id,
        projectName: data.project_name
      })
      toast.success('Project saved successfully')

      // Start blueprint analysis if floor plan is available
      if (floorPlan && floorPlan.url) {
        try {
          dbLogger.info('Starting blueprint analysis', {
            floorPlanId: floorPlan.id,
            floorPlanUrl: floorPlan.url
          })
          
          toast.loading('Analyzing floor plan...', { id: 'analysis' })
          
          // Call the analyze-blueprint edge function
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-blueprint', {
            body: {
              floorPlanId: floorPlan.id,
              imageUrl: floorPlan.url
            }
          })
          
          if (analysisError) {
            dbLogger.error('Blueprint analysis failed', {
              error: analysisError.message,
              floorPlanId: floorPlan.id
            })
            toast.error('Floor plan analysis failed, but project was saved', { id: 'analysis' })
          } else {
            dbLogger.info('Blueprint analysis completed successfully', {
              floorPlanId: floorPlan.id,
              analysisResults: analysisData
            })
            toast.success('Floor plan analysis completed!', { id: 'analysis' })
            
            // Update the floor plan with analysis results
            floorPlan.analysis_results = analysisData.data.analysisResults
          }
        } catch (analysisError: any) {
          dbLogger.error('Unexpected error during blueprint analysis', {
            error: analysisError.message,
            floorPlanId: floorPlan.id
          })
          toast.error('Analysis failed, but project was saved', { id: 'analysis' })
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
      navigate(`/project/${data.id}`, { 
        state: { 
          projectData: data, 
          floorPlan: serializableFloorPlan 
        } 
      })
    } catch (error: any) {
      dbLogger.error('Unexpected error in project creation flow', {
        error: error.message,
        stack: error.stack
      })
      toast.error(`An error occurred: ${error.message || 'Please try again.'}`)
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
                <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                <p className="text-sm text-gray-600">Design your intelligent home automation system</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Right Column - Information and Status */}
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

            {/* Help Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>Follow the steps to create your automated home design:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Upload a clear floor plan image</li>
                    <li>• Choose your automation complexity level</li>
                    <li>• Configure your preferences</li>
                    <li>• Set project details</li>
                    <li>• Start the AI analysis</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProjectCreationPage