/* eslint-disable no-console */
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import LocalStorage from './localStorage'
import { openNotificationError } from 'common/utils'
import { ADMIN_PATH } from 'common/constants/paths'
const API_URL = import.meta.env.VITE_API_URL

export const AxiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

AxiosClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = LocalStorage.getToken()

  const newConfig = { ...config }
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
    // config.headers.token = `${token}`;
  }

  if (newConfig.headers && newConfig.headers['Content-Type'] === 'multipart/form-data') return newConfig

  if (config.params) {
    newConfig.params = config.params
  }
  if (config.data) {
    newConfig.data = config.data
  }

  return newConfig
})

AxiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response && response.data) {
      return response.data
    }
    return response
  },
  (error) => {
    console.log('🚀 ~ error:', error)
    const status = error.response?.status || error.status
    if (status === 401 || status === 403) {
      const role = LocalStorage.getRole()
      if (role === 'ADMIN' || role === 'STAFF') {
        window.location.href = '/ad-login'
      } else {
        window.location.href = '/login'
      }
      openNotificationError(error)
      LocalStorage.removeToken()
    }
    return Promise.reject(error)
  }
)
