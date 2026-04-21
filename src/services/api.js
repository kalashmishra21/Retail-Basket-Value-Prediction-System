import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers['Authorization'] = `Token ${token}`
  }
  return config
})

// Auto-logout on 401 — token invalid or user deleted
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Authentication APIs
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
}

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile/'),
  updateProfile: (data) => api.put('/user/profile/', data),
  generateApiKey: () => api.post('/user/generate-api-key/'),
  getNotifications: () => api.get('/user/notifications/'),
  updateNotifications: (data) => api.put('/user/notifications/', data),
}

// Dataset APIs
export const datasetAPI = {
  getAll: () => api.get('/datasets/'),
  create: (data) => api.post('/datasets/', data),
  getById: (id) => api.get(`/datasets/${id}/`),
  delete: (id) => api.delete(`/datasets/${id}/`),
}

// Prediction APIs
export const predictionAPI = {
  /**
   * Fetch all predictions for current user.
   * Optional date param (YYYY-MM-DD) filters by calendar day on the backend.
   */
  getAll: (date = null) => api.get('/predictions/', { params: date ? { date } : {} }),
  create: (data) => api.post('/predictions/', data),
  getById: (id) => api.get(`/predictions/${id}/`),
  delete: (id) => api.delete(`/predictions/${id}/`),
  /**
   * Download a single prediction as CSV.
   * Returns a blob response — caller must trigger browser download.
   */
  download: (id) => api.get(`/predictions/${id}/download/`, { responseType: 'blob' }),
}

// Metrics APIs
export const metricsAPI = {
  getLatest: () => api.get('/metrics/latest/'),
  getTrends: () => api.get('/metrics/trends/'),
  getSummary: () => api.get('/metrics/summary/'),
  getTimeseries: (range = '30days') => api.get(`/metrics/timeseries/?range=${range}`),
  getSnapshots: () => api.get('/metrics/snapshots/'),
}

// Explainability APIs
export const explainabilityAPI = {
  /**
   * Fetch real feature importance data for a specific prediction.
   * Returns ranked features with category classification from the backend.
   */
  getByPredictionId: (predictionId) => api.get(`/explainability/${predictionId}/`),
}

// Visualization APIs
export const visualizationAPI = {
  getSummary: () => api.get('/visualization/summary/'),
  getScatter: () => api.get('/visualization/scatter/'),
  getErrorDistribution: () => api.get('/visualization/error-distribution/'),
  getCategoryAnalysis: () => api.get('/visualization/category-analysis/'),
}

export default api
