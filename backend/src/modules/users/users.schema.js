// TEMPLATE FILE — part of admin-template v1.0
const { z } = require('zod')

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter'),
  roleId: z.string().min(1, 'Role is required'),
  isActive: z.boolean().optional().default(true),
})

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
})

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8)
    .regex(/[0-9]/)
    .regex(/[A-Z]/),
})

module.exports = { createUserSchema, updateUserSchema, resetPasswordSchema }
