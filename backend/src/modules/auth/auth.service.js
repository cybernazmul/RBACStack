// TEMPLATE FILE — part of admin-template v1.0
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const prisma = new PrismaClient()

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, roleId: user.roleId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  )
}

async function getUserWithPermissions(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
      // NEW: include user-level overrides — does NOT change existing structure
      userPermissions: { include: { permission: true } },
    },
  })
  if (!user) return null

  // Start with role permissions (unchanged logic)
  const effectivePerms = new Set(
    user.role.permissions.map((rp) => rp.permission.name)
  )

  // NEW: apply user-level overrides on top — grant adds, revoke removes
  for (const override of user.userPermissions) {
    if (override.type === 'grant')  effectivePerms.add(override.permission.name)
    if (override.type === 'revoke') effectivePerms.delete(override.permission.name)
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    role: { id: user.role.id, name: user.role.name },
    permissions: [...effectivePerms], // same field name, same type — nothing downstream breaks
  }
}

async function login(email, password, ipAddress, userAgent) {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.isActive) {
    await prisma.auditLog.create({
      data: {
        action: 'login.failed',
        module: 'Auth',
        status: 'failed',
        ipAddress,
        userAgent,
        meta: { reason: !user ? 'User not found' : 'Account disabled', email },
      },
    })
    throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'login.failed',
        module: 'Auth',
        status: 'failed',
        ipAddress,
        userAgent,
        meta: { reason: 'Wrong password' },
      },
    })
    throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  }

  const rawRefresh = crypto.randomUUID()
  const hashedRefresh = hashToken(rawRefresh)
  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.refreshToken.create({
    data: { token: hashedRefresh, userId: user.id, expiresAt: expiry },
  })

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'login.success',
      module: 'Auth',
      status: 'success',
      ipAddress,
      userAgent,
    },
  })

  const userData = await getUserWithPermissions(user.id)
  const accessToken = generateAccessToken(user)

  return { accessToken, refreshToken: rawRefresh, user: userData }
}

async function refresh(rawRefreshToken) {
  if (!rawRefreshToken) throw Object.assign(new Error('No refresh token'), { status: 401 })

  const hashed = hashToken(rawRefreshToken)
  const tokenRecord = await prisma.refreshToken.findUnique({ where: { token: hashed } })

  if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
    throw Object.assign(new Error('Invalid or expired refresh token'), { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: tokenRecord.userId } })
  if (!user || !user.isActive) throw Object.assign(new Error('User not found'), { status: 401 })

  const accessToken = generateAccessToken(user)
  const userData = await getUserWithPermissions(user.id)

  return { accessToken, user: userData }
}

async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return
  const hashed = hashToken(rawRefreshToken)
  await prisma.refreshToken.updateMany({ where: { token: hashed }, data: { revoked: true } })
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { message: 'If that email exists, a reset link was sent.' }

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = hashToken(rawToken)
  const expiry = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: hashedToken, resetTokenExpiry: expiry },
  })

  return { message: 'Reset token generated (send via email in production)', resetToken: rawToken }
}

async function resetPassword(rawToken, newPassword) {
  const hashed = hashToken(rawToken)
  const user = await prisma.user.findFirst({
    where: { resetToken: hashed, resetTokenExpiry: { gt: new Date() } },
  })

  if (!user) throw Object.assign(new Error('Invalid or expired reset token'), { status: 400 })

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  })

  await prisma.refreshToken.updateMany({ where: { userId: user.id }, data: { revoked: true } })

  return { message: 'Password reset successfully' }
}

module.exports = { login, refresh, logout, forgotPassword, resetPassword }
