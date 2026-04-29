import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sidebar } from '../components'

const Settings = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    professionalRole: '',
    department: ''
  })
  const [apiKey, setApiKey] = useState('ro_live_xf8Za8c1e0b3d4e5f6g7h8i9jk1l2m3')
  const [notifications, setNotifications] = useState({
    modelPerformance: true,
    dataValidation: false
  })
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) {
      navigate('/')
      return
    }
    setCurrentUser(user)
    setFormData({
      fullName: user.name || '',
      email: user.email || '',
      professionalRole: user.professionalRole || '',
      department: user.department || ''
    })
  }, [navigate])

  /**
   * Show success message temporarily
   * Displays success notification and auto-hides after 3 seconds
   */
  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    navigate('/')
  }

  /**
   * Handle save changes
   * Updates user profile data in localStorage including professional role and department
   */
  const handleSaveChanges = () => {
    // Update user data in localStorage with all fields
    const updatedUser = {
      ...currentUser,
      name: formData.fullName,
      email: formData.email,
      professionalRole: formData.professionalRole,
      department: formData.department
    }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
    showSuccess('Profile changes saved successfully!')
  }

  /**
   * Generate new API key
   * Creates unique API key with 'ro_live_' prefix
   */
  const handleGenerateNewKey = () => {
    const newKey = 'ro_live_' + Math.random().toString(36).substring(2, 30)
    setApiKey(newKey)
    showSuccess('New API key generated successfully!')
  }

  /**
   * Copy API key to clipboard
   * Uses navigator clipboard API to copy key
   */
  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey)
    showSuccess('API key copied to clipboard!')
  }

  const handleLogoutFromSystem = () => {
    if (confirm('Are you sure you want to logout from the system?')) {
      handleLogout()
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar currentUser={currentUser} activeMenu="Settings" onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-4`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>›</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</span>
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

        {/* Settings Content */}
        <main className={`flex-1 overflow-y-auto p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          <div className="max-w-4xl">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Account Settings</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>Manage your profile, API access, and system preferences.</p>

            {/* Profile Information */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-6`}>
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Information</h2>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Update your personal details and how you appear in the system reports.</p>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {[
                  { label: 'Full Name', key: 'fullName', type: 'text' },
                  { label: 'Email Address', key: 'email', type: 'email' },
                  { label: 'Professional Role', key: 'professionalRole', type: 'text' },
                  { label: 'Department', key: 'department', type: 'text' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{label}</label>
                    <input type={type} value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className={`block w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button onClick={handleSaveChanges}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            {/* API Configuration */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>API Configuration</h2>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Production Environment</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Use this key to authenticate with our REST API. Keep this key secret and secure.</p>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Current Active Key</label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input type="text" value={apiKey} readOnly
                      className={`block w-full px-3 py-2.5 border rounded-lg text-sm font-mono ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    />
                    <button onClick={handleCopyKey} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <button onClick={handleGenerateNewKey}
                    className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition flex items-center space-x-2 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Generate New Key</span>
                  </button>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>Last created: Oct 24, 2024 at 14:22 PM</p>
              </div>
            </div>

            {/* Notifications */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-6`}>
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h2>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Control which system alerts you receive via email.</p>
              <div className="space-y-4">
                {[
                  { key: 'modelPerformance', label: 'Model Performance Alerts', sub: 'Notify me when RMSE exceeds threshold' },
                  { key: 'dataValidation', label: 'Data Validation Reports', sub: 'Receive daily summary of uploaded datasets' },
                ].map(({ key, label, sub }) => (
                  <div key={key} className={`flex items-center justify-between py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} last:border-0`}>
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{sub}</p>
                    </div>
                    <button onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notifications[key] ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* System Access */}
            <div className={`${isDarkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'} rounded-xl border p-6`}>
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-900'} mb-2`}>System Access</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-4`}>Sign out of your account to end the current session.</p>
              <button onClick={handleLogoutFromSystem}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout from System</span>
              </button>
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

export default Settings
