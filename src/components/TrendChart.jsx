import { useTheme } from '../context/ThemeContext'

/**
 * Trend Chart Component
 * Displays 7-day basket value trends with actual vs predicted lines
 * 
 * Props:
 * - trends: Trend data object { labels, actual, predicted, has_data }
 * - loading: Loading state (boolean)
 * - onRefresh: Refresh handler function
 */
const TrendChart = ({ trends, loading, onRefresh }) => {
  const { isDarkMode } = useTheme()

  /**
   * Builds SVG polyline points from data array
   * Maps values onto 480×240 canvas
   */
  const buildChartPoints = (values, maxVal) => {
    if (!values || maxVal === 0) return ''
    return values
      .map((v, i) => {
        if (v === null) return null
        const x = 80 + i * 82
        const y = Math.max(28, 260 - ((v / maxVal) * 232))
        return `${x},${y}`
      })
      .filter(Boolean)
      .join(' ')
  }

  const chartMax = trends?.has_data
    ? Math.ceil(Math.max(...[...(trends.actual || []), ...(trends.predicted || [])].filter(Boolean)) * 1.15)
    : 6000

  const yLabels = [
    chartMax,
    Math.round(chartMax * 0.75),
    Math.round(chartMax * 0.5),
    Math.round(chartMax * 0.25),
    0
  ]

  return (
    <div className={`col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Basket Value Trends
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Actual vs. predicted average basket value — last 7 days
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`px-4 py-2 border ${
            isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          } rounded-lg text-sm font-medium transition disabled:opacity-50`}
        >
          {loading ? '⟳ Syncing…' : '⟳ Sync Data'}
        </button>
      </div>

      <div className={`h-80 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-lg relative`}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {!loading && !trends?.has_data && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-gray-500">No prediction data yet. Upload a dataset to see trends.</p>
          </div>
        )}

        {!loading && trends?.has_data && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 300">
            {/* Y-axis labels */}
            {yLabels.map((val, i) => (
              <text key={i} x="42" y={24 + i * 52} fontSize="9" fill={isDarkMode ? '#9CA3AF' : '#6B7280'} textAnchor="end">
                ${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}
              </text>
            ))}

            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line key={i} x1="48" y1={24 + i * 52} x2="575" y2={24 + i * 52} stroke={isDarkMode ? '#374151' : '#E5E7EB'} strokeWidth="1" strokeDasharray="4" />
            ))}

            {/* X-axis labels */}
            {(trends.labels || []).map((label, i) => (
              <text key={i} x={80 + i * 82} y="285" fontSize="9" fill={isDarkMode ? '#9CA3AF' : '#6B7280'} textAnchor="middle">
                {label}
              </text>
            ))}

            {/* Actual line */}
            {buildChartPoints(trends.actual, chartMax) && (
              <polyline points={buildChartPoints(trends.actual, chartMax)} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinejoin="round" />
            )}

            {/* Predicted line */}
            {buildChartPoints(trends.predicted, chartMax) && (
              <polyline points={buildChartPoints(trends.predicted, chartMax)} fill="none" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6,4" strokeLinejoin="round" />
            )}

            {/* Dots on actual */}
            {(trends.actual || []).map((v, i) => v !== null && (
              <circle key={i} cx={80 + i * 82} cy={Math.max(28, 260 - ((v / chartMax) * 232))} r="4" fill="#3B82F6" />
            ))}

            {/* Dots on predicted */}
            {(trends.predicted || []).map((v, i) => v !== null && (
              <circle key={i} cx={80 + i * 82} cy={Math.max(28, 260 - ((v / chartMax) * 232))} r="3" fill="#93C5FD" />
            ))}
          </svg>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-6 bg-white/90 px-4 py-2 rounded-lg shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            <span className="text-xs text-gray-600">Actual Value</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full" />
            <span className="text-xs text-gray-600">Predicted Value</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrendChart
