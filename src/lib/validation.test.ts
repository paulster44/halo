import { describe, it, expect } from 'vitest'
import { 
  emailSchema, 
  passwordSchema, 
  signInSchema, 
  signUpSchema,
  projectSchema
} from '../lib/validation'

describe('Validation schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org'
      ]
      
      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow()
      })
    })

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        ''
      ]
      
      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow()
      })
    })
  })

  describe('passwordSchema', () => {
    it('should accept strong passwords', () => {
      const validPasswords = [
        'Password123!',
        'SecureP@ssw0rd',
        'MyStr0ng#Pass'
      ]
      
      validPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow()
      })
    })

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'password', // no uppercase, number, or special char
        'PASSWORD', // no lowercase, number, or special char
        'Password', // no number or special char
        'Pass1!', // too short
        'password123', // no uppercase or special char
      ]
      
      invalidPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow()
      })
    })
  })

  describe('signInSchema', () => {
    it('should accept valid sign-in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword'
      }
      
      expect(() => signInSchema.parse(validData)).not.toThrow()
    })

    it('should reject invalid sign-in data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      }
      
      expect(() => signInSchema.parse(invalidData)).toThrow()
    })
  })

  describe('signUpSchema', () => {
    it('should accept valid sign-up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'StrongP@ss123',
        confirmPassword: 'StrongP@ss123',
        firstName: 'John',
        lastName: 'Doe'
      }
      
      expect(() => signUpSchema.parse(validData)).not.toThrow()
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'StrongP@ss123',
        confirmPassword: 'DifferentP@ss123',
        firstName: 'John',
        lastName: 'Doe'
      }
      
      expect(() => signUpSchema.parse(invalidData)).toThrow()
    })
  })

  describe('projectSchema', () => {
    it('should accept valid project data', () => {
      const validData = {
        project_name: 'My Home Project',
        description: 'A smart home automation project',
        automation_tier: 'premium',
        estimated_cost: 5000
      }
      
      expect(() => projectSchema.parse(validData)).not.toThrow()
    })

    it('should reject invalid project names', () => {
      const invalidData = {
        project_name: '', // empty name
        automation_tier: 'premium',
        estimated_cost: 5000
      }
      
      expect(() => projectSchema.parse(invalidData)).toThrow()
    })

    it('should reject negative costs', () => {
      const invalidData = {
        project_name: 'My Project',
        automation_tier: 'premium',
        estimated_cost: -100
      }
      
      expect(() => projectSchema.parse(invalidData)).toThrow()
    })
  })
})
