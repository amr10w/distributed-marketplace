import axios from 'axios'
import { API_BASE_URL } from '../lib/constants'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('marketplace_user')
    if (user) {
      const parsed = JSON.parse(user)
      config.headers.Authorization = 'Bearer ' + parsed.id
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Safely grab the URL that just failed
    const failedUrl = error.config?.url || '';

    // 2. Check if it's a 401 AND make sure it WAS NOT the login request
    if (error.response && error.response.status === 401 && !failedUrl.includes('auth/login')) {
      localStorage.removeItem('marketplace_user')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance
