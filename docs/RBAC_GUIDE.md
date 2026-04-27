# RBAC Guide

## Permission Naming Convention

```
Format:  module.action
Examples:
  users.view       users.create    users.edit      users.delete
  roles.view       roles.create    roles.edit      roles.delete
  permissions.view permissions.edit
  logs.view        logs.export
  settings.view    settings.edit
  analytics.view
```

## How to Guard a Page

```jsx
// In router/index.jsx
<PermissionGuard permission="products.view" fallback={<Navigate to="/dashboard" replace />}>
  <ProductsPage />
</PermissionGuard>
```

## How to Guard a Button

```jsx
import PermissionGuard from '@/guards/PermissionGuard'
import { usePermission } from '@/hooks/usePermission'

// Option 1: PermissionGuard component
<PermissionGuard permission="products.create">
  <Button>Add Product</Button>
</PermissionGuard>

// Option 2: usePermission hook (more flexible)
const canDelete = usePermission('products.delete')
{canDelete && <Button onClick={handleDelete}>Delete</Button>}
```

## How to Guard a Backend Endpoint

```js
const { requirePermission } = require('../../middleware/permission.middleware')

router.delete('/:id', requirePermission('products.delete'), ctrl.remove)
```

## How to Add Permissions for a New Module

1. Add the module entry to `modules.config.js` with its permissions array
2. Run `node backend/prisma/seed.js`
3. Go to the Permissions page in the app to assign permissions to roles

## How Permission Changes Take Effect

Permission checks on the backend **query the database on every request** — they do not rely on the JWT. So if an admin changes a role's permissions, that change affects the next API call by that user automatically (no re-login required).

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| User sees buttons they shouldn't | Permission guard not applied | Wrap button in `<PermissionGuard>` |
| API returns 403 for valid user | Permission not assigned to role | Go to Permissions page, toggle on |
| New module not in sidebar | Permission not seeded | Run `npm run seed` |
| Permission change not taking effect | Old cached permissions | Permission checks are DB-based — should be instant |
