import React, { useState } from 'react'
import { Zap, Shield, Star, Check, Home, Cpu, Wifi } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export interface AutomationTier {
  id: 'basic' | 'intermediate' | 'advanced'
  name: string
  description: string
  price: string
  icon: any
  features: string[]
  deviceCategories: {
    wifi: { included: boolean; description: string }
    security: { included: boolean; description: string }
    switches: { included: boolean; description: string }
    cameras: { included: boolean; description: string }
    sensors: { included: boolean; description: string }
    comfort: { included: boolean; description: string }
    entertainment: { included: boolean; description: string }
    environmental: { included: boolean; description: string }
  }
  estimatedDevices: {
    min: number
    max: number
  }
}

interface TierSelectorProps {
  selectedTier: string | null
  onTierSelect: (tier: AutomationTier) => void
  onNext: () => void
  floorPlanAnalysis?: any
}

const TierSelector: React.FC<TierSelectorProps> = ({
  selectedTier,
  onTierSelect,
  onNext,
  floorPlanAnalysis
}) => {
  const tiers: AutomationTier[] = [
    {
      id: 'basic',
      name: 'Basic Automation',
      description: 'Essential smart home foundation with security and connectivity',
      price: '$2,500 - $4,000',
      icon: Home,
      features: [
        'Complete WiFi coverage optimization',
        'Essential security cameras',
        'Smart switches for all lights',
        'Basic door/window sensors',
        'Smart doorbell',
        'Smoke detector placement',
        'Central equipment rack'
      ],
      deviceCategories: {
        wifi: { included: true, description: 'Optimal access point placement' },
        security: { included: true, description: 'Basic camera coverage' },
        switches: { included: true, description: 'All lighting switches' },
        cameras: { included: true, description: '2-4 exterior cameras' },
        sensors: { included: true, description: 'Entry point sensors' },
        comfort: { included: false, description: 'Not included' },
        entertainment: { included: false, description: 'Not included' },
        environmental: { included: true, description: 'Basic thermostat' }
      },
      estimatedDevices: { min: 12, max: 20 }
    },
    {
      id: 'intermediate',
      name: 'Enhanced Automation',
      description: 'Comprehensive security and comfort with intelligent environmental control',
      price: '$4,500 - $7,500',
      icon: Shield,
      features: [
        'Everything in Basic tier',
        'Enhanced security system',
        'Motion detectors throughout',
        'Smart thermostats (multi-zone)',
        'Window treatment automation',
        'Smart locks for all doors',
        'Audio system pre-wiring',
        'Advanced equipment rack'
      ],
      deviceCategories: {
        wifi: { included: true, description: 'Enterprise-grade coverage' },
        security: { included: true, description: 'Comprehensive camera system' },
        switches: { included: true, description: 'Smart switches + dimmers' },
        cameras: { included: true, description: '4-8 interior/exterior cameras' },
        sensors: { included: true, description: 'Motion + entry sensors' },
        comfort: { included: true, description: 'Multi-zone climate control' },
        entertainment: { included: true, description: 'Audio pre-wiring' },
        environmental: { included: true, description: 'Smart thermostats + sensors' }
      },
      estimatedDevices: { min: 25, max: 40 }
    },
    {
      id: 'advanced',
      name: 'Premium Automation',
      description: 'Complete smart home ecosystem with AI-driven optimization and luxury features',
      price: '$8,000 - $15,000+',
      icon: Star,
      features: [
        'Everything in Enhanced tier',
        'AI-powered automation scenes',
        'Whole-home audio/video system',
        'Advanced lighting control',
        'Smart irrigation systems',
        'Energy monitoring systems',
        'Premium security features',
        'Professional-grade equipment rack'
      ],
      deviceCategories: {
        wifi: { included: true, description: 'Mesh network with redundancy' },
        security: { included: true, description: 'Professional security system' },
        switches: { included: true, description: 'Intelligent switch ecosystem' },
        cameras: { included: true, description: '8+ high-resolution cameras' },
        sensors: { included: true, description: 'Comprehensive sensor network' },
        comfort: { included: true, description: 'Luxury climate control' },
        entertainment: { included: true, description: 'Whole-home A/V system' },
        environmental: { included: true, description: 'Complete environmental automation' }
      },
      estimatedDevices: { min: 45, max: 75 }
    }
  ]

  const calculateEstimatedDevicesForPlan = (tier: AutomationTier) => {
    if (!floorPlanAnalysis) return tier.estimatedDevices
    
    // Basic calculation based on rooms and square footage
    const rooms = floorPlanAnalysis.rooms_detected?.length || 5
    const sqft = floorPlanAnalysis.dimensions?.total_sqft || 2000
    
    let multiplier = 1
    if (tier.id === 'basic') multiplier = 0.8
    else if (tier.id === 'intermediate') multiplier = 1.2
    else if (tier.id === 'advanced') multiplier = 1.8
    
    const estimated = Math.round((rooms * 3 + sqft / 200) * multiplier)
    return {
      min: Math.max(tier.estimatedDevices.min, estimated - 5),
      max: Math.max(tier.estimatedDevices.max, estimated + 5)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Automation Tier</h3>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Select the level of home automation that fits your needs and budget. 
          Our system will automatically determine and optimize the placement of all required devices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const Icon = tier.icon
          const isSelected = selectedTier === tier.id
          const estimatedDevices = calculateEstimatedDevicesForPlan(tier)
          
          return (
            <Card 
              key={tier.id} 
              className={`relative transition-all duration-200 cursor-pointer hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg transform scale-[1.02]' 
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
              onClick={() => onTierSelect(tier)}
            >
              {tier.id === 'intermediate' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  tier.id === 'basic' ? 'bg-green-100 text-green-600' :
                  tier.id === 'intermediate' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  <Icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription className="text-sm">{tier.description}</CardDescription>
                <div className={`text-2xl font-bold mt-2 ${
                  tier.id === 'basic' ? 'text-green-600' :
                  tier.id === 'intermediate' ? 'text-blue-600' :
                  'text-purple-600'
                }`}>
                  {tier.price}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Device Estimate */}
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-sm text-gray-600">Estimated Devices</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {estimatedDevices.min} - {estimatedDevices.max} devices
                  </div>
                </div>
                
                {/* Key Features */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">Key Features:</h4>
                  <ul className="space-y-1">
                    {tier.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {tier.features.length > 4 && (
                      <li className="text-xs text-gray-500 ml-6">
                        +{tier.features.length - 4} more features...
                      </li>
                    )}
                  </ul>
                </div>
                
                {/* Device Categories Grid */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">Included Systems:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(tier.deviceCategories).map(([key, config]) => (
                      <div key={key} className={`flex items-center space-x-1 ${
                        config.included ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {config.included ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <div className="w-3 h-3 border border-gray-300 rounded-sm" />
                        )}
                        <span className="capitalize">{key === 'wifi' ? 'WiFi' : key}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {isSelected && (
                  <div className="pt-2 border-t">
                    <Badge className="w-full justify-center bg-blue-500 text-white">
                      Selected Tier
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {selectedTier && (
        <div className="flex justify-center pt-6">
          <Button 
            onClick={onNext}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            Continue with {tiers.find(t => t.id === selectedTier)?.name}
          </Button>
        </div>
      )}
    </div>
  )
}

export default TierSelector