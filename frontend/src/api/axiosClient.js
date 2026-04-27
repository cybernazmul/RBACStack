// TEMPLATE FILE — part of admin-template v1.0
import axios from 'axios'
import { appConfig } from '@/config/app.config'
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore'

const axiosClient = axios.create({
  baseURL: `${appConfig.api.baseUrl}/api`,
  timeout: appConfig.api.timeout,
  withCredentials: true,
})

// Request: attach access token
axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response: on 401 Token expired → refresh → retry
let isRefreshing = false
let refreshQueue = []

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (
      error.response?.status === 401 &&
      error.response?.data?.error === 'Token expired' &&
      !original._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return axiosClient(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await axiosClient.post('/auth/refresh')
        const newToken = res.data.data.accessToken
        setAccessToken(newToken)
        refreshQueue.forEach((p) => p.resolve(newToken))
        refreshQueue = []
        original.headers.Authorization = `Bearer ${newToken}`
        return axiosClient(original)
      } catch {
        clearAccessToken()
        refreshQueue.forEach((p) => p.reject())
        refreshQueue = []
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default axiosClient
