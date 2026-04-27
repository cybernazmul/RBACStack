# Adding a Custom Module

This guide uses **Products** as the example. Replace "product/Product/products" with your entity name.

## Step 1: modules.config.js

Add to `frontend/src/config/modules.config.js` AND `backend/src/config/modules.config.js`:

```js
{
  key: 'products',
  label: 'Products',
  icon: 'Package',
  path: '/products',
  core: false,
  permissions: ['products.view', 'products.create', 'products.edit', 'products.delete'],
},
```

## Step 2: Prisma Model

Add to `backend/prisma/schema.prisma`:

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  price       Decimal  @db.Decimal(10, 2)
  description String?  @db.Text
  category    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Then migrate:
```bash
cd backend
npx prisma migrate dev --name add_products
```

## Step 3: Backend Files

Create `backend/src/modules/products/`:

**products.schema.js**
```js
const { z } = require('zod')
const createProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  description: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
})
const updateProductSchema = createProductSchema.partial()
module.exports = { createProductSchema, updateProductSchema }
```

**products.service.js**
```js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findAll({ page = 1, limit = 10, search = '' } = {}) {
  const where = search ? { name: { contains: search } } : {}
  const [data, total] = await Promise.all([
    prisma.product.findMany({ where, skip: (page - 1) * limit, take: +limit, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ])
  return { data, total, page: +page, totalPages: Math.ceil(total / limit) }
}
async function findById(id) { return prisma.product.findUniqueOrThrow({ where: { id } }) }
async function create(data) { return prisma.product.create({ data }) }
async function update(id, data) { return prisma.product.update({ where: { id }, data }) }
async function remove(id) { return prisma.product.delete({ where: { id } }) }
module.exports = { findAll, findById, create, update, remove }
```

**products.controller.js** — standard CRUD handlers using `service.*` and `res.json({ success, data })`

**products.routes.js**
```js
const router = express.Router()
const { authenticate } = require('../../middleware/auth.middleware')
const { requirePermission } = require('../../middleware/permission.middleware')
const { auditMiddleware } = require('../../middleware/audit.middleware')
router.use(authenticate, auditMiddleware('Products'))
router.get('/', requirePermission('products.view'), ctrl.getAll)
router.post('/', requirePermission('products.create'), ctrl.create)
router.put('/:id', requirePermission('products.edit'), ctrl.update)
router.delete('/:id', requirePermission('products.delete'), ctrl.remove)
module.exports = router
```

## Step 4: Frontend Files

Create `frontend/src/pages/products/`:

**productsApi.js** — axios wrappers for each endpoint

**ProductsPage.jsx** — table with search, pagination, useQuery + useMutation, PermissionGuard on buttons

**ProductFormModal.jsx** — React Hook Form + Zod form, pre-fills on edit, clears on add

## Step 5: Seed Permissions

```bash
npm run seed
```

## Step 6: Verification

- [ ] Module appears in sidebar (logged in as Admin)
- [ ] `/products` loads without error
- [ ] Add Product form validates and saves
- [ ] Edit pre-fills and saves changes
- [ ] Delete shows confirmation dialog
- [ ] Audit Logs shows product.create / update / delete entries
- [ ] Login as Viewer — Add/Edit/Delete buttons are hidden
- [ ] `DELETE /api/products/:id` without token → 403
