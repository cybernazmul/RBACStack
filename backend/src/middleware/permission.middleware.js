// TEMPLATE FILE — part of admin-template v1.0
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function requirePermission(permissionName) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' })
      }

      // Cache per request to avoid multiple DB calls on same request
      if (!req.userPermissions) {
        // Step 1: get role permissions — UNCHANGED
        const role = await prisma.role.findUnique({
          where: { id: req.user.roleId },
          include: { permissions: { include: { permission: true } } },
        })
        const effectivePerms = new Set(
          role?.permissions.map((rp) => rp.permission.name) || []
        )

        // Step 2: apply user-level overrides — NEW, purely additive
        const overrides = await prisma.userPermission.findMany({
          where: { userId: req.user.id },
          include: { permission: true },
        })
        for (const o of overrides) {
          if (o.type === 'grant')  effectivePerms.add(o.permission.name)
          if (o.type === 'revoke') effectivePerms.delete(o.permission.name)
        }

        req.userPermissions = [...effectivePerms]
      }

      // This check is IDENTICAL to before — nothing changed downstream
      if (!req.userPermissions.includes(permissionName)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          required: permissionName,
        })
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}

module.exports = { requirePermission }
