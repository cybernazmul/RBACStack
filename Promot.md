# Universal Full-Stack Admin Dashboard + RBAC
## Master Prompt File — AI Agent Reference

---

## PROMPT 0 — Development Workflow (Read Before Every Project)

### Description for AI Agent
> This is the master development workflow. Every time a new application is built
> on top of this template, this workflow must be followed in exact order.
> No phase should be skipped or done out of sequence. The template is specifically
> designed around this sequence — Config → Database → Backend → Frontend →
> Permissions → Test → Deploy. Any agent helping a developer build on this
> template must understand this workflow before writing a single line of code.
> If the developer has not completed Phase 0 (planning), the agent must ask
> the planning questions before proceeding to any code generation.

### Agent Checklist
- [ ] Developer has answered all 4 Phase 0 planning questions before any code
- [ ] `app.config.js` updated with project branding before running setup
- [ ] `modules.config.js` updated with all custom modules before running setup
- [ ] `node scripts/setup.js` run successfully before any module code is written
- [ ] ALL Prisma models designed and migrated before any backend code is written
- [ ] Backend fully tested (Postman/Thunder Client) before frontend is started
- [ ] Roles and permissions configured and QA tested before deployment
- [ ] Full QA checklist completed before handing to client

---

```
You are a senior full-stack developer building a new application on top of the
universal admin dashboard template. Read the SYSTEM CONTEXT in this file before
proceeding. This prompt defines the exact workflow to follow for every new project.
Never skip phases. Never do phases out of order.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 0 — PLAN BEFORE TOUCHING CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before writing any code, the developer must answer these 4 questions.
If any answer is missing, ASK the developer before proceeding.

Q1. What does this application do?
    → Write 2-3 sentences describing the business purpose.
    → Example: "Inventory management system for a garment factory.
      Staff track raw materials, production orders, and finished goods."

Q2. Who are the users and what roles do they need?
    → List every role in the organization.
    → Example: Admin, Warehouse Manager, Production Staff, Accountant, Viewer

Q3. What modules (pages/features) does the app need?
    → List every page beyond the core template pages.
    → Example: Inventory, Suppliers, Purchase Orders, Production Orders,
      Stock Reports, Quality Control

Q4. What data does each module manage?
    → For each module, list the fields/columns.
    → Example: Inventory Item → name, SKU, category, quantity,
      unit, reorder level, supplier, status

OUTPUT of Phase 0:
- A written summary of what the app does
- A list of roles with their responsibilities
- A module list with fields for each module
- A rough data relationship map (which modules connect to which)

Do NOT proceed to Phase 1 until all 4 questions are answered.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — CLONE & CONFIGURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commands to run:
  git clone https://github.com/yourteam/admin-template.git [project-name]
  cd [project-name]
  rm -rf .git && git init
  git add . && git commit -m "initial: from admin-template v1.0"

Then edit ONLY these 2 files:

FILE 1: frontend/src/config/app.config.js
Change:
- appName → your project name
- appLogo → path to your logo file
- theme.primaryColor → your brand hex color
- theme.darkMode → true or false (default theme)
Do NOT change api.baseUrl (it reads from .env automatically)

FILE 2: frontend/src/config/modules.config.js
Keep ALL 6 core modules (dashboard, users, roles, permissions, audit-logs, settings).
Add one object per custom module from your Phase 0 module list:
{
  key: 'module-slug',          // lowercase, hyphens, no spaces
  label: 'Module Label',       // display name in sidebar
  icon: 'LucideIconName',      // exact Lucide React icon name
  path: '/module-slug',        // must match key with leading slash
  core: false,                 // always false for custom modules
  permissions: [               // follow module.action naming
    'module-slug.view',
    'module-slug.create',
    'module-slug.edit',
    'module-slug.delete',
  ],
}

Copy the updated modules.config.js to backend/src/config/modules.config.js
(both files must always be identical)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — SETUP & VERIFY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run:
  node scripts/setup.js

This automatically:
  ✓ Copies .env.example files
  ✓ Installs all npm dependencies
  ✓ Creates all database tables via Prisma
  ✓ Seeds default roles, permissions, and admin user

Then run:
  npm run dev

Verify these work before proceeding:
  [ ] http://localhost:5173 loads without errors
  [ ] Login with admin@admin.com / Admin@1234 works
  [ ] Sidebar shows all your custom module names (pages will be empty — that is correct)
  [ ] Dark mode toggle works
  [ ] No console errors in browser

Do NOT proceed to Phase 3 until all verifications pass.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — DESIGN THE DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT: Design ALL database models BEFORE writing any backend or frontend code.
Changing models after building pages causes cascading breakage.

For every custom module from Phase 0, add a Prisma model to:
  backend/prisma/schema.prisma

Rules every model must follow (from System Context):
- id: String @id @default(uuid())
- isActive: Boolean @default(true)   ← for soft delete
- createdAt: DateTime @default(now())
- updatedAt: DateTime @updatedAt
- Always define both sides of relations

Example model:
  model InventoryItem {
    id           String    @id @default(uuid())
    name         String
    sku          String    @unique
    category     String
    quantity     Int       @default(0)
    unit         String
    reorderLevel Int       @default(10)
    supplierId   String?
    supplier     Supplier? @relation(fields: [supplierId], references: [id])
    isActive     Boolean   @default(true)
    createdAt    DateTime  @default(now())
    updatedAt    DateTime  @updatedAt
  }

After adding ALL models, run ONE migration:
  cd backend
  npx prisma migrate dev --name add_custom_modules

Verify in MySQL that all tables were created correctly before proceeding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — BUILD BACKEND MODULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each custom module, create these 4 files:
  backend/src/modules/[module-key]/
  ├── [module].schema.js      ← Zod validation schemas
  ├── [module].service.js     ← Prisma database queries
  ├── [module].controller.js  ← HTTP request handlers
  └── [module].routes.js      ← Express routes + permission guards

Build in this exact order per module:
  1. schema.js first  → define what valid data looks like
  2. service.js second → write the database queries
  3. controller.js third → handle HTTP req/res, call service
  4. routes.js last → wire routes, apply requirePermission + auditMiddleware

Use PROMPT 10 from this file to generate each module.
Replace 'Products'/'product'/'products' with your module name.

Every module MUST follow the patterns from System Context:
- API response format: { success, data, message } or { success, error }
- Paginated response: { success, data, total, page, totalPages }
- Permission guards: requirePermission('module.action') on every route
- Audit middleware: auditMiddleware('ModuleName') on all routes

Test each module with Postman or Thunder Client BEFORE building the frontend:
  [ ] GET /api/[module] returns paginated list
  [ ] POST /api/[module] creates a record
  [ ] PUT /api/[module]/:id updates a record
  [ ] DELETE /api/[module]/:id deletes a record
  [ ] All routes return 403 without a valid JWT token
  [ ] All routes return 403 with a token that lacks the required permission

Do NOT start Phase 5 until ALL backend modules are tested.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5 — BUILD FRONTEND MODULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each custom module, create these 3 files:
  frontend/src/pages/[module-key]/
  ├── [module]Api.js           ← axios API call functions
  ├── [Module]Page.jsx         ← main page (table, search, pagination)
  └── [Module]FormModal.jsx    ← add/edit form modal

Build in this exact order per module:
  1. [module]Api.js first → define all API call functions
  2. [Module]Page.jsx second → build the table + search + pagination
  3. [Module]FormModal.jsx third → build the add/edit form

Every page MUST:
- Use useQuery for data fetching (never useState + useEffect for API calls)
- Use useMutation for create/update/delete
- Call queryClient.invalidateQueries after every successful mutation
- Show loading skeleton while data loads (not a spinner)
- Show empty state when table has no records
- Show toast notification on every success and error
- Wrap every action button in PermissionGuard

Every form MUST:
- Use React Hook Form + Zod for validation
- Show inline error messages under each field
- Pre-fill all fields when editing an existing record
- Disable submit button while mutation is in flight
- Clear/close after successful submit

For complex modules with related data (e.g. Order with line items):
- Build a detail page: [Module]DetailPage.jsx
- Register it in router as /[module]/:id

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 6 — CONFIGURE ROLES & PERMISSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Login as admin@admin.com and go to the Roles page:

Step 1: Rename or add roles to match the organization
  Default roles: Admin, Editor, Viewer, Moderator
  Rename/add to match Phase 0 roles:
  Example: Warehouse Manager, Production Staff, Accountant

Step 2: Assign permissions per role using the permission matrix
  Go to Permissions page → toggle each permission per role
  Example:
    Warehouse Manager → inventory.view + inventory.create + inventory.edit
    Accountant → inventory.view + purchase-orders.view + reports.view + reports.export
    Production Staff → inventory.view + production-orders.view + production-orders.edit

Step 3: Create test users for each role
  Go to Users page → Add User → assign each role to one test user

Step 4: QA every role in the browser
  Log in as each role and verify:
  [ ] Sidebar shows only permitted modules
  [ ] Permitted action buttons (Add, Edit, Delete) are visible
  [ ] Non-permitted buttons are hidden
  [ ] Navigating directly to a forbidden page redirects to dashboard
  [ ] API calls from the browser return 403 for forbidden actions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 7 — CUSTOMIZE THE DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace the generic dashboard content with project-specific stats and charts.

Step 1: Update stat cards to reflect your domain
  Replace default cards with metrics that matter to your client.
  Example for inventory app:
    Total Items | Low Stock Items | Pending Orders | Active Suppliers

Step 2: Add analytics API endpoints for your domain
  In backend/src/modules/analytics/analytics.controller.js, add:
  GET /api/analytics/[your-metric] → return aggregated data from your tables

Step 3: Update or replace charts with domain-relevant visualizations
  Example: replace Login Activity chart with Stock Level Trends chart

Step 4: Update the Recent Activity feed description format
  The feed shows raw action names (e.g. 'inventory.create')
  Map these to human-readable descriptions:
  'inventory.create' → 'Added new inventory item'
  'purchase-orders.edit' → 'Updated purchase order'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 8 — FULL QA CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Complete this checklist before every client handover or deployment:

FUNCTIONALITY:
[ ] All CRUD operations work on every custom module
[ ] Search filters return correct results
[ ] Pagination navigates correctly and shows right record counts
[ ] All form validations show correct inline error messages
[ ] Delete confirmation dialogs appear before deleting
[ ] Toast notifications appear on every success and error action
[ ] Empty states appear when tables have no records
[ ] Loading skeletons appear while data is being fetched

RBAC & SECURITY:
[ ] Every role sees only permitted modules in sidebar
[ ] Every role can only perform permitted CRUD actions
[ ] All API endpoints return 403 when called without permission
[ ] Accessing a forbidden page URL redirects to dashboard
[ ] Audit log records every create/edit/delete action
[ ] Login failure is recorded in audit log
[ ] JWT refresh works silently after 15-minute access token expires
[ ] Logout revokes refresh token (re-login required after logout)

UI & COMPATIBILITY:
[ ] Dark mode works correctly on all pages and components
[ ] App renders correctly on 1280px desktop width
[ ] App renders correctly on 1024px tablet width
[ ] No broken layouts, overflow, or misaligned elements
[ ] No console errors or warnings in browser developer tools

DATA:
[ ] Seed data is realistic and relevant to the client's domain
[ ] Default roles match the client's organizational structure
[ ] At least one test user per role exists for QA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 9 — DEPLOY TO PRODUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Follow docs/DEPLOYMENT.md for full instructions. Summary:

Frontend → Deploy to Vercel or Netlify
  Build command: npm run build (in frontend/)
  Output directory: frontend/dist
  Set environment variable: VITE_API_URL=https://your-api-domain.com

Backend → Deploy to VPS with PM2 + Nginx
  Install PM2: npm install -g pm2
  Start app: pm2 start backend/src/app.js --name admin-api
  Save process: pm2 save && pm2 startup

Database → MySQL on VPS or managed service (PlanetScale, Railway)

Pre-deployment checklist:
[ ] NODE_ENV=production set in backend .env
[ ] JWT_ACCESS_SECRET is a random 64-character string (not dev default)
[ ] JWT_REFRESH_SECRET is a different random 64-character string
[ ] DATABASE_URL points to production MySQL database
[ ] CLIENT_URL set to your production frontend URL (for CORS)
[ ] HTTPS/SSL certificate installed on backend domain
[ ] Database backed up before first production deployment
[ ] All .env files NOT committed to git (.gitignore verified)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEVELOPMENT WORKFLOW SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every new module follows this exact sequence:
Config → Database → Backend → Frontend → Permissions → Test

Every new project follows this exact sequence:
Plan → Configure → Setup → Database → Backend → Frontend
→ Permissions → Dashboard → QA → Deploy

GOLDEN RULE FOR AI AGENTS:
If a developer asks you to build a new module or feature on this template,
always ask which phase they are in before writing code.
If they have not completed the earlier phases, guide them to complete
those first. Building out of order breaks the template's assumptions
and causes difficult-to-debug problems later.

TIME ESTIMATES PER PROJECT SIZE:
Small (3-5 custom modules)  → 1 week
Medium (6-10 custom modules) → 2 weeks
Large (11-20 custom modules) → 3-4 weeks
These assume one developer following the workflow correctly.
```

---

## ━━━ SYSTEM CONTEXT (Read This First) ━━━

> **Every AI coding agent must read this section before executing any prompt below.**
> This section explains the entire project — what it is, how it works, the rules,
> and the patterns every module must follow. Never skip this section.

---

### What This Project Is

This is a **universal full-stack admin dashboard template** built to be reused
across multiple client projects. It includes a complete RBAC (Role-Based Access
Control) system, JWT authentication, analytics dashboard, and a plugin-style
module system where new features can be added by editing a single config file.

The goal is: **clone → configure → build custom modules → deploy.**
Every project built from this template shares the same foundation.
Only the branding, modules, and business logic change per project.

---

### Tech Stack (Never Change These)

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 18 |
| Build tool | Vite | 5 |
| Styling | Tailwind CSS | 3 |
| Component library | shadcn/ui | latest |
| Global state | Zustand | 4 |
| Server state + caching | React Query (@tanstack/react-query) | 5 |
| Forms | React Hook Form + Zod | 7 + 3 |
| Charts | Recharts | 2 |
| Routing | React Router | 6 |
| Icons | Lucide React | latest |
| Backend | Node.js + Express | 18+ / 4 |
| Database | MySQL via Prisma ORM | 5 |
| Auth | JWT (access + refresh tokens) | 9 |
| Validation (shared) | Zod | 3 |

---

### How The Module System Works

The entire app is driven by **two config files**:

```
frontend/src/config/app.config.js      → branding, theme, API URL
frontend/src/config/modules.config.js  → all modules (sidebar, routes, permissions)
```

When you add an object to `modules.config.js`, the following happen automatically:
- Sidebar renders a new nav item
- React Router registers a new route
- Backend auto-loads the module's route file
- Seed script inserts the module's permissions into the database

**This means: adding a module = editing one file + creating the module files.**

---

### Folder Structure (Full)

```
admin-template/
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── app.config.js
│   │   │   └── modules.config.js
│   │   ├── api/
│   │   │   └── axiosClient.js
│   │   ├── stores/
│   │   │   ├── authStore.js
│   │   │   ├── permissionStore.js
│   │   │   └── uiStore.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── usePermission.js
│   │   │   └── useTheme.js
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Topbar.jsx
│   │   │   │   └── AppLayout.jsx
│   │   │   └── common/
│   │   │       ├── DataTable.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── ConfirmDialog.jsx
│   │   │       ├── StatCard.jsx
│   │   │       ├── Badge.jsx
│   │   │       ├── Avatar.jsx
│   │   │       └── PageHeader.jsx
│   │   ├── pages/
│   │   │   ├── auth/LoginPage.jsx
│   │   │   ├── dashboard/DashboardPage.jsx
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   ├── audit-logs/
│   │   │   ├── settings/
│   │   │   └── [custom-modules]/     ← add per project
│   │   ├── guards/
│   │   │   ├── AuthGuard.jsx
│   │   │   └── PermissionGuard.jsx
│   │   ├── router/index.jsx
│   │   └── utils/
│   │       ├── formatDate.js
│   │       └── exportCsv.js
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/modules.config.js  ← same as frontend copy
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── permission.middleware.js
│   │   │   └── audit.middleware.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   ├── audit-logs/
│   │   │   ├── analytics/
│   │   │   └── [custom-modules]/     ← add per project
│   │   ├── routes/index.js
│   │   └── app.js
│   ├── .env.example
│   └── package.json
│
├── scripts/setup.js
├── docs/
└── README.md
```

---

### Core Patterns Every Agent Must Follow

#### 1. API Response Format (always consistent)
```js
// Success
res.json({ success: true, data: result, message: 'Created successfully' })

// Error
res.status(400).json({ success: false, error: 'Validation failed', details: [...] })

// Paginated list
res.json({ success: true, data: items, total, page, totalPages })
```

#### 2. Permission Naming Convention
```
Format:  module.action
Examples: users.view, users.create, users.edit, users.delete
          roles.view, roles.create, roles.edit, roles.delete
          products.view, products.create, products.edit, products.delete
          orders.view, orders.edit
          logs.view, logs.export
          settings.view, settings.edit
```

#### 3. Frontend API Call Pattern
```js
// Always use React Query for data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => getProducts(filters),
})

// Always use useMutation for writes
const mutation = useMutation({
  mutationFn: createProduct,
  onSuccess: () => {
    queryClient.invalidateQueries(['products'])
    toast.success('Product created')
    onClose()
  },
  onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
})
```

#### 4. Permission Guard Pattern
```jsx
// Guard entire page
<PermissionGuard permission="products.view">
  <ProductsPage />
</PermissionGuard>

// Guard action buttons
const canCreate = usePermission('products.create')
const canDelete = usePermission('products.delete')

{canCreate && <Button onClick={openModal}>Add Product</Button>}
{canDelete && <Button onClick={handleDelete}>Delete</Button>}
```

#### 5. Backend Route Pattern
```js
// Every module route file follows this structure
const router = express.Router()
const ctrl = require('./module.controller')
const { requirePermission } = require('../../middleware/permission.middleware')
const { auditMiddleware } = require('../../middleware/audit.middleware')

router.use(auditMiddleware('ModuleName'))

router.get('/',     requirePermission('module.view'),   ctrl.getAll)
router.get('/:id',  requirePermission('module.view'),   ctrl.getOne)
router.post('/',    requirePermission('module.create'), ctrl.create)
router.put('/:id',  requirePermission('module.edit'),   ctrl.update)
router.delete('/:id', requirePermission('module.delete'), ctrl.remove)

module.exports = router
```

#### 6. Audit Logging (automatic)
Every write operation is automatically logged via `audit.middleware.js`.
**Never manually write to AuditLog** — the middleware handles it.
It captures: userId, action, module, status (success/failed), ipAddress, meta.

#### 7. Form Validation Pattern
```js
// Always define Zod schema first
const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.number().positive('Price must be positive'),
  description: z.string().optional(),
})

// Use with React Hook Form
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(productSchema),
})
```

---

### Database Rules

- **Primary keys**: always UUID (`@id @default(uuid())`)
- **Timestamps**: every model has `createdAt` and `updatedAt`
- **Soft delete**: use `isActive: Boolean` instead of hard delete where possible
- **Relations**: always define both sides of a relation in Prisma schema
- **Migrations**: run `npx prisma migrate dev --name description` for every schema change
- **Never edit** the migration files manually

---

### Environment Variables Reference

