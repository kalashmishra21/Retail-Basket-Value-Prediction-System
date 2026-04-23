/**
 * Shared Menu Items Configuration
 * Used across all authenticated pages for consistent navigation
 * Single source of truth - update once, reflects everywhere
 */

export const MENU_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '📤', label: 'Upload Data', path: '/upload' },
  { icon: '📋', label: 'Predictions', path: '/predictions' },
  { icon: '🕐', label: 'History', path: '/history' },
  { icon: '🔍', label: 'Explainability', path: '/explainability' },
  { icon: '📈', label: 'Metrics', path: '/metrics' },
  { icon: '📊', label: 'Visualization', path: '/visualization' },
  { icon: '⚙️', label: 'Settings', path: '/settings' }
]
