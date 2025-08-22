import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface AuthSyncStatus {
  synced: boolean
  error?: string
  lastSync?: string
}

// Hook to automatically sync authentication configuration
export const useAuthSync = () => {
  const [syncStatus, setSyncStatus] = useState<AuthSyncStatus>({ synced: false })

  useEffect(() => {
    const syncAuthConfig = async () => {
      try {
        console.log('Syncing authentication configuration...')
        
        const currentUrl = window.location.origin
        
        const { data, error } = await supabase.functions.invoke('auto-auth-config', {
          body: {
            currentDeploymentUrl: currentUrl
          }
        })

        if (error) {
          console.error('Auth sync failed:', error)
          setSyncStatus({ 
            synced: false, 
            error: error.message,
            lastSync: new Date().toISOString()
          })
        } else {
          console.log('Auth sync successful:', data)
          setSyncStatus({ 
            synced: true,
            lastSync: new Date().toISOString()
          })
          
          // Store sync status in localStorage
          localStorage.setItem('auth-sync-status', JSON.stringify({
            synced: true,
            url: currentUrl,
            timestamp: new Date().toISOString()
          }))
        }
      } catch (error) {
        console.error('Auth sync error:', error)
        setSyncStatus({ 
          synced: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          lastSync: new Date().toISOString()
        })
      }
    }

    // Check if we've already synced for this URL recently
    const lastSyncStatus = localStorage.getItem('auth-sync-status')
    if (lastSyncStatus) {
      try {
        const parsed = JSON.parse(lastSyncStatus)
        const timeDiff = new Date().getTime() - new Date(parsed.timestamp).getTime()
        const oneHour = 60 * 60 * 1000
        
        // If synced within the last hour for this URL, skip sync
        if (parsed.synced && parsed.url === window.location.origin && timeDiff < oneHour) {
          setSyncStatus({ 
            synced: true,
            lastSync: parsed.timestamp
          })
          return
        }
      } catch (e) {
        // Invalid localStorage data, proceed with sync
      }
    }

    // Perform auth sync
    syncAuthConfig()
  }, [])

  return syncStatus
}

// Component to display auth sync status (for debugging)
export const AuthSyncIndicator: React.FC = () => {
  const syncStatus = useAuthSync()

  if (process.env.NODE_ENV !== 'development') {
    return null // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
        syncStatus.synced 
          ? 'bg-green-100 text-green-800' 
          : syncStatus.error
          ? 'bg-red-100 text-red-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {syncStatus.synced 
          ? '✓ Auth Synced' 
          : syncStatus.error
          ? '✗ Auth Sync Failed'
          : '⟳ Syncing Auth...'}
      </div>
    </div>
  )
}