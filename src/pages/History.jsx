import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictionAPI } from '../services/api'
import { useTheme } from '../context/ThemeContext'

const PAGE_SIZE = 5

/**
 * History page — shows paginated prediction records with working 3-dot menu.
 *
 * Features:
 *  - 5 records per page (client-side pagination over full user dataset)
 *  - Search by prediction ID or batch name (filters before paginating)
 *  - 3-dot menu per row: Delete (calls DELETE API) + Download (CSV)
 *  - Export button removed
 *  - All data from DB — no dummy values, no Math.random()
 */
const History = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()

  const [currentUser, setCurrentUser]   = useState(null)
  const [activeMenu, setActiveMenu]     = useState('History')
  const [searchQuery, setSearchQuery]   = useState('')
  const [allRecords, setAllRecords]     = useState([])   // full list from DB
  const [isLoading, setIsLoading]       = useState(true)

  // Pagination
  const [currentPage, setCurrentPage]   = useState(1)

  // 3-dot dropdown: stores the record.id that is currently open, or null
  const [openMenuId, setOpenMenuId]     = useState(null)
  const menuRef                         = useRef(null)

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) { navigate('/'); return }
    setCurrentUser(user)
  }, [navigate])

  // ── Close 3-dot menu on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /**
   * fetchHistory — loads all predictions for the current user from the DB.
   * Sorted by created_at DESC (backend default ordering).
   * No random values — rows_count comes from the linked Dataset record.
   */
  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await predictionAPI.getAll()
      setAllRecords(res.data)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser) fetchHistory()
  }, [currentUser, fetchHistory])

  // ── Derived data ────────────────────────────────────────────────────────────

  /** Filter records by search query (prediction_id or batch label). */
  const filtered = allRecords.filter((r) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      r.prediction_id.toLowerCase().includes(q) ||
      `batch #${r.id}`.toLowerCase().includes(q)
    )
  })

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage    = Math.min(currentPage, totalPages)
  const pageRecords = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Reset to page 1 when search changes
  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  // ── Stats (computed from full allRecords, not just current page) ────────────
  const totalCount   = allRecords.length
  const successRate  = totalCount === 0 ? '-'
    : ((allRecords.filter(r => r.status === 'completed').length / totalCount) * 100).toFixed(1) + '%'
  const avgConf      = totalCount === 0 ? '-'
    : (allRecords.reduce((s, r) => s + parseFloat(r.confidence || 0), 0) / totalCount).toFixed(1) + '%'

  // ── Actions ─────────────────────────────────────────────────────────────────

  /**
   * handleDelete — calls DELETE /api/predictions/:id/
   * On success removes the record from local state immediately
   * so the UI updates without a full re-fetch.
   */
  const handleDelete = async (record) => {
    setOpenMenuId(null)
    if (!window.confirm(`Delete prediction ${record.prediction_id}? This cannot be undone.`)) return
    try {
      await predictionAPI.delete(record.id)
      setAllRecords(prev => prev.filter(r => r.id !== record.id))
    } catch (err) {
      alert('Failed to delete record. Please try again.')
      console.error(err)
    }
  }

  /**
   * handleDownload — calls GET /api/predictions/:id/download/
   * Backend returns a CSV blob; we create a temporary <a> tag to trigger
   * the browser's native file-save dialog.
   */
  const handleDownload = async (record) => {
    setOpenMenuId(null)
    try {
      const res = await predictionAPI.download(record.id)
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `${record.prediction_id}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download record. Please try again.')
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    navigate('/')
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const menuItems = [
    { icon: '📊', label: 'Dashboard',     path: '/dashboard' },
    { icon: '📤', label: 'Upload Data',   path: '/upload' },
    { icon: '📋', label: 'Predictions',   path: '/predictions' },
    { icon: '🕐', label: 'History',       path: '/history' },
    { icon: '🔍', label: 'Explainability',path: '/explainability' },
    { icon: '📈', label: 'Metrics',       path: '/metrics' },
    { icon: '📊', label: 'Visualization', path: '/visualization' },
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
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-4`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>›</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Prediction History</span>
            </div>
            <div onClick={() => navigate('/settings')}
              className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:opacity-80 transition">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

          {/* Title — Export button removed */}
          <div className="mb-8">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>History</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Review and audit past prediction executions and model outputs.
            </p>
          </div>

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              { label: 'TOTAL PREDICTIONS', value: totalCount, sub: 'All time' },
              { label: 'SUCCESS RATE',       value: successRate, sub: 'Completed predictions' },
              { label: 'AVG. CONFIDENCE',    value: avgConf,     sub: 'Mean confidence score' },
              { label: 'TOTAL RECORDS',      value: totalCount,  sub: 'Database entries' },
            ].map(({ label, value, sub }) => (
              <div key={label} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{label}</p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{isLoading ? '—' : value}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>{sub}</p>
              </div>
            ))}
          </div>

          {/* ── Records Table ── */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Records</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Use filters to narrow down specific batches or date ranges.
            </p>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search prediction ID or batch name..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto" ref={menuRef}>
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border-b`}>
                  <tr>
                    {['Prediction ID','Batch Name','Processed Date','Rows','Predicted Value','Confidence','Status',''].map(h => (
                      <th key={h} className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {isLoading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <p className="text-gray-500 text-sm">Loading history…</p>
                        </div>
                      </td>
                    </tr>
                  ) : pageRecords.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-500 text-sm">
                          {allRecords.length === 0 ? 'No history records yet. Run predictions to see history.' : 'No records match your search.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    pageRecords.map((record) => (
                      <tr key={record.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
                        <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{record.prediction_id}</td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Batch #{record.id}</td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{formatDate(record.created_at)}</td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {/* rows_count stored in Dataset model, linked via prediction.dataset */}
                          {record.dataset_rows_count ?? '—'}
                        </td>
                        <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(record.predicted_value).toFixed(2)}</td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{parseFloat(record.confidence).toFixed(2)}%</td>
                        <td className="px-6 py-4">
                          {record.status === 'completed' && <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Completed</span>}
                          {record.status === 'processing' && <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Processing</span>}
                          {record.status === 'failed' && <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Failed</span>}
                        </td>

                        {/* ── 3-dot menu ── */}
                        <td className="px-6 py-4 text-right relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === record.id ? null : record.id)}
                            className={`p-1 rounded ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'} transition`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>

                          {openMenuId === record.id && (
                            <div className={`absolute right-8 top-8 z-50 w-44 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-1`}>
                              {/* Download */}
                              <button
                                onClick={() => handleDownload(record)}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-50'} transition`}
                              >
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Download Record</span>
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(record)}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${isDarkMode ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-red-50'} transition`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete Record</span>
                              </button>
                            </div>
                          )}
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
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} results
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className={`px-3 py-1.5 border rounded-lg text-sm transition flex items-center space-x-1 ${
                      safePage === 1
                        ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                        : isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        page === safePage
                          ? 'bg-blue-600 text-white'
                          : isDarkMode ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >{page}</button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className={`px-3 py-1.5 border rounded-lg text-sm transition flex items-center space-x-1 ${
                      safePage === totalPages
                        ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                        : isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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

export default History
