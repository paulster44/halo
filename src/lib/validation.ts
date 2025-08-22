import { z } from 'zod'

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(254, 'Email is too long')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
  .optional()

// Authentication schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const resetPasswordSchema = z.object({
  email: emailSchema
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Project schemas
export const projectSchema = z.object({
  project_name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name is too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z
    .string()
    .max(500, 'Description is too long')
    .optional(),
  automation_tier: z
    .string()
    .min(1, 'Automation tier is required'),
  floor_plan_url: z
    .string()
    .url('Invalid floor plan URL')
    .optional(),
  estimated_cost: z
    .number()
    .min(0, 'Cost cannot be negative')
    .max(1000000, 'Cost is too high')
})

export const deviceSpecSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'Device name is required'),
  category: z.string().min(1, 'Category is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  price: z.number().min(0, 'Price cannot be negative'),
  installation_requirements: z.string().optional(),
  technical_specs: z.record(z.any()).optional()
})

// User preferences schemas
export const audioPreferencesSchema = z.object({
  type: z.enum(['stereo', 'surround', 'multi-room'], {
    errorMap: () => ({ message: 'Please select a valid audio type' })
  }),
  primaryRooms: z.array(z.string()).min(1, 'At least one room must be selected'),
  qualityLevel: z.enum(['standard', 'premium', 'audiophile'], {
    errorMap: () => ({ message: 'Please select a valid quality level' })
  }),
  outdoorAudio: z.boolean()
})

export const tvPlacementSchema = z.object({
  room: z.string().min(1, 'Room is required'),
  size: z.number().min(32, 'TV size must be at least 32 inches').max(100, 'TV size cannot exceed 100 inches'),
  wall: z.enum(['north', 'south', 'east', 'west'], {
    errorMap: () => ({ message: 'Please select a valid wall' })
  }),
  mounting: z.enum(['wall', 'stand', 'ceiling'], {
    errorMap: () => ({ message: 'Please select a valid mounting option' })
  })
})

export const userPreferencesSchema = z.object({
  tvPlacements: z.array(tvPlacementSchema),
  audioPreferences: audioPreferencesSchema,
  roomPriorities: z.array(z.string()),
  additionalRequests: z.string().max(1000, 'Additional requests are too long').optional()
})

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
  maxSize: z.number().optional().default(10 * 1024 * 1024), // 10MB default
  allowedTypes: z.array(z.string()).optional().default(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
}).refine(
  (data) => data.file.size <= data.maxSize,
  { message: 'File size is too large', path: ['file'] }
).refine(
  (data) => data.allowedTypes.includes(data.file.type),
  { message: 'File type is not allowed', path: ['file'] }
)

// API response schemas
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  })
})

export const apiSuccessSchema = z.object({
  data: z.any(),
  message: z.string().optional()
})

// Export types
export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type DeviceSpecInput = z.infer<typeof deviceSpecSchema>
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type TVPlacementInput = z.infer<typeof tvPlacementSchema>
export type AudioPreferencesInput = z.infer<typeof audioPreferencesSchema>
