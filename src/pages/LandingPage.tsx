import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Cpu, Upload, Star, BarChart3, FileText, Zap, CheckCircle, ArrowRight, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  React.useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

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

  const steps = [
    { id: 1, title: 'Upload Floor Plan', icon: Upload, description: 'Upload your architectural blueprint or floor plan' },
    { id: 2, title: 'Choose Automation Tier', icon: Star, description: 'Select your automation level and budget' },
    { id: 3, title: 'Set Preferences', icon: Cpu, description: 'Configure TV, audio, and room preferences' },
    { id: 4, title: 'Get Analysis', icon: Zap, description: 'AI analyzes and optimizes device placement' },
    { id: 5, title: 'Installation Guide', icon: FileText, description: 'Download professional installation documentation' }
  ]

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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth/login')}
                className="flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Button>
              <Button 
                onClick={() => navigate('/auth/register')}
                className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Intelligent Home Automation <span className="text-blue-600">Design & Placement</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Upload your floor plans, choose your automation level, and get AI-powered automatic device selection 
            and placement optimization with professional installation guidance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => navigate('/auth/register')}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 flex items-center justify-center space-x-2"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth/login')}
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h3>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.id} className="flex flex-col lg:flex-row items-center gap-4">
                  <div className="flex flex-col items-center max-w-[250px] lg:max-w-[200px]">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 text-center">{step.title}</h4>
                    <p className="text-sm text-gray-600 text-center">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-6 h-6 text-gray-400 hidden lg:block flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Optimize Your Home Automation?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join contractors and installers who trust our AI-powered platform for professional home automation design.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => navigate('/auth/register')}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth/login')}
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-xl font-bold">Home Automation Analyzer</h4>
          </div>
          <p className="text-center text-gray-400">
            Professional home automation design powered by artificial intelligence
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage