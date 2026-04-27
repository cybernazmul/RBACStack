# 🛡️ Universal Full-Stack Admin Dashboard + RBAC

A **production-ready, fully-featured admin dashboard template** built with React 18, Node.js, and MySQL. Clone it once, configure it in minutes, and ship any client project on top of it — without rewriting the core.

---

## 📸 Screenshots

### Login Page
> Clean centered card, show/hide password toggle, Zod validation, dark mode ready.

![Login Page](docs/screenshots/login.png)

---

### Dashboard
> KPI cards, AI insights banner, 4 interactive charts (area, bar, line, donut), sortable data table, quick actions, live activity feed, and system status with 90-day uptime history.

![Dashboard](docs/screenshots/dashboard.png)

---

### User Management — Users
> Searchable, paginated user table. Add / Edit / Delete with role-based button visibility. Reset password action per user.

![Users Page](docs/screenshots/users.png)

---

### User Management — Roles
> Card grid layout. Each card shows user count, permission count, and an expandable permission chip view. Add/edit roles with a permission matrix picker.

![Roles Page](docs/screenshots/roles.png)

---

### User Management — Permissions
> **Role filter chips** (Viewer · Admin · Editor · Moderator) with live permission counts. Full-width search with amber highlight. Module cards with toggle switches, progress bars, and Grant all / Revoke all actions. Unsaved changes banner with Save / Discard.

![Permissions Page](docs/screenshots/permissions.png)

---

### Audit Logs
> Server-side filtered, paginated log table. Filter by module, status, date range. Expandable rows show raw JSON meta. CSV export. Auto-refresh toggle (30 s).

![Audit Logs](docs/screenshots/audit-logs.png)

---

### Collapsible Sidebar
> Expands to show label + icon. Collapses to icon-only mode. **User Management** group shows a flyout submenu in collapsed mode. Active-route detection auto-opens the correct group.

![Sidebar Collapsed](docs/screenshots/sidebar-collapsed.png)

---

## ✨ Features

### Core Template
| Feature | Detail |
|---|---|
| **RBAC** | Dynamic role/permission system — no hardcoded role names anywhere |
| **JWT Auth** | Access token (15 min, memory only) + Refresh token (7 days, httpOnly cookie) |
| **Silent refresh** | Axios interceptor refreshes expired token and retries the original request |
| **Audit logging** | Every write operation is automatically logged via middleware — no manual calls needed |
| **Module system** | Add a module by editing one config file — sidebar, router, API routes, and seed all update automatically |
| **Dark mode** | System-aware default, persisted to `localStorage`, smooth transition |
| **Setup script** | `node scripts/setup.js` — installs deps, migrates DB, seeds data in one command |

### Dashboard UI
| Feature | Detail |
|---|---|
| **KPI cards** | Revenue, Active Users, New Signups, System Uptime with trend indicators |
| **AI Insights** | Auto-generated insight cards with icon + description |
| **Charts** | User Growth (area), Traffic Sources (donut), Sales by Region (bar), Login Activity (line) — all via Recharts |
| **DataTable** | Client-side sort, filter, pagination — reusable component |
| **Quick Actions** | 6 shortcut buttons to key pages |
| **System Status** | Per-service health + 90-day uptime history bar |
| **Auto Refresh** | Live-polls analytics every 30 s when enabled |

### Sidebar
| Feature | Detail |
|---|---|
| **Collapsible** | Toggle button on edge, smooth CSS transition |
| **Groups** | Modules can be grouped under a parent (e.g. User Management) |
| **Flyout** | In collapsed mode, clicking a group opens a fixed flyout submenu |
| **Auto-open** | Active child route automatically opens its parent group |
| **RBAC-aware** | Nav items hidden if user lacks the module's primary permission |

