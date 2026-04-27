// TEMPLATE FILE — part of admin-template v1.0
const service = require('./audit-logs.service')

async function getAll(req, res, next) {
  try {
    const { page, limit, userId, module, status, startDate, endDate } = req.query
    const result = await service.findAll({ page, limit, userId, module, status, startDate, endDate })
    res.json({ success: true, ...result })
  } catch (err) { next(err) }
}

async function exportCsv(req, res, next) {
  try {
    const { userId, module, status, startDate, endDate } = req.query
    const csv = await service.exportCsv({ userId, module, status, startDate, endDate })
    const date = new Date().toISOString().split('T')[0]
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${date}.csv"`)
    res.send(csv)
  } catch (err) { next(err) }
}

module.exports = { getAll, exportCsv }
