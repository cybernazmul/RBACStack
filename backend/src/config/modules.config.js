// TEMPLATE FILE — part of admin-template v1.0
// IMPORTANT: Keep this file identical to frontend/src/config/modules.config.js
const modulesConfig = [
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
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.reset_password'],
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: 'Shield',
    path: '/roles',
    core: true,
    permissions: ['roles.view', 'roles.create', 'roles.edit', 'roles.delete'],
  },
  {
    key: 'permissions',
    label: 'Permissions',
    icon: 'Key',
    path: '/permissions',
    core: true,
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
  // Add custom modules here — mirror frontend/src/config/modules.config.js exactly
]

module.exports = modulesConfig
