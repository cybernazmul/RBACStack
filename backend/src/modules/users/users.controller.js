// TEMPLATE FILE — part of admin-template v1.0
const service = require('./users.service')
const { createUserSchema, updateUserSchema, resetPasswordSchema } = require('./users.schema')

async function getAll(req, res, next) {
  try {
    const { page, limit, search, roleId } = req.query
    const result = await service.findAll({ page, limit, search, roleId })
    res.json({ success: true, ...result })
  } catch (err) { next(err) }
}

async function getOne(req, res, next) {
  try {
    const data = await service.findById(req.params.id)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const body = createUserSchema.parse(req.body)
    const data = await service.create(body)
    res.status(201).json({ success: true, data, message: 'User created' })
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const body = updateUserSchema.parse(req.body)
    const data = await service.update(req.params.id, body)
    res.json({ success: true, data, message: 'User updated' })
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id)
    res.json({ success: true, message: 'User deleted' })
  } catch (err) { next(err) }
}

async function resetPassword(req, res, next) {
  try {
    const { newPassword } = resetPasswordSchema.parse(req.body)
    await service.resetPassword(req.params.id, newPassword)
    res.json({ success: true, message: 'Password reset' })
  } catch (err) { next(err) }
}

async function getMe(req, res, next) {
  try {
    const data = await service.getMe(req.user.id)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

async function updateMe(req, res, next) {
  try {
    const { name, email } = req.body
    const data = await service.updateMe(req.user.id, { name, email })
    res.json({ success: true, data, message: 'Profile updated' })
  } catch (err) { next(err) }
}

async function updateMyPassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    await service.updateMyPassword(req.user.id, currentPassword, newPassword)
    res.json({ success: true, message: 'Password updated' })
  } catch (err) { next(err) }
}

module.exports = { getAll, getOne, create, update, remove, resetPassword, getMe, updateMe, updateMyPassword }
