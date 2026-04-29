import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

/**
 * Reusable Sidebar Component
 * Used across all pages for consistent navigation
 * 
 * Props:
 * - activeMenu: Current active menu item (string)
 * - onLogout: Logout handler function
 */
const Sidebar = ({ activeMenu, onLogout }) => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()

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

  return (
    <div className={`w-64 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              activeMenu === item.label
                ? 'bg-blue-50 text-blue-600'
                : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={onLogout}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
            isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
