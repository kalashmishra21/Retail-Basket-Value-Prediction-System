import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const Monitoring = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [currentUser, setCurrentUser] = useState(null)
  const [activeMenu, setActiveMenu] = useState('Monitoring')

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
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Monitoring</span>
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
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>System Monitoring</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Live performance tracking and infrastructure health overview.</p>
            </div>
            <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
              <span>Last updated: 2 mins ago</span>
            </div>
          </div>

          {/* Top Metrics */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Model Drift</h3>
                <span className={`px-2 py-1 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} text-xs font-medium rounded`}>No Data</span>
              </div>
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No drift data available</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>Upload data to monitor model drift</p>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Inference Load</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Request volume per second</p>
              <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>0 <span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>req/s</span></p>
              <div className="space-y-3">
                {[['CPU Utilization','0%','bg-blue-600'],['Memory Usage','0 GB','bg-purple-600']].map(([label,val,color]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{label}</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{val}</span>
                    </div>
                    <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                      <div className={`${color} h-2 rounded-full`} style={{width:'0%'}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Inference Reliability</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Success vs failure rate</p>
              <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>-</p>
              <div className="grid grid-cols-2 gap-4">
                {[['0','ERRORS (24H)'],['0','TIMEOUTS']].map(([v,l]) => (
                  <div key={l} className={`text-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{v}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{l}</p>
                  </div>
                ))}
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-3`}>No inference data available yet</p>
            </div>
          </div>

          {/* Prediction Accuracy Chart */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-8`}>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Prediction Accuracy</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Compare actual vs predicted basket values (last 7 days)</p>
            <div className="h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 700 250">
                {[50,100,150,200].map(y => <line key={y} x1="0" y1={y} x2="700" y2={y} stroke={isDarkMode?'#374151':'#E5E7EB'} strokeWidth="1" strokeDasharray="4" />)}
                <path d="M 50 180 L 150 140 L 250 160 L 350 120 L 450 100 L 550 130 L 650 80" fill="none" stroke="#3B82F6" strokeWidth="3" />
                <path d="M 50 170 L 150 135 L 250 155 L 350 115 L 450 95 L 550 125 L 650 75" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeDasharray="8,4" />
                {[50,150,250,350,450,550,650].map((x,i) => (
                  <g key={i}>
                    <circle cx={x} cy={[180,140,160,120,100,130,80][i]} r="5" fill="#3B82F6" />
                    <circle cx={x} cy={[170,135,155,115,95,125,75][i]} r="5" fill="#8B5CF6" />
                  </g>
                ))}
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => (
                  <text key={d} x={40+i*100} y="235" fontSize="10" fill={isDarkMode?'#9CA3AF':'#6B7280'}>{d}</text>
                ))}
              </svg>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-600 rounded-full"/><span className={`text-xs ${isDarkMode?'text-gray-400':'text-gray-600'}`}>Actual</span></div>
              <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-purple-600 rounded-full"/><span className={`text-xs ${isDarkMode?'text-gray-400':'text-gray-600'}`}>Predicted</span></div>
            </div>
          </div>

          {/* API Usage & Infrastructure Health */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>API Usage</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Request distribution by hour</p>
              <div className="h-48 flex items-end justify-between space-x-1">
                {[3200,2800,3600,4200,5600,4800,3400].map((value,idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition" style={{height:`${(value/6000)*100}%`}} />
                    <span className={`text-xs ${isDarkMode?'text-gray-400':'text-gray-500'} mt-2`}>{['00:00','04:00','08:00','12:00','16:00','20:00','23:00'][idx]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Infrastructure Health</h3>
              <div className="grid grid-cols-2 gap-4">
                {[{label:'Inference Server',ms:'124ms',color:'text-blue-600'},{label:'Model Registry',ms:'45ms',color:'text-purple-600'},{label:'PostgreSQL DB',ms:'12ms',color:'text-green-600'},{label:'S3 Data Lake',ms:'210ms',color:'text-orange-600'}].map(({label,ms,color}) => (
                  <div key={label} className={`p-4 border ${isDarkMode?'border-gray-700':'border-gray-200'} rounded-lg`}>
                    <p className={`text-xs ${isDarkMode?'text-gray-400':'text-gray-600'}`}>{label}</p>
                    <p className={`text-sm font-semibold ${isDarkMode?'text-white':'text-gray-900'}`}>{ms}</p>
                    <span className="text-xs text-green-600 font-medium">online</span>
                  </div>
                ))}
              </div>
              <div className={`mt-4 p-3 ${isDarkMode?'bg-blue-900/30':'bg-blue-50'} rounded-lg`}>
                <p className={`text-xs ${isDarkMode?'text-gray-300':'text-gray-700'}`}>[14:24:02] Model inference successfully completed.</p>
                <p className={`text-xs ${isDarkMode?'text-gray-300':'text-gray-700'}`}>[14:23:58] Database query optimized in 12ms.</p>
              </div>
              <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">View All Logs →</button>
            </div>
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

export default Monitoring
