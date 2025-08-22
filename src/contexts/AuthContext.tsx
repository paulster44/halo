import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useAuthSync } from '../hooks/useAuthSync'
import { authLogger } from '../lib/logger'
import { validateWithToast } from '../lib/security'
import { signInSchema, resetPasswordSchema, SignInInput, ResetPasswordInput } from '../lib/validation'
import { rateLimiter } from '../lib/security'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  authSynced: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Use auth sync hook
  const authSyncStatus = useAuthSync()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        authLogger.debug('Getting initial session')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          authLogger.error('Error getting session', { error: error.message })
        } else {
          authLogger.info('Initial session retrieved', { hasSession: !!session })
        }
        
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        authLogger.error('Unexpected error getting session', { error })
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        authLogger.info('Auth state changed', { 
          event, 
          userEmail: session?.user?.email || 'none',
          hasSession: !!session 
        })
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData?: any) => {
    // Rate limiting
    if (rateLimiter.isRateLimited(`signup_${email}`, 3, 15 * 60 * 1000)) {
      toast.error('Too many signup attempts. Please try again later.')
      return
    }

    // Validate input - use basic signIn schema for signup validation in this context
    const validatedData = validateWithToast(
      { email, password },
      signInSchema,
      'signup'
    ) as SignInInput | null
    
    if (!validatedData) {
      return
    }

    setLoading(true)
    try {
      authLogger.info('Starting sign up', { email })
      
      // Ensure userData is properly formatted as an object
      const sanitizedUserData = userData && typeof userData === 'object' 
        ? userData 
        : userData 
        ? { display_name: String(userData) }
        : {}
      
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: sanitizedUserData
        }
      })

      if (error) {
        authLogger.error('Sign up failed', { error: error.message, email })
        throw error
      }

      authLogger.info('Sign up successful', { email, userId: data.user?.id })
      toast.success('Account created successfully! Please check your email to verify your account.')
    } catch (error: any) {
      authLogger.error('Sign up error', { error: error.message, email })
      toast.error(error.message || 'Failed to create account')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    // Rate limiting
    if (rateLimiter.isRateLimited(`signin_${email}`, 5, 15 * 60 * 1000)) {
      toast.error('Too many login attempts. Please try again later.')
      return
    }

    // Validate input
    const validatedData = validateWithToast(
      { email, password },
      signInSchema,
      'signin'
    ) as SignInInput | null
    
    if (!validatedData) {
      return
    }

    setLoading(true)
    try {
      authLogger.info('Starting sign in', { email })
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password
      })

      if (error) {
        authLogger.error('Sign in failed', { error: error.message, email })
        throw error
      }

      authLogger.info('Sign in successful', { email, userId: data.user?.id })
      toast.success('Successfully signed in!')
    } catch (error: any) {
      authLogger.error('Sign in error', { error: error.message, email })
      toast.error(error.message || 'Failed to sign in')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      authLogger.info('Starting sign out', { userId: user?.id })
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        authLogger.error('Sign out failed', { error: error.message })
        throw error
      }
      
      authLogger.info('Sign out successful')
      toast.success('Successfully signed out!')
    } catch (error: any) {
      authLogger.error('Sign out error', { error: error.message })
      toast.error(error.message || 'Failed to sign out')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    // Rate limiting
    if (rateLimiter.isRateLimited(`reset_${email}`, 2, 60 * 60 * 1000)) {
      toast.error('Too many password reset attempts. Please try again later.')
      return
    }

    // Validate input
    const validatedData = validateWithToast(
      { email },
      resetPasswordSchema,
      'reset_password'
    ) as ResetPasswordInput | null
    
    if (!validatedData) {
      return
    }

    setLoading(true)
    try {
      authLogger.info('Starting password reset', { email })
      const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) {
        authLogger.error('Password reset failed', { error: error.message, email })
        throw error
      }
      
      authLogger.info('Password reset email sent', { email })
      toast.success('Password reset email sent! Please check your inbox.')
    } catch (error: any) {
      authLogger.error('Password reset error', { error: error.message, email })
      toast.error(error.message || 'Failed to send reset email')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    authSynced: authSyncStatus.synced
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}