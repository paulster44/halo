import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';

interface AuthSyncResult {
  success: boolean;
  message?: string;
  error?: string;
  deploymentUrl?: string;
}

export function ManualAuthSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuthSyncResult | null>(null);

  const handleManualSync = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('🔄 Manually triggering auth sync...');
      
      // Get current deployment URL
      const currentUrl = window.location.origin;
      
      // Call the deployment auth sync edge function
      const { data, error } = await supabase.functions.invoke('deployment-auth-sync', {
        body: { deploymentUrl: currentUrl }
      });
      
      if (error) {
        setResult({
          success: false,
          error: error.message
        });
        return;
      }
      
      setResult({
        success: data?.success || false,
        message: data?.message || 'Auth sync completed',
        deploymentUrl: currentUrl
      });
      
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Manual Authentication Sync</h3>
        <p className="text-gray-600 mb-4">
          If you're experiencing authentication issues, you can manually trigger 
          a sync to update the Supabase configuration with the current deployment URL.
        </p>
        
        <Button 
          onClick={handleManualSync}
          disabled={isLoading}
          className="mb-4"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">♾️</span>
              Syncing...
            </>
          ) : (
            <>
              🔄 Sync Authentication
            </>
          )}
        </Button>
        
        {result && (
          <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-start">
              <span className="mr-2">
                {result.success ? '✅' : '❌'}
              </span>
              <div>
                <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.success ? 'Success!' : 'Error:'} {result.message || result.error}
                </p>
                {result.deploymentUrl && (
                  <p className="text-sm text-gray-600 mt-1">
                    Deployment URL: {result.deploymentUrl}
                  </p>
                )}
              </div>
            </div>
          </Alert>
        )}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">💡 How It Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• The system automatically detects your current deployment URL</li>
          <li>• It updates the Supabase Site URL and redirect URLs configuration</li>
          <li>• This ensures authentication works correctly on any deployment</li>
          <li>• The sync runs automatically when the app starts</li>
        </ul>
      </div>
    </div>
  );
}

export default ManualAuthSync;