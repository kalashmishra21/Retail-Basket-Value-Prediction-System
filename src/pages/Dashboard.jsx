import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictionAPI, metricsAPI } from '../services/api'
import { useTheme } from '../context/ThemeContext'

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
  const [activeMenu, setActiveMenu]         = useState('Dashboard')
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

  // ── Chart helpers ────────────────────────────────────────────────────────────
  /**
   * buildChartPoints — converts trend data arrays into SVG polyline points.
   * Maps values onto a 480×240 canvas (x: 80–530, y: 20–260).
   * Days with null values are skipped so gaps appear in the line.
   */
  const buildChartPoints = (values, maxVal) => {
    if (!values || maxVal === 0) return ''
    return values
      .map((v, i) => {
        if (v === null) return null
        const x = 80 + i * 82
        const y = Math.max(28, 260 - ((v / maxVal) * 232))
        return `${x},${y}`
      })
      .filter(Boolean)
      .join(' ')
  }

  const chartMax = trends?.has_data
    ? Math.ceil(Math.max(...[...(trends.actual || []), ...(trends.predicted || [])].filter(Boolean)) * 1.15)
    : 6000

  const yLabels = [chartMax, Math.round(chartMax * 0.75), Math.round(chartMax * 0.5), Math.round(chartMax * 0.25), 0]

  const recentPredictions = allPredictions.slice(0, 5)

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
            <button key={item.label}
              onClick={() => { setActiveMenu(item.label); navigate(item.path) }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeMenu === item.label
                  ? 'bg-blue-50 text-blue-600'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
              }`}>
              <span className="text-lg">{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button onClick={handleLogout} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <span className="text-lg">🚪</span><span>Logout</span>
          </button>
        </div>
      </div>

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

            {/* Total Predictions — real count from DB */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>TOTAL PREDICTIONS</p>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isLoading ? '—' : allPredictions.length}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                {allPredictions.length > 0 ? `${allPredictions.filter(p => p.status === 'completed').length} completed` : 'No predictions yet'}
              </p>
            </div>

            {/* RMSE — stable, from DB */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
              <div className="flex items-center space-x-2 mb-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>RMSE</p>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isLoading ? '—' : metrics?.rmse ?? '—'}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                Root Mean Square Error
              </p>
            </div>

            {/* MAE — stable, from DB */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
              <div className="flex items-center space-x-2 mb-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>MAE</p>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isLoading ? '—' : metrics?.mae ?? '—'}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Mean absolute error</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">

            {/* ── Basket Value Trends Chart — real data from /api/metrics/trends/ ── */}
            <div className={`col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Basket Value Trends</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Actual vs. predicted average basket value — last 7 days
                  </p>
                </div>
                <button
                  onClick={() => { fetchDashboardData(); fetchTrends() }}
                  disabled={trendsLoading}
                  className={`px-4 py-2 border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg text-sm font-medium transition disabled:opacity-50`}>
                  {trendsLoading ? '⟳ Syncing…' : '⟳ Sync Data'}
                </button>
              </div>

              <div className={`h-80 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-lg relative`}>
                {trendsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}

                {!trendsLoading && !trends?.has_data && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm text-gray-500">No prediction data yet. Upload a dataset to see trends.</p>
                  </div>
                )}

                {!trendsLoading && trends?.has_data && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 300">
                    {/* Y-axis labels */}
                    {yLabels.map((val, i) => (
                      <text key={i} x="42" y={24 + i * 52} fontSize="9" fill={isDarkMode ? '#9CA3AF' : '#6B7280'} textAnchor="end">
                        ${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}
                      </text>
                    ))}
                    {/* Grid lines */}
                    {[0,1,2,3,4].map(i => (
                      <line key={i} x1="48" y1={24 + i*52} x2="575" y2={24 + i*52} stroke={isDarkMode ? '#374151' : '#E5E7EB'} strokeWidth="1" strokeDasharray="4" />
                    ))}
                    {/* X-axis labels — always shown from API labels */}
                    {(trends.labels || []).map((label, i) => (
                      <text key={i} x={80 + i * 82} y="285" fontSize="9" fill={isDarkMode ? '#9CA3AF' : '#6B7280'} textAnchor="middle">{label}</text>
                    ))}
                    {/* Actual line */}
                    {buildChartPoints(trends.actual, chartMax) && (
                      <polyline points={buildChartPoints(trends.actual, chartMax)} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinejoin="round" />
                    )}
                    {/* Predicted line */}
                    {buildChartPoints(trends.predicted, chartMax) && (
                      <polyline points={buildChartPoints(trends.predicted, chartMax)} fill="none" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6,4" strokeLinejoin="round" />
                    )}
                    {/* Dots on actual */}
                    {(trends.actual || []).map((v, i) => v !== null && (
                      <circle key={i} cx={80 + i * 82} cy={Math.max(28, 260 - ((v / chartMax) * 232))} r="4" fill="#3B82F6" />
                    ))}
                    {/* Dots on predicted */}
                    {(trends.predicted || []).map((v, i) => v !== null && (
                      <circle key={i} cx={80 + i * 82} cy={Math.max(28, 260 - ((v / chartMax) * 232))} r="3" fill="#93C5FD" />
                    ))}
                  </svg>
                )}

                {/* Legend */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-6 bg-white/90 px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    <span className="text-xs text-gray-600">Actual Value</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-300 rounded-full" />
                    <span className="text-xs text-gray-600">Predicted Value</span>
                  </div>
                </div>
              </div>
            </div>

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
