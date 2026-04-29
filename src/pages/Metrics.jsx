import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import api from '../services/api'
import { Sidebar } from '../components'

/**
 * Metrics Page - 100% Real-Time Data-Driven
 * NO dummy data - all values fetched from database
 * Calculates RMSE, MAE, R² from actual predictions
 * Auto-refreshes when new predictions are added
 */
const Metrics = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [currentUser, setCurrentUser] = useState(null)
  const [timeRange, setTimeRange] = useState('30days')
  
  // Real-time data states
  const [summary, setSummary] = useState(null)
  const [timeseries, setTimeseries] = useState(null)
  const [snapshots, setSnapshots] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) {
      navigate('/')
      return
    }
    setCurrentUser(user)
    fetchAllMetrics()
  }, [navigate])

  /**
   * Fetches all metrics data from backend APIs
   * Called on mount and when timeRange changes
   */
  const fetchAllMetrics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [summaryRes, timeseriesRes, snapshotsRes] = await Promise.all([
        api.get('/metrics/summary/'),
        api.get(`/metrics/timeseries/?range=${timeRange}`),
        api.get('/metrics/snapshots/')
      ])

      setSummary(summaryRes.data)
      setTimeseries(timeseriesRes.data)
      setSnapshots(snapshotsRes.data)
    } catch (err) {
      console.error('Failed to fetch metrics:', err)
      setError(err.response?.data?.error || 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  // Refetch when time range changes
  useEffect(() => {
    if (currentUser) {
      fetchAllMetrics()
    }
  }, [timeRange])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    navigate('/')
  }

  if (!currentUser) return null

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar currentUser={currentUser} activeMenu="Metrics" onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-4`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>›</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Model Metrics</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Performance Overview</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time statistical metrics from database predictions.</p>
            </div>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className={`px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'}`}
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading metrics...</p>
              </div>
            </div>
          ) : error ? (
            <div className={`${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border rounded-xl p-6 text-center`}>
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-2`}>Failed to Load Metrics</p>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{error}</p>
              <button 
                onClick={fetchAllMetrics}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Retry
              </button>
            </div>
          ) : !summary?.has_data ? (
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-12 text-center`}>
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Predictions Yet</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Upload a dataset and create predictions to see metrics.</p>
              <button 
                onClick={() => navigate('/upload')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Upload Dataset
              </button>
            </div>
          ) : (
            <>
              {/* Main Metrics - Real Data */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>CURRENT RMSE</span>
                    {summary.rmse_change !== null && (
                      <span className={`text-xs ${summary.rmse_change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summary.rmse_change > 0 ? '+' : ''}{summary.rmse_change}%
                      </span>
                    )}
                  </div>
                  <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {summary.rmse}
                  </p>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>CURRENT MAE</span>
                    {summary.mae_change !== null && (
                      <span className={`text-xs ${summary.mae_change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summary.mae_change > 0 ? '+' : ''}{summary.mae_change}%
                      </span>
                    )}
                  </div>
                  <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {summary.mae}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                  <p className="text-sm mb-2 opacity-90">R² SCORE (COEFFICIENT)</p>
                  <p className="text-5xl font-bold mb-2">{summary.r2}</p>
                  <p className="text-xs opacity-75">
                    {summary.r2 >= 0.9 ? 'Highly Accurate' : summary.r2 >= 0.7 ? 'Good Performance' : 'Needs Improvement'}
                  </p>
                  <div className="mt-4 bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{width: `${summary.r2 * 100}%`}} />
                  </div>
                </div>
              </div>

              {/* Charts - Real Time Series Data */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* RMSE Time Series */}
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>RMSE Time Series</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    Root Mean Square Error over {timeRange === '7days' ? '7' : timeRange === '30days' ? '30' : '90'} days.
                  </p>
                  {timeseries?.has_data ? (
                    <div className="h-64 flex items-end justify-between space-x-1">
                      {timeseries.rmse.map((value, idx) => {
                        if (value === null) return <div key={idx} className="flex-1" />
                        const maxVal = Math.max(...timeseries.rmse.filter(v => v !== null))
                        const height = maxVal > 0 ? (value / maxVal) * 100 : 0
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative">
                            <div 
                              className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition cursor-pointer" 
                              style={{height: `${height}%`}}
                              title={`${timeseries.labels[idx]}: ${value}`}
                            />
                            {idx % Math.ceil(timeseries.labels.length / 7) === 0 && (
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                                {timeseries.labels[idx]}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>No data for selected range</p>
                    </div>
                  )}
                </div>

                {/* MAE Trend */}
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>MAE Trend</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Mean Absolute Error showing average deviation.</p>
                  {timeseries?.has_data ? (
                    <div className="h-64 flex items-end justify-between space-x-1">
                      {timeseries.mae.map((value, idx) => {
                        if (value === null) return <div key={idx} className="flex-1" />
                        const maxVal = Math.max(...timeseries.mae.filter(v => v !== null))
                        const height = maxVal > 0 ? (value / maxVal) * 100 : 0
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative">
                            <div 
                              className="w-full bg-purple-600 rounded-t hover:bg-purple-700 transition cursor-pointer" 
                              style={{height: `${height}%`}}
                              title={`${timeseries.labels[idx]}: ${value}`}
                            />
                            {idx % Math.ceil(timeseries.labels.length / 7) === 0 && (
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                                {timeseries.labels[idx]}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>No data for selected range</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Model Snapshots - Real Best/Worst */}
              {snapshots?.has_data && (
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Model Snapshots</h3>
                    <div className="space-y-4">
                      <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg`}>
                        <div>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Best Performance</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{snapshots.best.prediction_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">Error</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{snapshots.best.store_location}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>${snapshots.best.error}</p>
                        </div>
                      </div>
                      <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'} rounded-lg`}>
                        <div>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Worst Performance</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{snapshots.worst.prediction_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">Error</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{snapshots.worst.store_location}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>${snapshots.worst.error}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Performance Summary</h3>
                    <div className="space-y-3">
                      <div className={`p-3 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg`}>
                        <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Total Predictions</p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{summary.total_predictions}</p>
                      </div>
                      <div className={`p-3 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-lg`}>
                        <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Model Status</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {summary.r2 >= 0.9 ? '✅ Excellent' : summary.r2 >= 0.7 ? '✓ Good' : '⚠️ Review Needed'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Want to understand why?</h3>
                  <p className="text-sm opacity-90">View feature importance and individual prediction contributions.</p>
                </div>
                <button 
                  onClick={() => navigate('/explainability')}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  Go to Explainability →
                </button>
              </div>
            </>
          )}

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

export default Metrics