### Permissions Page
| Feature | Detail |
|---|---|
| **Role chips** | Filter by role, shows granted permission count badge |
| **Search** | Real-time filter with amber text highlight, result count |
| **Module cards** | 2-column grid, progress bar, Grant all / Revoke all per module |
| **Toggle switches** | Replaces checkboxes, smooth animation |
| **Unsaved changes** | Accumulates changes, shows count banner, batch-saves on confirm |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 18 |
| Build tool | Vite | 5 |
| Styling | Tailwind CSS | 3 |
| Component library | shadcn/ui (Radix primitives) | latest |
| Global state | Zustand | 4 |
| Server state + cache | TanStack React Query | 5 |
| Forms | React Hook Form + Zod | 7 + 3 |
| Charts | Recharts | 2 |
| Routing | React Router | 6 |
| Icons | Lucide React | latest |
| Toast notifications | Sonner | latest |
| HTTP client | Axios | latest |
| Backend | Node.js + Express | 18+ / 4 |
| Database ORM | Prisma | 5 |
| Database | MySQL | 8+ |
| Auth | JWT (jsonwebtoken + bcryptjs) | latest |
| Validation (backend) | Zod | 3 |

---

## 📁 Project Structure

```
dashboard/
├── frontend/                        # React + Vite app
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosClient.js       # Axios instance + auth interceptors
│   │   │   └── tokenStore.js        # In-memory access token (no localStorage)
│   │   ├── components/
│   │   │   ├── charts/              # UserGrowth, LoginActivity, RoleDistribution, ModuleUsage
│   │   │   ├── common/              # KPICard, DataTable, Badge, Modal, ConfirmDialog,
│   │   │   │                        #   StatCard, PageHeader, SystemStatus, QuickActions
│   │   │   └── layout/              # AppLayout, Sidebar (collapsible + groups), Topbar
│   │   ├── config/
│   │   │   ├── app.config.js        # Branding, theme, API URL, pagination
│   │   │   └── modules.config.js    # Module definitions (sidebar, routes, permissions)
│   │   ├── guards/
│   │   │   ├── AuthGuard.jsx        # Redirect to /login if unauthenticated
│   │   │   └── PermissionGuard.jsx  # Hide/show based on permission name
│   │   ├── hooks/
│   │   │   ├── useDebounce.js
│   │   │   └── usePermission.js     # Returns boolean from permission store
│   │   ├── pages/
│   │   │   ├── auth/                # LoginPage
│   │   │   ├── audit-logs/          # AuditLogsPage
│   │   │   ├── dashboard/           # DashboardPage (full featured)
│   │   │   ├── permissions/         # PermissionsPage (redesigned)
│   │   │   ├── roles/               # RolesPage + RoleFormModal
│   │   │   ├── settings/            # SettingsPage (profile, password, theme)
│   │   │   └── users/               # UsersPage + UserFormModal
│   │   ├── router/index.jsx         # Dynamic routes from modules.config
│   │   ├── stores/
│   │   │   ├── authStore.js         # User, isAuthenticated, isLoading, init/login/logout
│   │   │   ├── permissionStore.js   # Permission list + hasPermission()
│   │   │   └── uiStore.js           # Dark mode, sidebar collapsed state
│   │   └── utils/
│   │       ├── exportCsv.js
│   │       └── formatDate.js        # formatDate, formatDateTime, formatRelativeTime
│   ├── .env                         # VITE_API_URL (empty = use Vite proxy)
│   ├── .env.example
│   ├── vite.config.js               # Proxy /api → localhost:5001
│   └── tailwind.config.js
│
├── backend/                         # Node.js + Express API
│   ├── prisma/
│   │   ├── schema.prisma            # User, Role, Permission, RolePermission,
│   │   │                            #   RefreshToken, AuditLog
│   │   └── seed.js                  # Seeds roles, permissions, admin user
│   └── src/
│       ├── app.js                   # Express app entry point
│       ├── config/
│       │   └── modules.config.js    # Mirror of frontend modules config
│       ├── middleware/
│       │   ├── auth.middleware.js   # JWT verification → req.user
│       │   ├── permission.middleware.js  # requirePermission() factory
│       │   └── audit.middleware.js  # Auto-logs all write operations
│       ├── modules/
│       │   ├── analytics/           # 5 aggregation endpoints for dashboard charts
│       │   ├── audit-logs/          # Paginated log query + CSV export
│       │   ├── auth/                # Login, refresh, logout, forgot/reset password
│       │   ├── permissions/         # Permission list + role-permission matrix
│       │   ├── roles/               # Role CRUD + toggle permission endpoint
│       │   └── users/               # User CRUD + /me self-service endpoints
│       └── routes/index.js          # Auto-loads module routes from modules.config
│
├── scripts/
│   └── setup.js                     # One-command project setup
├── docs/
│   ├── GETTING_STARTED.md
│   ├── ADDING_A_MODULE.md
│   ├── RBAC_GUIDE.md
│   ├── CONFIG_REFERENCE.md
│   └── DEPLOYMENT.md
├── package.json                     # Root: npm run setup / npm run dev
└── Promot.md                        # Master AI prompt file (10 build prompts)
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18 or higher |
| MySQL | 8 or higher |
| npm | 9 or higher |

> **macOS users:** Port 5000 is used by AirPlay Receiver. This project uses **port 5001** for the backend. If you need to change it, update `backend/.env` → `PORT=` and `frontend/vite.config.js` → `target:`.

---

### 1. Clone & Install

```bash
git clone https://github.com/yourteam/admin-template.git my-project
cd my-project

