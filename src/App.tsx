import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { PageErrorBoundary, ComponentErrorBoundary } from './components/EnhancedErrorBoundary'
import { useDatabaseInitialization } from './hooks/useDatabaseInitialization'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import ProjectCreationPage from './pages/ProjectCreationPage'
import ProjectPage from './pages/ProjectPage'
import AnalysisPage from './pages/AnalysisPage'
import ReportsPage from './pages/ReportsPage'
import ClientDashboard from './pages/ClientDashboard'
import AdminPanel from './pages/AdminPanel'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import AuthCallback from './components/auth/AuthCallback'
import ForgotPassword from './components/auth/ForgotPassword'
import useDeploymentAuthSync from './hooks/useDeploymentAuthSync'
import { logger } from './lib/logger'
import { Button } from './components/ui/button'
import { AlertTriangle, RefreshCw, Database } from 'lucide-react'
import './App.css'

// Configure React Query with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry for authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false
        }
        // Retry up to 2 times for other errors
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  logger.critical('Unhandled promise rejection', {
    error: event.reason,
    type: 'unhandledrejection'
  })
  event.preventDefault() // Prevent the default browser behavior
})

// Global error handler for JavaScript errors
window.addEventListener('error', (event) => {
  logger.critical('Global JavaScript error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  })
})

// Database connection status component
const DatabaseConnectionStatus: React.FC<{
  connected: boolean
  loading: boolean
  error: string | null
  onRetry: () => void
}> = ({ connected, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing Database</h2>
          <p className="text-gray-600">Connecting to database and refreshing schema cache...</p>
        </div>
      </div>
    )
  }

  if (error && !connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Database Connection Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  return null
}

function App() {
  // Auto-sync authentication configuration on app startup
  useDeploymentAuthSync()
  
  // Initialize database connection and schema cache
  const { connected, loading, error, retryConnection } = useDatabaseInitialization()
  
  // Show database connection status if not connected
  if (!connected) {
    return (
      <PageErrorBoundary>
        <DatabaseConnectionStatus
          connected={connected}
          loading={loading}
          error={error}
          onRetry={retryConnection}
        />
      </PageErrorBoundary>
    )
  }
  
  return (
    <PageErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ComponentErrorBoundary>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={
                    <ProtectedRoute requireAuth={false}>
                      <ComponentErrorBoundary>
                        <LandingPage />
                      </ComponentErrorBoundary>
                    </ProtectedRoute>
                  } />
                  
                  {/* Auth Routes */}
                  <Route path="/auth/login" element={
                    <ProtectedRoute requireAuth={false}>
                      <ComponentErrorBoundary>
                        <LoginForm />
                      </ComponentErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/auth/register" element={
                    <ProtectedRoute requireAuth={false}>
                      <ComponentErrorBoundary>
                        <RegisterForm />
                      </ComponentErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/auth/callback" element={
                    <ProtectedRoute requireAuth={false}>
                      <ComponentErrorBoundary>
                        <AuthCallback />
                      </ComponentErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/auth/forgot-password" element={
                    <ProtectedRoute requireAuth={false}>
                      <ComponentErrorBoundary>
                        <ForgotPassword />
                      </ComponentErrorBoundary>
                    </ProtectedRoute>
                  } />
                  
                  {/* Protected Client Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <ComponentErrorBoundary>
                        <ClientDashboard />
                      </ComponentErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/create-project" element={
                    <ProtectedRoute>
                      <ComponentErrorBoundary>
                        <ProjectCreationPage />
                      </ComponentErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/project/:id" element={
                    <ProtectedRoute>
                      <ComponentErrorBoundary>
                        <ProjectPage />
                      </ComponentErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/analysis/:id" element={
                    <ProtectedRoute>
                      <ComponentErrorBoundary>
                        <AnalysisPage />
                      </ComponentErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/reports/:id" element={
                    <ProtectedRoute>
                      <ComponentErrorBoundary>
                        <ReportsPage />
                      </ComponentErrorBoundary>
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                      <ComponentErrorBoundary>
                        <AdminPanel />
                      </ComponentErrorBoundary>
                    </ProtectedRoute>
                  } />
                </Routes>
                
                {/* Enhanced Toast Notifications */}
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#1F2937',
                      color: '#F9FAFB',
                      border: '1px solid #374151',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    },
                    success: {
                      style: {
                        background: '#065F46',
                        color: '#D1FAE5',
                        border: '1px solid #10B981',
                      },
                    },
                    error: {
                      style: {
                        background: '#7F1D1D',
                        color: '#FEE2E2',
                        border: '1px solid #EF4444',
                      },
                      duration: 6000,
                    },
                  }}
                />
              </div>
            </Router>
          </AuthProvider>
        </ComponentErrorBoundary>
      </QueryClientProvider>
    </PageErrorBoundary>
  )
}

export default App