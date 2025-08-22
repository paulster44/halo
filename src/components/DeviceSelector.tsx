import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Wifi, Camera, Speaker, Shield, Bell, RectangleHorizontal, Server, Thermometer, Plus, Minus } from 'lucide-react'
import { supabase, DeviceCategory, DeviceSpecification } from '../lib/supabase'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

interface SelectedDevice {
  deviceSpecId: number
  quantity: number
  priority: 'high' | 'medium' | 'low'
}

interface DeviceSelectorProps {
  selectedDevices: SelectedDevice[]
  onSelectionChange: (devices: SelectedDevice[]) => void
  onNext: () => void
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedDevices,
  onSelectionChange,
  onNext
}) => {
  const [activeCategory, setActiveCategory] = useState<number>(1)

  // Fetch device categories
  const { data: categories = [] } = useQuery({
    queryKey: ['device-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('device_categories')
        .select('*')
        .order('id')
      
      if (error) throw error
      return data as DeviceCategory[]
    }
  })

  // Fetch device specifications
  const { data: devices = [] } = useQuery({
    queryKey: ['device-specifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('device_specifications')
        .select('*')
        .order('category_id, device_name')
      
      if (error) throw error
      return data as DeviceSpecification[]
    }
  })

  const getIconForCategory = (iconName: string) => {
    const icons = {
      wifi: Wifi,
      camera: Camera,
      speaker: Speaker,
      shield: Shield,
      doorbell: Bell,
      window: RectangleHorizontal,
      server: Server,
      thermometer: Thermometer
    }
    return icons[iconName as keyof typeof icons] || Server
  }

  const updateDeviceQuantity = (deviceSpecId: number, quantity: number) => {
    const existing = selectedDevices.find(d => d.deviceSpecId === deviceSpecId)
    
    if (quantity === 0) {
      // Remove device
      onSelectionChange(selectedDevices.filter(d => d.deviceSpecId !== deviceSpecId))
    } else if (existing) {
      // Update quantity
      onSelectionChange(
        selectedDevices.map(d => 
          d.deviceSpecId === deviceSpecId 
            ? { ...d, quantity }
            : d
        )
      )
    } else {
      // Add device
      onSelectionChange([
        ...selectedDevices,
        { deviceSpecId, quantity, priority: 'medium' }
      ])
    }
  }

  const getDeviceQuantity = (deviceSpecId: number): number => {
    return selectedDevices.find(d => d.deviceSpecId === deviceSpecId)?.quantity || 0
  }

  const totalSelectedDevices = selectedDevices.reduce((sum, d) => sum + d.quantity, 0)

  useEffect(() => {
    if (categories.length > 0 && activeCategory === 1 && categories[0]) {
      setActiveCategory(categories[0].id)
    }
  }, [categories])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg text-gray-700">
          Select the home automation devices you want to install. Our AI will optimize their placement 
          for maximum coverage, minimal interference, and professional installation requirements.
        </p>
      </div>

      <Tabs value={activeCategory.toString()} onValueChange={(value) => setActiveCategory(parseInt(value))}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          {categories.map((category) => {
            const Icon = getIconForCategory(category.icon_name)
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id.toString()}
                className="flex flex-col space-y-1 p-3"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">{category.name.split(' ')[0]}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {categories.map((category) => {
          const categoryDevices = devices.filter(d => d.category_id === category.id)
          
          return (
            <TabsContent key={category.id} value={category.id.toString()} className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryDevices.map((device) => {
                  const quantity = getDeviceQuantity(device.id)
                  const isSelected = quantity > 0
                  
                  return (
                    <Card key={device.id} className={`transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{device.device_name}</CardTitle>
                            <CardDescription className="text-sm">
                              {device.description}
                            </CardDescription>
                          </div>
                          <Badge 
                            variant="outline" 
                            style={{ backgroundColor: category.color_code + '20', borderColor: category.color_code }}
                          >
                            {category.name.split(' ')[0]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Device Specs */}
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            {device.coverage_radius_feet && (
                              <div>
                                <span className="font-medium">Coverage:</span> {device.coverage_radius_feet}ft
                              </div>
                            )}
                            {device.mounting_height_optimal_feet && (
                              <div>
                                <span className="font-medium">Height:</span> {device.mounting_height_optimal_feet}ft
                              </div>
                            )}
                            {device.power_consumption_watts && (
                              <div>
                                <span className="font-medium">Power:</span> {device.power_consumption_watts}W
                              </div>
                            )}
                            {device.field_of_view_degrees && (
                              <div>
                                <span className="font-medium">FOV:</span> {device.field_of_view_degrees}°
                              </div>
                            )}
                          </div>
                          
                          {/* Quantity Selector */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm font-medium text-gray-700">Quantity</span>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateDeviceQuantity(device.id, Math.max(0, quantity - 1))}
                                disabled={quantity === 0}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateDeviceQuantity(device.id, quantity + 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Summary and Continue */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900">
            {totalSelectedDevices} device{totalSelectedDevices !== 1 ? 's' : ''} selected
          </p>
          <p className="text-sm text-gray-600">
            {selectedDevices.length} type{selectedDevices.length !== 1 ? 's' : ''} across {new Set(selectedDevices.map(d => {
              const device = devices.find(dev => dev.id === d.deviceSpecId)
              return device?.category_id
            })).size} categor{new Set(selectedDevices.map(d => {
              const device = devices.find(dev => dev.id === d.deviceSpecId)
              return device?.category_id
            })).size !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <Button 
          onClick={onNext}
          disabled={selectedDevices.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continue with {totalSelectedDevices} Device{totalSelectedDevices !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  )
}

export default DeviceSelector