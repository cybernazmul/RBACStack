// TEMPLATE FILE — part of admin-template v1.0
const express = require('express')
const ctrl = require('./users.controller')
const upService = require('./user-permissions.service') // NEW
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

// ── NEW: per-user permission override endpoints ───────────────────────────────
// GET    /api/users/:id/permissions  → list overrides for user
// POST   /api/users/:id/permissions  → add/update one override { permissionId, type }
// DELETE /api/users/:id/permissions/:permissionId → remove one override
// DELETE /api/users/:id/permissions  → clear all overrides for user

router.get('/:id/permissions', requirePermission('users.edit'), async (req, res, next) => {
  try {
    const data = await upService.getOverrides(req.params.id)
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

router.post('/:id/permissions', requirePermission('users.edit'), async (req, res, next) => {
  try {
    const { permissionId, type } = req.body
    const data = await upService.setOverride(req.params.id, permissionId, type)
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

router.delete('/:id/permissions/:permissionId', requirePermission('users.edit'), async (req, res, next) => {
  try {
    await upService.removeOverride(req.params.id, req.params.permissionId)
    res.json({ success: true, message: 'Override removed' })
  } catch (err) { next(err) }
})

router.delete('/:id/permissions', requirePermission('users.edit'), async (req, res, next) => {
  try {
    await upService.clearOverrides(req.params.id)
    res.json({ success: true, message: 'All overrides cleared' })
  } catch (err) { next(err) }
})

module.exports = router
