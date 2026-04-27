// TEMPLATE FILE — part of admin-template v1.0
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findAll() {
  return prisma.role.findMany({
    include: {
      _count: { select: { users: true, permissions: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

async function findById(id) {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { permissions: { include: { permission: true } } },
  })
  if (!role) throw Object.assign(new Error('Role not found'), { status: 404 })
  return role
}

async function create({ name, description, permissionIds = [] }) {
  return prisma.role.create({
    data: {
      name,
      description,
      permissions: {
        create: permissionIds.map((pid) => ({ permissionId: pid })),
      },
    },
    include: { _count: { select: { users: true, permissions: true } } },
  })
}

async function update(id, { name, description, permissionIds }) {
  await prisma.rolePermission.deleteMany({ where: { roleId: id } })
  return prisma.role.update({
    where: { id },
    data: {
      name,
      description,
      permissions: {
        create: (permissionIds || []).map((pid) => ({ permissionId: pid })),
      },
    },
    include: { _count: { select: { users: true, permissions: true } } },
  })
}

async function remove(id) {
  const count = await prisma.user.count({ where: { roleId: id } })
  if (count > 0) {
    throw Object.assign(
      new Error(`Cannot delete role: ${count} user(s) are assigned to it.`),
      { status: 400 }
    )
  }
  await prisma.role.delete({ where: { id } })
}

async function togglePermission(roleId, permissionId) {
  const existing = await prisma.rolePermission.findUnique({
    where: { roleId_permissionId: { roleId, permissionId } },
  })
  if (existing) {
    await prisma.rolePermission.delete({ where: { roleId_permissionId: { roleId, permissionId } } })
    return { assigned: false }
  }
  await prisma.rolePermission.create({ data: { roleId, permissionId } })
  return { assigned: true }
}

module.exports = { findAll, findById, create, update, remove, togglePermission }
