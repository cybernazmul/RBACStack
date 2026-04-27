import axiosClient from '@/api/axiosClient'
export const getRoles = () => axiosClient.get('/roles').then((r) => r.data.data)
export const getRole = (id) => axiosClient.get(`/roles/${id}`).then((r) => r.data.data)
export const createRole = (data) => axiosClient.post('/roles', data).then((r) => r.data)
export const updateRole = (id, data) => axiosClient.put(`/roles/${id}`, data).then((r) => r.data)
export const deleteRole = (id) => axiosClient.delete(`/roles/${id}`).then((r) => r.data)
