import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

/**
 * Login component for user authentication
 * Handles user login via backend API and manages session state
 */
const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(sessionStorage.getItem('loginError') || '')
  const [errorLocked, setErrorLocked] = useState(sessionStorage.getItem('loginErrorLocked') === 'true')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const navigate = useNavigate()
  const errorRef = useRef(null)
  const mountedRef = useRef(true)
  
  useEffect(() => {
    mountedRef.current = true
    
    // Auto-hide error after 3 seconds
    if (errorLocked) {
      const timer = setTimeout(() => {
        setErrorLocked(false)
        setError('')
        sessionStorage.removeItem('loginError')
        sessionStorage.removeItem('loginErrorLocked')
      }, 3000)
      return () => clearTimeout(timer)
    }
    
    return () => {
      mountedRef.current = false
    }
  }, [errorLocked])

  /**
   * Handle forgot password submission
   * Sends password reset email to user via backend API
   */
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    setResetLoading(true)
    
    try {
      const response = await authAPI.forgotPassword({ email: resetEmail })
      setResetError('')
      setResetSuccess(true)
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status
        const errorData = error.response.data
        
        if (statusCode === 404) {
          setResetError('No account found with this email.')
        } else if (statusCode === 400) {
          setResetError(errorData.error || 'Please enter a valid email address.')
        } else {
          setResetError(errorData.error || 'Failed to send reset email.')
        }
      } else if (error.request) {
        setResetError('Unable to connect to server.')
      } else {
        setResetError('An unexpected error occurred.')
      }
    } finally {
      setResetLoading(false)
    }
  }

  /**
   * Handle login form submission
   * Validates credentials and authenticates user via backend API
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (errorLocked) return

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      sessionStorage.setItem('loginError', 'Password must be at least 8 characters')
      sessionStorage.setItem('loginErrorLocked', 'true')
      setErrorLocked(true)
      return
    }

    setIsLoading(true)
    
    try {
      const response = await authAPI.login({ email, password })
      
      setError('')
      sessionStorage.removeItem('loginError')
      sessionStorage.removeItem('loginErrorLocked')
      
      localStorage.setItem('authToken', response.data.token)
      const userData = {
        ...response.data.user,
        name: response.data.user.full_name || response.data.user.first_name || response.data.user.username
      }
      localStorage.setItem('currentUser', JSON.stringify(userData))
      navigate('/dashboard')
      
    } catch (error) {
      let errorMessage = 'Invalid email or password.'
      
      if (error.response) {
        const statusCode = error.response.status
        const errorData = error.response.data
        
        if (statusCode === 401) {
          errorMessage = 'Invalid email or password.'
        } else if (statusCode === 404) {
          errorMessage = 'No account found with this email.'
        } else if (statusCode === 400) {
          errorMessage = errorData.error || 'Please check your input.'
        } else {
          errorMessage = 'Login failed. Please try again.'
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to server.'
      } else {
        errorMessage = 'An unexpected error occurred.'
      }
      
      errorRef.current = errorMessage
      sessionStorage.setItem('loginError', errorMessage)
      sessionStorage.setItem('loginErrorLocked', 'true')
      
      if (mountedRef.current) {
        setError(errorMessage)
        setErrorLocked(true)
      }
      
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Retail Basket Predictor</h1>
          <p className="text-gray-600">Sign in to access your ML dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message - LOCKED FOR 2 SECONDS */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start justify-between animate-pulse">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!errorLocked) {
                      setError('')
                      sessionStorage.removeItem('loginError')
                      sessionStorage.removeItem('loginErrorLocked')
                    }
                  }}
                  disabled={errorLocked}
                  className={`ml-2 ${errorLocked ? 'opacity-30 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                  type="button"
                  title={errorLocked ? 'Please wait 2 seconds' : 'Close'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || errorLocked}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/signup')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up for free
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          © 2024 Retail Basket Predictor. Built by Kalash Mishra
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowForgotPassword(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setShowForgotPassword(false)
                setResetSuccess(false)
                setResetEmail('')
                setResetError('')
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {!resetSuccess ? (
              <>
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                <p className="text-gray-600 mb-6">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>

                {resetError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{resetError}</span>
                    </div>
                    <button
                      onClick={() => setResetError('')}
                      className="text-red-600 hover:text-red-800 ml-2"
                      type="button"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {resetLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Instructions'
                    )}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Back to login
                  </button>
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Check Your Email</h2>
                <p className="text-gray-600 text-center mb-6">
                  We've sent password reset instructions to <span className="font-semibold">{resetEmail}</span>
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Didn't receive the email?</strong> Check your spam folder or try again in a few minutes.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetSuccess(false)
                    setResetEmail('')
                  }}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
