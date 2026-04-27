// TEMPLATE FILE — part of admin-template v1.0
/**
 * modules.config.js — Single source of truth for all app modules.
 *
 * Adding an entry here automatically:
 *   - Adds a nav item to the Sidebar
 *   - Registers a route in the Router
 *   - Auto-loads its backend route file
 *   - Inserts its permissions into the DB on next seed
 *
 * Fields:
 *   key         — unique slug (lowercase, hyphens). Used as route key and API path.
 *   label       — display name in sidebar
 *   icon        — exact Lucide React icon name (see lucide.dev)
 *   path        — frontend route path (must start with /)
 *   core        — true = always included, never remove; false = project-specific
 *   permissions — all permission names for this module (module.action format)
 */
export const modulesConfig = [
  // ─── CORE MODULES — never remove these ────────────────────────────────────
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    core: true,
    permissions: ['analytics.view'],
  },
  {
    key: 'users',
    label: 'Users',
    icon: 'Users',
    path: '/users',
    core: true,
    group: 'user-management',
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.reset_password'],
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: 'Shield',
    path: '/roles',
    core: true,
    group: 'user-management',
    permissions: ['roles.view', 'roles.create', 'roles.edit', 'roles.delete'],
  },
  {
    key: 'permissions',
    label: 'Permissions',
    icon: 'Key',
    path: '/permissions',
    core: true,
    group: 'user-management',
    permissions: ['permissions.view', 'permissions.edit'],
  },
  {
    key: 'audit-logs',
    label: 'Audit Logs',
    icon: 'ScrollText',
    path: '/audit-logs',
    core: true,
    permissions: ['logs.view', 'logs.export'],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/settings',
    core: true,
    permissions: ['settings.view', 'settings.edit'],
  },

  // ─── EXAMPLE CUSTOM MODULES — uncomment and adapt per project ─────────────
  // {
  //   key: 'products',
  //   label: 'Products',
  //   icon: 'Package',
  //   path: '/products',
  //   core: false,
  //   permissions: ['products.view', 'products.create', 'products.edit', 'products.delete'],
  // },
  // {
  //   key: 'orders',
  //   label: 'Orders',
  //   icon: 'ShoppingCart',
  //   path: '/orders',
  //   core: false,
  //   permissions: ['orders.view', 'orders.edit', 'orders.delete'],
  // },
  // {
  //   key: 'reports',
  //   label: 'Reports',
  //   icon: 'BarChart2',
  //   path: '/reports',
  //   core: false,
  //   permissions: ['reports.view', 'reports.export'],
  // },
]
