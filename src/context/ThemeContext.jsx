import { createContext, useContext, useState, useEffect } from 'react'

/**
 * Theme Context for managing dark/light mode across the application
 * Provides theme state and toggle function to all components
 */
const ThemeContext = createContext()

/**
 * Custom hook to use theme context
 * Returns current theme and toggle function
 */
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

/**
 * Theme Provider component
 * Wraps application and provides theme state to all children
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load theme from localStorage or default to light mode
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'dark'
  })

  /**
   * Toggle between dark and light mode
   * Saves preference to localStorage
   */
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev
      localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      return newTheme
    })
  }

  // Apply theme class to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
