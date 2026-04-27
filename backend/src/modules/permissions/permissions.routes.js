// TEMPLATE FILE — part of admin-template v1.0
const express = require('express')
const ctrl = require('./permissions.controller')
const { authenticate } = require('../../middleware/auth.middleware')
const { requirePermission } = require('../../middleware/permission.middleware')
const { auditMiddleware } = require('../../middleware/audit.middleware')

const router = express.Router()

router.use(authenticate)
router.use(auditMiddleware('Permissions'))

router.get('/', requirePermission('permissions.view'), ctrl.getAll)
router.get('/matrix', requirePermission('permissions.view'), ctrl.getMatrix)
router.post('/', requirePermission('permissions.edit'), ctrl.create)

module.exports = router
