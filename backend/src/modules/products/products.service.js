/**
 * TEMPLATE MODULE — admin-template v1.0
 * Replace 'product'/'Product'/'products' with your entity name.
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findAll({ page = 1, limit = 10, search = '' } = {}) {
  const where = search
    ? { OR: [{ name: { contains: search } }, { category: { contains: search } }] }
    : {}
  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])
  return { data, total, page: Number(page), totalPages: Math.ceil(total / limit) }
}

async function findById(id) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 })
  return product
}

async function create(data) {
  return prisma.product.create({ data })
}

async function update(id, data) {
  return prisma.product.update({ where: { id }, data })
}

async function remove(id) {
  await prisma.product.delete({ where: { id } })
}

module.exports = { findAll, findById, create, update, remove }
