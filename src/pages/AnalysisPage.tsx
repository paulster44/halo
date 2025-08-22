import React from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Activity, MapPin, Zap } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

const AnalysisPage: React.FC = () => {
  const { id } = useParams()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Project
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
                <p className="text-sm text-gray-600">Device placement optimization analysis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Interactive Analysis Dashboard
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This feature is under development. The analysis page will include interactive floor plan visualization 
            with device placements, coverage heat maps, interference analysis, optimization metrics, and detailed 
            recommendations for professional installation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>Device Placement</span>
              </CardTitle>
              <CardDescription>
                Interactive floor plan with optimized device positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Visualize optimal placement for each device with coverage areas, 
                mounting heights, and installation constraints.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span>Coverage Analysis</span>
              </CardTitle>
              <CardDescription>
                Heat maps and coverage optimization metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Detailed analysis of signal coverage, blind spots, and overlap 
                optimization for maximum efficiency.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <span>Interference Check</span>
              </CardTitle>
              <CardDescription>
                Frequency analysis and interference mitigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Identify potential interference between devices and provide 
                recommendations for optimal channel configuration.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default AnalysisPage