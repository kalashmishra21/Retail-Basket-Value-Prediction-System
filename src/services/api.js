/**
 * Axios API Client Configuration for Frontend-Backend Communication
 * 
 * This module sets up the HTTP client with:
 * - Base URL configuration for all API requests
 * - Automatic token attachment from localStorage
 * - Auto-logout on 401 (unauthorized) responses
 * - Credential handling for session cookies
 * 
 * All API functions return Axios promises that resolve to response objects.
 * Error handling is centralized in the response interceptor.
 */

import axios from 'axios'

const API_BASE_URL = '/api'

/**
 * Create Axios instance with default configuration
 * withCredentials: true enables session cookie handling
 * Content-Type: application/json for all requests
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor - Attach Authentication Token
 * Reads token from localStorage and adds to Authorization header
 * Format: "Token <token_value>" (Django REST Framework format)
 * Runs before every API request
 */
// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers['Authorization'] = `Token ${token}`
  }
  return config
})

/**
 * Response Interceptor - Handle Authentication Errors
 * On 401 Unauthorized: clears auth data and redirects to login
 * Prevents users from accessing protected routes with invalid tokens
 * Handles token expiration and user deletion scenarios
 */
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

/**
 * Authentication API Functions
 * register: Create new user account (POST /api/auth/register/)
 * login: Authenticate user and get token (POST /api/auth/login/)
 * logout: Destroy session (POST /api/auth/logout/)
 */
// Authentication APIs
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
}

/**
 * User Profile API Functions
 * getProfile: Fetch current user data (GET /api/user/profile/)
 * updateProfile: Update user info (PUT /api/user/profile/)
 * generateApiKey: Create new API key (POST /api/user/generate-api-key/)
 * getNotifications: Fetch notification settings (GET /api/user/notifications/)
 * updateNotifications: Update notification preferences (PUT /api/user/notifications/)
 */
// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile/'),
  updateProfile: (data) => api.put('/user/profile/', data),
  generateApiKey: () => api.post('/user/generate-api-key/'),
  getNotifications: () => api.get('/user/notifications/'),
  updateNotifications: (data) => api.put('/user/notifications/', data),
}

/**
 * Dataset API Functions
 * getAll: List all user's datasets (GET /api/datasets/)
 * create: Upload new dataset (POST /api/datasets/)
 * getById: Fetch single dataset (GET /api/datasets/:id/)
 * delete: Remove dataset (DELETE /api/datasets/:id/)
 */
// Dataset APIs
export const datasetAPI = {
  getAll: () => api.get('/datasets/'),
  create: (data) => api.post('/datasets/', data),
  getById: (id) => api.get(`/datasets/${id}/`),
  delete: (id) => api.delete(`/datasets/${id}/`),
}

/**
 * Prediction API Functions
 * getAll: List all predictions, optional date filter (GET /api/predictions/)
 * create: Run new prediction (POST /api/predictions/)
 * getById: Fetch single prediction (GET /api/predictions/:id/)
 * delete: Remove prediction (DELETE /api/predictions/:id/)
 * download: Export prediction as CSV (GET /api/predictions/:id/download/)
 */
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

/**
 * Metrics API Functions
 * All return real-time calculated data from database
 * No dummy values - metrics computed from actual predictions
 * getLatest: Current RMSE, MAE, R² (GET /api/metrics/latest/)
 * getTrends: 7-day basket value trends (GET /api/metrics/trends/)
 * getSummary: Metrics summary with change indicators (GET /api/metrics/summary/)
 * getTimeseries: Historical metrics over time (GET /api/metrics/timeseries/)
 * getSnapshots: Best/worst prediction instances (GET /api/metrics/snapshots/)
 */
// Metrics APIs
export const metricsAPI = {
  getLatest: () => api.get('/metrics/latest/'),
  getTrends: () => api.get('/metrics/trends/'),
  getSummary: () => api.get('/metrics/summary/'),
  getTimeseries: (range = '30days') => api.get(`/metrics/timeseries/?range=${range}`),
  getSnapshots: () => api.get('/metrics/snapshots/'),
}

/**
 * Explainability API Functions
 * getByPredictionId: Fetch feature importance for specific prediction
 * Returns ranked features with categories (Primary Driver, Supporting Factor, Insignificant)
 * Data is deterministic - stored at prediction creation time
 */
// Explainability APIs
export const explainabilityAPI = {
  /**
   * Fetch real feature importance data for a specific prediction.
   * Returns ranked features with category classification from the backend.
   */
  getByPredictionId: (predictionId) => api.get(`/explainability/${predictionId}/`),
}

/**
 * Visualization API Functions
 * Provide chart-ready data for Visualization page
 * All calculations from real database records
 * getSummary: R², bias, outlier score (GET /api/visualization/summary/)
 * getScatter: Actual vs predicted values (GET /api/visualization/scatter/)
 * getErrorDistribution: Error histogram data (GET /api/visualization/error-distribution/)
 * getCategoryAnalysis: Category-wise metrics (GET /api/visualization/category-analysis/)
 */
// Visualization APIs
export const visualizationAPI = {
  getSummary: () => api.get('/visualization/summary/'),
  getScatter: () => api.get('/visualization/scatter/'),
  getErrorDistribution: () => api.get('/visualization/error-distribution/'),
  getCategoryAnalysis: () => api.get('/visualization/category-analysis/'),
}

/**
 * Monitoring module removed completely
 * No dependency remains in system
 */

export default api
