// TEMPLATE FILE — part of admin-template v1.0
const authService = require('./auth.service')

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

async function loginHandler(req, res, next) {
  try {
    const { email, password } = req.body
    const ipAddress = req.ip || req.headers['x-forwarded-for']
    const userAgent = req.headers['user-agent']

    const { accessToken, refreshToken, user } = await authService.login(email, password, ipAddress, userAgent)

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.json({ success: true, data: { accessToken, user } })
  } catch (err) {
    next(err)
  }
}

async function refreshHandler(req, res, next) {
  try {
    const raw = req.cookies?.refreshToken
    const { accessToken, user } = await authService.refresh(raw)
    res.json({ success: true, data: { accessToken, user } })
  } catch (err) {
    next(err)
  }
}

async function logoutHandler(req, res, next) {
  try {
    const raw = req.cookies?.refreshToken
    await authService.logout(raw)
    res.clearCookie('refreshToken', COOKIE_OPTIONS)
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
}

async function forgotPasswordHandler(req, res, next) {
  try {
    const { email } = req.body
    const result = await authService.forgotPassword(email)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

async function resetPasswordHandler(req, res, next) {
  try {
    const { token, newPassword } = req.body
    const result = await authService.resetPassword(token, newPassword)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

module.exports = { loginHandler, refreshHandler, logoutHandler, forgotPasswordHandler, resetPasswordHandler }
