// TEMPLATE FILE — part of admin-template v1.0
import axiosClient from '@/api/axiosClient'

export const getUsers = (params) => axiosClient.get('/users', { params }).then((r) => r.data)
export const getUser = (id) => axiosClient.get(`/users/${id}`).then((r) => r.data.data)
export const createUser = (data) => axiosClient.post('/users', data).then((r) => r.data)
export const updateUser = (id, data) => axiosClient.put(`/users/${id}`, data).then((r) => r.data)
export const deleteUser = (id) => axiosClient.delete(`/users/${id}`).then((r) => r.data)
export const resetUserPassword = (id, newPassword) =>
  axiosClient.post(`/users/${id}/reset-password`, { newPassword }).then((r) => r.data)
