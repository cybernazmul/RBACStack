/**
 * TEMPLATE MODULE — admin-template v1.0
 * To adapt for a new module:
 * 1. Duplicate this folder
 * 2. Replace 'product' → your entity (lowercase singular)
 * 3. Replace 'Product' → your entity (PascalCase singular)
 * 4. Replace 'products' → your entity (lowercase plural)
 * 5. Update fields to match your Prisma model
 * 6. Add entry to modules.config.js
 * 7. Run: npx prisma migrate dev --name add_[entity]
 * 8. Run: npm run seed
 */
const { z } = require('zod')

const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.number().positive('Price must be positive'),
  description: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
})

const updateProductSchema = createProductSchema.partial()

module.exports = { createProductSchema, updateProductSchema }
