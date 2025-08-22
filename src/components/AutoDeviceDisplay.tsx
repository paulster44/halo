import React from 'react'
import { Cpu, CheckCircle, Info, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { DeviceCalculationResult } from '../lib/deviceCalculator'
import { AutomationTier } from './TierSelector'

interface AutoDeviceDisplayProps {
  calculationResult: DeviceCalculationResult
  tier: AutomationTier
  isLoading?: boolean
}

const AutoDeviceDisplay: React.FC<AutoDeviceDisplayProps> = ({
  calculationResult,
  tier,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-600 animate-spin" />
            <span>Calculating Optimal Device Placement...</span>
          </CardTitle>
          <CardDescription>
            Analyzing your floor plan and tier selection to determine the best device configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const devicesByCategory = calculationResult.devices.reduce((acc, device) => {
    const category = device.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(device)
    return acc
  }, {} as Record<string, typeof calculationResult.devices>)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-2 border-green-300 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Automatic Device Configuration Complete</span>
          </CardTitle>
          <CardDescription>
            Based on your {tier.name} tier selection and floor plan analysis, we've automatically 
            selected and optimized {calculationResult.totalDevices} devices for your home automation system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{calculationResult.totalDevices}</div>
              <div className="text-sm text-gray-600">Total Devices</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{Object.keys(devicesByCategory).length}</div>
              <div className="text-sm text-gray-600">Device Categories</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">
                ${calculationResult.estimatedCost.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Estimated Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(devicesByCategory).map(([category, devices]) => {
          const totalDevicesInCategory = devices.reduce((sum, d) => sum + d.quantity, 0)
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
                <CardDescription>
                  {totalDevicesInCategory} device{totalDevicesInCategory !== 1 ? 's' : ''} in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {devices.map((device, index) => (
                    <div key={`${device.deviceSpecId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{device.deviceName}</div>
                        <div className="text-sm text-gray-600">{device.placementReason}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={device.priority === 'high' ? 'default' : 'outline'}
                          className={device.priority === 'high' ? 'bg-red-500' : device.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'}
                        >
                          {device.priority}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold">{device.quantity}</div>
                          <div className="text-xs text-gray-500">units</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* AI Rationale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span>AI Analysis & Rationale</span>
          </CardTitle>
          <CardDescription>
            Here's how our AI determined the optimal device configuration for your home.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {calculationResult.rationale.map((reason, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{reason}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span>Investment Overview</span>
          </CardTitle>
          <CardDescription>
            Estimated costs for your {tier.name} automation system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Equipment & Devices</span>
              <span className="font-medium">${Math.round(calculationResult.estimatedCost * 0.6).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Professional Installation</span>
              <span className="font-medium">${Math.round(calculationResult.estimatedCost * 0.3).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Configuration & Testing</span>
              <span className="font-medium">${Math.round(calculationResult.estimatedCost * 0.1).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 pt-4 border-t-2 border-gray-300">
              <span className="text-lg font-semibold text-gray-900">Total Investment</span>
              <span className="text-xl font-bold text-green-600">${calculationResult.estimatedCost.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This is an estimate based on typical pricing. Final costs may vary 
              based on specific equipment choices, installation complexity, and local market rates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AutoDeviceDisplay