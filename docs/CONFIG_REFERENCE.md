# Config Reference

## app.config.js

| Field | Type | Default | Description |
|---|---|---|---|
| `appName` | string | `'Admin Dashboard'` | App name shown in sidebar and browser tab |
| `appLogo` | string | `'/logo.svg'` | Path to logo in `/public` |
| `appVersion` | string | `'1.0.0'` | Displayed in sidebar footer |
| `theme.primaryColor` | hex string | `'#3b82f6'` | Main accent color (change per project) |
| `theme.darkMode` | boolean | `false` | Default theme on first load |
| `pagination.defaultPageSize` | number | `10` | Rows per page in all tables |
| `api.baseUrl` | string | `VITE_API_URL` | Backend API base URL |
| `api.timeout` | number | `10000` | Axios request timeout (ms) |

## modules.config.js

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | string | Yes | Unique slug. Used as route key and API path. Lowercase, hyphens. |
| `label` | string | Yes | Display name in sidebar |
| `icon` | string | Yes | Lucide React icon name (see lucide.dev) |
| `path` | string | Yes | Frontend route path (must start with `/`) |
| `core` | boolean | Yes | `true` = never remove. `false` = project-specific |
| `permissions` | string[] | Yes | All permission names. First entry = primary (used for sidebar visibility) |

## Configuration Examples

### E-Commerce Project

```js
// modules.config.js — add these custom modules:
{ key: 'products',  label: 'Products',  icon: 'Package',      path: '/products',  core: false, permissions: ['products.view','products.create','products.edit','products.delete'] },
{ key: 'orders',    label: 'Orders',    icon: 'ShoppingCart', path: '/orders',    core: false, permissions: ['orders.view','orders.edit','orders.delete'] },
{ key: 'customers', label: 'Customers', icon: 'UserCheck',    path: '/customers', core: false, permissions: ['customers.view','customers.create','customers.edit'] },
```

### CMS Project

```js
{ key: 'posts',      label: 'Posts',      icon: 'FileText',  path: '/posts',      core: false, permissions: ['posts.view','posts.create','posts.edit','posts.delete','posts.publish'] },
{ key: 'categories', label: 'Categories', icon: 'Tag',       path: '/categories', core: false, permissions: ['categories.view','categories.create','categories.edit','categories.delete'] },
{ key: 'media',      label: 'Media',      icon: 'Image',     path: '/media',      core: false, permissions: ['media.view','media.upload','media.delete'] },
```

### SaaS Project

```js
{ key: 'subscriptions', label: 'Subscriptions', icon: 'CreditCard', path: '/subscriptions', core: false, permissions: ['subscriptions.view','subscriptions.edit','subscriptions.cancel'] },
{ key: 'billing',       label: 'Billing',       icon: 'Receipt',    path: '/billing',       core: false, permissions: ['billing.view','billing.export'] },
{ key: 'tenants',       label: 'Tenants',       icon: 'Building2',  path: '/tenants',       core: false, permissions: ['tenants.view','tenants.create','tenants.edit','tenants.delete'] },
```
