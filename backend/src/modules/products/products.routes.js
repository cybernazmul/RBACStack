/**
 * TEMPLATE MODULE — admin-template v1.0
 * Replace 'product'/'Product'/'products' with your entity name.
 */
const express = require('express')
const ctrl = require('./products.controller')
const { authenticate } = require('../../middleware/auth.middleware')
const { requirePermission } = require('../../middleware/permission.middleware')
const { auditMiddleware } = require('../../middleware/audit.middleware')

const router = express.Router()

router.use(authenticate)
router.use(auditMiddleware('Products'))

router.get('/',     requirePermission('products.view'),   ctrl.getAll)
router.get('/:id',  requirePermission('products.view'),   ctrl.getOne)
router.post('/',    requirePermission('products.create'), ctrl.create)
router.put('/:id',  requirePermission('products.edit'),   ctrl.update)
router.delete('/:id', requirePermission('products.delete'), ctrl.remove)

module.exports = router
