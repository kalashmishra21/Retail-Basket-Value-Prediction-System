import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import api from '../services/api'

/**
 * Visualization Page - 100% Real-Time Data-Driven
 * Fetches real dataset and renders charts dynamically
 * NO static values used - all data from database predictions
 * 
 * Charts:
 * 1. Scatter Plot: Actual vs Predicted with diagonal reference line
 * 2. Error Distribution: Histogram of (Actual - Predicted)
 * 3. Category Analysis: RMSE, MAE, Volume by store location
 * 4. Summary Stats: R², Bias, Outlier Score
 */
const Visualization = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [currentUser, setCurrentUser] = useState(null)
  const [activeMenu, setActiveMenu] = useState('Visualization')
  const [dataFilter, setDataFilter] = useState('all')
  
  // Real-time data states
  const [summary, setSummary] = useState(null)
  const [scatterData, setScatterData] = useState(null)
  const [errorData, setErrorData] = useState(null)
  const [categoryData, setCategoryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) {
      navigate('/')
      return
    }
    setCurrentUser(user)
    fetchAllVisualizationData()
  }, [navigate])

  /**
   * Fetches all visualization data from backend APIs
   * Called on mount and when dataFilter changes
   */
  const fetchAllVisualizationData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [summaryRes, scatterRes, errorRes, categoryRes] = await Promise.all([
        api.get('/visualization/summary/'),
        api.get('/visualization/scatter/'),
        api.get('/visualization/error-distribution/'),
        api.get('/visualization/category-analysis/')
      ])

      setSummary(summaryRes.data)
      setScatterData(scatterRes.data)
      setErrorData(errorRes.data)
      setCategoryData(categoryRes.data)
    } catch (err) {
      console.error('Failed to fetch visualization data:', err)
      setError(err.response?.data?.error || 'Failed to load visualization data')
    } finally {
      setLoading(false)
    }
  }

  // Refetch when filter changes
  useEffect(() => {
    if (currentUser) {
      fetchAllVisualizationData()
    }
  }, [dataFilter])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    navigate('/')
  }

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '📤', label: 'Upload Data', path: '/upload' },
    { icon: '📋', label: 'Predictions', path: '/predictions' },
    { icon: '🕐', label: 'History', path: '/history' },
    { icon: '🔍', label: 'Explainability', path: '/explainability' },
    { icon: '📈', label: 'Metrics', path: '/metrics' },
    { icon: '📊', label: 'Visualization', path: '/visualization' },
    { icon: '⚙️', label: 'Settings', path: '/settings' }
  ]

  /**
   * Calculates histogram bins from error data
   * Auto bin calculation - no hardcoded values
   * Includes comprehensive NaN prevention
   */
  const calculateHistogram = (errors) => {
    if (!errors || errors.length === 0) return []
    
    const validErrors = errors.filter(e => typeof e === 'number' && !isNaN(e) && isFinite(e))
    if (validErrors.length === 0) return []
    
    const min = Math.min(...validErrors)
    const max = Math.max(...validErrors)
    
    if (!isFinite(min) || !isFinite(max) || min === max) return []
    
    const binCount = Math.min(10, Math.ceil(Math.sqrt(validErrors.length)))
    const binWidth = (max - min) / binCount
    
    if (!isFinite(binWidth) || binWidth <= 0) return []
    
    const bins = Array(binCount).fill(0)
    validErrors.forEach(error => {
      const binIndex = Math.min(Math.floor((error - min) / binWidth), binCount - 1)
      if (binIndex >= 0 && binIndex < binCount) {
        bins[binIndex]++
      }
    })
    
    return bins.map((count, idx) => ({
      start: min + idx * binWidth,
      end: min + (idx + 1) * binWidth,
      count
    }))
  }

  if (!currentUser) return null

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
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
              onClick={() => {
                setActiveMenu(item.label)
                navigate(item.path)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeMenu === item.label ? 'bg-blue-50 text-blue-600' : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button onClick={handleLogout} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-4`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>›</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Visualization</span>
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
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Model Analysis Gallery</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time visual breakdown from database predictions.</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={dataFilter}
                onChange={(e) => setDataFilter(e.target.value)}
                className={`px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'}`}
              >
                <option value="all">All Test Data</option>
                <option value="30days">Last 30 Days</option>
                <option value="7days">Last 7 Days</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading visualizations...</p>
              </div>
            </div>
          ) : error ? (
            <div className={`${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border rounded-xl p-6 text-center`}>
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-2`}>Failed to Load Visualizations</p>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{error}</p>
              <button 
                onClick={fetchAllVisualizationData}
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
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Upload a dataset and create predictions to see visualizations.</p>
              <button 
                onClick={() => navigate('/upload')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Upload Dataset
              </button>
            </div>
          ) : (
            <>
              {/* Top Metrics - Real Data */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Variance explained (R²)</span>
                  <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-2 mb-1`}>{summary.r2}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {summary.r2 >= 0.9 ? 'Excellent fit' : summary.r2 >= 0.7 ? 'Good fit' : 'Needs improvement'}
                  </p>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Bias</span>
                  <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-2 mb-1`}>${summary.bias}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {summary.bias > 0 ? 'Overpredicting' : 'Underpredicting'}
                  </p>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Outlier Intensity</span>
                  <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-2 mb-1`}>{summary.outlier_score}%</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {summary.outlier_score < 5 ? 'Low outliers' : summary.outlier_score < 10 ? 'Moderate' : 'High outliers'}
                  </p>
                </div>
              </div>

              {/* Main Charts - Real Data */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Scatter Plot: Actual vs Predicted */}
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Actual vs. Predicted Values</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Correlation between ground truth and model estimations.</p>
                  {scatterData?.has_data ? (
                    <div className={`h-80 relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
                      <svg className="w-full h-full" viewBox="0 0 400 300">
                        {/* Grid lines */}
                        {[75, 150, 225].map(y => (
                          <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="1" strokeDasharray="4" />
                        ))}
                        {[100, 200, 300].map(x => (
                          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="1" strokeDasharray="4" />
                        ))}
                        
                        {/* Diagonal reference line (perfect prediction) */}
                        <line x1="0" y1="300" x2="400" y2="0" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="8,4" />
                        
                        {/* Scatter points from real data */}
                        {scatterData.actual.map((actual, idx) => {
                          const predicted = scatterData.predicted[idx]
                          const maxVal = Math.max(...scatterData.actual, ...scatterData.predicted)
                          const x = (predicted / maxVal) * 380 + 10
                          const y = 290 - (actual / maxVal) * 280
                          return (
                            <circle 
                              key={idx} 
                              cx={x} 
                              cy={y} 
                              r="3" 
                              fill="#3B82F6" 
                              opacity="0.6"
                              title={`Actual: ${actual}, Predicted: ${predicted}`}
                            />
                          )
                        })}
                        
                        {/* Axis labels */}
                        <text x="10" y="20" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>High</text>
                        <text x="10" y="290" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>Low</text>
                        <text x="10" y="310" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>Predicted →</text>
                      </svg>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <p className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>No data available</p>
                    </div>
                  )}
                </div>

                {/* Error Distribution Histogram */}
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Error Distribution</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Frequency of residuals (Actual - Predicted).</p>
                  {errorData?.has_data ? (
                    <>
                      <div className={`h-80 relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
                        <svg className="w-full h-full" viewBox="0 0 400 300">
                          <line x1="0" y1="250" x2="400" y2="250" stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="2" />
                          
                          {/* Histogram bars from real error data */}
                          {(() => {
                            const histogram = calculateHistogram(errorData.errors)
                            if (histogram.length === 0) return null
                            
                            const maxCount = Math.max(...histogram.map(b => b.count), 1)
                            const barWidth = 380 / histogram.length
                            
                            return histogram.map((bin, idx) => {
                              const barHeight = (bin.count / maxCount) * 230
                              const x = 10 + idx * barWidth
                              const y = 250 - barHeight
                              const width = Math.max(barWidth - 5, 1)
                              
                              // Final safety check
                              if (!isFinite(x) || !isFinite(y) || !isFinite(width) || !isFinite(barHeight)) {
                                return null
                              }
                              
                              return (
                                <rect 
                                  key={idx}
                                  x={x}
                                  y={y}
                                  width={width}
                                  height={barHeight}
                                  fill="#3B82F6"
                                  opacity="0.8"
                                  title={`Error: ${bin.start.toFixed(1)} to ${bin.end.toFixed(1)}, Count: ${bin.count}`}
                                />
                              )
                            })
                          })()}
                          
                          <text x="10" y="270" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>
                            {errorData.errors.length > 0 ? Math.min(...errorData.errors).toFixed(0) : '0'}
                          </text>
                          <text x="360" y="270" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>
                            {errorData.errors.length > 0 ? Math.max(...errorData.errors).toFixed(0) : '0'}
                          </text>
                        </svg>
                      </div>
                      <div className={`mt-4 p-3 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg`}>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Mean Error: ${errorData.mean_error} | Std Dev: ${errorData.std_error}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <p className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>No data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Analysis - Real Data */}
              {categoryData?.has_data && (
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Error Analysis by Category</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Comparative accuracy metrics across different store locations.</p>
                  <div className="flex items-center space-x-4 mb-4">
                    {[['bg-blue-600','RMSE'],['bg-purple-600','MAE'],['bg-gray-400','Record Volume']].map(([c,l]) => (
                      <div key={l} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 ${c} rounded`} />
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-96">
                    <svg className="w-full h-full" viewBox="0 0 900 350">
                      <line x1="0" y1="300" x2="900" y2="300" stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="2" />
                      
                      {categoryData.categories.map((cat, idx) => {
                        const x = 100 + idx * 130
                        const maxRmse = Math.max(...categoryData.rmse)
                        const maxMae = Math.max(...categoryData.mae)
                        const maxVol = Math.max(...categoryData.volume)
                        
                        const rmseHeight = (categoryData.rmse[idx] / maxRmse) * 200
                        const maeHeight = (categoryData.mae[idx] / maxMae) * 200
                        const volY = 300 - (categoryData.volume[idx] / maxVol) * 250
                        
                        return (
                          <g key={idx}>
                            <rect x={x-25} y={300-rmseHeight} width="20" height={rmseHeight} fill="#3B82F6" />
                            <rect x={x+5} y={300-maeHeight} width="20" height={maeHeight} fill="#8B5CF6" />
                            <circle cx={x} cy={volY} r="5" fill="#9CA3AF" />
                            <text x={x-30} y="330" fontSize="10" fill={isDarkMode?'#9CA3AF':'#6B7280'}>
                              {cat.replace('Store #', 'S')}
                            </text>
                          </g>
                        )
                      })}
                      
                      {/* Trend line for volume */}
                      <path 
                        d={categoryData.categories.map((_, idx) => {
                          const x = 100 + idx * 130
                          const maxVol = Math.max(...categoryData.volume)
                          const y = 300 - (categoryData.volume[idx] / maxVol) * 250
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                        }).join(' ')}
                        fill="none"
                        stroke="#9CA3AF"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              )}
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

export default Visualization
