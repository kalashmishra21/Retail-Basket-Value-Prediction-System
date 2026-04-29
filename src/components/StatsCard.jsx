import { useTheme } from '../context/ThemeContext'

/**
 * Reusable Stats Card Component
 * Displays a metric with title, value, and subtitle
 * 
 * Props:
 * - title: Card title (string)
 * - value: Main value to display (string/number)
 * - subtitle: Additional info below value (string)
 * - isLoading: Loading state (boolean)
 * - icon: Optional icon element
 */
const StatsCard = ({ title, value, subtitle, isLoading = false, icon = null }) => {
  const { isDarkMode } = useTheme()

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
      <div className="flex items-center space-x-2 mb-1">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
        {icon}
      </div>
      <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {isLoading ? '—' : value}
      </h2>
      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
        {subtitle}
      </p>
    </div>
  )
}

export default StatsCard