# Remove template git history and start fresh
rm -rf .git
git init && git add . && git commit -m "initial: from admin-template v1.0"
```

---

### 2. Configure the Database

Open `backend/.env` (copy from `.env.example` if it doesn't exist):

```env
DATABASE_URL=mysql://root:your-password@localhost:3306/admin_db
JWT_ACCESS_SECRET=<generate a 64-char random string>
JWT_REFRESH_SECRET=<generate a different 64-char random string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=5001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. Run Setup (One Command)

```bash
node scripts/setup.js
```

This automatically:
1. ✓ Checks Node.js version
2. ✓ Copies `.env.example` → `.env` for both frontend and backend
3. ✓ Runs `npm install` in `frontend/` and `backend/`
4. ✓ Generates Prisma client
5. ✓ Runs database migrations
6. ✓ Seeds default roles, permissions, and admin user

---

### 4. Start Development

```bash
npm run dev
```

This starts both servers concurrently:

| Server | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:5001 |

---

### 5. Login

Open **http://localhost:5173** and sign in with:

| Field | Value |
|---|---|
| Email | `admin@admin.com` |
| Password | `Admin@1234` |

---

## 🔐 Default Roles & Permissions

| Role | Access |
|---|---|
| **Admin** | Full access to all modules and actions |
| **Editor** | View + Create + Edit on most modules. No delete, no role management |
| **Viewer** | Read-only (`.view` permissions only) |
| **Moderator** | View + Edit on most modules |

Permissions follow the `module.action` naming convention:

```
users.view     users.create    users.edit      users.delete    users.reset_password
roles.view     roles.create    roles.edit      roles.delete
permissions.view               permissions.edit
logs.view      logs.export
settings.view  settings.edit
analytics.view
```

---

## ➕ Adding a New Module

Adding a module touches **one config file** — everything else wires up automatically.

```bash
# Step 1: Add to modules.config.js (frontend + backend)
{
  key: 'products',
  label: 'Products',
  icon: 'Package',
  path: '/products',
  core: false,
  permissions: ['products.view', 'products.create', 'products.edit', 'products.delete'],
}

# Step 2: Create 3 frontend files
frontend/src/pages/products/
  ├── productsApi.js       # Axios wrappers
  ├── ProductsPage.jsx     # Table + search + pagination
  └── ProductFormModal.jsx # Add/Edit form (React Hook Form + Zod)

# Step 3: Create 4 backend files
backend/src/modules/products/
  ├── products.schema.js     # Zod validation
  ├── products.service.js    # Prisma queries
  ├── products.controller.js # HTTP handlers
  └── products.routes.js     # Express routes + middleware

# Step 4: Add Prisma model + migrate
cd backend
npx prisma migrate dev --name add_products

# Step 5: Seed new permissions
npm run seed
```