**Frontend** (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=MyApp Admin
```

**Backend** (`backend/.env`)
```env
DATABASE_URL=mysql://root:password@localhost:3306/admin_db
JWT_ACCESS_SECRET=64_char_random_string
JWT_REFRESH_SECRET=64_char_random_string
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

### Default Seed Data (always present after setup)

| Type | Data |
|---|---|
| Admin user | admin@admin.com / Admin@1234 |
| Roles | Admin, Editor, Viewer, Moderator |
| Permissions | 18 across Users, Roles, Permissions, Logs modules |
| Admin role | Has ALL permissions |
| Editor role | view + create + edit on most, no delete, no role management |
| Viewer role | view only on all modules |

---
---

## PROMPT 1 — Project Setup & Folder Structure

### Description for AI Agent
> This is the first prompt to run when starting a new project from the template.
> It creates the complete repository structure with all starter files.
> The output must be a working React + Vite app and a working Express server
> that can both start without errors. All files must follow the core patterns
> defined in the System Context above. Do not add any business logic yet —
> only scaffolding, config, and wiring.

### Agent Checklist
- [ ] Create complete folder structure exactly as shown in System Context
- [ ] Generate `package.json` for both frontend and backend with all dependencies
- [ ] Create `vite.config.js` with path alias `@` pointing to `src/`
- [ ] Create `tailwind.config.js` with `darkMode: 'class'` and shadcn/ui content paths
- [ ] Create `app.js` (Express) with CORS, helmet, cookie-parser, morgan middleware
- [ ] Create `frontend/.env.example` and `backend/.env.example`
- [ ] Ensure `npm run dev` in both folders starts without errors
- [ ] Do NOT add any page content yet — only layout shells

---

```
You are a senior full-stack developer setting up a universal admin dashboard template.
Read the SYSTEM CONTEXT at the top of this file before proceeding.

TASK: Generate the complete folder structure and all starter/scaffold files.

TECH STACK (do not change):
- Frontend: React 18 + Vite 5 + Tailwind CSS 3 + shadcn/ui
- State: Zustand 4
- API: Axios + React Query v5
- Forms: React Hook Form + Zod
- Charts: Recharts
- Routing: React Router v6
- Icons: Lucide React
- Backend: Node.js 18+ + Express 4
- Database: MySQL via Prisma 5
- Auth: JWT

GENERATE THESE FILES WITH WORKING STARTER CODE:

frontend/package.json — all dependencies listed in System Context
frontend/vite.config.js — path alias @ → src/, port 5173
frontend/tailwind.config.js — darkMode: 'class', content paths for shadcn
frontend/index.html — basic HTML shell
frontend/src/main.jsx — ReactDOM.createRoot, QueryClientProvider, RouterProvider
frontend/src/App.jsx — shell only, renders <RouterProvider>
frontend/.env.example — VITE_API_URL and VITE_APP_NAME

backend/package.json — all dependencies listed in System Context
backend/src/app.js — Express app with: cors (allow CLIENT_URL), helmet,
  cookie-parser, morgan, json body parser, route loader, 404 handler, error handler
backend/src/routes/index.js — auto-loads route files from modules/ directory
  based on modules.config.js (try/catch per module, skip if no routes file)
backend/.env.example — all variables listed in System Context

RULES:
- Every file must have a comment at the top: "// TEMPLATE FILE — part of admin-template v1.0"
- Use ES modules (import/export) in frontend, CommonJS (require) in backend
- Do not create any page components yet
- Do not implement any business logic yet
- All files must be syntactically correct and runnable
```

---
---

## PROMPT 2 — Config System

### Description for AI Agent
> The config system is the heart of the template. These two files control
> everything in the application. The Sidebar, Router, backend route loader,
> and seed script all READ from modules.config.js — they never hardcode
> module names. Adding a new entry to modules.config.js is the ONLY action
> needed to register a new module across the entire stack.
> app.config.js controls per-project branding and never affects routing logic.

### Agent Checklist
- [ ] `app.config.js` exports `appConfig` object with all fields documented
- [ ] `modules.config.js` exports `modulesConfig` array with 6 core + 3 example custom modules
- [ ] Every field in both files has a JSDoc comment explaining what it does
- [ ] Sidebar reads `modulesConfig` and renders nav items dynamically (no hardcoded items)
- [ ] Router reads `modulesConfig` and generates routes dynamically
- [ ] Backend `routes/index.js` reads `modulesConfig` and auto-loads module route files
- [ ] Removing a module from config removes it from sidebar + routes automatically
- [ ] Custom modules (core: false) can be freely added or removed

---

```
You are a senior full-stack developer working on a universal admin template.
Read the SYSTEM CONTEXT at the top of this file before proceeding.

TASK: Build the complete config system — the two files that drive the entire application.

FILE 1: frontend/src/config/app.config.js

Create and export appConfig object:
- appName: string — shown in sidebar header and browser tab title
- appLogo: string — path to logo file e.g. '/logo.svg'
- appVersion: string — e.g. '1.0.0'
- theme:
    primaryColor: hex string — main accent color (change per project)
    darkMode: boolean — default theme on first load
- pagination:
    defaultPageSize: number — rows per page in all tables (default 10)
- api:
    baseUrl: string — from import.meta.env.VITE_API_URL
    timeout: number — axios timeout in ms (default 10000)

Add JSDoc comment above every field explaining what to change per project.

---

FILE 2: frontend/src/config/modules.config.js
(copy identical file to backend/src/config/modules.config.js)

Create and export modulesConfig array. Each object has:
- key: string — unique slug, used as route key and API path e.g. 'products'
- label: string — display name in sidebar
- icon: string — exact Lucide icon component name e.g. 'Package'
- path: string — frontend route path e.g. '/products'
- core: boolean — true = always included, never remove; false = project-specific
- permissions: string[] — all permission names for this module (module.action format)

CORE MODULES (core: true) — always include these, never remove:
1. key:'dashboard', label:'Dashboard', icon:'LayoutDashboard', path:'/dashboard'
   permissions: ['analytics.view']
2. key:'users', label:'Users', icon:'Users', path:'/users'
   permissions: ['users.view','users.create','users.edit','users.delete','users.reset_password']
3. key:'roles', label:'Roles', icon:'Shield', path:'/roles'
   permissions: ['roles.view','roles.create','roles.edit','roles.delete']
4. key:'permissions', label:'Permissions', icon:'Key', path:'/permissions'
   permissions: ['permissions.view','permissions.edit']
5. key:'audit-logs', label:'Audit Logs', icon:'ScrollText', path:'/audit-logs'
   permissions: ['logs.view','logs.export']
6. key:'settings', label:'Settings', icon:'Settings', path:'/settings'
   permissions: ['settings.view','settings.edit']

EXAMPLE CUSTOM MODULES (core: false) — show as commented-out examples:
7. key:'products', label:'Products', icon:'Package', path:'/products'
   permissions: ['products.view','products.create','products.edit','products.delete']
8. key:'orders', label:'Orders', icon:'ShoppingCart', path:'/orders'
   permissions: ['orders.view','orders.edit','orders.delete']
9. key:'reports', label:'Reports', icon:'BarChart2', path:'/reports'
   permissions: ['reports.view','reports.export']

---

DYNAMIC WIRING — implement all three:

1. Sidebar.jsx — reads modulesConfig:
import { modulesConfig } from '@/config/modules.config'
import * as Icons from 'lucide-react'
// Map over modulesConfig, render NavItem per module
// Only show modules where user hasPermission(module.permissions[0])
// Active state based on current route path

2. router/index.jsx — reads modulesConfig:
// Core routes (always present): /login, /dashboard, /users, /roles,
// /permissions, /audit-logs, /settings
// Dynamic routes from modulesConfig where core === false:
//   each gets a lazy-loaded page component from pages/[key]/[Key]Page.jsx
//   wrapped in PermissionGuard with permission = module.permissions[0]

3. backend/src/routes/index.js — reads modulesConfig:
// For each module in modulesConfig, try to require('../modules/[key]/[key].routes')
// Mount at /api/[key]
// Use try/catch — skip silently if route file does not exist yet
// Log which modules were loaded successfully on server start
```

---
---

## PROMPT 3 — MySQL Database Schema (Prisma)

### Description for AI Agent
> This prompt defines the complete database schema using Prisma ORM with MySQL.
> All models follow the rules defined in System Context (UUID PKs, timestamps,
> soft delete via isActive). The seed file reads from modules.config.js to
> auto-insert permissions — this means when a new module is added to the config,
> running the seed again inserts its permissions automatically without editing
> the seed file. Never alter the migration files manually.

### Agent Checklist
- [ ] All models use UUID primary keys with `@default(uuid())`
- [ ] All models have `createdAt` and `updatedAt` timestamps
- [ ] `User` model has soft delete via `isActive` boolean
- [ ] `RolePermission` uses composite primary key `@@id([roleId, permissionId])`
- [ ] `AuditLog.userId` is optional (null for unauthenticated failed logins)
- [ ] `AuditLog.meta` is `Json` type for flexible extra data
- [ ] `RefreshToken.token` stores hashed value (never raw token)
- [ ] Seed file reads `modules.config.js` to insert permissions dynamically
- [ ] Seed creates default admin user with bcrypt hashed password
- [ ] Seed assigns ALL permissions to Admin role
- [ ] Running seed twice does not create duplicate records (use upsert)

---

```
You are a senior full-stack developer working on a universal admin template.
Read the SYSTEM CONTEXT at the top of this file before proceeding.

TASK: Create the complete Prisma schema for MySQL and a smart seed file.

FILE: backend/prisma/schema.prisma

generator client { provider = "prisma-client-js" }
datasource db { provider = "mysql", url = env("DATABASE_URL") }

Create these models exactly:

model User
- id: String @id @default(uuid())
- name: String
- email: String @unique
- passwordHash: String
- isActive: Boolean @default(true)
- lastLoginAt: DateTime?
- role: Role (relation via roleId)
- roleId: String
- refreshTokens: RefreshToken[]
- auditLogs: AuditLog[]
- createdAt: DateTime @default(now())
- updatedAt: DateTime @updatedAt

model Role
- id: String @id @default(uuid())
- name: String @unique
- description: String? @db.Text
- users: User[]
- permissions: RolePermission[]
- createdAt: DateTime @default(now())
- updatedAt: DateTime @updatedAt

model Permission
- id: String @id @default(uuid())
- name: String @unique (format: module.action)
- module: String (e.g. 'Users', 'Products')
- description: String? @db.Text
- roles: RolePermission[]
- createdAt: DateTime @default(now())

model RolePermission
- role: Role (relation via roleId)
- roleId: String
- permission: Permission (relation via permissionId)
- permissionId: String
- @@id([roleId, permissionId])
- assignedAt: DateTime @default(now())

model RefreshToken
- id: String @id @default(uuid())
- token: String @unique (store SHA-256 hash of the actual token)
- user: User (relation via userId)
- userId: String
- expiresAt: DateTime
- revoked: Boolean @default(false)
- createdAt: DateTime @default(now())

model AuditLog
- id: String @id @default(uuid())
- user: User? (optional relation via userId)
- userId: String? (null for unauthenticated requests)
- action: String (e.g. 'user.delete', 'role.edit', 'login.failed')
- module: String (e.g. 'Users', 'Auth', 'Products')
- status: String ('success' or 'failed')
- ipAddress: String?
- userAgent: String?
- meta: Json? (any extra context — old values, new values, etc.)
- createdAt: DateTime @default(now())

---

FILE: backend/prisma/seed.js

The seed file must:
1. Read modulesConfig from '../src/config/modules.config.js'
2. Extract all unique permissions from all modules in the config
3. Upsert all permissions into Permission table (name as unique key)
4. Create/upsert these 4 roles: Admin, Editor, Viewer, Moderator
5. Assign ALL permissions to Admin role
6. Assign limited permissions to Editor (view+create+edit, no delete/role mgmt)
7. Assign only .view permissions to Viewer role
8. Create default admin user: admin@admin.com / Admin@1234 (bcrypt 12 rounds)
9. Use upsert everywhere — running seed twice is safe
10. Print a summary table after seeding showing counts of what was created

Run with: node backend/prisma/seed.js
```

---
---

## PROMPT 4 — JWT Authentication System

### Description for AI Agent
> JWT auth uses a two-token strategy: a short-lived access token (15min) stored
> in memory only (Zustand store, never localStorage), and a long-lived refresh
> token (7 days) stored as an httpOnly cookie. This prevents XSS attacks from
> stealing tokens. The Axios interceptor silently refreshes the access token
> when it expires — the user never sees a logout. On the frontend, session is
> restored on page load by calling /auth/refresh silently. All login/logout
> actions are recorded in AuditLog automatically via audit middleware.

### Agent Checklist
- [ ] Access token stored ONLY in Zustand memory, never localStorage or cookie
- [ ] Refresh token stored ONLY in httpOnly, sameSite:strict, secure cookie
- [ ] Axios interceptor catches 401, calls /auth/refresh, retries original request
- [ ] If refresh fails → clear auth state → redirect to /login
- [ ] `authStore.js` has: user, accessToken, isAuthenticated, isLoading
- [ ] `authStore.js` `init()` action called on app start to restore session
- [ ] LoginPage uses React Hook Form + Zod with inline error messages
- [ ] AuthGuard redirects to /login if not authenticated
- [ ] AuthGuard shows loading spinner while checking auth on app load
- [ ] All 5 auth endpoints implemented with full validation
- [ ] AuditLog entry created for every login attempt (success AND failed)

---

```
You are a senior full-stack developer working on a universal admin template.
Read the SYSTEM CONTEXT at the top of this file before proceeding.

TASK: Build the complete JWT authentication system — backend API + frontend integration.

━━━ BACKEND ━━━

FILE: backend/src/modules/auth/auth.service.js
Implement these functions:

- login(email, password, ipAddress, userAgent)
  → find user by email, check isActive, bcrypt.compare password
  → generate accessToken (jwt.sign, 15m) and refreshToken (crypto.randomUUID())
  → hash refreshToken with SHA-256, save to RefreshToken table with 7d expiry
  → update user.lastLoginAt
  → return { accessToken, refreshToken (raw), user with permissions[] }
  → on failure: log to AuditLog with status:'failed', throw AuthError

- refresh(rawRefreshToken)
  → hash incoming token, find in DB, check not revoked and not expired
  → generate new accessToken only
  → return { accessToken }

- logout(rawRefreshToken)
  → hash token, find in DB, set revoked:true

- forgotPassword(email)
  → generate reset token (crypto.randomBytes(32).toString('hex'))
  → store SHA-256 hash + expiry (1hr) on user record
  → return raw token (in production: send email; for now: return in response)

- resetPassword(rawToken, newPassword)
  → hash token, find user with matching resetToken and non-expired resetTokenExpiry
  → bcrypt hash newPassword, update user
  → revoke all refresh tokens for that user

FILE: backend/src/modules/auth/auth.controller.js
- POST /login → call auth.service.login → set cookie → return { accessToken, user }
- POST /refresh → read cookie → call auth.service.refresh → return { accessToken }
- POST /logout → read cookie → call auth.service.logout → clear cookie
- POST /forgot-password → call auth.service.forgotPassword
- POST /reset-password → call auth.service.resetPassword

Cookie settings (use these exact options):
httpOnly: true, secure: process.env.NODE_ENV === 'production',
sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000

FILE: backend/src/middleware/auth.middleware.js
- authenticate: verify JWT from Authorization header → attach req.user
- On expired token: return 401 { error: 'Token expired' }
- On invalid token: return 401 { error: 'Invalid token' }

━━━ FRONTEND ━━━

FILE: frontend/src/api/axiosClient.js
- Create axios instance with baseURL from appConfig.api.baseUrl
- Request interceptor: get accessToken from authStore → set Authorization header
- Response interceptor:
  → on 401 with error 'Token expired':
    → call POST /auth/refresh (without auth header)
    → update accessToken in authStore
    → retry original request with new token
  → if refresh fails: authStore.logout() → window.location = '/login'
- Export axiosClient as default

FILE: frontend/src/stores/authStore.js (Zustand)
State: { user: null, accessToken: null, isAuthenticated: false, isLoading: true }
Actions:
- init() → call GET /auth/refresh → set user + accessToken → isLoading: false
  On fail: set isAuthenticated: false, isLoading: false (no redirect here)
- login(email, password) → POST /auth/login → set user + accessToken + isAuthenticated
- logout() → POST /auth/logout → clear all state
- setAccessToken(token) → update token only (called by interceptor after refresh)

FILE: frontend/src/guards/AuthGuard.jsx
- Call authStore.init() on mount (once, not on every render)
- While isLoading: show full-screen centered spinner
- If not isAuthenticated: <Navigate to="/login" replace />
- If authenticated: render children

FILE: frontend/src/pages/auth/LoginPage.jsx
- Clean centered card layout, dark mode compatible
- Fields: Email (type email), Password (type password, show/hide toggle)
- Zod schema: email().min(1), password min 8 chars
- Submit: call authStore.login → on success navigate to /dashboard
- Show inline field errors from Zod
- Show API error (wrong credentials) as error alert above form
- Loading spinner on submit button while request in flight
- Link to /forgot-password at bottom
```

---
---

## PROMPT 5 — RBAC Permission System

### Description for AI Agent
> The RBAC system is fully dynamic — there are no hardcoded role checks anywhere
> in the codebase. Permissions are stored in the database and loaded into the
> frontend as an array of permission name strings after login. The frontend
> checks permissions using the hasPermission() function in permissionStore.
> The backend checks permissions using the requirePermission() middleware which
> queries the database on every protected request. Changing a role's permissions
> in the Roles page takes effect on the next API call without requiring re-login.

### Agent Checklist
- [ ] `permissionStore.js` has `permissions: string[]` and `hasPermission(name)` getter
- [ ] Permissions loaded from login response and stored in permissionStore
- [ ] `usePermission(name)` hook returns boolean (reactive to store changes)
- [ ] `PermissionGuard` component renders children or fallback based on permission
- [ ] `requirePermission()` backend middleware queries DB (not JWT) for accuracy
- [ ] Sidebar hides nav items if user lacks the module's primary permission
- [ ] Action buttons (Add, Edit, Delete) wrapped in PermissionGuard on every page
- [ ] Unauthorized page access returns 403 (not 401) from backend
- [ ] No role names (Admin, Editor) hardcoded anywhere in frontend or backend
- [ ] Permission changes by admin apply to other users' next request automatically

---

```
You are a senior full-stack developer working on a universal admin template.
Read the SYSTEM CONTEXT at the top of this file before proceeding.

TASK: Build the complete RBAC permission system for frontend and backend.

━━━ BACKEND ━━━

FILE: backend/src/middleware/permission.middleware.js

requirePermission(permissionName) — factory function returning Express middleware:
- Get userId from req.user (set by auth.middleware)
- Query DB: find user's role → get role's permissions → extract permission names
- If permissionName is in the list → call next()
- If not → return 403 { success: false, error: 'Access denied', required: permissionName }
- Cache user permissions in req.userPermissions for reuse in same request

Usage example:
router.get('/', requirePermission('products.view'), ctrl.getAll)
router.delete('/:id', requirePermission('products.delete'), ctrl.remove)

━━━ FRONTEND ━━━

FILE: frontend/src/stores/permissionStore.js (Zustand)
const usePermissionStore = create((set, get) => ({
  permissions: [],
  setPermissions: (list) => set({ permissions: list }),
  clearPermissions: () => set({ permissions: [] }),
  hasPermission: (name) => get().permissions.includes(name),
}))

Call setPermissions(user.permissions) immediately after successful login.
Call clearPermissions() on logout.

FILE: frontend/src/hooks/usePermission.js
import usePermissionStore from '@/stores/permissionStore'
export const usePermission = (name) =>
  usePermissionStore((state) => state.hasPermission(name))

FILE: frontend/src/guards/PermissionGuard.jsx
Props: permission (string, required), fallback (JSX, default null)
- Call usePermission(permission)
- If true: render children
- If false: render fallback (default null = invisible, no error shown)

Usage:
<PermissionGuard permission="users.create">
  <Button>Add User</Button>
</PermissionGuard>

<PermissionGuard permission="users.view" fallback={<Navigate to="/dashboard" />}>
  <UsersPage />
</PermissionGuard>

FILE: frontend/src/components/layout/Sidebar.jsx
For each module in modulesConfig:
- Check hasPermission(module.permissions[0]) — the .view permission
- Only render nav item if user has that permission
- Active state: compare module.path to current location.pathname
- Resolve icon dynamically: import * as Icons from 'lucide-react', then Icons[module.icon]

APPLY PERMISSION GUARDS IN ALL PAGES:
Users: canView, canCreate (Add btn), canEdit (Edit btn), canDelete (Delete btn)
Roles: canCreate, canEdit, canDelete
Permissions: canEdit (enables/disables toggle switches)
Audit Logs: canExport (shows/hides Export CSV button)
Settings: canEdit (enables/disables form fields)
```

---
---

## PROMPT 6 — Dashboard Page + Charts

### Description for AI Agent
> The dashboard is the first page users see after login. It shows a real-time
> snapshot of the system using 4 stat cards and 4 charts, all fetched from
> dedicated analytics API endpoints. React Query handles caching — charts
> do not re-fetch on every navigation, only every 5 minutes. All charts use
> Recharts with consistent colors and dark mode support. The recent activity
> feed shows the last 10 audit log entries with time-relative formatting.

### Agent Checklist
- [ ] All data fetched with `useQuery` from React Query (not useState + useEffect)
- [ ] React Query `staleTime` set to 5 minutes for analytics endpoints
- [ ] Loading skeleton shown for each card/chart while data loads (not a spinner)
- [ ] Error state rendered if any query fails with a retry button
- [ ] All 4 charts wrapped in `ResponsiveContainer` from Recharts
- [ ] Charts work in both light and dark mode
- [ ] Stat card trend shows direction: positive=green, negative=red
- [ ] Recent activity uses `formatRelativeTime` util (e.g. "2 min ago")
- [ ] Dashboard only visible to users with `analytics.view` permission
- [ ] All 5 backend analytics endpoints implemented with real DB queries

---

```
You are a senior full-stack developer working on a universal admin template.
Read the SYSTEM CONTEXT at the top of this file before proceeding.

TASK: Build the complete Dashboard page with stat cards, 4 charts, and activity feed.

━━━ BACKEND ANALYTICS ENDPOINTS ━━━

FILE: backend/src/modules/analytics/analytics.controller.js

GET /api/analytics/stats → returns:
{
  totalUsers, activeUsers, totalRoles, totalPermissions,
  logsToday, failedToday, newUsersThisWeek
}

GET /api/analytics/user-growth → last 12 months:
[ { month: 'Jan 2025', count: 12 }, ... ]
Query: group User by month of createdAt

GET /api/analytics/login-activity → last 30 days:
[ { date: '2025-01-15', success: 45, failed: 3 }, ... ]
Query: group AuditLog where action='login' by date, count by status

GET /api/analytics/role-distribution → users per role:
[ { role: 'Admin', count: 3 }, ... ]

GET /api/analytics/module-usage → actions per module (last 30 days):
[ { module: 'Users', count: 234 }, ... ]

━━━ FRONTEND ━━━

FILE: frontend/src/pages/dashboard/DashboardPage.jsx

LAYOUT (top to bottom):
1. Page header: "Dashboard" + current date
2. Stat cards: 4 columns desktop, 2 tablet, 1 mobile
3. Charts row 1: UserGrowthChart (2/3) + RoleDistributionChart (1/3)
4. Charts row 2: LoginActivityChart (2/3) + ModuleUsageChart (1/3)
5. Recent activity feed: full width

STAT CARDS:
1. Total Users — icon:Users — trend: +{newUsersThisWeek} this week
2. Active Roles — icon:Shield
3. Total Permissions — icon:Key
4. Logs Today — icon:ScrollText — red badge showing failed count if > 0

CHART COMPONENTS in frontend/src/components/charts/:

UserGrowthChart.jsx — Recharts AreaChart
- Smooth gradient fill, X: month, Y: user count, tooltip with count

LoginActivityChart.jsx — Recharts BarChart (stacked)
- Two bars: success (green) + failed (red), X: date, legend at bottom

RoleDistributionChart.jsx — Recharts PieChart (donut, innerRadius:60)
- One slice per role, legend below, center shows total user count

ModuleUsageChart.jsx — Recharts BarChart (horizontal)
- Y: module name, X: count, sorted by most used at top

RECENT ACTIVITY FEED:
- Fetch: GET /api/audit-logs?limit=10&sort=desc
- Each row: colored dot + username + action + time ago
- "View all logs →" link to /audit-logs

DATA FETCHING:
const { data: stats, isLoading } = useQuery({
  queryKey: ['analytics', 'stats'],
  queryFn: () => axiosClient.get('/analytics/stats').then(r => r.data.data),
  staleTime: 5 * 60 * 1000,
})
Use skeleton placeholders (not spinners) while loading each section.
```

---
---

## PROMPT 7 — Users, Roles & Permissions Pages

### Description for AI Agent
> These three pages are the core of the RBAC management system. The Users page
> manages user accounts and role assignments. The Roles page manages role
> definitions and which permissions each role has — rendered as an expandable
> card grid, not a table. The Permissions page shows a matrix view where admins
> can toggle permissions per role with a single click. All three pages use the
> shared DataTable, Modal, and ConfirmDialog components. All write operations
> are automatically logged to AuditLog via the audit middleware on the backend.

### Agent Checklist
- [ ] All pages use `useQuery` for fetching and `useMutation` for writes
- [ ] `queryClient.invalidateQueries` called after every successful mutation
- [ ] Toast notification shown on every success and error
- [ ] Every action button wrapped in `PermissionGuard`
- [ ] Delete always shows `ConfirmDialog` before proceeding
- [ ] Form validation uses React Hook Form + Zod with inline error messages
- [ ] Roles page: delete blocked with error if users are assigned to the role
- [ ] Permissions matrix: toggle applies immediately without a save button
- [ ] Pagination works server-side (page + limit sent as query params)
- [ ] Search is debounced 300ms before triggering API call

---

```
You are a senior full-stack developer working on a universal admin template.
Read the SYSTEM CONTEXT at the top of this file before proceeding.

TASK: Build Users page, Roles page, and Permissions page — full CRUD.

━━━ USERS PAGE ━━━

BACKEND: backend/src/modules/users/
- users.schema.js: Zod schemas for create and update
- users.service.js:
    findAll({ page, limit, search, roleId }) → paginated, search on name+email
    findById(id) → include role
    create(data) → bcrypt hash password, create user
    update(id, data) → update fields (re-hash password if provided)
    remove(id) → hard delete
    toggleStatus(id) → flip isActive boolean
    resetPassword(id, newPassword) → bcrypt hash, update, revoke refresh tokens
- users.controller.js: standard CRUD handlers
- users.routes.js: follow backend route pattern from System Context

FRONTEND: frontend/src/pages/users/
- UsersPage.jsx:
    Table columns: Avatar+Name | Email | Role badge | Status badge | Last Login | Actions
    Toolbar: search input (debounced 300ms) + Add User button (canCreate guard)
    Pagination: server-side, show "Showing X-Y of Z results"
    Row actions: Edit (canEdit) | Reset Password (canEdit) | Delete (canDelete)

- UserFormModal.jsx (handles both Add and Edit):
    Props: user (null=add, object=edit), onClose, onSuccess
    Fields: Full Name | Email | Password (optional on edit) |
            Role (select from GET /api/roles) | Status (toggle)
    Zod: name min 2 | email valid | password min 8 + number + uppercase (add only)

━━━ ROLES PAGE ━━━

BACKEND: backend/src/modules/roles/
- roles.service.js:
    findAll() → include _count of users and permissions
    findById(id) → include permissions with details
    create({ name, description, permissionIds }) → create + assign permissions
    update(id, data) → update + sync permissions
    remove(id) → if users assigned: throw error with message
    getPermissions(id) → return permissions grouped by module

FRONTEND: frontend/src/pages/roles/
- RolesPage.jsx: Card grid (3 col desktop, 2 tablet, 1 mobile)
    Each card: name | description | user count | permission count | Edit + Delete
    Click card → expand to show permissions grouped by module as chips
    Active permission: filled blue chip | Inactive: outlined gray chip

- RoleFormModal.jsx:
    Fields: Role name | Description (textarea)
    Permission matrix: grouped by module, checkboxes per permission
    "Select all" toggle per module section
    Send: { name, description, permissionIds: string[] }

━━━ PERMISSIONS PAGE ━━━

BACKEND additions:
PATCH /api/roles/:roleId/permissions/:permissionId
- Toggle: if assigned → remove; if not → add
- Return { assigned: boolean }

FRONTEND: frontend/src/pages/permissions/PermissionsPage.jsx
- Matrix layout: permissions as rows, roles as columns
- Group by module with collapsible sections
- Table header: "Permission" | "Description" | {Role1} | {Role2} ...
- Each cell: Toggle switch (ON = role has permission)
- Optimistic update: flip immediately, revert on error
- All toggles disabled (read-only) if user lacks permissions.edit
- Add Permission modal: name + module + description
```

---
---

## PROMPT 8 — Audit Logs Page

### Description for AI Agent
> The Audit Logs page is a read-only page showing all system actions. It is
> essential for accountability in a large org (100+ users). The page must handle
> large datasets efficiently with server-side pagination and filtering. The CSV
> export applies the current filters so admins can export exactly what they see.
> The audit middleware runs automatically on every write request — no page or
> developer needs to manually call a logging function. Logs are never deleted.

### Agent Checklist
- [ ] All filtering is server-side (not client-side array filtering)
- [ ] Pagination shows current page, total pages, and "Showing X-Y of Z"
- [ ] Date range filter uses native date inputs (no external date picker library)
- [ ] CSV export applies all active filters (same query as table)
- [ ] Expanding a row shows the `meta` JSON in a readable formatted view
- [ ] Auto-refresh toggle re-fetches every 30 seconds when enabled
- [ ] Audit middleware captures all POST, PUT, PATCH, DELETE automatically
- [ ] Failed requests (4xx/5xx) are also logged with status:'failed'
- [ ] `userId` is null in log if request was unauthenticated (login failures)
- [ ] IP address captured from `req.ip` or `X-Forwarded-For` header

---

```
You are a senior full-stack developer working on a universal admin template.
Read the SYSTEM CONTEXT at the top of this file before proceeding.

TASK: Build the Audit Logs page and the automatic audit logging middleware.

━━━ BACKEND ━━━

FILE: backend/src/middleware/audit.middleware.js

auditMiddleware(moduleName) — factory returning Express middleware:
- Use res.on('finish') to log after response is sent (never slows response)
- Capture:
    userId: req.user?.id (null if unauthenticated)
    action: derive from method+route e.g. 'POST /users' → 'user.create'
    module: the moduleName parameter passed to factory
    status: res.statusCode < 400 ? 'success' : 'failed'
    ipAddress: req.ip || req.headers['x-forwarded-for']
    userAgent: req.headers['user-agent']
    meta: { method, path, body: sanitize(req.body) }
- sanitize(body): strip password, passwordHash, token fields before logging
- Write to AuditLog asynchronously (do not await)

FILE: backend/src/modules/audit-logs/audit-logs.service.js
- findAll({ page, limit, userId, module, status, startDate, endDate })
  → filter by all params, paginate, include user name+email
  → return { data, total, page, totalPages }
- exportCsv(filters) → same query, no pagination, return CSV string

ROUTES:
GET /api/audit-logs → requirePermission('logs.view') → getAll
GET /api/audit-logs/export → requirePermission('logs.export') → exportCsv
  Set header: Content-Disposition: attachment; filename="audit-logs-{date}.csv"

━━━ FRONTEND ━━━

FILE: frontend/src/pages/audit-logs/AuditLogsPage.jsx

TOOLBAR:
- User dropdown: load from GET /api/users?minimal=true
- Module dropdown: all modules from modulesConfig + 'Auth'
- Status dropdown: All | Success | Failed
- Start date + End date (type="date" inputs)
- Reset filters button
- Export CSV button (canExport guard) → download with current filters
- Auto-refresh toggle → refetchInterval: autoRefresh ? 30000 : false

TABLE COLUMNS:
#ID (8 chars) | User (avatar+name, 'System' if null) | Action |
Module | IP Address | Status badge | Timestamp (full datetime)

ROW BEHAVIOR:
- Click row → inline expand → show meta as formatted <pre> block
- Status: success=green badge, failed=red badge
- Timestamp: "Jan 15, 2025 09:32:14"

PAGINATION: 10 rows/page, prev/next + page display + "Showing X-Y of Z"

DATA FETCHING:
useQuery({
  queryKey: ['audit-logs', filters, page],
  queryFn: () => axiosClient.get('/audit-logs', { params: {...filters, page, limit:10} }),
  refetchInterval: autoRefresh ? 30000 : false,
  keepPreviousData: true,
})
```

---
---

## PROMPT 9 — Settings Page + Setup Script + Documentation

### Description for AI Agent
> The Settings page handles per-user account settings (not system settings).
> The setup script is the single command that takes a fresh clone of the template
> and makes it ready for development in under 2 minutes. Documentation must be
> written for developers who have never seen this codebase — they must be able
> to add a new module by only reading ADDING_A_MODULE.md without asking questions.

### Agent Checklist (Settings)
- [ ] Profile section: update name and email independently
- [ ] Password section: requires current password before allowing change
- [ ] Appearance section: dark/light mode toggle persisted to localStorage
- [ ] All form sections are independent — saving one does not affect others
- [ ] canEdit guard disables all inputs if user lacks settings.edit

### Agent Checklist (Setup Script)
- [ ] Checks Node version >= 18 before proceeding
- [ ] All steps print colored status (check or cross)
- [ ] Fails gracefully with helpful message if MySQL is not running
- [ ] Idempotent — running on already-configured project is safe
- [ ] Final output shows URLs, credentials, and next steps clearly

---

```
You are a senior full-stack developer working on a universal admin template.
Read the SYSTEM CONTEXT at the top of this file before proceeding.

TASK: Build the Settings page, setup script, and all 5 documentation files.

━━━ SETTINGS PAGE ━━━

BACKEND additions to users module:
GET  /api/users/me → return current user with role + permissions
PUT  /api/users/me → update own name/email
PUT  /api/users/me/password → require currentPassword, set newPassword (bcrypt)

FRONTEND: frontend/src/pages/settings/SettingsPage.jsx
Three independent card sections:

1. Profile Card — fields: Full Name, Email
   Save → PUT /api/users/me → update authStore.user on success

2. Security Card — fields: Current Password, New Password, Confirm New Password
   Zod: newPassword min 8 + number + uppercase, passwords must match
   Save → PUT /api/users/me/password → clear fields on success

3. Appearance Card — dark/light toggle switch
   On toggle → update uiStore.darkMode → toggle 'dark' on <html>
   Persist choice to localStorage key 'theme'
   On app load: read localStorage and apply before first render

━━━ SETUP SCRIPT ━━━

FILE: scripts/setup.js (plain Node.js, no external deps except child_process + fs)

Steps with colored console output (✓ green = success, ✗ red = fail):
1. Check Node.js >= 18
2. Check MySQL reachable (attempt connection using DATABASE_URL from .env)
3. Copy frontend/.env.example → frontend/.env (skip if exists)
4. Copy backend/.env.example → backend/.env (skip if exists)
5. npm install in frontend/
6. npm install in backend/
7. npx prisma generate (backend/)
8. npx prisma migrate dev --name init (backend/)
9. node backend/prisma/seed.js
10. Print success box with URLs, login, and next step instructions

Add to root package.json:
"setup": "node scripts/setup.js"
"dev": "concurrently \"npm run dev --prefix frontend\" \"npm run dev --prefix backend\""

━━━ DOCUMENTATION ━━━

Write complete, detailed content for all 5 files:

docs/GETTING_STARTED.md
- Prerequisites: Node 18+, MySQL 8+, Git
- Clone, configure app.config.js, configure modules.config.js
- npm run setup, npm run dev, open browser
- Common errors and how to fix them

docs/ADDING_A_MODULE.md
- Complete step-by-step guide using "Products" as example
- Show complete working code for ALL files (not just file names)
- Step 1: modules.config.js entry
- Step 2: 3 frontend files (Page, FormModal, api)
- Step 3: 4 backend files (routes, controller, service, schema)
- Step 4: Prisma model + migration command
- Step 5: npm run seed
- Step 6: verification checklist

docs/RBAC_GUIDE.md
- Permission naming convention with examples
- How to guard a page, a button, a backend endpoint
- How to add permissions for new module
- How permission changes take effect without re-login
- Troubleshooting common RBAC issues

docs/CONFIG_REFERENCE.md
- Every field in app.config.js with type/default/description/example
- Every field in modules.config.js with type/default/description/example
- Configuration examples for 3 project types:
  e-commerce (products, orders, customers)
  CMS (posts, categories, media)
  SaaS (subscriptions, billing, tenants)

docs/DEPLOYMENT.md
- Deploy frontend to Vercel: step by step with vercel.json
- Deploy frontend to Netlify: with _redirects for SPA routing
- Deploy backend to VPS: PM2 + Nginx config files included
- MySQL production setup commands
- Production environment variables
- CORS + SSL configuration
```

---
---

## PROMPT 10 — Adding a Custom Module (Reusable Pattern)

### Description for AI Agent
> This prompt defines the exact pattern that every custom module in this template
> must follow. Use "Products" as the concrete example but the pattern is identical
> for any module (Orders, Reports, Invoices, Employees, etc.). Every file in this
> pattern has a comment at the top explaining how to adapt it. After generating
> all files, the developer only needs to find-replace "Product/product/products"
> with their entity name. The pattern is fully self-contained and runnable.

### Agent Checklist
- [ ] modules.config.js entry shown with exact syntax
- [ ] All 3 frontend files created with complete, working code
- [ ] All 4 backend files created with complete, working code
- [ ] Prisma model shown with UUID PK and timestamps
- [ ] Migration and seed commands shown
- [ ] Permission naming follows module.action convention exactly
- [ ] All files have adaptation comment block at top
- [ ] Shared components (DataTable, Modal, ConfirmDialog) used — never duplicated
- [ ] Error handling follows the API response format from System Context
- [ ] Verification checklist at end confirms the module works end-to-end

---

```
You are a senior full-stack developer working on a universal admin template.
Read the SYSTEM CONTEXT at the top of this file before proceeding.

TASK: Generate the complete reusable module pattern using "Products" as example.
Every file must have an adaptation comment block at the top.

ADAPTATION COMMENT (put at top of every generated file):
/**
 * TEMPLATE MODULE — admin-template v1.0
 * To adapt for a new module:
 * 1. Duplicate this folder
 * 2. Replace 'product' → your entity (lowercase singular)
 * 3. Replace 'Product' → your entity (PascalCase singular)
 * 4. Replace 'products' → your entity (lowercase plural)
 * 5. Update fields in schema, form, and table columns
 * 6. Add entry to modules.config.js
 * 7. Run: npx prisma migrate dev --name add_[entity]
 * 8. Run: npm run seed
 */

━━━ STEP 1: modules.config.js ━━━
Show the exact object to paste into modulesConfig array:
{
  key: 'products',
  label: 'Products',
  icon: 'Package',
  path: '/products',
  core: false,
  permissions: ['products.view','products.create','products.edit','products.delete'],
}

━━━ STEP 2: Frontend files (complete working code) ━━━

frontend/src/pages/products/productsApi.js
All 5 axios functions: getProducts, getProduct, createProduct, updateProduct, deleteProduct

frontend/src/pages/products/ProductsPage.jsx
Complete page with:
- useQuery for fetching, useMutation for delete
- Search (debounced 300ms), pagination (server-side)
- Table: Name | Price | Category | Status | Created | Actions
- Edit button (canEdit guard) → opens ProductFormModal
- Delete button (canDelete guard) → ConfirmDialog → delete mutation
- Loading skeleton, empty state, error state
- Toast on success/error

frontend/src/pages/products/ProductFormModal.jsx
Complete form with:
- Props: product (null=add), onClose, onSuccess
- Fields: name, price (number), description, category, isActive (toggle)
- Zod validation with inline errors
- Pre-fill when editing, clear when adding
- Loading state on submit button

━━━ STEP 3: Backend files (complete working code) ━━━

backend/src/modules/products/products.schema.js
Zod createProductSchema and updateProductSchema (partial)

backend/src/modules/products/products.service.js
findAll (paginated+search), findById, create, update, remove

backend/src/modules/products/products.controller.js
getAll, getOne, create, update, remove handlers
Consistent response format from System Context

backend/src/modules/products/products.routes.js
Full route file following backend route pattern from System Context
auditMiddleware('Products') applied to all routes

━━━ STEP 4: Database model ━━━

Prisma model to add to schema.prisma:
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

Commands:
npx prisma migrate dev --name add_products
npm run seed

━━━ STEP 5: Verification checklist ━━━
After completing all steps, verify in browser:
[ ] Module appears in sidebar (logged in as Admin)
[ ] Navigating to /products loads without error
[ ] Add Product button is visible
[ ] Form validation works (submit empty form shows errors)
[ ] Product saves and appears in table
[ ] Edit loads pre-filled form and saves changes
[ ] Delete shows confirmation dialog and removes record
[ ] Audit log page shows product.create / product.update / product.delete entries
[ ] Login as Viewer — Add/Edit/Delete buttons are hidden
[ ] API test: DELETE /api/products/:id without token → returns 403
```

---
---

## Quick Reference

### Start a New Client Project
```bash
git clone https://github.com/yourteam/admin-template.git my-project
cd my-project && rm -rf .git && git init
# Edit: frontend/src/config/app.config.js   → name, color, logo
# Edit: frontend/src/config/modules.config.js → add your modules
node scripts/setup.js
npm run dev
```

### Add Any New Module
```bash
# 1. Add entry to modules.config.js
# 2. Create frontend/src/pages/[module]/   (3 files)
# 3. Create backend/src/modules/[module]/  (4 files)
# 4. Add Prisma model:
npx prisma migrate dev --name add_[module]
# 5. Insert permissions:
npm run seed
```

### Prompt Usage Order

| Step | Prompt | What It Builds |
|---|---|---|
| 1 | PROMPT 1 | Folder structure + scaffold files |
| 2 | PROMPT 2 | Config system — branding + modules |
| 3 | PROMPT 3 | MySQL schema + seed script |
| 4 | PROMPT 4 | JWT authentication system |
| 5 | PROMPT 5 | RBAC permission system |
| 6 | PROMPT 6 | Dashboard + 4 charts |
| 7 | PROMPT 7 | Users, Roles, Permissions pages |
| 8 | PROMPT 8 | Audit Logs page + middleware |
| 9 | PROMPT 9 | Settings + setup script + docs |
| 10 | PROMPT 10 | Any new custom module |

---

*Universal Full-Stack Admin Dashboard + RBAC Template*
*Stack: React 18 + Tailwind CSS + shadcn/ui + Node.js + Express + MySQL + Prisma*
*Auth: JWT | State: Zustand | Charts: Recharts | Forms: React Hook Form + Zod*
*Version: 1.0 | Use: Internal admin panels and client projects*