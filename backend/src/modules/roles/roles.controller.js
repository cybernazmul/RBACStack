// TEMPLATE FILE — part of admin-template v1.0
const service = require('./roles.service')

async function getAll(req, res, next) {
  try {
    const data = await service.findAll()
    res.json({ success: true, data })
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
    const data = await service.create(req.body)
    res.status(201).json({ success: true, data, message: 'Role created' })
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const data = await service.update(req.params.id, req.body)
    res.json({ success: true, data, message: 'Role updated' })
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id)
    res.json({ success: true, message: 'Role deleted' })
  } catch (err) { next(err) }
}

async function togglePermission(req, res, next) {
  try {
    const { roleId, permissionId } = req.params
    const data = await service.togglePermission(roleId, permissionId)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

module.exports = { getAll, getOne, create, update, remove, togglePermission }
