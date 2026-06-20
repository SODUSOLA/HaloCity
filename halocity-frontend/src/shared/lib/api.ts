import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('halocity_auth')
    if (stored) {
      const { token } = JSON.parse(stored)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch {}
  return config
})

api.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      response.data = body.data
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('halocity_auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosErr = error as { response?: { data?: { message?: string } } }
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message
    }
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}

export default api
