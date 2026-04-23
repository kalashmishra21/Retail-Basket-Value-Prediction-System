/**
 * Shared Footer Component
 * Reusable footer with copyright and system status
 * Consistent across all pages
 */

import { useTheme } from '../context/ThemeContext'

const Footer = () => {
  const { isDarkMode } = useTheme()

  return (
    <div className={`mt-8 flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
      <p>© 2024 Retail Basket Value Prediction System</p>
      <div className="flex items-center space-x-4">
        <span>System Status: Online</span>
        <span>v1.2.0-beta</span>
      </div>
    </div>
  )
}

export default Footer
