// TEMPLATE FILE — part of admin-template v1.0
const service = require('./permissions.service')

async function getAll(req, res, next) {
  try {
    const data = await service.findAll()
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

async function getMatrix(req, res, next) {
  try {
    const data = await service.getRolesWithPermissions()
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { name, module, description } = req.body
    const data = await service.create({ name, module, description })
    res.status(201).json({ success: true, data, message: 'Permission created' })
  } catch (err) { next(err) }
}

module.exports = { getAll, getMatrix, create }
