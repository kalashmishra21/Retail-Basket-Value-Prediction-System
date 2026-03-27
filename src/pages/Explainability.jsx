import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { predictionAPI, explainabilityAPI } from '../services/api'

/**
 * Explainability page — shows real feature importance for each prediction.
 *
 * Data flow:
 *  1. On mount: fetch all predictions for the current user via GET /api/predictions/
 *  2. Populate dropdown with prediction IDs
 *  3. When user selects a prediction: call GET /api/explainability/<predictionId>/
 *  4. Backend returns ranked features with category classification
 *  5. Render dynamic progress bars + category badges — NO hardcoded values
 */
const Explainability = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()

  const [currentUser, setCurrentUser]           = useState(null)
  const [activeMenu, setActiveMenu]             = useState('Explainability')

  // Predictions list for dropdown
  const [predictions, setPredictions]           = useState([])
  const [predictionsLoading, setPredictionsLoading] = useState(true)

  // Selected prediction state
  const [selectedId, setSelectedId]             = useState('')

  // Explainability data from backend
  const [explainData, setExplainData]           = useState(null)
  const [explainLoading, setExplainLoading]     = useState(false)
  const [explainError, setExplainError]         = useState('')

  // ─── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) { navigate('/'); return }
    setCurrentUser(user)
  }, [navigate])

  // ─── Fetch predictions list on mount ───────────────────────────────────────
  useEffect(() => {
    /**
     * Loads all predictions belonging to the current user.
     * Only completed predictions are shown in the dropdown because
     * only completed ones have feature data stored.
     */
    const fetchPredictions = async () => {
      try {
        setPredictionsLoading(true)
        const res = await predictionAPI.getAll()
        const completed = res.data.filter(p => p.status === 'completed')
        setPredictions(completed)
      } catch (err) {
        console.error('Failed to fetch predictions:', err)
      } finally {
        setPredictionsLoading(false)
      }
    }
    fetchPredictions()
  }, [])

  // ─── Fetch explainability when selection changes ────────────────────────────
  const fetchExplainability = useCallback(async (predictionId) => {
    /**
     * Calls GET /api/explainability/<predictionId>/
     * Backend returns:
     *   - features: [{ name, value, category }] sorted by value desc
     *   - insight: top-feature insight string
     *   - predicted_value, confidence, created_at
     *
     * No random values — data is deterministic from stored feature_data.
     */
    if (!predictionId) return
    try {
      setExplainLoading(true)
      setExplainError('')
      setExplainData(null)
      const res = await explainabilityAPI.getByPredictionId(predictionId)
      setExplainData(res.data)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load explainability data.'
      setExplainError(msg)
    } finally {
      setExplainLoading(false)
    }
  }, [])

  const handleSelectChange = (e) => {
    const id = e.target.value
    setSelectedId(id)
    fetchExplainability(id)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    navigate('/')
  }

  // ─── Category styling helpers ───────────────────────────────────────────────
  const categoryColor = (category) => {
    if (category === 'Primary Driver')   return 'bg-blue-600'
    if (category === 'Supporting Factor') return 'bg-blue-300'
    return 'bg-gray-300'
  }

  const categoryBadge = (category) => {
    if (category === 'Primary Driver')
      return 'bg-blue-100 text-blue-700'
    if (category === 'Supporting Factor')
      return 'bg-sky-100 text-sky-700'
    return 'bg-gray-100 text-gray-500'
  }

  const menuItems = [
    { icon: '📊', label: 'Dashboard',     path: '/dashboard' },
    { icon: '📤', label: 'Upload Data',   path: '/upload' },
    { icon: '📋', label: 'Predictions',   path: '/predictions' },
    { icon: '🕐', label: 'History',       path: '/history' },
    { icon: '🔍', label: 'Explainability',path: '/explainability' },
    { icon: '📈', label: 'Metrics',       path: '/metrics' },
    { icon: '📊', label: 'Visualization', path: '/visualization' },
    { icon: '📡', label: 'Monitoring',    path: '/monitoring' },
    { icon: '⚙️', label: 'Settings',      path: '/settings' },
  ]

  if (!currentUser) return null

  // ─── Derived display values ─────────────────────────────────────────────────
  const primaryDrivers   = explainData?.features?.filter(f => f.category === 'Primary Driver')   ?? []
  const supportingFactor = explainData?.features?.filter(f => f.category === 'Supporting Factor') ?? []
  const insignificant    = explainData?.features?.filter(f => f.category === 'Insignificant')     ?? []

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>

      {/* ── Sidebar ── */}
      <div className={`w-64 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RBVPS</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { setActiveMenu(item.label); navigate(item.path) }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeMenu === item.label
                  ? 'bg-blue-50 text-blue-600'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button onClick={handleLogout} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <span className="text-lg">🚪</span><span>Logout</span>
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-4`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>›</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Explainability Analysis</span>
            </div>
            <div
              onClick={() => navigate('/settings')}
              className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:opacity-80 transition"
            >
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

          {/* Page title + dropdown */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Model Explainability</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Analyze feature impact and individual prediction logic.
              </p>
            </div>

            {/* ── Prediction dropdown ── */}
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>PREDICTION ID:</span>
              {predictionsLoading ? (
                <div className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-white">
                  Loading…
                </div>
              ) : predictions.length === 0 ? (
                <div className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-white">
                  No predictions available
                </div>
              ) : (
                <select
                  value={selectedId}
                  onChange={handleSelectChange}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">— Select a prediction —</option>
                  {predictions.map(p => (
                    <option key={p.id} value={p.prediction_id}>
                      {p.prediction_id} (${parseFloat(p.predicted_value).toFixed(2)})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* ── Body grid ── */}
          <div className="grid grid-cols-3 gap-6">

            {/* ── Left: Global Feature Importance ── */}
            <div className={`col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
              <div className="flex items-center space-x-2 mb-2">
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Global Feature Importance
                </h2>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                {explainData
                  ? `Feature contributions for prediction ${explainData.prediction_id}`
                  : 'Select a prediction to see real feature importance'}
              </p>

              {/* Loading state */}
              {explainLoading && (
                <div className="flex items-center justify-center py-16">
                  <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="ml-3 text-sm text-gray-500">Computing feature importance…</span>
                </div>
              )}

              {/* Error state */}
              {!explainLoading && explainError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                  {explainError}
                </div>
              )}

              {/* Empty — no selection */}
              {!explainLoading && !explainError && !explainData && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">
                    {predictions.length === 0
                      ? 'No predictions yet. Upload data and run a prediction first.'
                      : 'Select a prediction from the dropdown above to view feature importance.'}
                  </p>
                </div>
              )}

              {/* ── Real feature bars ── */}
              {!explainLoading && !explainError && explainData && (
                <div className="space-y-5">
                  {explainData.features.map((feature) => (
                    <div key={feature.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {feature.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryBadge(feature.category)}`}>
                          {feature.category}
                        </span>
                      </div>
                      <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-8`}>
                        <div
                          className={`${categoryColor(feature.category)} h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500`}
                          style={{ width: `${Math.max(feature.value * 100, 8)}%` }}
                        >
                          <span className="text-xs text-white font-semibold">
                            {feature.value.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Legend */}
                  <div className={`flex items-center justify-center space-x-6 mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded" />
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Primary Driver (≥0.70)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-300 rounded" />
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Supporting Factor (0.40–0.69)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-300 rounded" />
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Insignificant (&lt;0.40)</span>
                    </div>
                  </div>

                  {/* Insight cards */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">Model Insight</h3>
                      </div>
                      <p className="text-sm text-gray-700">{explainData.insight}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">Feature Summary</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        {primaryDrivers.length} Primary Driver{primaryDrivers.length !== 1 ? 's' : ''},{' '}
                        {supportingFactor.length} Supporting Factor{supportingFactor.length !== 1 ? 's' : ''},{' '}
                        {insignificant.length} Insignificant feature{insignificant.length !== 1 ? 's' : ''}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column ── */}
            <div className="space-y-6">

              {/* Prediction detail card */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                {!explainData ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <svg className="w-14 h-14 text-white/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-base font-semibold">No Prediction Selected</p>
                    <p className="text-xs opacity-80 mt-1">
                      {predictions.length === 0
                        ? 'Upload data and run predictions first'
                        : 'Select a prediction from the dropdown'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs opacity-75 mb-1">PREDICTION ID</p>
                    <p className="text-xl font-bold mb-4">{explainData.prediction_id}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="opacity-75">Predicted Value</span>
                        <span className="font-semibold">${parseFloat(explainData.predicted_value).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Confidence</span>
                        <span className="font-semibold">{parseFloat(explainData.confidence).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Top Feature</span>
                        <span className="font-semibold">{explainData.top_feature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Status</span>
                        <span className="font-semibold capitalize">{explainData.status}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Feature attribute list */}
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                <h3 className={`font-bold text-sm uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  Feature Attribute
                </h3>

                {!explainData && (
                  <div className="flex flex-col items-center py-8 text-center">
                    <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm text-gray-500">No feature data available</p>
                  </div>
                )}

                {explainLoading && (
                  <div className="flex items-center justify-center py-8">
                    <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}

                {explainData && !explainLoading && (
                  <div className="space-y-2">
                    {explainData.features.map((f) => (
                      <div
                        key={f.name}
                        className={`flex items-center justify-between py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} last:border-0`}
                      >
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{f.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-semibold ${
                            f.category === 'Primary Driver'
                              ? 'text-blue-600'
                              : f.category === 'Supporting Factor'
                              ? 'text-sky-500'
                              : 'text-gray-400'
                          }`}>
                            {f.value.toFixed(2)}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${categoryBadge(f.category)}`}>
                            {f.category === 'Primary Driver' ? 'P' : f.category === 'Supporting Factor' ? 'S' : 'I'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Health tip */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Model Health Tip</h4>
                    <p className="text-xs text-gray-700">
                      {explainData
                        ? `'${explainData.top_feature}' is the dominant driver. Monitor this feature for drift over time.`
                        : 'Select a prediction to see model health insights.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* View details button */}
              <button
                disabled={!explainData}
                onClick={() => explainData && navigate('/prediction-result')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>View Prediction Details</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className={`mt-8 flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            <p>© 2024 Retail Basket Value Prediction System</p>
            <div className="flex items-center space-x-4">
              <span>System Status: Online</span>
              <span>v1.2.0-beta</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Explainability
