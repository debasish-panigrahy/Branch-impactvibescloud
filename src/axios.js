import axios from 'axios'
import { isAutheticated } from './auth'

const Axios = axios.create({
  // baseURL: 'http://localhost:5040',
  baseURL: 'https://api-impactvibescloud.onrender.com',
})

// Add request interceptor to automatically attach auth token
Axios.interceptors.request.use(
  (config) => {
    const token = isAutheticated()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default Axios
