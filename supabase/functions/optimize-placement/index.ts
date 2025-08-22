// Device calculation logic (simplified version for Deno environment)
function calculateDevicesForTier(tierDetails: any, floorPlan: any, userPreferences: any, deviceSpecs: any[]) {
    const result = {
        devices: [],
        totalDevices: 0,
        estimatedCost: 0,
        rationale: []
    };

    // Extract floor plan metrics
    const rooms = floorPlan.rooms_detected || [];
    const doors = floorPlan.doors_detected || [];
    const windows = floorPlan.windows_detected || [];
    const sqft = floorPlan.dimensions?.total_sqft || 2000;
    const roomCount = Math.max(rooms.length, 5);
    const entryPoints = doors.length + windows.length;

    result.rationale.push(`Floor Plan Analysis: ${roomCount} rooms, ${Math.round(sqft)} sq ft, ${entryPoints} entry points`);
    result.rationale.push(`Selected Tier: ${tierDetails.name}`);

    // Calculate devices by category based on tier
    if (tierDetails.deviceCategories.wifi.included) {
        const wifiDevices = calculateWiFiDevices(sqft, rooms, deviceSpecs);
        result.devices.push(...wifiDevices.devices);
        result.rationale.push(...wifiDevices.rationale);
    }

    if (tierDetails.deviceCategories.security.included) {
        const securityDevices = calculateSecurityDevices(tierDetails.id, roomCount, doors.length, deviceSpecs);
        result.devices.push(...securityDevices.devices);
        result.rationale.push(...securityDevices.rationale);
    }

    if (tierDetails.deviceCategories.switches.included) {
        const switchDevices = calculateSwitchDevices(roomCount, tierDetails.id, deviceSpecs);
        result.devices.push(...switchDevices.devices);
        result.rationale.push(...switchDevices.rationale);
    }

    // Calculate totals
    result.totalDevices = result.devices.reduce((sum, d) => sum + d.quantity, 0);
    result.estimatedCost = estimateProjectCost(tierDetails, result.totalDevices, sqft);

    return result;
}

function calculateWiFiDevices(sqft: number, rooms: any[], deviceSpecs: any[]) {
    const wifiSpecs = deviceSpecs.filter(d => d.device_categories?.icon_name === 'wifi');
    const accessPoint = wifiSpecs.find(d => d.device_name.toLowerCase().includes('access point')) || wifiSpecs[0];

    if (!accessPoint) {
        return { devices: [], rationale: [] };
    }

    const coveragePerAP = accessPoint.coverage_area_sqft || 1500;
    const apCount = Math.max(1, Math.ceil(sqft / coveragePerAP));

    return {
        devices: [{
            deviceSpecId: accessPoint.id,
            quantity: apCount,
            priority: 'high',
            placementReason: `Coverage optimization for ${Math.round(sqft)} sq ft`,
            category: accessPoint.device_categories?.name || 'WiFi',
            deviceName: accessPoint.device_name
        }],
        rationale: [`WiFi Coverage: ${apCount} access points for ${Math.round(sqft)} sq ft`]
    };
}

function calculateSecurityDevices(tierLevel: string, roomCount: number, exteriorDoors: number, deviceSpecs: any[]) {
    const devices = [];
    const rationale = [];

    // Smoke detectors
    const smokeDetector = deviceSpecs.find(d => d.device_name.toLowerCase().includes('smoke'));
    if (smokeDetector) {
        const smokeCount = Math.max(roomCount, 3);
        devices.push({
            deviceSpecId: smokeDetector.id,
            quantity: smokeCount,
            priority: 'high',
            placementReason: 'Fire safety code compliance',
            category: smokeDetector.device_categories?.name || 'Security',
            deviceName: smokeDetector.device_name
        });
        rationale.push(`Smoke Detectors: ${smokeCount} units for fire safety`);
    }

    // Door sensors
    const doorSensor = deviceSpecs.find(d => d.device_name.toLowerCase().includes('door') && d.device_name.toLowerCase().includes('sensor'));
    if (doorSensor) {
        const sensorCount = Math.max(exteriorDoors, 2);
        devices.push({
            deviceSpecId: doorSensor.id,
            quantity: sensorCount,
            priority: 'high',
            placementReason: 'Entry point monitoring',
            category: doorSensor.device_categories?.name || 'Security',
            deviceName: doorSensor.device_name
        });
        rationale.push(`Entry Sensors: ${sensorCount} sensors for doors`);
    }

    return { devices, rationale };
}

function calculateSwitchDevices(roomCount: number, tierLevel: string, deviceSpecs: any[]) {
    const switchSpecs = deviceSpecs.filter(d => d.device_name.toLowerCase().includes('switch'));
    const smartSwitch = switchSpecs[0];
    
    if (!smartSwitch) {
        return { devices: [], rationale: [] };
    }

    const switchesPerRoom = tierLevel === 'advanced' ? 3 : tierLevel === 'intermediate' ? 2.5 : 2;
    const switchCount = Math.ceil(roomCount * switchesPerRoom);

    return {
        devices: [{
            deviceSpecId: smartSwitch.id,
            quantity: switchCount,
            priority: 'medium',
            placementReason: 'Complete lighting control',
            category: smartSwitch.device_categories?.name || 'Switches',
            deviceName: smartSwitch.device_name
        }],
        rationale: [`Smart Switches: ${switchCount} switches for lighting control`]
    };
}

