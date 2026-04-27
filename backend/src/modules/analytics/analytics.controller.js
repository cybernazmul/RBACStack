// TEMPLATE FILE — part of admin-template v1.0
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getStats(req, res, next) {
  try {
    const [totalUsers, activeUsers, totalRoles, totalPermissions] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.role.count(),
      prisma.permission.count(),
    ])

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [logsToday, failedToday] = await Promise.all([
      prisma.auditLog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.auditLog.count({ where: { createdAt: { gte: todayStart }, status: 'failed' } }),
    ])

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const newUsersThisWeek = await prisma.user.count({ where: { createdAt: { gte: weekAgo } } })

    res.json({
      success: true,
      data: { totalUsers, activeUsers, totalRoles, totalPermissions, logsToday, failedToday, newUsersThisWeek },
    })
  } catch (err) { next(err) }
}

async function getUserGrowth(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const counts = {}
    for (const u of users) {
      const key = u.createdAt.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      counts[key] = (counts[key] || 0) + 1
    }

    const data = Object.entries(counts).map(([month, count]) => ({ month, count }))
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

async function getLoginActivity(req, res, next) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const logs = await prisma.auditLog.findMany({
      where: { action: { in: ['login.success', 'login.failed'] }, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, status: true },
    })

    const byDate = {}
    for (const log of logs) {
      const date = log.createdAt.toISOString().split('T')[0]
      if (!byDate[date]) byDate[date] = { date, success: 0, failed: 0 }
      if (log.status === 'success') byDate[date].success++
      else byDate[date].failed++
    }

    const data = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

async function getRoleDistribution(req, res, next) {
  try {
    const roles = await prisma.role.findMany({
      include: { _count: { select: { users: true } } },
    })
    const data = roles.map((r) => ({ role: r.name, count: r._count.users }))
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

async function getModuleUsage(req, res, next) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const logs = await prisma.auditLog.groupBy({
      by: ['module'],
      _count: { module: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { module: 'desc' } },
    })
    const data = logs.map((l) => ({ module: l.module, count: l._count.module }))
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

module.exports = { getStats, getUserGrowth, getLoginActivity, getRoleDistribution, getModuleUsage }
