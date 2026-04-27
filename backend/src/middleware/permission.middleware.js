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
        const role = await prisma.role.findUnique({
          where: { id: req.user.roleId },
          include: { permissions: { include: { permission: true } } },
        })
        req.userPermissions = role?.permissions.map((rp) => rp.permission.name) || []
      }

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
