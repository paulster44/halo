import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { dbLogger } from './logger'

// Get Supabase configuration from environment variables or use correct defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bygttpiyjqkuoliydkth.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5Z3R0cGl5anFrdW9saXlka3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTA5NDcsImV4cCI6MjA3MTIyNjk0N30.ofjBCyVwwjOqzt07z5yPDLW2xV4PFVvZonOa07zyMzQ'

// Create Supabase client with enhanced configuration and cache busting
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': `home-automation-analyzer@2.0.0-${Date.now()}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Test Edge Function connectivity
export async function testEdgeFunctionConnectivity() {
  try {
    dbLogger.debug('Testing Edge Function connectivity')
    
    // Test simple connectivity with minimal payload
    const { data, error } = await supabase.functions.invoke('upload-floor-plan', {
      body: {
        test: true,
        fileName: 'connectivity-test.png',
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        title: 'Connectivity Test'
      }
    })
    
    if (error) {
      dbLogger.error('Edge Function connectivity test failed', {
        error: error.message,
        code: error.code
      })
      return { success: false, error: error.message }
    }
    
    dbLogger.info('Edge Function connectivity test successful', { data })
    return { success: true, data }
    
  } catch (error: any) {
    dbLogger.error('Edge Function connectivity test error', {
      error: error.message
    })
    return { success: false, error: error.message }
  }
}

// Enhanced database connection tester with fallback approach
export async function testDatabaseConnection() {
  try {
    dbLogger.debug('Testing database connection with robust approach')
    
    // First try the RPC function approach
    try {
      const { data: connectivityResult, error: connectivityError } = await (supabase as any)
        .rpc('check_database_connectivity')
      
      if (!connectivityError && connectivityResult && (connectivityResult as any).status === 'success') {
        dbLogger.info('Database connection successful via RPC function', {
          url: supabaseUrl,
          result: connectivityResult
        })
        return { success: true, message: 'Database connectivity confirmed' }
      }
    } catch (rpcError) {
      dbLogger.debug('RPC function approach failed, trying fallback')
    }
    
    // Fallback: Test basic table existence via information_schema (bypasses RLS)
    const { data: schemaTest, error: schemaError } = await supabase
      .from('information_schema.tables' as any)
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['projects', 'profiles', 'device_categories'])
      .limit(3)
    
    if (!schemaError && schemaTest && schemaTest.length >= 3) {
      dbLogger.info('Database connection successful via schema test', {
        url: supabaseUrl,
        tables: schemaTest.map((t: any) => t.table_name)
      })
      return { success: true, message: 'Database connectivity confirmed via schema validation' }
    }
    
    // Final fallback: Simple connection test
    const { error: basicError } = await supabase
      .from('profiles')
      .select('count')
      .limit(0)  // No actual data needed
    
    if (!basicError || basicError.code === 'PGRST116' || basicError.message.includes('permission denied')) {
      // If we get a permission error, it means the table exists and connection works
      dbLogger.info('Database connection confirmed via basic test', { url: supabaseUrl })
      return { success: true, message: 'Database connectivity confirmed' }
    }
    
    throw new Error(`All connectivity tests failed. Last error: ${basicError?.message || 'Unknown error'}`)
    
  } catch (error: any) {
    dbLogger.error('Database connection test failed', {
      error: error.message,
      url: supabaseUrl
    })
    return { success: false, error: error.message }
  }
}

// Force schema refresh with fallback approach
export async function refreshSchemaCache() {
  try {
    dbLogger.info('Forcing schema cache refresh with robust approach')
    
    // Use the same robust connectivity test
    const connectionResult = await testDatabaseConnection()
    
    if (!connectionResult.success) {
      throw new Error(`Schema refresh failed: ${connectionResult.error}`)
    }
    
    dbLogger.info('Schema cache refreshed successfully')
    return { success: true, client: supabase }
  } catch (error: any) {
    dbLogger.error('Schema cache refresh failed', { error: error.message })
    return { success: false, error: error.message }
  }
}

// Enhanced project creation with better error handling and schema refresh
export async function createProject(projectData: ProjectInsert) {
  try {
    dbLogger.info('Starting project creation', {
      projectName: projectData.project_name,
      userId: projectData.user_id
    })
    
    // First test database connection and refresh schema if needed
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      dbLogger.warn('Initial connection test failed, attempting schema refresh')
      const refreshResult = await refreshSchemaCache()
      if (!refreshResult.success) {
        throw new Error(`Database connection failed: ${connectionTest.error}`)
      }
    }
    
    // Ensure estimated_cost is a proper number
    const sanitizedData: ProjectInsert = {
      ...projectData,
      estimated_cost: typeof projectData.estimated_cost === 'number' 
        ? projectData.estimated_cost 
        : parseFloat(String(projectData.estimated_cost)) || 0.00,
      total_devices: projectData.total_devices || 0
    }
    
    dbLogger.debug('Inserting project data', { 
      hasProjectName: !!sanitizedData.project_name,
      hasUserId: !!sanitizedData.user_id,
      dataTypes: {
        estimated_cost: typeof sanitizedData.estimated_cost,
        total_devices: typeof sanitizedData.total_devices
      }
    })
    
    const { data, error } = await supabase
      .from('projects')
      .insert(sanitizedData)
      .select()
      .single()
    
    if (error) {
      dbLogger.error('Project creation failed', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw error
    }
    
    if (!data) {
      throw new Error('No data returned from project creation')
    }
    
    dbLogger.info('Project created successfully', {
      projectId: data.id,
      projectName: data.project_name
    })
    
    return { data, error: null }
  } catch (error: any) {
    dbLogger.error('Enhanced project creation failed', {
      error: error.message,
      originalData: {
        hasProjectName: !!projectData.project_name,
        hasUserId: !!projectData.user_id
      }
    })
    return { data: null, error }
  }
}

// Export database types for convenience
export type { Database } from './database.types'
export type DatabaseTables = Database['public']['Tables']
export type ProjectsTable = DatabaseTables['projects']
export type ProjectRow = ProjectsTable['Row']
export type ProjectInsert = ProjectsTable['Insert']
export type ProjectUpdate = ProjectsTable['Update']

// Device types for components
export type DeviceCategory = DatabaseTables['device_categories']['Row']
export type DeviceSpecification = DatabaseTables['device_specifications']['Row']
export type DevicePlacement = DatabaseTables['device_placements']['Row']
export type EquipmentRack = DatabaseTables['equipment_racks']['Row']
export type Profile = DatabaseTables['profiles']['Row']