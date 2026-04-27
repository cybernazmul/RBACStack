// TEMPLATE FILE — part of admin-template v1.0
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findAll({ page = 1, limit = 10, userId, module, status, startDate, endDate } = {}) {
  const where = {}
  if (userId) where.userId = userId
  if (module) where.module = module
  if (status) where.status = status
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      where.createdAt.lte = end
    }
  }

  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: Number(limit),
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ])

  return { data, total, page: Number(page), totalPages: Math.ceil(total / limit) }
}

async function exportCsv(filters = {}) {
  const { data } = await findAll({ ...filters, page: 1, limit: 10000 })
  const headers = ['ID', 'User', 'Action', 'Module', 'Status', 'IP Address', 'Created At']
  const rows = data.map((log) => [
    log.id.slice(0, 8),
    log.user?.name || 'System',
    log.action,
    log.module,
    log.status,
    log.ipAddress || '',
    log.createdAt.toISOString(),
  ])
  return [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
}

module.exports = { findAll, exportCsv }
