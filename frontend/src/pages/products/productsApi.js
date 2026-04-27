/**
 * TEMPLATE MODULE — admin-template v1.0
 * Replace 'product'/'products' with your entity name.
 */
import axiosClient from '@/api/axiosClient'

export const getProducts = (params) => axiosClient.get('/products', { params }).then((r) => r.data)
export const getProduct = (id) => axiosClient.get(`/products/${id}`).then((r) => r.data.data)
export const createProduct = (data) => axiosClient.post('/products', data).then((r) => r.data)
export const updateProduct = (id, data) => axiosClient.put(`/products/${id}`, data).then((r) => r.data)
export const deleteProduct = (id) => axiosClient.delete(`/products/${id}`).then((r) => r.data)
