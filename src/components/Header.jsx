/**
 * Shared Header Component
 * Reusable page header with breadcrumb and user avatar
 * Reduces code duplication across all pages
 */

import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const Header = ({ pageName, currentUser }) => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()

  return (
    <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-4`}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <span>›</span>
          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pageName}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div
            onClick={() => navigate('/settings')}
            className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:opacity-80 transition"
            title="Go to Settings"
          >
            {currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
