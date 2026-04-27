// TEMPLATE FILE — part of admin-template v1.0
const express = require('express')
const ctrl = require('./users.controller')
const { authenticate } = require('../../middleware/auth.middleware')
const { requirePermission } = require('../../middleware/permission.middleware')
const { auditMiddleware } = require('../../middleware/audit.middleware')

const router = express.Router()

router.use(authenticate)
router.use(auditMiddleware('Users'))

// Self-service routes
router.get('/me', ctrl.getMe)
router.put('/me', ctrl.updateMe)
router.put('/me/password', ctrl.updateMyPassword)

// Admin routes
router.get('/', requirePermission('users.view'), ctrl.getAll)
router.get('/:id', requirePermission('users.view'), ctrl.getOne)
router.post('/', requirePermission('users.create'), ctrl.create)
router.put('/:id', requirePermission('users.edit'), ctrl.update)
router.delete('/:id', requirePermission('users.delete'), ctrl.remove)
router.post('/:id/reset-password', requirePermission('users.reset_password'), ctrl.resetPassword)

module.exports = router
