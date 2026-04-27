// NEW FILE — user-level permission overrides (Option B)
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Get all overrides for a user with full permission details
async function getOverrides(userId) {
  return prisma.userPermission.findMany({
    where: { userId },
    include: { permission: true },
    orderBy: { createdAt: 'asc' },
  })
}

// Set an override — upsert so calling twice is safe
async function setOverride(userId, permissionId, type) {
  if (!['grant', 'revoke'].includes(type)) {
    throw Object.assign(new Error('type must be "grant" or "revoke"'), { status: 400 })
  }
  return prisma.userPermission.upsert({
    where: { userId_permissionId: { userId, permissionId } },
    update: { type },
    create: { userId, permissionId, type },
    include: { permission: true },
  })
}

// Remove an override — user falls back to pure role permissions for this permission
async function removeOverride(userId, permissionId) {
  await prisma.userPermission.deleteMany({ where: { userId, permissionId } })
}

// Remove ALL overrides for a user (reset to role-only)
async function clearOverrides(userId) {
  await prisma.userPermission.deleteMany({ where: { userId } })
}

module.exports = { getOverrides, setOverride, removeOverride, clearOverrides }
