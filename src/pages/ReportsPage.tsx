import React from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Download, Printer } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

const ReportsPage: React.FC = () => {
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
                Back to Analysis
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Installation Reports</h1>
                <p className="text-sm text-gray-600">Professional installation documentation</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Professional Installation Reports
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This feature is under development. The reports page will generate comprehensive installation 
            documentation including device lists, wiring diagrams, power requirements, cable routing plans, 
            and step-by-step installation guides for professional installers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Device Inventory</CardTitle>
              <CardDescription>
                Complete list of selected devices with specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Detailed inventory including model numbers, power requirements, 
                mounting hardware, and installation accessories.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Wiring Diagrams</CardTitle>
              <CardDescription>
                Cable routing and power distribution plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Professional wiring diagrams showing optimal cable routes from 
                devices to central equipment rack with power calculations.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Installation Guide</CardTitle>
              <CardDescription>
                Step-by-step professional installation instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Comprehensive installation guide with mounting procedures, 
                configuration steps, and testing protocols.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Equipment Rack Layout</CardTitle>
              <CardDescription>
                Central equipment organization and thermal management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Detailed rack layout with equipment positioning, power distribution, 
                and ventilation requirements for optimal operation.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Coverage Analysis</CardTitle>
              <CardDescription>
                Signal coverage maps and optimization metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Detailed coverage analysis with heat maps, blind spot identification, 
                and performance optimization recommendations.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Compliance Report</CardTitle>
              <CardDescription>
                Building codes and safety compliance documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Compliance verification for local building codes, electrical safety, 
                and industry standards for professional installation.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default ReportsPage