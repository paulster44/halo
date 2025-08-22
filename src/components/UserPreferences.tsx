import React, { useState } from 'react'
import { Tv, Volume2, Home, MapPin, Plus, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export interface UserPreference {
  tvPlacements: {
    room: string
    size: string
    viewingDistance: string
    mountType: 'wall' | 'stand' | 'ceiling'
    priority: 'high' | 'medium' | 'low'
  }[]
  audioPreferences: {
    type: 'stereo' | 'surround' | 'whole-home' | 'zone-based'
    primaryRooms: string[]
    qualityLevel: 'standard' | 'premium' | 'audiophile'
    outdoorAudio: boolean
  }
  roomPriorities: {
    room: string
    priority: 'high' | 'medium' | 'low'
    specialRequirements?: string
  }[]
  additionalRequests: string
}

interface UserPreferencesProps {
  preferences: UserPreference
  onPreferencesChange: (preferences: UserPreference) => void
  onNext: () => void
  onBack: () => void
  floorPlanAnalysis?: any
}

const UserPreferences: React.FC<UserPreferencesProps> = ({
  preferences,
  onPreferencesChange,
  onNext,
  onBack,
  floorPlanAnalysis
}) => {
  // Common room types that might be detected or manually specified
  const commonRooms = [
    'Living Room', 'Family Room', 'Kitchen', 'Master Bedroom', 'Bedroom 2', 'Bedroom 3',
    'Dining Room', 'Home Office', 'Basement', 'Garage', 'Patio', 'Deck'
  ]

  // Extract rooms from floor plan analysis or use common rooms
  const availableRooms = floorPlanAnalysis?.rooms_detected?.map((room: any) => 
    room.room_type || room.label || `Room ${room.id}`
  ) || commonRooms

  const addTvPlacement = () => {
    const newTv = {
      room: '',
      size: '55"',
      viewingDistance: '8-10 feet',
      mountType: 'wall' as const,
      priority: 'medium' as const
    }
    onPreferencesChange({
      ...preferences,
      tvPlacements: [...preferences.tvPlacements, newTv]
    })
  }

  const removeTvPlacement = (index: number) => {
    onPreferencesChange({
      ...preferences,
      tvPlacements: preferences.tvPlacements.filter((_, i) => i !== index)
    })
  }

  const updateTvPlacement = (index: number, updates: Partial<typeof preferences.tvPlacements[0]>) => {
    const updated = preferences.tvPlacements.map((tv, i) => 
      i === index ? { ...tv, ...updates } : tv
    )
    onPreferencesChange({
      ...preferences,
      tvPlacements: updated
    })
  }

  const updateAudioPreferences = (updates: Partial<UserPreference['audioPreferences']>) => {
    onPreferencesChange({
      ...preferences,
      audioPreferences: { ...preferences.audioPreferences, ...updates }
    })
  }

  const updateRoomPriority = (room: string, priority: 'high' | 'medium' | 'low') => {
    const existing = preferences.roomPriorities.find(r => r.room === room)
    const updated = existing
      ? preferences.roomPriorities.map(r => 
          r.room === room ? { ...r, priority } : r
        )
      : [...preferences.roomPriorities, { room, priority }]
    
    onPreferencesChange({
      ...preferences,
      roomPriorities: updated
    })
  }

  const getRoomPriority = (room: string): string => {
    return preferences.roomPriorities.find(r => r.room === room)?.priority || 'medium'
  }

  const toggleAudioRoom = (room: string) => {
    const isSelected = preferences.audioPreferences.primaryRooms.includes(room)
    const updated = isSelected
      ? preferences.audioPreferences.primaryRooms.filter(r => r !== room)
      : [...preferences.audioPreferences.primaryRooms, room]
    
    updateAudioPreferences({ primaryRooms: updated })
  }

  const isFormValid = () => {
    return preferences.tvPlacements.every(tv => tv.room.trim() !== '')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Preferences</h3>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Tell us about your entertainment and room preferences. Our system will automatically 
          place all other devices and optimize their positioning for your specific needs.
        </p>
      </div>

      {/* TV Placement Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tv className="w-5 h-5 text-blue-600" />
            <span>TV and Display Placement</span>
          </CardTitle>
          <CardDescription>
            Specify where you want TVs or displays installed. We'll optimize cable routing and power placement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {preferences.tvPlacements.map((tv, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">TV {index + 1}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTvPlacement(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <select
                    value={tv.room}
                    onChange={(e) => updateTvPlacement(index, { room: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select room...</option>
                    {availableRooms.map((room) => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Screen Size</label>
                  <select
                    value={tv.size}
                    onChange={(e) => updateTvPlacement(index, { size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value='32"'>32" (Small)</option>
                    <option value='43"'>43" (Medium)</option>
                    <option value='55"'>55" (Large)</option>
                    <option value='65"'>65" (Extra Large)</option>
                    <option value='75"'>75"+ (Premium)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mount Type</label>
                  <select
                    value={tv.mountType}
                    onChange={(e) => updateTvPlacement(index, { mountType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="wall">Wall Mount</option>
                    <option value="stand">TV Stand</option>
                    <option value="ceiling">Ceiling Mount</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={tv.priority}
                    onChange={(e) => updateTvPlacement(index, { priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addTvPlacement}
            className="w-full border-dashed border-gray-300 text-gray-600 hover:text-gray-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add TV/Display Location
          </Button>
        </CardContent>
      </Card>

      {/* Audio System Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-blue-600" />
            <span>Audio System Preferences</span>
          </CardTitle>
          <CardDescription>
            Configure your audio preferences for speaker placement and wiring optimization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Audio Type</label>
              <select
                value={preferences.audioPreferences.type}
                onChange={(e) => updateAudioPreferences({ type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="stereo">Basic Stereo</option>
                <option value="surround">Surround Sound</option>
                <option value="zone-based">Multi-Zone Audio</option>
                <option value="whole-home">Whole-Home System</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality Level</label>
              <select
                value={preferences.audioPreferences.qualityLevel}
                onChange={(e) => updateAudioPreferences({ qualityLevel: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard Quality</option>
                <option value="premium">Premium Quality</option>
                <option value="audiophile">Audiophile Grade</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="outdoor-audio"
                checked={preferences.audioPreferences.outdoorAudio}
                onChange={(e) => updateAudioPreferences({ outdoorAudio: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="outdoor-audio" className="text-sm text-gray-700">
                Include outdoor audio
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Audio Rooms</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableRooms.slice(0, 8).map((room) => {
                const isSelected = preferences.audioPreferences.primaryRooms.includes(room)
                return (
                  <button
                    key={room}
                    type="button"
                    onClick={() => toggleAudioRoom(room)}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {room}
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Priority Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-blue-600" />
            <span>Room Priority Settings</span>
          </CardTitle>
          <CardDescription>
            Set priority levels for rooms to help optimize device placement and coverage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableRooms.slice(0, 9).map((room) => {
              const priority = getRoomPriority(room)
              return (
                <div key={room} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{room}</span>
                  <select
                    value={priority}
                    onChange={(e) => updateRoomPriority(room, e.target.value as any)}
                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Requirements</CardTitle>
          <CardDescription>
            Any special requests or specific requirements for your home automation installation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={preferences.additionalRequests}
            onChange={(e) => onPreferencesChange({ ...preferences, additionalRequests: e.target.value })}
            placeholder="e.g., Avoid placing cameras in bedrooms, need extra WiFi coverage in garage, prefer wireless devices where possible..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex space-x-3">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!isFormValid()}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Continue to Analysis
        </Button>
      </div>
    </div>
  )
}

export default UserPreferences