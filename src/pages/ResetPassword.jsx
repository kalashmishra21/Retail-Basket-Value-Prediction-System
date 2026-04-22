import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/api'

/**
 * Reset Password component
 * Allows users to set a new password after clicking email reset link
 */
const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    // Get email from URL query parameter
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [searchParams])

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25

    setPasswordStrength(strength)
  }, [password])

  /**
   * Handle password reset form submission
   * Validates input and calls backend API with proper error handling
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('') // Clear previous errors

    // Validate email exists
    if (!email) {
      setError('Invalid reset link. Email parameter is missing.')
      return
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please make sure both passwords are identical.')
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    // Validate password strength
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.')
      return
    }

    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter.')
      return
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.')
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.resetPassword({ 
        email, 
        password 
      })
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (error) {
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error
        const status = error.response.status
        const errorData = error.response.data
        
        if (status === 404) {
          setError('No account found with this email address. Please check your email or sign up for a new account.')
        } else if (status === 400) {
          setError(errorData.error || 'Invalid request. Please check your input and try again.')
        } else if (status === 500) {
          setError('Server error occurred. Please try again later or contact support.')
        } else {
          setError(errorData.error || 'Failed to reset password. Please try again.')
        }
      } else if (error.request) {
        // Request made but no response
        setError('Unable to connect to server. Please check your internet connection and try again.')
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.')
      }
      
      // Keep error visible - user must see it
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            {/* Success Icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your password has been successfully changed for <span className="font-semibold">{email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You can now login with your new password. Redirecting to login page in 3 seconds...
            </p>
            
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-600 hover:text-red-800 ml-2"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Email Display (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* New Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters with uppercase, lowercase, and number</p>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">Password Strength:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength === 100 ? 'text-green-600' :
                      passwordStrength >= 75 ? 'text-blue-600' :
                      passwordStrength >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {passwordStrength === 100 ? 'Strong' :
                       passwordStrength >= 75 ? 'Good' :
                       passwordStrength >= 50 ? 'Fair' :
                       'Weak'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength === 100 ? 'bg-green-600' :
                        passwordStrength >= 75 ? 'bg-blue-600' :
                        passwordStrength >= 50 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className={`text-xs flex items-center ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      {password.length >= 8 ? '✓' : '○'} At least 8 characters
                    </p>
                    <p className={`text-xs flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                    </p>
                    <p className={`text-xs flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
                    </p>
                    <p className={`text-xs flex items-center ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[0-9]/.test(password) ? '✓' : '○'} One number
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Confirm new password"
                required
                minLength={8}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Back to login
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          © 2024 Retail Basket Predictor. Built by Kalash Mishra
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
