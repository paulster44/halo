import { describe, it, expect } from 'vitest'
import { validateData, sanitizeHtml, sanitizeUrl, sanitizeFileName } from '../lib/security'
import { z } from 'zod'

describe('Security utilities', () => {
  describe('validateData', () => {
    const testSchema = z.object({
      email: z.string().email(),
      age: z.number().min(0).max(120)
    })

    it('should validate correct data', () => {
      const data = { email: 'test@example.com', age: 25 }
      const result = validateData(data, testSchema)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(data)
      expect(result.errors).toBeUndefined()
    })

    it('should reject invalid data', () => {
      const data = { email: 'invalid-email', age: -5 }
      const result = validateData(data, testSchema)
      
      expect(result.success).toBe(false)
      expect(result.data).toBeUndefined()
      expect(result.errors).toBeDefined()
      expect(result.firstError).toBeDefined()
    })

    it('should handle non-zod errors', () => {
      const data = { email: 'test@example.com', age: 25 }
      const mockSchema = {
        parse: () => {
          throw new Error('Unexpected error')
        }
      }
      
      const result = validateData(data, mockSchema as any)
      
      expect(result.success).toBe(false)
      expect(result.firstError).toBe('An unexpected validation error occurred')
    })
  })

  describe('sanitizeHtml', () => {
    it('should escape HTML tags', () => {
      const input = '<script>alert("xss")</script>'
      const result = sanitizeHtml(input)
      
      expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;')
    })

    it('should handle regular text', () => {
      const input = 'Hello world!'
      const result = sanitizeHtml(input)
      
      expect(result).toBe('Hello world!')
    })
  })

  describe('sanitizeUrl', () => {
    it('should block javascript: URLs', () => {
      const input = 'javascript:alert("xss")'
      const result = sanitizeUrl(input)
      
      expect(result).toBe('#')
    })

    it('should block data: URLs', () => {
      const input = 'data:text/html,<script>alert(1)</script>'
      const result = sanitizeUrl(input)
      
      expect(result).toBe('#')
    })

    it('should allow valid HTTP URLs', () => {
      const input = 'https://example.com'
      const result = sanitizeUrl(input)
      
      expect(result).toBe('https://example.com')
    })

    it('should add https:// to URLs without protocol', () => {
      const input = 'example.com'
      const result = sanitizeUrl(input)
      
      expect(result).toBe('https://example.com')
    })

    it('should allow relative URLs', () => {
      const input = '/path/to/resource'
      const result = sanitizeUrl(input)
      
      expect(result).toBe('/path/to/resource')
    })
  })

  describe('sanitizeFileName', () => {
    it('should replace special characters', () => {
      const input = 'file name with spaces & symbols!@#$.pdf'
      const result = sanitizeFileName(input)
      
      expect(result).toBe('file_name_with_spaces_symbols_.pdf')
    })

    it('should limit length', () => {
      const input = 'a'.repeat(300)
      const result = sanitizeFileName(input)
      
      expect(result.length).toBeLessThanOrEqual(255)
    })

    it('should remove leading/trailing underscores', () => {
      const input = '___file___.txt'
      const result = sanitizeFileName(input)
      
      expect(result).toBe('file_.txt')
    })
  })
})
