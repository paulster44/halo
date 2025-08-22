import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

interface ErrorInfo {
  componentStack: string
  errorBoundary?: string
  errorBoundaryStack?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  level?: 'page' | 'component' | 'critical'
}

class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log error details
    console.group('🚨 Error Boundary Caught Error')
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Component Stack:', errorInfo.componentStack)
    console.groupEnd()

    // Call onError prop if provided
    this.props.onError?.(error, errorInfo)

    // Report to error tracking service (placeholder)
    this.reportError(error, errorInfo)
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // In a real app, you would send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    // Store in localStorage as fallback for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('error_reports') || '[]')
      existingErrors.push(errorReport)
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.shift()
      }
      localStorage.setItem('error_reports', JSON.stringify(existingErrors))
    } catch (e) {
      console.warn('Failed to store error report in localStorage:', e)
    }
  }

  private handleRetry = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
    
    // Add a small delay to prevent immediate re-rendering issues
    this.retryTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: this.generateErrorId()
      })
    }, 100)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private copyErrorDetails = () => {
    const { error, errorInfo, errorId } = this.state
    const errorDetails = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2)).then(() => {
      // Could show a toast here
      console.log('Error details copied to clipboard')
    })
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorId } = this.state
      const { level = 'component', showDetails = false } = this.props
      
      const isPageLevel = level === 'page'
      const isCritical = level === 'critical'

      return (
        <div className={`flex items-center justify-center p-4 ${
          isPageLevel ? 'min-h-screen bg-gray-50' : 'min-h-[400px]'
        }`}>
          <Card className={`w-full max-w-lg ${isCritical ? 'border-red-500' : 'border-yellow-500'}`}>
            <CardHeader className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isCritical ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <AlertTriangle className={`w-8 h-8 ${
                  isCritical ? 'text-red-600' : 'text-yellow-600'
                }`} />
              </div>
              <CardTitle className="text-xl">
                {isCritical ? 'Critical Error' : 'Something went wrong'}
              </CardTitle>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Error ID: {errorId}
                </Badge>
                <Badge variant={isCritical ? 'destructive' : 'secondary'} className="text-xs">
                  {level.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">
                {isCritical 
                  ? 'A critical error has occurred that requires immediate attention.'
                  : 'We apologize for the inconvenience. This error has been automatically reported.'}
              </p>
              
              {showDetails && error && (
                <div className="bg-gray-50 border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Error Details:</h4>
                  <code className="text-xs text-red-600 block whitespace-pre-wrap">
                    {error.message}
                  </code>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                {isPageLevel && (
                  <Button 
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                )}
                
                {(isCritical || showDetails) && (
                  <Button 
                    onClick={this.copyErrorDetails}
                    variant="outline"
                    size="sm"
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Copy Details
                  </Button>
                )}
              </div>
              
              {isCritical && (
                <Button 
                  onClick={this.handleReload}
                  variant="destructive"
                  className="w-full"
                  size="sm"
                >
                  Reload Application
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export { EnhancedErrorBoundary }

// Convenience wrapper components
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary level="page" showDetails={false}>
    {children}
  </EnhancedErrorBoundary>
)

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary level="component" showDetails={false}>
    {children}
  </EnhancedErrorBoundary>
)

export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary level="critical" showDetails={true}>
    {children}
  </EnhancedErrorBoundary>
)

// Keep the old ErrorBoundary for backward compatibility
export { ErrorBoundary } from './ErrorBoundary'
