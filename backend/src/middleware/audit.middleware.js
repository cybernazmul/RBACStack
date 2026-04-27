// TEMPLATE FILE — part of admin-template v1.0
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const METHOD_ACTION_MAP = {
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
  GET: 'view',
}

function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body
  const sensitive = ['password', 'passwordHash', 'token', 'refreshToken', 'currentPassword', 'newPassword']
  const clean = { ...body }
  for (const key of sensitive) {
    if (key in clean) clean[key] = '[REDACTED]'
  }
  return clean
}

function auditMiddleware(moduleName) {
  return (req, res, next) => {
    res.on('finish', () => {
      // Only log write operations
      if (req.method === 'GET') return

      const action = `${moduleName.toLowerCase()}.${METHOD_ACTION_MAP[req.method] || req.method.toLowerCase()}`
      const status = res.statusCode < 400 ? 'success' : 'failed'

      prisma.auditLog
        .create({
          data: {
            userId: req.user?.id || null,
            action,
            module: moduleName,
            status,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
            userAgent: req.headers['user-agent'] || null,
            meta: {
              method: req.method,
              path: req.originalUrl,
              body: sanitizeBody(req.body),
              statusCode: res.statusCode,
            },
          },
        })
        .catch((e) => console.error('Audit log error:', e.message))
    })
    next()
  }
}

module.exports = { auditMiddleware }
