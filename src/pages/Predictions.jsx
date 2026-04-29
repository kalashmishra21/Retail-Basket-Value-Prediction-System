import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictionAPI } from '../services/api'
import { useTheme } from '../context/ThemeContext'
import { Sidebar } from '../components'

const PAGE_SIZE = 5

/**
 * Predictions page — live feed of inference results.
 *
 * Features:
 *  - Checkbox removed completely
 *  - Sort by Date replaced with calendar date-picker filter
 *  - Store location comes from DB (stable, deterministic, never random)
 *  - System Latency shows real measured API response time
 *  - Search filters by prediction_id OR store_location (client-side)
 *  - Pagination: 5 per page, Previous/Next properly disabled
 *  - No Math.random() anywhere
 */
const Predictions = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()

  const [currentUser, setCurrentUser]   = useState(null)
  const [predictions, setPredictions]   = useState([])
  const [isLoading, setIsLoading]       = useState(true)

  // Search & filter
  const [searchQuery, setSearchQuery]   = useState('')
  const [dateFilter, setDateFilter]     = useState('')   // YYYY-MM-DD or ''

  // Pagination
  const [currentPage, setCurrentPage]   = useState(1)

  // Real measured latency in ms
  const [latencyMs, setLatencyMs]       = useState(null)

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) { navigate('/'); return }
    setCurrentUser(user)
  }, [navigate])

  /**
   * fetchPredictions — loads predictions from backend.
   * When dateFilter is set, passes ?date=YYYY-MM-DD to the API so the
   * backend filters by calendar day using an indexed query.
   * Measures actual round-trip time and stores it in latencyMs.
   */
  const fetchPredictions = useCallback(async (date = '') => {
    try {
      setIsLoading(true)
      const t0  = performance.now()
      const res = await predictionAPI.getAll(date || null)
      const t1  = performance.now()
      setLatencyMs(Math.round(t1 - t0))
      setPredictions(res.data)
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to fetch predictions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser) fetchPredictions(dateFilter)
  }, [currentUser, fetchPredictions, dateFilter])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    navigate('/')
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  // ── Client-side search (prediction_id + store_location) ────────────────────
  /**
   * filtered — memoized list after applying searchQuery.
   * Searches prediction_id and store_location fields.
   * Resets to page 1 via separate effect below.
   */
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return predictions
    const q = searchQuery.toLowerCase()
    return predictions.filter(
      p =>
        p.prediction_id.toLowerCase().includes(q) ||
        (p.store_location || '').toLowerCase().includes(q)
    )
  }, [predictions, searchQuery])

  useEffect(() => { setCurrentPage(1) }, [searchQuery, dateFilter])

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage    = Math.min(currentPage, totalPages)
  const pageRecords = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // ── Stats (from full predictions list, not just current page) ───────────────
  const today       = new Date().toDateString()
  const totalToday  = predictions.filter(p => new Date(p.created_at).toDateString() === today).length
  const avgConf     = predictions.length > 0
    ? (predictions.reduce((s, p) => s + parseFloat(p.confidence || 0), 0) / predictions.length).toFixed(1) + '%'
    : '-'
  const lowConfAlerts = predictions.filter(p => parseFloat(p.confidence) < 70).length

  if (!currentUser) return null

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>

      {/* ── Sidebar ── */}
      <Sidebar currentUser={currentUser} activeMenu="Predictions" onLogout={handleLogout} />

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-4`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>›</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Prediction Entries</span>
            </div>
            <div onClick={() => navigate('/settings')}
              className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:opacity-80 transition">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Predictions</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
            Monitor and manage all recent basket value inference entries.
          </p>

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>TOTAL TODAY</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{isLoading ? '—' : totalToday}</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Predictions today</p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>AVG. CONFIDENCE</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{isLoading ? '—' : avgConf}</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Across all predictions</p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>LOW CONFIDENCE ALERTS</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{isLoading ? '—' : lowConfAlerts}</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Below 70% confidence</p>
            </div>
            {/* Real measured latency — no hardcoded ~2.3s */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>SYSTEM LATENCY</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {latencyMs !== null ? `${latencyMs}ms` : '—'}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Last API response time</p>
            </div>
          </div>

          {/* ── Table Card ── */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>

            {/* Search + Date filter + New Prediction */}
            <div className="flex items-center justify-between mb-6 gap-4">
              {/* Search — works on prediction_id and store_location */}
              <div className="flex-1 max-w-sm relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search prediction IDs or stores..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                />
              </div>

              {/* Calendar date filter — replaces "Sort by Date" button */}
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'}`}
                />
                {dateFilter && (
                  <button onClick={() => setDateFilter('')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Clear
                  </button>
                )}
              </div>

              <button onClick={() => navigate('/upload')}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Prediction</span>
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Entries</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Live feed of inference engine results</p>
              </div>
            </div>

            {/* Table — no checkbox column */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border-b`}>
                  <tr>
                    {['Entry ID','Timestamp','Store Location','Predicted Value','Confidence','Status','Actions'].map(h => (
                      <th key={h} className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <p className="text-gray-500 text-sm">Loading predictions…</p>
                        </div>
                      </td>
                    </tr>
                  ) : pageRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-sm">
                          {predictions.length === 0
                            ? 'No predictions yet. Upload data to get started.'
                            : 'No predictions match your search or date filter.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    pageRecords.map((pred) => (
                      <tr key={pred.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
                        <td className={`px-4 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pred.prediction_id}</td>
                        <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{formatDate(pred.created_at)}</td>
                        {/* store_location from DB — stable, never random */}
                        <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{pred.store_location || '—'}</td>
                        <td className={`px-4 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(pred.predicted_value).toFixed(2)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-16 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                              <div
                                className={`h-2 rounded-full ${parseFloat(pred.confidence) < 70 ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(parseFloat(pred.confidence), 100)}%` }}
                              />
                            </div>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{parseFloat(pred.confidence).toFixed(2)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {pred.status === 'completed' && <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Success</span>}
                          {pred.status === 'processing' && <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Processing</span>}
                          {pred.status === 'failed' && <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Failed</span>}
                        </td>
                        <td className="px-4 py-4">
                          <button onClick={() => navigate('/prediction-result', { state: { prediction: pred } })}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View Result
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {!isLoading && filtered.length > 0 && (
              <div className={`flex items-center justify-between mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className={`px-3 py-1.5 border rounded-lg text-sm transition ${safePage === 1 ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400' : isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${page === safePage ? 'bg-blue-600 text-white' : isDarkMode ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className={`px-3 py-1.5 border rounded-lg text-sm transition ${safePage === totalPages ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400' : isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    Next
                  </button>
                </div>
              </div>
            )}
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

export default Predictions
