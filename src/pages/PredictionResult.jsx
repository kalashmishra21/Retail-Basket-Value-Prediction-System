import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const PredictionResult = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [currentUser, setCurrentUser] = useState(null)
  const [activeMenu, setActiveMenu] = useState('Predictions')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) {
      navigate('/')
      return
    }
    setCurrentUser(user)
  }, [navigate])

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

  if (!currentUser) return null

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">RBVPS</span>
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
                activeMenu === item.label ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/predictions')}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Return to Input</span>
              </button>
              <span className="text-sm text-gray-400">›</span>
              <span className="text-sm font-medium text-gray-900">Prediction Result</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Prediction Completed</span>
            </div>
            <div className="flex items-center space-x-4">
              <div 
                onClick={() => navigate('/settings')}
                className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:opacity-80 transition"
                title="Go to Settings"
              >
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {/* Main Result Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
            <div className="grid grid-cols-3 gap-8">
              {/* Predicted Value */}
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-2">PREDICTED BASKET VALUE</p>
                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-6xl font-bold text-gray-900">$112.45</span>
                  <span className="text-2xl text-gray-500">USD</span>
                </div>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">94.2% Confidence</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">Model: XGBoost-v2.4</span>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">REFERENCE ID</p>
                  <p className="text-sm font-medium text-gray-900">#RBV-2024-9912</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">PROCESSED AT</p>
                  <p className="text-sm font-medium text-gray-900">📅 Oct 24, 14:22Z</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">INPUTS DETECTED</p>
                  <p className="text-sm font-medium text-gray-900">42 Data Points</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">MARGIN OF ERROR</p>
                  <p className="text-sm font-medium text-gray-900">+/- $3.12</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Value Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Value Distribution Probability</h3>
                  <p className="text-sm text-gray-600">Frequency analysis of predicted basket outcomes across 10,000 simulations.</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="h-64 flex items-end justify-between space-x-2">
                {[
                  { range: '$50-75', height: 60 },
                  { range: '$75-100', height: 120 },
                  { range: '$100-125', height: 200 },
                  { range: '$125-150', height: 80 },
                  { range: '$150+', height: 50 }
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t transition-all ${idx === 2 ? 'bg-blue-600' : 'bg-blue-300'}`}
                      style={{ height: `${bar.height}px` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{bar.range}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Impact Drivers */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Top Impact Drivers</h3>
              <p className="text-sm text-gray-600 mb-6">Primary variables influencing this specific basket value.</p>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Historical Monthly Spend</span>
                    <span className="text-sm font-bold text-green-600">+$24.50</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Electronics Category</span>
                    <span className="text-sm font-bold text-green-600">+$18.20</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Weekend Shopping Factor</span>
                    <span className="text-sm font-bold text-red-600">-$4.10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Peak Hour Traffic</span>
                    <span className="text-sm font-bold text-red-600">-$5.15</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Items in Cart Count</span>
                    <span className="text-sm font-bold text-green-600">+$18.00</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Distance from Store</span>
                    <span className="text-sm font-bold text-red-600">-$2.90</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Historical Avg</span>
                    <span className="text-sm font-bold text-gray-600">Base</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">+$45.00</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/explainability')}
                className="w-full mt-6 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center space-x-2"
              >
                <span>Explore Complete Explainability</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h3>
            <p className="text-sm text-gray-600 mb-6">Save this result to your history or download a detailed technical report.</p>

            <div className="flex items-center space-x-4">
              <button className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Result</span>
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Report</span>
              </button>
              <button
                onClick={() => navigate('/history')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View All History</span>
              </button>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h4 className="font-semibold text-gray-900">Market Trend Alignment</h4>
              </div>
              <p className="text-sm text-gray-600">This prediction aligns with current seasonal retail trends for Q4.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold text-gray-900">Model Reliability</h4>
              </div>
              <p className="text-sm text-gray-600">Input data quality score: 96%. No missing fields detected.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold text-gray-900">Confidence Interval</h4>
              </div>
              <p className="text-sm text-gray-600">Probability of value exceeding $150 is low (5.7%).</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between text-xs text-gray-500">
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

export default PredictionResult
