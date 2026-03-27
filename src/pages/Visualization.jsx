import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const Visualization = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [currentUser, setCurrentUser] = useState(null)
  const [activeMenu, setActiveMenu] = useState('Visualization')
  const [dataFilter, setDataFilter] = useState('All Test Data')

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
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Visualization</span>
            </div>
            <div className="flex items-center space-x-4">
              <div
                onClick={() => navigate('/settings')}
                className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:opacity-80 transition"
              >
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Model Analysis Gallery</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Comprehensive visual breakdown of model prediction accuracy and error patterns.</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={dataFilter}
                onChange={(e) => setDataFilter(e.target.value)}
                className={`px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'}`}
              >
                <option>All Test Data</option>
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
              </select>
            </div>
          </div>

          {/* Top Metrics */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {['Variance explained (R²)', 'Average Bias', 'Outlier Intensity'].map((label) => (
              <div key={label} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
                <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-2 mb-1`}>-</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No data available</p>
              </div>
            ))}
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Actual vs. Predicted Values</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Correlation between ground truth and model estimations across all test samples.</p>
              <div className={`h-80 relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  <line x1="0" y1="75" x2="400" y2="75" stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="150" x2="400" y2="150" stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="225" x2="400" y2="225" stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="1" strokeDasharray="4" />
                  <line x1="100" y1="0" x2="100" y2="300" stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="1" strokeDasharray="4" />
                  <line x1="200" y1="0" x2="200" y2="300" stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="1" strokeDasharray="4" />
                  <line x1="300" y1="0" x2="300" y2="300" stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="300" x2="400" y2="0" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="8,4" />
                  {[[50,280],[80,260],[120,240],[150,220],[180,200],[200,180],[220,170],[250,150],[280,140],[300,120],[320,100],[340,90],[360,70],[380,50],[390,40],[100,250],[140,210],[190,190],[240,160],[290,130],[330,110],[370,60]].map((p,i) => (
                    <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#3B82F6" opacity="0.6" />
                  ))}
                  <text x="10" y="20" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>400$</text>
                  <text x="10" y="80" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>300$</text>
                  <text x="10" y="155" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>200$</text>
                  <text x="10" y="230" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>100$</text>
                  <text x="90" y="295" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>100$</text>
                  <text x="190" y="295" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>200$</text>
                  <text x="290" y="295" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>300$</text>
                  <text x="380" y="295" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>400$</text>
                </svg>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Error Distribution</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Frequency of residuals (Actual - Predicted).</p>
              <div className={`h-80 relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  <line x1="0" y1="250" x2="400" y2="250" stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="2" />
                  {[{x:20,h:40},{x:60,h:80},{x:100,h:140},{x:140,h:200},{x:180,h:240},{x:220,h:200},{x:260,h:140},{x:300,h:80},{x:340,h:40}].map((b,i) => (
                    <rect key={i} x={b.x} y={250-b.h} width="30" height={b.h} fill="#3B82F6" opacity="0.8" />
                  ))}
                  <text x="10" y="270" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>-200$</text>
                  <text x="330" y="270" fontSize="9" fill={isDarkMode?'#9CA3AF':'#6B7280'}>0</text>
                </svg>
              </div>
              <div className={`mt-4 p-3 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg`}>
                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>The distribution is slightly left-skewed, suggesting a tendency to underpredict high-value baskets.</p>
              </div>
            </div>
          </div>

          {/* Error Analysis by Category */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Error Analysis by Category</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Comparative accuracy metrics across different retail segments.</p>
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
                {[{name:'Grocery',rmse:45,mae:32,volume:1400},{name:'Electronics',rmse:52,mae:38,volume:1050},{name:'Apparel',rmse:38,mae:28,volume:930},{name:'Home Decor',rmse:42,mae:30,volume:850},{name:'Beauty',rmse:35,mae:25,volume:780},{name:'Pharmacy',rmse:40,mae:29,volume:650}].map((cat,idx) => {
                  const x=100+idx*130, rh=(cat.rmse/60)*200, mh=(cat.mae/60)*200, vy=300-(cat.volume/1500)*250
                  return (
                    <g key={idx}>
                      <rect x={x-25} y={300-rh} width="20" height={rh} fill="#3B82F6" />
                      <rect x={x+5} y={300-mh} width="20" height={mh} fill="#8B5CF6" />
                      <circle cx={x} cy={vy} r="5" fill="#9CA3AF" />
                      <text x={x-20} y="330" fontSize="10" fill={isDarkMode?'#9CA3AF':'#6B7280'}>{cat.name}</text>
                    </g>
                  )
                })}
                <path d="M 100 133 L 230 167 L 360 183 L 490 200 L 620 217 L 750 250" fill="none" stroke="#9CA3AF" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div className={`mt-8 flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            <p>© 2024 Retail Basket Value Prediction System</p>
            <div className="flex items-center space-x-4"><span>System Status: Online</span><span>v1.2.0-beta</span></div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Visualization
