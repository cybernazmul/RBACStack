// TEMPLATE FILE — part of admin-template v1.0
const express = require('express')
const ctrl = require('./roles.controller')
const { authenticate } = require('../../middleware/auth.middleware')
const { requirePermission } = require('../../middleware/permission.middleware')
const { auditMiddleware } = require('../../middleware/audit.middleware')

const router = express.Router()

router.use(authenticate)
router.use(auditMiddleware('Roles'))

router.get('/', requirePermission('roles.view'), ctrl.getAll)
router.get('/:id', requirePermission('roles.view'), ctrl.getOne)
router.post('/', requirePermission('roles.create'), ctrl.create)
router.put('/:id', requirePermission('roles.edit'), ctrl.update)
router.delete('/:id', requirePermission('roles.delete'), ctrl.remove)
router.patch('/:roleId/permissions/:permissionId', requirePermission('permissions.edit'), ctrl.togglePermission)

module.exports = router
