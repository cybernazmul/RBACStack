// TEMPLATE FILE — part of admin-template v1.0
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findAll() {
  return prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { name: 'asc' }] })
}

async function create({ name, module, description }) {
  return prisma.permission.create({ data: { name, module, description } })
}

async function getRolesWithPermissions() {
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({ include: { permissions: { select: { permissionId: true } } } }),
    prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { name: 'asc' }] }),
  ])
  return { roles, permissions }
}

module.exports = { findAll, create, getRolesWithPermissions }