See **[docs/ADDING_A_MODULE.md](docs/ADDING_A_MODULE.md)** for the full guide with complete working code.

---

## 🧩 Sidebar Group Configuration

To group modules under a collapsible parent in the sidebar:

```js
// modules.config.js — add group: 'key' to any module
{ key: 'users',       group: 'user-management', ... }
{ key: 'roles',       group: 'user-management', ... }
{ key: 'permissions', group: 'user-management', ... }

// Sidebar.jsx — define the group label and icon
const GROUP_META = {
  'user-management': {
    label: 'User Management',
    icon: 'UsersRound',
  },
}
```

The sidebar automatically:
- Renders a collapsible section for the group
- Opens it when a child route is active
- Shows a flyout submenu in collapsed mode

---

## 🔧 Configuration Reference

### `frontend/src/config/app.config.js`

```js
export const appConfig = {
  appName: 'Admin Dashboard',  // Sidebar header + browser tab
  appLogo: '/logo.svg',
  theme: {
    primaryColor: '#3b82f6',   // Change accent color per project
    darkMode: false,            // Default theme
  },
  pagination: { defaultPageSize: 10 },
  api: {
    baseUrl: '',                // Empty = use Vite proxy (recommended in dev)
                                // Set to https://api.yourdomain.com in production
  },
}
```

### `frontend/.env`

```env
VITE_API_URL=          # Leave empty in dev (Vite proxy handles it)
                       # Set to https://api.yourdomain.com in production
VITE_APP_NAME=Admin Dashboard
```

---

## 🚢 Deployment

### Frontend → Vercel / Netlify

```bash
# Build
cd frontend && npm run build

# Set environment variable in Vercel/Netlify dashboard:
VITE_API_URL=https://your-api-domain.com
```

Add `frontend/public/_redirects` for Netlify SPA routing:
```
/* /index.html 200
```

### Backend → VPS (PM2 + Nginx)

```bash
npm install -g pm2
pm2 start backend/src/app.js --name admin-api
pm2 save && pm2 startup
```

Production `.env` checklist:
```env
NODE_ENV=production
JWT_ACCESS_SECRET=<64-char random>    # NOT the dev default
JWT_REFRESH_SECRET=<64-char random>   # Different from access secret
DATABASE_URL=mysql://user:pass@host/db
CLIENT_URL=https://your-frontend.com
```

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for full Nginx config and SSL setup.

---

## 📖 Documentation

| File | Description |
|---|---|
| [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) | Prerequisites, clone, setup, common errors |
| [docs/ADDING_A_MODULE.md](docs/ADDING_A_MODULE.md) | Step-by-step with full working code example |
| [docs/RBAC_GUIDE.md](docs/RBAC_GUIDE.md) | How to guard pages, buttons, and API endpoints |
| [docs/CONFIG_REFERENCE.md](docs/CONFIG_REFERENCE.md) | Every config field documented with examples |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel, Netlify, VPS, PM2, Nginx, SSL |
| [Promot.md](Promot.md) | Master AI prompt file — 10 prompts that built this template |

---

## 🏗️ Development Workflow

Every new project follows this exact sequence:

```
Plan → Configure → Setup → Database → Backend → Frontend
     → Permissions → Dashboard → QA → Deploy
```

Every new module follows:

```
Config → Database → Backend → Frontend → Permissions → Test
```

**Golden rule:** Never skip phases. Building out of order breaks the template's assumptions.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'add: my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free for personal and commercial use.

---

*Built with React 18 · Tailwind CSS · shadcn/ui · Node.js · Express · MySQL · Prisma*
*Auth: JWT · State: Zustand · Charts: Recharts · Forms: React Hook Form + Zod*
