import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileImage, X, Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import toast from 'react-hot-toast'

interface FloorPlanUploadProps {
  onUploadComplete: (floorPlan: any) => void
}

const FloorPlanUpload: React.FC<FloorPlanUploadProps> = ({ onUploadComplete }) => {
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Convert file to base64
      return new Promise<any>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = async () => {
          try {
            const base64Data = reader.result as string
            
            console.log('Starting floor plan upload...')
            console.log('File size:', file.size, 'bytes')
            console.log('File type:', file.type)
            
            // Check authentication status before upload
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError) {
              console.warn('Auth check failed:', authError.message)
            } else {
              console.log('User authenticated:', user ? 'Yes' : 'No')
            }

            // Use Edge Function to upload floor plan
            const { data, error } = await supabase.functions.invoke('upload-floor-plan', {
              body: {
                imageData: base64Data,
                fileName: file.name,
                title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                description: `Uploaded floor plan: ${file.name}`
              }
            })

            console.log('Edge Function response:', { data, error })

            if (error) {
              console.error('Edge Function error:', error)
              throw new Error(`Upload failed: ${error.message || 'Unknown error'}`)
            }
            
            if (!data || !data.data || !data.data.floorPlan) {
              console.error('Invalid response structure:', data)
              throw new Error('Invalid response from upload service')
            }
            
            console.log('Upload successful, floor plan:', data.data.floorPlan)
            resolve(data.data.floorPlan)
          } catch (err) {
            reject(err)
          }
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },
    onError: (error: any) => {
      console.error('Upload mutation error:', error)
      const errorMessage = error?.message || 'Floor plan upload failed'
      toast.error(errorMessage)
    },
    onSuccess: (floorPlan) => {
      toast.success('Floor plan uploaded successfully!')
      // Convert floorPlan format to match what ProjectCreationPage expects
      const compatibleFloorPlan = {
        id: floorPlan.id,
        title: floorPlan.title,
        url: floorPlan.image_url, // Convert image_url to url
        analysis_results: floorPlan.analysis_results
      }
      onUploadComplete(compatibleFloorPlan)
    }
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB')
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a JPG, PNG, or PDF file')
        return
      }
      
      uploadMutation.mutate(file)
    }
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: uploadMutation.isPending
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : uploadMutation.isPending
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input {...getInputProps()} />
        
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <div>
              <p className="text-lg font-medium text-gray-900">Uploading Floor Plan...</p>
              <p className="text-sm text-gray-600">Processing your blueprint for analysis</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              {isDragActive ? (
                <Upload className="w-8 h-8 text-blue-600" />
              ) : (
                <FileImage className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your floor plan here' : 'Upload Floor Plan'}
              </p>
              <p className="text-sm text-gray-600">
                {isDragActive 
                  ? 'Release to upload' 
                  : 'Drag & drop or click to select (JPG, PNG, PDF - max 50MB)'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {uploadMutation.error && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>
            {uploadMutation.error.message || 'Upload failed. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supported formats: JPEG, PNG, PDF</p>
        <p>• Maximum file size: 50MB</p>
        <p>• For best results, use high-resolution images with clear room boundaries</p>
        <p>• Hand-drawn sketches are supported and will be processed automatically</p>
      </div>
    </div>
  )
}

export default FloorPlanUpload