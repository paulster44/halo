import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { mockSupabase } from '../test/mocks/supabase'

// Mock the logger
vi.mock('../lib/logger', () => ({
  authLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  },
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

// Mock the security module
vi.mock('../lib/security', () => {
  const mockValidateWithToast = vi.fn((data, schema, context) => {
    // For tests, always return the original data as if validation passed
    return data
  })
  
  return {
    validateWithToast: mockValidateWithToast,
    rateLimiter: {
      isRateLimited: vi.fn(() => false) // Never rate limited in tests
    }
  }
})

// Mock validation schemas
vi.mock('../lib/validation', () => ({
  signInSchema: {
    parse: vi.fn((data) => data)
  },
  signUpSchema: {
    omit: vi.fn(() => ({
      parse: vi.fn((data) => data)
    }))
  },
  resetPasswordSchema: {
    parse: vi.fn((data) => data)
  }
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock the auth sync hook
vi.mock('../hooks/useAuthSync', () => ({
  useAuthSync: () => ({ synced: true })
}))

// Test component to consume AuthContext
const TestComponent = () => {
  const { user, loading, signIn, signOut, signUp, resetPassword } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <button onClick={() => signIn('test@example.com', 'ValidPassword123!')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'ValidPassword123!')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => resetPassword('test@example.com')}>Reset Password</button>
    </div>
  )
}

const renderWithAuth = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide initial auth state', async () => {
    renderWithAuth()
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
    expect(screen.getByTestId('user')).toHaveTextContent('No User')
    
    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })
  })

  it('should throw error when used outside AuthProvider', () => {
    const TestErrorComponent = () => {
      useAuth()
      return <div>Test</div>
    }
    
    expect(() => render(<TestErrorComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    )
  })
})
