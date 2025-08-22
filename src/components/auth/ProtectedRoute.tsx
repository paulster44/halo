import React, { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Cpu } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  adminOnly?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  adminOnly = false 
}) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Checking authentication status</p>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not logged in, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // If admin access is required, check user role
  if (adminOnly && user) {
    // We would need to fetch user profile to check role
    // For now, we'll implement a basic check
    return <Navigate to="/dashboard" replace />
  }

  // If user is logged in but trying to access public pages that should redirect, redirect to dashboard
  if (!requireAuth && user && (location.pathname === '/' || location.pathname.startsWith('/auth'))) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