function estimateProjectCost(tier: any, deviceCount: number, sqft: number): number {
    const baseCosts = {
        basic: 2500,
        intermediate: 5000,
        advanced: 10000
    };

    const baseCost = baseCosts[tier.id] || 5000;
    const deviceCost = deviceCount * 150;
    const installationCost = sqft * 1.5;
    
    return Math.round(baseCost + deviceCost + installationCost);
}

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { projectId, floorPlanId, automationTier, tierDetails, userPreferences, selectedDevices } = await req.json();

        if (!projectId || !floorPlanId || (!automationTier && !selectedDevices)) {
            throw new Error('Project ID, floor plan ID, and either automation tier or selected devices are required');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        console.log(`Starting real device placement optimization for project ${projectId}`);

        // Fetch floor plan analysis data
        const floorPlanResponse = await fetch(`${supabaseUrl}/rest/v1/floor_plans?id=eq.${floorPlanId}&select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!floorPlanResponse.ok) {
            throw new Error('Failed to fetch floor plan data');
        }

        const floorPlanData = await floorPlanResponse.json();
        if (!floorPlanData || floorPlanData.length === 0) {
            throw new Error('Floor plan not found');
        }

        const floorPlan = floorPlanData[0];
        if (floorPlan.analysis_status !== 'completed') {
            throw new Error('Floor plan analysis must be completed before optimization');
        }

        // Fetch all device specifications for tier-based calculation or specific devices
        let deviceSpecs = [];
        let calculatedDevices = [];
        
        if (automationTier && tierDetails) {
            // Fetch all device specifications for automatic calculation
            const allDevicesResponse = await fetch(
                `${supabaseUrl}/rest/v1/device_specifications?select=*,device_categories(name,icon_name)`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );
            
            if (!allDevicesResponse.ok) {
                throw new Error('Failed to fetch device specifications');
            }
            
            deviceSpecs = await allDevicesResponse.json();
            
            // Calculate devices automatically based on tier
            calculatedDevices = calculateDevicesForTier(
                tierDetails,
                floorPlan,
                userPreferences || {},
                deviceSpecs
            );
        } else {
            // Legacy: use manually selected devices
            const deviceIds = selectedDevices.map((d: any) => d.deviceSpecId);
            const devicesResponse = await fetch(
                `${supabaseUrl}/rest/v1/device_specifications?id=in.(${deviceIds.join(',')})&select=*`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );
            
            if (!devicesResponse.ok) {
                throw new Error('Failed to fetch device specifications');
            }
            
            deviceSpecs = await devicesResponse.json();
            calculatedDevices = selectedDevices;
        }

        // Perform real optimization algorithm with calculated devices
        const optimizationResults = await performRealDeviceOptimization(
            floorPlan,
            deviceSpecs,
            calculatedDevices,
            userPreferences || {},
            automationTier ? {
                tier: automationTier,
                tierDetails: tierDetails,
                automaticCalculation: true
            } : { automaticCalculation: false }
        );

        // Save device placements to database
        const placements = optimizationResults.placements.map((placement: any) => ({
            project_id: projectId,
            device_spec_id: placement.deviceSpecId,
            placement_x: placement.position.x,
            placement_y: placement.position.y,
            room_id: placement.roomId,
            mounting_height_feet: placement.mountingHeight,
            rotation_degrees: placement.rotation || 0,
            coverage_analysis: placement.coverageAnalysis,
            interference_analysis: placement.interferenceAnalysis,
            optimization_score: placement.optimizationScore,
            placement_rationale: placement.rationale,
            installation_notes: placement.installationNotes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        // Delete existing placements for this project
        await fetch(`${supabaseUrl}/rest/v1/device_placements?project_id=eq.${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        // Insert new placements
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/device_placements`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(placements)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Failed to save placements: ${errorText}`);
        }

        console.log(`Real device placement optimization completed for project ${projectId}`);

        return new Response(JSON.stringify({
            data: {
                projectId: projectId,
                optimizationResults: optimizationResults,
                placementsCount: placements.length,
                message: 'Real device placement optimization completed successfully'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Device placement optimization error:', error);

        const errorResponse = {
            error: {
                code: 'PLACEMENT_OPTIMIZATION_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Real device placement optimization algorithm
async function performRealDeviceOptimization(
    floorPlan: any,
    deviceSpecs: any[],
    selectedDevices: any[],
    preferences: any,
    tierInfo: any = { automaticCalculation: false }
) {
    console.log('Performing real device placement optimization...');
    
    const rooms = floorPlan.rooms_detected || [];
    const walls = floorPlan.walls_detected || [];
    const doors = floorPlan.doors_detected || [];
    const windows = floorPlan.windows_detected || [];
    const scale = floorPlan.scale_pixels_per_foot || 10;
    
    // Initialize optimization environment
    const optimizer = new PlacementOptimizer(rooms, walls, doors, windows, scale);
    
    const placements = [];
    const interferenceManager = new InterferenceManager();
    
    // Process each selected device with real optimization
    for (const selectedDevice of selectedDevices) {
        const deviceSpec = deviceSpecs.find(spec => spec.id === selectedDevice.deviceSpecId);
        if (!deviceSpec) continue;
        
        const quantity = selectedDevice.quantity || 1;
        
        for (let i = 0; i < quantity; i++) {
            const placement = await optimizer.optimizeDevicePlacement(
                deviceSpec,
                placements, // Existing placements for interference calculation
                interferenceManager,
                preferences,
                i // Instance number for naming
            );
            
            if (placement) {
                placements.push(placement);
                interferenceManager.addDevice(placement, deviceSpec);
            }
        }
    }
    
    // Calculate overall optimization metrics
    const metrics = optimizer.calculateOptimizationMetrics(placements, deviceSpecs);
    
    return {
        placements,
        metrics,
        coverageAnalysis: optimizer.analyzeCoverage(placements, deviceSpecs),
        interferenceAnalysis: interferenceManager.getInterferenceReport(),
        recommendations: optimizer.generateRecommendations(placements, metrics),
        wiringPlan: generateWiringPlan(placements, rooms, deviceSpecs)
    };
}

// Real placement optimization class
class PlacementOptimizer {
    private rooms: any[];
    private walls: any[];
    private doors: any[];
    private windows: any[];
    private scale: number;
    private grid: number[][];
    private gridResolution: number = 5; // 5 pixels per grid cell
    
    constructor(rooms: any[], walls: any[], doors: any[], windows: any[], scale: number) {
        this.rooms = rooms;
        this.walls = walls;
        this.doors = doors;
        this.windows = windows;
        this.scale = scale;
        
        // Create occupancy grid for placement optimization
        this.initializeGrid();
    }
    
    private initializeGrid() {
        // Calculate grid dimensions
        const maxX = Math.max(...this.rooms.map(r => r.coordinates?.maxX || 0), 1000);
        const maxY = Math.max(...this.rooms.map(r => r.coordinates?.maxY || 0), 1000);
        
        const gridWidth = Math.ceil(maxX / this.gridResolution);
        const gridHeight = Math.ceil(maxY / this.gridResolution);
        
        // Initialize grid with accessibility scores
        this.grid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(1));
        
        // Mark walls and obstacles
        this.markObstacles();
    }
    
    private markObstacles() {
        // Mark wall areas as obstacles
        for (const wall of this.walls) {
            this.markLine(
                Math.floor(wall.start.x / this.gridResolution),
                Math.floor(wall.start.y / this.gridResolution),
                Math.floor(wall.end.x / this.gridResolution),
                Math.floor(wall.end.y / this.gridResolution),
                0 // Obstacle
            );
        }
    }
    
    private markLine(x0: number, y0: number, x1: number, y1: number, value: number) {
        // Bresenham's line algorithm to mark grid cells
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        
        let x = x0;
        let y = y0;
        
        while (true) {
            if (y >= 0 && y < this.grid.length && x >= 0 && x < this.grid[0].length) {
                this.grid[y][x] = value;
            }
            
            if (x === x1 && y === y1) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }
    
    async optimizeDevicePlacement(
        deviceSpec: any,
        existingPlacements: any[],
        interferenceManager: InterferenceManager,
        preferences: any,
        instanceNumber: number
    ) {
        const candidatePositions = this.generateCandidatePositions(deviceSpec);
        
        let bestPlacement = null;
        let bestScore = -Infinity;
        
        for (const candidate of candidatePositions) {
            const score = await this.evaluatePlacement(
                candidate,
                deviceSpec,
                existingPlacements,
                interferenceManager,
                preferences
            );
            
            if (score > bestScore) {
                bestScore = score;
                bestPlacement = candidate;
            }
        }
        
        if (bestPlacement) {
            return this.createPlacementResult(
                bestPlacement,
                deviceSpec,
                bestScore,
                instanceNumber
            );
        }
        
        return null;
    }
    
    private generateCandidatePositions(deviceSpec: any): any[] {
        const candidates: any[] = [];
        
        // Device-specific placement strategy
        switch (deviceSpec.category_id) {
            case 1: // WiFi Infrastructure
                candidates.push(...this.generateWiFiPositions(deviceSpec));
                break;
            case 2: // Security Cameras
                candidates.push(...this.generateCameraPositions(deviceSpec));
                break;
            case 3: // Entertainment Systems
                candidates.push(...this.generateEntertainmentPositions(deviceSpec));
                break;
            case 4: // Security Devices
                candidates.push(...this.generateSecurityPositions(deviceSpec));
                break;
            case 5: // Smart Doorbells
                candidates.push(...this.generateDoorbellPositions(deviceSpec));
                break;
            case 7: // Central Equipment
                candidates.push(...this.generateEquipmentRackPositions(deviceSpec));
                break;
            case 8: // Environmental Controls
                candidates.push(...this.generateEnvironmentalPositions(deviceSpec));
                break;
            default:
                candidates.push(...this.generateGenericPositions(deviceSpec));
        }
        
        return candidates;
    }
    
    private generateWiFiPositions(deviceSpec: any): any[] {
        const positions: any[] = [];
        
        // WiFi access points: optimal central ceiling positions
        for (const room of this.rooms) {
            if (room.area_sqft > 100) { // Only larger rooms
                const centerX = room.coordinates.minX + room.coordinates.width / 2;
                const centerY = room.coordinates.minY + room.coordinates.height / 2;
                
                positions.push({
                    x: centerX,
                    y: centerY,
                    roomId: room.id,
                    mountingHeight: deviceSpec.mounting_height_optimal_feet || 12,
                    placementType: 'ceiling_center',
                    priority: this.calculateRoomPriority(room, 'wifi')
                });
                
                // Additional positions for large rooms
                if (room.area_sqft > 400) {
                    positions.push({
                        x: centerX - room.coordinates.width * 0.25,
                        y: centerY,
                        roomId: room.id,
                        mountingHeight: deviceSpec.mounting_height_optimal_feet || 12,
                        placementType: 'ceiling_offset',
                        priority: this.calculateRoomPriority(room, 'wifi') * 0.8
                    });
                }
            }
        }
        
        return positions;
    }
    
    private generateCameraPositions(deviceSpec: any): any[] {
        const positions: any[] = [];
        
        // Security cameras: corner positions for optimal coverage
        for (const room of this.rooms) {
            const corners = [
                { x: room.coordinates.minX + 20, y: room.coordinates.minY + 20 },
                { x: room.coordinates.maxX - 20, y: room.coordinates.minY + 20 },
                { x: room.coordinates.minX + 20, y: room.coordinates.maxY - 20 },
                { x: room.coordinates.maxX - 20, y: room.coordinates.maxY - 20 }
            ];
            
            for (const corner of corners) {
                positions.push({
                    x: corner.x,
                    y: corner.y,
                    roomId: room.id,
                    mountingHeight: deviceSpec.mounting_height_optimal_feet || 8,
                    placementType: 'corner_mount',
                    priority: this.calculateRoomPriority(room, 'security')
                });
            }
        }
        
        return positions;
    }
    
    private generateEntertainmentPositions(deviceSpec: any): any[] {
        const positions: any[] = [];
        
        // Entertainment devices: wall positions with proper viewing angles
        for (const room of this.rooms) {
            if (room.type === 'living_room' || room.area_sqft > 200) {
                // TV/Speaker positions along walls
                const wallPositions = this.getWallPositions(room);
                
                for (const wallPos of wallPositions) {
                    positions.push({
                        x: wallPos.x,
                        y: wallPos.y,
                        roomId: room.id,
                        mountingHeight: deviceSpec.mounting_height_optimal_feet || 6,
                        placementType: 'wall_mount',
                        priority: this.calculateRoomPriority(room, 'entertainment')
                    });
                }
            }
        }
        
        return positions;
    }
    
    private generateSecurityPositions(deviceSpec: any): any[] {
        const positions: any[] = [];
        
        // Motion detectors: corner positions with optimal coverage
        for (const room of this.rooms) {
            // Optimal corner position for motion detection
            positions.push({
                x: room.coordinates.maxX - 30,
                y: room.coordinates.minY + 30,
                roomId: room.id,
                mountingHeight: 7, // Optimal height from research
                placementType: 'corner_motion',
                priority: this.calculateRoomPriority(room, 'security')
            });
        }
        
        // Door/window sensors: near openings
        for (const door of this.doors) {
            positions.push({
                x: door.position.x,
                y: door.position.y,
                roomId: null,
                mountingHeight: 7,
                placementType: 'door_sensor',
                priority: 1.0
            });
        }
        
        return positions;
    }
    
    private generateDoorbellPositions(deviceSpec: any): any[] {
        const positions: any[] = [];
        
        // Smart doorbells: exterior door positions
        for (const door of this.doors) {
            if (door.type === 'exterior') {
                positions.push({
                    x: door.position.x + 20,
                    y: door.position.y,
                    roomId: null,
                    mountingHeight: 4, // Research-based optimal height
                    placementType: 'doorbell_mount',
                    priority: 1.0
                });
            }
        }
        
        return positions;
    }
    
    private generateEquipmentRackPositions(deviceSpec: any): any[] {
        const positions: any[] = [];
        
        // Equipment racks: utility/basement areas, avoiding main living spaces
        for (const room of this.rooms) {
            if (room.type !== 'living_room' && room.type !== 'bedroom') {
                // Corner positions for equipment racks
                positions.push({
                    x: room.coordinates.minX + 50,
                    y: room.coordinates.minY + 50,
                    roomId: room.id,
                    mountingHeight: 0, // Floor-standing
                    placementType: 'floor_rack',
                    priority: this.calculateRoomPriority(room, 'equipment')
                });
            }
        }
        
        return positions;
    }
    
    private generateEnvironmentalPositions(deviceSpec: any): any[] {
        const positions: any[] = [];
        
        // Thermostats, smoke detectors: central wall positions
        for (const room of this.rooms) {
            // Wall-mounted position away from heat sources
            const centerX = room.coordinates.minX + room.coordinates.width * 0.3;
            const centerY = room.coordinates.minY + room.coordinates.height * 0.5;
            
            positions.push({
                x: centerX,
                y: centerY,
                roomId: room.id,
                mountingHeight: deviceSpec.mounting_height_optimal_feet || 5,
                placementType: 'wall_mount',
                priority: this.calculateRoomPriority(room, 'environmental')
            });
        }
        
        return positions;
    }
    
    private generateGenericPositions(deviceSpec: any): any[] {
        const positions: any[] = [];
        
        // Generic central positions
        for (const room of this.rooms) {
            const centerX = room.coordinates.minX + room.coordinates.width / 2;
            const centerY = room.coordinates.minY + room.coordinates.height / 2;
            
            positions.push({
                x: centerX,
                y: centerY,
                roomId: room.id,
                mountingHeight: deviceSpec.mounting_height_optimal_feet || 8,
                placementType: 'center',
                priority: 0.5
            });
        }
        
        return positions;
    }
    
    private getWallPositions(room: any): any[] {
        const positions = [];
        const margin = 30;
        
        // Positions along each wall
        const walls = [
            { x: room.coordinates.minX + margin, y: room.coordinates.minY + margin }, // Top-left
            { x: room.coordinates.maxX - margin, y: room.coordinates.minY + margin }, // Top-right
            { x: room.coordinates.minX + margin, y: room.coordinates.maxY - margin }, // Bottom-left
            { x: room.coordinates.maxX - margin, y: room.coordinates.maxY - margin }  // Bottom-right
        ];
        
        return walls;
    }
    
    private calculateRoomPriority(room: any, deviceType: string): number {
        let priority = 0.5;
        
        switch (deviceType) {
            case 'wifi':
                if (room.type === 'living_room') priority = 1.0;
                else if (room.type === 'bedroom') priority = 0.8;
                else if (room.type === 'kitchen') priority = 0.7;
                break;
            case 'security':
                if (room.type === 'living_room') priority = 1.0;
                else if (room.type === 'kitchen') priority = 0.8;
                break;
            case 'entertainment':
                if (room.type === 'living_room') priority = 1.0;
                else if (room.type === 'bedroom') priority = 0.6;
                break;
            case 'equipment':
                if (room.type === 'utility' || room.type === 'basement') priority = 1.0;
                else if (room.type === 'garage') priority = 0.8;
                else priority = 0.3;
                break;
        }
        
        // Adjust for room size
        if (room.area_sqft > 300) priority *= 1.1;
        else if (room.area_sqft < 100) priority *= 0.8;
        
        return Math.min(1.0, priority);
    }
    
    private async evaluatePlacement(
        candidate: any,
        deviceSpec: any,
        existingPlacements: any[],
        interferenceManager: InterferenceManager,
        preferences: any
    ): Promise<number> {
        let score = candidate.priority * 100; // Base score from priority
        
        // Coverage optimization score
        const coverageScore = this.calculateCoverageScore(candidate, deviceSpec);
        score += coverageScore * 40;
        
        // Interference penalty
        const interferenceScore = interferenceManager.calculateInterference(
            candidate, deviceSpec, existingPlacements
        );
        score -= interferenceScore * 30;
        
        // Accessibility score (can we actually install here?)
        const accessibilityScore = this.calculateAccessibilityScore(candidate);
        score *= accessibilityScore;
        
        // Installation difficulty penalty
        const installationScore = this.calculateInstallationScore(candidate, deviceSpec);
        score += installationScore * 10;
        
        // Separation from other devices of same type
        const separationScore = this.calculateSeparationScore(
            candidate, deviceSpec, existingPlacements
        );
        score += separationScore * 20;
        
        return score;
    }
    
    private calculateCoverageScore(candidate: any, deviceSpec: any): number {
        const coverageRadius = (deviceSpec.coverage_radius_feet || 25) * this.scale;
        let totalCoverage = 0;
        let totalArea = 0;
        
        for (const room of this.rooms) {
            const roomCenter = {
                x: room.coordinates.minX + room.coordinates.width / 2,
                y: room.coordinates.minY + room.coordinates.height / 2
            };
            
            const distance = Math.sqrt(
                Math.pow(candidate.x - roomCenter.x, 2) +
                Math.pow(candidate.y - roomCenter.y, 2)
            );
            
            const roomArea = room.area_sqft || 0;
            totalArea += roomArea;
            
            if (distance <= coverageRadius) {
                // Calculate overlap percentage
                const overlap = Math.max(0, 1 - distance / coverageRadius);
                totalCoverage += roomArea * overlap;
            }
        }
        
        return totalArea > 0 ? (totalCoverage / totalArea) * 100 : 0;
    }
    
    private calculateAccessibilityScore(candidate: any): number {
        const gridX = Math.floor(candidate.x / this.gridResolution);
        const gridY = Math.floor(candidate.y / this.gridResolution);
        
        if (gridY >= 0 && gridY < this.grid.length && 
            gridX >= 0 && gridX < this.grid[0].length) {
            return this.grid[gridY][gridX];
        }
        
        return 0; // Outside bounds
    }
    
    private calculateInstallationScore(candidate: any, deviceSpec: any): number {
        let score = 50; // Base installation score
        
        // Ceiling mounting is more complex
        if (candidate.placementType === 'ceiling_center') {
            score -= 15;
        }
        
        // Corner mounting may be challenging
        if (candidate.placementType === 'corner_mount') {
            score -= 10;
        }
        
        // Floor-standing is easier
        if (candidate.placementType === 'floor_rack') {
            score += 10;
        }
        
        return score;
    }
    
    private calculateSeparationScore(
        candidate: any,
        deviceSpec: any,
        existingPlacements: any[]
    ): number {
        const sameTypeDevices = existingPlacements.filter(
            p => p.deviceSpecId === deviceSpec.id
        );
        
        if (sameTypeDevices.length === 0) return 100;
        
        const minSeparation = (deviceSpec.coverage_radius_feet || 25) * this.scale * 0.7;
        let minDistance = Infinity;
        
        for (const existing of sameTypeDevices) {
            const distance = Math.sqrt(
                Math.pow(candidate.x - existing.position.x, 2) +
                Math.pow(candidate.y - existing.position.y, 2)
            );
            minDistance = Math.min(minDistance, distance);
        }
        
        if (minDistance < minSeparation * 0.5) return -50; // Too close
        if (minDistance < minSeparation) return 0;
        return Math.min(100, (minDistance / minSeparation) * 50);
    }
    
    private createPlacementResult(
        candidate: any,
        deviceSpec: any,
        score: number,
        instanceNumber: number
    ) {
        return {
            deviceSpecId: deviceSpec.id,
            position: { x: candidate.x, y: candidate.y },
            roomId: candidate.roomId,
            mountingHeight: candidate.mountingHeight,
            rotation: this.calculateOptimalRotation(candidate, deviceSpec),
            optimizationScore: score,
            coverageAnalysis: this.calculateDetailedCoverage(candidate, deviceSpec),
            interferenceAnalysis: { level: 'low', conflicts: [] },
            rationale: this.generatePlacementRationale(candidate, deviceSpec, score),
            installationNotes: this.generateInstallationNotes(candidate, deviceSpec),
            instanceName: this.generateInstanceName(deviceSpec, instanceNumber)
        };
    }
    
    private calculateOptimalRotation(candidate: any, deviceSpec: any): number {
        // Calculate optimal rotation based on room layout and device type
        if (deviceSpec.category_id === 2) { // Security cameras
            // Point toward room center or entrance
            const room = this.rooms.find(r => r.id === candidate.roomId);
            if (room) {
                const roomCenter = {
                    x: room.coordinates.minX + room.coordinates.width / 2,
                    y: room.coordinates.minY + room.coordinates.height / 2
                };
                const angle = Math.atan2(
                    roomCenter.y - candidate.y,
                    roomCenter.x - candidate.x
                ) * 180 / Math.PI;
                return angle;
            }
        }
        
        return 0; // Default rotation
    }
    
    private calculateDetailedCoverage(candidate: any, deviceSpec: any) {
        const coverageRadius = (deviceSpec.coverage_radius_feet || 25) * this.scale;
        const coveredRooms = [];
        let totalCoveragePercent = 0;
        
        for (const room of this.rooms) {
            const distance = Math.sqrt(
                Math.pow(candidate.x - (room.coordinates.minX + room.coordinates.width / 2), 2) +
                Math.pow(candidate.y - (room.coordinates.minY + room.coordinates.height / 2), 2)
            );
            
            if (distance <= coverageRadius) {
                const coveragePercent = Math.max(0, (1 - distance / coverageRadius) * 100);
                coveredRooms.push({
                    roomId: room.id,
                    coveragePercent: Math.round(coveragePercent)
                });
                totalCoveragePercent += coveragePercent * (room.area_sqft / 1000);
            }
        }
        
        return {
            effectiveRadius: Math.round(coverageRadius / this.scale),
            coveredRooms,
            totalCoveragePercent: Math.round(totalCoveragePercent)
        };
    }
    
    private generatePlacementRationale(
        candidate: any,
        deviceSpec: any,
        score: number
    ): string {
        const reasons = [];
        
        if (candidate.placementType === 'ceiling_center') {
            reasons.push('Central ceiling position provides optimal omnidirectional coverage');
        } else if (candidate.placementType === 'corner_mount') {
            reasons.push('Corner placement minimizes blind spots and maximizes field of view');
        } else if (candidate.placementType === 'wall_mount') {
            reasons.push('Wall mounting provides stable installation with optimal viewing angles');
        }
        
        if (candidate.priority > 0.8) {
            reasons.push('High-priority room for this device type');
        }
        
        reasons.push(`Optimization score: ${Math.round(score)}/100`);
        
        return reasons.join('. ');
    }
    
    private generateInstallationNotes(
        candidate: any,
        deviceSpec: any
    ): string {
        const notes = [];
        
        if (deviceSpec.mounting_height_optimal_feet) {
            notes.push(`Mount at ${deviceSpec.mounting_height_optimal_feet} feet height`);
        }
        
        if (deviceSpec.voltage_requirements) {
            notes.push(`Power requirements: ${deviceSpec.voltage_requirements}`);
        }
        
        if (candidate.placementType === 'ceiling_center') {
            notes.push('Ensure adequate ceiling support for mounting');
        }
        
        if (deviceSpec.installation_constraints) {
            notes.push(deviceSpec.installation_constraints);
        }
        
        return notes.join('. ');
    }
    
    private generateInstanceName(deviceSpec: any, instanceNumber: number): string {
        const baseName = deviceSpec.device_name.replace(/\s+/g, '_').toLowerCase();
        return instanceNumber > 0 ? `${baseName}_${instanceNumber + 1}` : baseName;
    }
    
    // Analysis methods
    calculateOptimizationMetrics(placements: any[], deviceSpecs: any[]) {
        const totalDevices = placements.length;
        const avgScore = placements.reduce((sum, p) => sum + p.optimizationScore, 0) / totalDevices;
        
        // Calculate coverage efficiency
        const coverageEfficiency = this.calculateOverallCoverage(placements, deviceSpecs);
        
        // Estimate installation complexity
        const complexityScore = this.calculateInstallationComplexity(placements);
        
        return {
            overallScore: Math.round(avgScore),
            coverageEfficiency: Math.round(coverageEfficiency),
            installationComplexity: this.categorizeComplexity(complexityScore),
            estimatedInstallTime: this.estimateInstallationTime(placements),
            totalDevices: totalDevices,
            roomsCovered: new Set(placements.map(p => p.roomId).filter(Boolean)).size
        };
    }
    
    private calculateOverallCoverage(placements: any[], deviceSpecs: any[]): number {
        // Calculate combined coverage across all rooms
        const roomCoverage = new Map();
        
        for (const room of this.rooms) {
            roomCoverage.set(room.id, 0);
        }
        
        for (const placement of placements) {
            if (placement.coverageAnalysis?.coveredRooms) {
                for (const coveredRoom of placement.coverageAnalysis.coveredRooms) {
                    const current = roomCoverage.get(coveredRoom.roomId) || 0;
                    roomCoverage.set(coveredRoom.roomId, Math.max(current, coveredRoom.coveragePercent));
                }
            }
        }
        
        const coverageValues = Array.from(roomCoverage.values());
        return coverageValues.reduce((sum, coverage) => sum + coverage, 0) / coverageValues.length;
    }
    
    private calculateInstallationComplexity(placements: any[]): number {
        let complexity = 0;
        
        for (const placement of placements) {
            if (placement.mountingHeight > 10) complexity += 2;
            else if (placement.mountingHeight > 7) complexity += 1;
            
            if (placement.position.placementType === 'ceiling_center') complexity += 2;
            else if (placement.position.placementType === 'corner_mount') complexity += 1;
        }
        
        return complexity / placements.length;
    }
    
    private categorizeComplexity(score: number): string {
        if (score < 1) return 'simple';
        if (score < 2) return 'moderate';
        return 'complex';
    }
    
    private estimateInstallationTime(placements: any[]): string {
        const baseTime = placements.length * 30; // 30 minutes per device
        const complexityMultiplier = 1.5; // Average complexity factor
        const totalMinutes = Math.round(baseTime * complexityMultiplier);
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (hours === 0) return `${minutes} minutes`;
        if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        return `${hours}h ${minutes}m`;
    }
    
    analyzeCoverage(placements: any[], deviceSpecs: any[]) {
        const roomAnalysis = this.rooms.map(room => {
            const coveringDevices = placements.filter(p => 
                p.coverageAnalysis?.coveredRooms?.some((cr: any) => cr.roomId === room.id)
            );
            
            const maxCoverage = Math.max(
                ...coveringDevices.map(p => 
                    p.coverageAnalysis.coveredRooms.find((cr: any) => cr.roomId === room.id)?.coveragePercent || 0
                ),
                0
            );
            
            return {
                roomId: room.id,
                roomName: room.name,
                coveragePercent: maxCoverage,
                deviceCount: coveringDevices.length
            };
        });
        
        return {
            totalCoverage: this.calculateOverallCoverage(placements, deviceSpecs),
            roomAnalysis,
            deviceCoverage: placements.map(p => ({
                deviceId: p.instanceName,
                effectiveCoverage: p.coverageAnalysis?.totalCoveragePercent || 0
            }))
        };
    }
    
    generateRecommendations(placements: any[], metrics: any): string[] {
        const recommendations = [];
        
        if (metrics.coverageEfficiency < 70) {
            recommendations.push('Consider adding additional devices to improve coverage in low-signal areas');
        }
        
        if (metrics.installationComplexity === 'complex') {
            recommendations.push('Professional installation recommended due to complex mounting requirements');
        }
        
        const wifiDevices = placements.filter(p => p.deviceSpecId <= 3); // Assuming WiFi devices have low IDs
        if (wifiDevices.length > 0) {
            recommendations.push('Ensure proper cable routing from WiFi access points to central equipment rack');
        }
        
        const securityDevices = placements.filter(p => p.deviceSpecId >= 4 && p.deviceSpecId <= 10);
        if (securityDevices.length > 0) {
            recommendations.push('Configure security devices to eliminate blind spots and ensure proper coverage overlap');
        }
        
        if (placements.length > 10) {
            recommendations.push('Consider implementing a central management system for device monitoring and control');
        }
        
        return recommendations;
    }
}

// Interference management class
class InterferenceManager {
    private devices: Array<{placement: any, spec: any}> = [];
    
    addDevice(placement: any, spec: any) {
        this.devices.push({placement, spec});
    }
    
    calculateInterference(
        candidate: any,
        deviceSpec: any,
        existingPlacements: any[]
    ): number {
        if (!deviceSpec.interference_frequency_ghz) return 0;
        
        let interferenceScore = 0;
        
        for (const existing of this.devices) {
            if (existing.spec.interference_frequency_ghz && 
                Math.abs(existing.spec.interference_frequency_ghz - deviceSpec.interference_frequency_ghz) < 0.1) {
                
                const distance = Math.sqrt(
                    Math.pow(candidate.x - existing.placement.position.x, 2) +
                    Math.pow(candidate.y - existing.placement.position.y, 2)
                );
                
                const interferenceRadius = (existing.spec.coverage_radius_feet || 25) * 12; // Convert to pixels
                
                if (distance < interferenceRadius) {
                    interferenceScore += 50 * (1 - distance / interferenceRadius);
                }
            }
        }
        
        return interferenceScore;
    }
    
    getInterferenceReport() {
        const conflicts = [];
        
        for (let i = 0; i < this.devices.length; i++) {
            for (let j = i + 1; j < this.devices.length; j++) {
                const device1 = this.devices[i];
                const device2 = this.devices[j];
                
                if (device1.spec.interference_frequency_ghz === device2.spec.interference_frequency_ghz) {
                    const distance = Math.sqrt(
                        Math.pow(device1.placement.position.x - device2.placement.position.x, 2) +
                        Math.pow(device1.placement.position.y - device2.placement.position.y, 2)
                    );
                    
                    const minDistance = Math.max(device1.spec.coverage_radius_feet, device2.spec.coverage_radius_feet) * 12;
                    
                    if (distance < minDistance * 0.7) {
                        conflicts.push({
                            device1: device1.placement.instanceName,
                            device2: device2.placement.instanceName,
                            distance: Math.round(distance / 12),
                            severity: 'medium'
                        });
                    }
                }
            }
        }
        
        return {
            interferenceLevel: conflicts.length === 0 ? 'low' : conflicts.length < 3 ? 'medium' : 'high',
            conflicts,
            recommendations: this.generateInterferenceRecommendations(conflicts)
        };
    }
    
    private generateInterferenceRecommendations(conflicts: any[]): string[] {
        const recommendations = [];
        
        if (conflicts.length > 0) {
            recommendations.push('Maintain recommended separation distances between devices on the same frequency');
            recommendations.push('Consider adjusting channels or frequencies to minimize interference');
        }
        
        return recommendations;
    }
}

// Generate wiring plan
function generateWiringPlan(placements: any[], rooms: any[], deviceSpecs: any[]) {
    const centralRack = placements.find(p => p.deviceSpecId === 13); // Equipment rack
    
    if (!centralRack) {
        return {
            centralRackLocation: null,
            cableRoutes: [],
            powerRequirements: calculatePowerRequirements(placements, deviceSpecs)
        };
    }
    
    const cableRoutes = placements
        .filter(p => p.deviceSpecId !== 13) // Exclude the rack itself
        .map(placement => {
            const deviceSpec = deviceSpecs.find(spec => spec.id === placement.deviceSpecId);
            const distance = Math.sqrt(
                Math.pow(placement.position.x - centralRack.position.x, 2) +
                Math.pow(placement.position.y - centralRack.position.y, 2)
            );
            
            return {
                deviceName: placement.instanceName,
                from: placement.position,
                to: centralRack.position,
                distance: Math.round(distance / 12), // Convert to feet
                cableType: determineCableType(deviceSpec),
                powerRequired: deviceSpec?.power_consumption_watts || 0
            };
        });
    
    return {
        centralRackLocation: centralRack.position,
        cableRoutes,
        powerRequirements: calculatePowerRequirements(placements, deviceSpecs),
        totalCableLength: cableRoutes.reduce((sum, route) => sum + route.distance, 0)
    };
}

function determineCableType(deviceSpec: any): string {
    if (deviceSpec?.category_id === 1) return 'Cat6 Ethernet'; // WiFi
    if (deviceSpec?.category_id === 2) return 'Cat6 Ethernet + Power'; // Security cameras
    if (deviceSpec?.voltage_requirements?.includes('PoE')) return 'Cat6 Ethernet (PoE)';
    if (deviceSpec?.voltage_requirements?.includes('AC')) return 'AC Power Cable';
    return 'DC Power Cable';
}

function calculatePowerRequirements(placements: any[], deviceSpecs: any[]) {
    let totalWatts = 0;
    const devicePower = [];
    
    for (const placement of placements) {
        const deviceSpec = deviceSpecs.find(spec => spec.id === placement.deviceSpecId);
        const watts = deviceSpec?.power_consumption_watts || 0;
        totalWatts += watts;
        
        if (watts > 0) {
            devicePower.push({
                deviceName: placement.instanceName,
                watts,
                voltage: deviceSpec?.voltage_requirements || 'Unknown'
            });
        }
    }
    
    return {
        totalWatts,
        estimatedAmps: Math.ceil(totalWatts / 120), // Assuming 120V
        deviceBreakdown: devicePower,
        recommendedCircuits: Math.ceil(totalWatts / 1800) // 15A circuits with safety margin
    };
}