import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface DeploymentSyncResult {
  success: boolean;
  message?: string;
  error?: string;
}

export function useDeploymentAuthSync() {
  const hasRun = useRef(false);
  const isRunning = useRef(false);

  useEffect(() => {
    // Only run once per app session
    if (hasRun.current || isRunning.current) return;
    
    const syncAuthConfiguration = async () => {
      try {
        isRunning.current = true;
        console.log('🔄 Syncing authentication configuration with current deployment...');
        
        // Get current deployment URL
        const currentUrl = window.location.origin;
        
        // Call the deployment auth sync edge function
        const { data, error } = await supabase.functions.invoke('deployment-auth-sync', {
          body: { deploymentUrl: currentUrl }
        });
        
        if (error) {
          console.warn('⚠️ Auth sync warning:', error);
          // Don't throw error - app should still work even if sync fails
          return;
        }
        
        if (data?.success) {
          console.log('✅ Authentication configuration synced successfully');
          console.log('📍 Deployment URL:', currentUrl);
        } else {
          console.warn('⚠️ Auth sync completed with warnings:', data);
        }
        
      } catch (error) {
        console.warn('⚠️ Deployment auth sync failed:', error);
        // Don't throw error - app should still work even if sync fails
      } finally {
        isRunning.current = false;
        hasRun.current = true;
      }
    };
    
    // Run sync after a short delay to ensure app is fully loaded
    const timeoutId = setTimeout(syncAuthConfiguration, 1000);
    
    return () => {
      clearTimeout(timeoutId);
      isRunning.current = false;
    };
  }, []);
  
  return null;
}

export default useDeploymentAuthSync;