import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../components/ErrorBoundary'

// Component that throws an error
const ThrowingComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Working component</div>
}

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Working component')).toBeInTheDocument()
  })

  it('should display error UI when child component throws', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = () => {}
    
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    expect(screen.getByText(/Test error message/)).toBeInTheDocument()
    
    // Restore console.error
    console.error = originalError
  })

  it('should serialize non-Error objects', () => {
    const originalError = console.error
    console.error = () => {}
    
    // Component that throws a non-Error object
    const ThrowingNonErrorComponent = () => {
      throw { message: 'Custom error object', code: 500 }
    }
    
    render(
      <ErrorBoundary>
        <ThrowingNonErrorComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    expect(screen.getByText(/Custom error object/)).toBeInTheDocument()
    
    console.error = originalError
  })
})
