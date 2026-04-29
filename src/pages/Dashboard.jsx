import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictionAPI, metricsAPI } from '../services/api'
import { useTheme } from '../context/ThemeContext'
import { Sidebar, StatsCard, TrendChart } from '../components'

/**
 * Dashboard — main overview page.
 *
 * Data sources (all from DB, no hardcoded values):
 *  - Total predictions  : count from GET /api/predictions/
 *  - RMSE / MAE         : GET /api/metrics/latest/  (deterministic, stable)
 *  - Basket Value Trends: GET /api/metrics/trends/  (real 7-day window)
 *  - Recent predictions : last 5 from GET /api/predictions/
 *  - Model Health       : derived from metrics API response
 */
const Dashboard = () => {
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useTheme()

  const [currentUser, setCurrentUser]       = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Data states
  const [allPredictions, setAllPredictions] = useState([])
  const [metrics, setMetrics]               = useState(null)
  const [trends, setTrends]                 = useState(null)
  const [isLoading, setIsLoading]           = useState(true)
  const [trendsLoading, setTrendsLoading]   = useState(false)

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) { navigate('/'); return }
    setCurrentUser(user)
  }, [navigate])

  // ── Close profile dropdown on outside click ─────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (showProfileMenu && !e.target.closest('.profile-dropdown'))
        setShowProfileMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showProfileMenu])

  /**
   * fetchDashboardData — loads predictions + metrics in parallel.
   * Called once on mount and again when "Sync Data" is clicked.
   * No random values — everything comes from the database.
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [predsRes, metricsRes] = await Promise.all([
        predictionAPI.getAll(),
        metricsAPI.getLatest().catch(() => ({ data: null })),
      ])
      setAllPredictions(predsRes.data)
      setMetrics(metricsRes.data)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * fetchTrends — loads 7-day basket value trend from backend.
   * Backend groups real predictions by calendar day — no static arrays.
   */
  const fetchTrends = useCallback(async () => {
    try {
      setTrendsLoading(true)
      const res = await metricsAPI.getTrends()
      setTrends(res.data)
    } catch (err) {
      console.error('Failed to fetch trends:', err)
    } finally {
      setTrendsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData()
      fetchTrends()
    }
  }, [currentUser, fetchDashboardData, fetchTrends])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    navigate('/')
  }

  /** Format ISO timestamp to HH:MM AM/PM */
  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  /** Format ISO timestamp to "DD MMM, YYYY" */
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })

  const recentPredictions = allPredictions.slice(0, 5)

  if (!currentUser) return null

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>

      {/* ── Sidebar ── */}
      <Sidebar currentUser={currentUser} activeMenu="Dashboard" onLogout={handleLogout} />

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-4`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>›</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition`}>
                {isDarkMode
                  ? <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  : <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                }
              </button>
              <div className="relative profile-dropdown">
                <div onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:opacity-80 transition">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {showProfileMenu && (
                  <div className={`absolute right-0 mt-2 w-64 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border py-2 z-50`}>
                    <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>{currentUser?.name || 'User'}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{currentUser?.email || ''}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setShowProfileMenu(false); navigate('/settings') }}
                        className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center space-x-2 transition`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>Settings</span>
                      </button>
                      <button onClick={() => { setShowProfileMenu(false); handleLogout() }}
                        className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'} flex items-center space-x-2 transition`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── Dashboard Content ── */}
        <main className={`flex-1 overflow-y-auto p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="TOTAL PREDICTIONS"
              value={isLoading ? '—' : allPredictions.length}
              subtitle={allPredictions.length > 0 ? `${allPredictions.filter(p => p.status === 'completed').length} completed` : 'No predictions yet'}
            />
            <StatsCard
              title="RMSE"
              value={isLoading ? '—' : metrics?.rmse ?? '—'}
              subtitle="Root Mean Square Error"
              showInfoIcon
            />
            <StatsCard
              title="MAE"
              value={isLoading ? '—' : metrics?.mae ?? '—'}
              subtitle="Mean absolute error"
              showInfoIcon
            />
          </div>

          <div className="grid grid-cols-3 gap-6">

            {/* ── Basket Value Trends Chart — real data from /api/metrics/trends/ ── */}
            <TrendChart
              trends={trends}
              trendsLoading={trendsLoading}
              onSync={() => { fetchDashboardData(); fetchTrends() }}
            />

            {/* ── Right column ── */}
            <div className="space-y-6">
              {/* Upload card */}
              <div className={`${isDarkMode ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-100'} rounded-xl p-6 border`}>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Get New Predictions</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Upload your latest retail transaction CSV to generate new insights.</p>
                <div onClick={() => navigate('/upload')}
                  className={`border-2 border-dashed ${isDarkMode ? 'border-blue-700 bg-gray-800 hover:bg-gray-700' : 'border-blue-300 bg-white hover:bg-blue-50'} rounded-lg p-6 text-center mb-4 cursor-pointer transition`}>
                  <svg className="w-10 h-10 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Drag and drop files here</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Supports .csv, .xlsx up to 80MB</p>
                </div>
                <button onClick={() => navigate('/upload')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload Data</span>
                </button>
              </div>

              {/* Model Health — derived from metrics API, no hardcoded values */}
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Model Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</span>
                    {metrics?.model_status
                      ? <span className={`px-3 py-1 text-xs font-medium rounded-full ${metrics.model_status === 'Optimal' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{metrics.model_status}</span>
                      : <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">No data</span>
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Trained</span>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metrics?.last_trained ? formatDate(metrics.last_trained) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Drift Detected</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${metrics?.drift_detected ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {metrics ? (metrics.drift_detected ? 'Yes' : 'None') : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Recent Predictions Table ── */}
          <div className={`mt-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Predictions</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Detailed overview of the last 5 inferences run by the system.</p>
              </div>
              {/* Fixed navigation button */}
              <button
                onClick={() => navigate('/history')}
                className={`px-4 py-2 border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg text-sm font-medium transition`}>
                View All History
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border-b`}>
                  <tr>
                    {['Timestamp','Prediction ID','Predicted Value','Confidence','Status',''].map(h => (
                      <th key={h} className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <p className="text-gray-500 text-sm">Loading…</p>
                        </div>
                      </td>
                    </tr>
                  ) : recentPredictions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-sm">No recent predictions. Upload data to get started.</p>
                      </td>
                    </tr>
                  ) : (
                    recentPredictions.map((pred) => (
                      <tr key={pred.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatTime(pred.created_at)}</span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pred.prediction_id}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(pred.predicted_value).toFixed(2)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{parseFloat(pred.confidence).toFixed(2)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {pred.status === 'completed' && (
                            <span className="flex items-center space-x-1 text-sm text-gray-600">
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Completed</span>
                            </span>
                          )}
                          {pred.status === 'processing' && <span className="text-sm text-blue-600">Processing</span>}
                          {pred.status === 'failed' && <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Failed</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button onClick={() => navigate('/prediction-result', { state: { prediction: pred } })} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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

export default Dashboard
