// TEMPLATE FILE — part of admin-template v1.0
const express = require('express')
const ctrl = require('./analytics.controller')
const { authenticate } = require('../../middleware/auth.middleware')
const { requirePermission } = require('../../middleware/permission.middleware')

const router = express.Router()

router.use(authenticate)
router.use(requirePermission('analytics.view'))

router.get('/stats', ctrl.getStats)
router.get('/user-growth', ctrl.getUserGrowth)
router.get('/login-activity', ctrl.getLoginActivity)
router.get('/role-distribution', ctrl.getRoleDistribution)
router.get('/module-usage', ctrl.getModuleUsage)

module.exports = router
