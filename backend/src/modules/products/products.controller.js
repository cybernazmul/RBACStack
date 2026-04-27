/**
 * TEMPLATE MODULE — admin-template v1.0
 * Replace 'product'/'Product'/'products' with your entity name.
 */
const service = require('./products.service')
const { createProductSchema, updateProductSchema } = require('./products.schema')

async function getAll(req, res, next) {
  try {
    const { page, limit, search } = req.query
    const result = await service.findAll({ page, limit, search })
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
    const body = createProductSchema.parse(req.body)
    const data = await service.create(body)
    res.status(201).json({ success: true, data, message: 'Product created' })
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const body = updateProductSchema.parse(req.body)
    const data = await service.update(req.params.id, body)
    res.json({ success: true, data, message: 'Product updated' })
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id)
    res.json({ success: true, message: 'Product deleted' })
  } catch (err) { next(err) }
}

module.exports = { getAll, getOne, create, update, remove }
