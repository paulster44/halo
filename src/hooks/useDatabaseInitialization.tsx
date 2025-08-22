import { useEffect, useState } from 'react'
import { testDatabaseConnection, refreshSchemaCache } from '../lib/supabase'
import { dbLogger } from '../lib/logger'
import toast from 'react-hot-toast'

interface DatabaseStatus {
  connected: boolean
  schemaRefreshed: boolean
  loading: boolean
  error: string | null
}

export const useDatabaseInitialization = () => {
  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    schemaRefreshed: false,
    loading: true,
    error: null
  })

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        dbLogger.info('Initializing database connection and schema cache')
        setStatus(prev => ({ ...prev, loading: true, error: null }))

        // First, test basic database connection
        dbLogger.debug('Testing initial database connection')
        const connectionTest = await testDatabaseConnection()
        
        if (!connectionTest.success) {
          dbLogger.warn('Initial connection test failed, attempting schema refresh')
          
          // If connection fails, try refreshing schema cache
          const refreshResult = await refreshSchemaCache()
          
          if (!refreshResult.success) {
            throw new Error(`Database initialization failed: ${refreshResult.error}`)
          }
          
          dbLogger.info('Schema cache refreshed successfully')
          setStatus(prev => ({ ...prev, schemaRefreshed: true }))
          
          // Test connection again after refresh
          const retestConnection = await testDatabaseConnection()
          if (!retestConnection.success) {
            throw new Error(`Connection still failed after schema refresh: ${retestConnection.error}`)
          }
        }
        
        dbLogger.info('Database initialization completed successfully')
        setStatus({
          connected: true,
          schemaRefreshed: true,
          loading: false,
          error: null
        })
        
      } catch (error: any) {
        dbLogger.error('Database initialization failed', {
          error: error.message
        })
        
        setStatus({
          connected: false,
          schemaRefreshed: false,
          loading: false,
          error: error.message
        })
        
        // Show error toast
        toast.error(`Database connection failed: ${error.message}`, {
          duration: 8000,
          id: 'database-error' // Prevent duplicate toasts
        })
      }
    }

    initializeDatabase()
  }, [])

  const retryConnection = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      dbLogger.info('Retrying database connection')
      
      // Force schema refresh on retry
      const refreshResult = await refreshSchemaCache()
      if (!refreshResult.success) {
        throw new Error(`Schema refresh failed: ${refreshResult.error}`)
      }
      
      const connectionTest = await testDatabaseConnection()
      if (!connectionTest.success) {
        throw new Error(`Connection test failed: ${connectionTest.error}`)
      }
      
      setStatus({
        connected: true,
        schemaRefreshed: true,
        loading: false,
        error: null
      })
      
      toast.success('Database connection restored')
      dbLogger.info('Database connection retry successful')
      
    } catch (error: any) {
      dbLogger.error('Database connection retry failed', {
        error: error.message
      })
      
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
      
      toast.error(`Retry failed: ${error.message}`)
    }
  }

  return {
    ...status,
    retryConnection
  }
}
