// TEMPLATE FILE — part of admin-template v1.0
const express = require('express')
const ctrl = require('./audit-logs.controller')
const { authenticate } = require('../../middleware/auth.middleware')
const { requirePermission } = require('../../middleware/permission.middleware')

const router = express.Router()

router.use(authenticate)

router.get('/', requirePermission('logs.view'), ctrl.getAll)
router.get('/export', requirePermission('logs.export'), ctrl.exportCsv)

module.exports = router
