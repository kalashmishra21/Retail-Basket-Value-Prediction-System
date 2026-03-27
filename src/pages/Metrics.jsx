import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const Metrics = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [currentUser, setCurrentUser] = useState(null)
  const [activeMenu, setActiveMenu] = useState('Metrics')
  const [timeRange, setTimeRange] = useState('Last 30 Days')

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
    { icon: '📡', label: 'Monitoring', path: '/monitoring' },
    { icon: '⚙️', label: 'Settings', path: '/settings' }
  ]

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
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Detailed statistical metrics for the basket value prediction model.</p>
            </div>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
              className={`px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'}`}>
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>

          {/* Main Metrics */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>CURRENT RMSE</span>
                <span className="text-xs text-green-600">-4.2%</span>
              </div>
              <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>39.12 <span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>USD</span></p>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>CURRENT MAE</span>
                <span className="text-xs text-green-600">-2.8%</span>
              </div>
              <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>28.50 <span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>USD</span></p>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <p className="text-sm mb-2 opacity-90">R² SCORE (COEFFICIENT)</p>
              <p className="text-5xl font-bold mb-2">0.884</p>
              <p className="text-xs opacity-75">Highly Accurate</p>
              <div className="mt-4 bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{width:'88.4%'}} />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>RMSE Time Series</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Root Mean Square Error over last 7 validation cycles.</p>
              <div className="h-64 flex items-end justify-between space-x-2">
                {[42,41,43,40,39,38,39].map((value,idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-blue-600 rounded-t" style={{height:`${(value/50)*100}%`}} />
                    <span className={`text-xs ${isDarkMode?'text-gray-400':'text-gray-500'} mt-2`}>
                      {['01-01','01-15','01-30','02-12','02-17','02-20','02-12'][idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>MAE Trend</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Mean Absolute Error showing average deviation magnitude.</p>
              <div className="h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="maeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[50,100,150].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="1" strokeDasharray="4" />)}
                  <path d="M 0 80 Q 50 60, 100 90 T 200 70 T 300 100 T 400 85 L 400 200 L 0 200 Z" fill="url(#maeGrad)" />
                  <path d="M 0 80 Q 50 60, 100 90 T 200 70 T 300 100 T 400 85" fill="none" stroke="#3B82F6" strokeWidth="3" />
                  {[0,100,200,300,400].map((x,i) => <circle key={i} cx={x} cy={[80,90,70,100,85][i]} r="4" fill="#3B82F6" />)}
                </svg>
              </div>
            </div>
          </div>

          {/* Model Snapshots & Analysis Notes */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Model Snapshots</h3>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 ${isDarkMode?'bg-gray-700':'bg-gray-50'} rounded-lg`}>
                  <div>
                    <p className={`font-semibold ${isDarkMode?'text-white':'text-gray-900'}`}>Best Performance Instance</p>
                    <p className={`text-sm ${isDarkMode?'text-gray-400':'text-gray-600'}`}>Retail Segment</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">Error</p>
                    <p className={`text-sm ${isDarkMode?'text-gray-300':'text-gray-900'}`}>Electronics / High Value</p>
                    <p className={`text-xs ${isDarkMode?'text-gray-400':'text-gray-500'}`}>-$2.14</p>
                  </div>
                </div>
                <div className={`flex items-center justify-between p-4 ${isDarkMode?'bg-red-900/30':'bg-red-50'} rounded-lg`}>
                  <div>
                    <p className={`font-semibold ${isDarkMode?'text-white':'text-gray-900'}`}>Worst Performance Instance</p>
                    <p className={`text-sm ${isDarkMode?'text-gray-400':'text-gray-600'}`}>Retail Segment</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">Error</p>
                    <p className={`text-sm ${isDarkMode?'text-gray-300':'text-gray-900'}`}>Grocery / Seasonal</p>
                    <p className={`text-xs ${isDarkMode?'text-gray-400':'text-gray-500'}`}>+$112.40</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Analysis Notes</h3>
              <div className="space-y-3">
                <div className={`p-3 ${isDarkMode?'bg-blue-900/30':'bg-blue-50'} rounded-lg`}>
                  <p className={`text-xs font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-1`}>Recent Drift Detected</p>
                  <p className={`text-xs ${isDarkMode?'text-gray-300':'text-gray-700'}`}>RMSE increased by 12% in the Grocery category last week.</p>
                </div>
                <div className={`p-3 ${isDarkMode?'bg-yellow-900/30':'bg-yellow-50'} rounded-lg`}>
                  <p className={`text-xs font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-1`}>Model Versioning</p>
                  <p className={`text-xs ${isDarkMode?'text-gray-300':'text-gray-700'}`}>Consider recalibrating model weights if importance variance exceeds 15%.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Want to understand why?</h3>
              <p className="text-sm opacity-90">View feature importance and individual prediction contributions.</p>
            </div>
            <button onClick={() => navigate('/explainability')}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition">
              Go to Explainability →
            </button>
          </div>

          <div className={`mt-8 flex items-center justify-between text-xs ${isDarkMode?'text-gray-500':'text-gray-500'}`}>
            <p>© 2024 Retail Basket Value Prediction System</p>
            <div className="flex items-center space-x-4"><span>System Status: Online</span><span>v1.2.0-beta</span></div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Metrics
