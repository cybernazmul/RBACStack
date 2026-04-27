// TEMPLATE FILE — part of admin-template v1.0
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function findAll({ page = 1, limit = 10, search = '', roleId } = {}) {
  const skip = (page - 1) * limit
  const where = {
    AND: [
      search
        ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
        : {},
      roleId ? { roleId } : {},
    ],
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return {
    data: data.map((u) => ({ ...u, passwordHash: undefined })),
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  }
}

async function findById(id) {
  const user = await prisma.user.findUnique({ where: { id }, include: { role: true } })
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 })
  const { passwordHash, ...safe } = user
  return safe
}

async function create(data) {
  const passwordHash = await bcrypt.hash(data.password, 12)
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash, roleId: data.roleId, isActive: data.isActive ?? true },
    include: { role: true },
  })
  const { passwordHash: _, ...safe } = user
  return safe
}

async function update(id, data) {
  const updateData = { ...data }
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 12)
    delete updateData.password
  }
  const user = await prisma.user.update({ where: { id }, data: updateData, include: { role: true } })
  const { passwordHash, ...safe } = user
  return safe
}

async function remove(id) {
  await prisma.user.delete({ where: { id } })
}

async function toggleStatus(id) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 })
  return prisma.user.update({ where: { id }, data: { isActive: !user.isActive } })
}

async function resetPassword(id, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id }, data: { passwordHash } })
  await prisma.refreshToken.updateMany({ where: { userId: id }, data: { revoked: true } })
}

async function getMe(userId) {
  return findById(userId)
}

async function updateMe(userId, data) {
  return update(userId, data)
}

async function updateMyPassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) throw Object.assign(new Error('Current password is incorrect'), { status: 400 })
  await resetPassword(userId, newPassword)
}

module.exports = { findAll, findById, create, update, remove, toggleStatus, resetPassword, getMe, updateMe, updateMyPassword }
