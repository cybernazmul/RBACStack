// TEMPLATE FILE — part of admin-template v1.0
const express = require('express')
const ctrl = require('./auth.controller')

const router = express.Router()

router.post('/login', ctrl.loginHandler)
router.post('/refresh', ctrl.refreshHandler)
router.post('/logout', ctrl.logoutHandler)
router.post('/forgot-password', ctrl.forgotPasswordHandler)
router.post('/reset-password', ctrl.resetPasswordHandler)

module.exports = router
