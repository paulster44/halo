import { ZodError, ZodSchema } from 'zod'
import toast from 'react-hot-toast'
import { logger } from './logger'

// Validation result type
export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: Record<string, string>
  firstError?: string
}

// Validate data against a Zod schema
export function validateData<T>(
  data: unknown,
  schema: ZodSchema<T>,
  context?: string
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data)
    
    logger.debug('Validation successful', { context, dataKeys: Object.keys(data as any) })
    
    return {
      success: true,
      data: validatedData
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {}
      let firstError = ''
      
      error.errors.forEach((err, index) => {
        const field = err.path.join('.')
        errors[field] = err.message
        if (index === 0) {
          firstError = err.message
        }
      })
      
      logger.warn('Validation failed', {
        context,
        errors,
        dataKeys: Object.keys(data as any)
      })
      
      return {
        success: false,
        errors,
        firstError
      }
    }
    
    // Handle unexpected validation errors
    logger.error('Unexpected validation error', { context, error })
    
    return {
      success: false,
      errors: { _root: 'An unexpected validation error occurred' },
      firstError: 'An unexpected validation error occurred'
    }
  }
}

// Validate and show toast on error
export function validateWithToast<T>(
  data: unknown,
  schema: ZodSchema<T>,
  context?: string
): T | null {
  const result = validateData(data, schema, context)
  
  if (!result.success) {
    toast.error(result.firstError || 'Validation failed')
    return null
  }
  
  return result.data!
}

// Sanitize HTML input to prevent XSS
export function sanitizeHtml(input: string): string {
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

// Sanitize URL to prevent javascript: and data: schemes
export function sanitizeUrl(url: string): string {
  const sanitized = url.trim()
  
  // Check for dangerous schemes
  if (/^(javascript|data|vbscript):/i.test(sanitized)) {
    logger.warn('Dangerous URL scheme detected', { url: sanitized })
    return '#'
  }
  
  // Ensure URL starts with http:// or https:// or is relative
  if (!/^(https?:\/\/|\/)/i.test(sanitized)) {
    return `https://${sanitized}`
  }
  
  return sanitized
}

// Sanitize file name
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric chars except . and -
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .substring(0, 255) // Limit length
}

// Rate limiting helper
class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  
  isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    
    // Remove attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs)
    
    if (validAttempts.length >= maxAttempts) {
      logger.warn('Rate limit exceeded', { key, attempts: validAttempts.length, maxAttempts })
      return true
    }
    
    // Add current attempt
    validAttempts.push(now)
    this.attempts.set(key, validAttempts)
    
    return false
  }
  
  reset(key: string) {
    this.attempts.delete(key)
  }
}

export const rateLimiter = new RateLimiter()

// Form error handling utility
export function handleFormErrors(
  errors: Record<string, string>,
  setFieldError?: (field: string, error: string) => void
) {
  Object.entries(errors).forEach(([field, error]) => {
    if (setFieldError) {
      setFieldError(field, error)
    } else {
      toast.error(`${field}: ${error}`)
    }
  })
}

// Security headers validation
export function validateSecurityHeaders(response: Response): boolean {
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection'
  ]
  
  const missingHeaders = requiredHeaders.filter(
    header => !response.headers.has(header)
  )
  
  if (missingHeaders.length > 0) {
    logger.warn('Missing security headers', { missingHeaders })
    return false
  }
  
  return true
}

// Data masking for logging (to avoid logging sensitive data)
export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }
  
  const sensitiveFields = ['password', 'token', 'key', 'secret', 'credit_card', 'ssn']
  const masked = { ...data }
  
  Object.keys(masked).forEach(key => {
    const lowerKey = key.toLowerCase()
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      masked[key] = '***MASKED***'
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key])
    }
  })
  
  return masked
}
