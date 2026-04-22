import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import UploadData from './pages/UploadData'
import Predictions from './pages/Predictions'
import PredictionResult from './pages/PredictionResult'
import History from './pages/History'
import Explainability from './pages/Explainability'
import Metrics from './pages/Metrics'
import Visualization from './pages/Visualization'
import ResetPassword from './pages/ResetPassword'

/**
 * Main App component with routing configuration and theme provider
 * Defines all application routes and wraps with theme context
 */
function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/upload" element={<UploadData />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/prediction-result" element={<PredictionResult />} />
          <Route path="/history" element={<History />} />
          <Route path="/explainability" element={<Explainability />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/visualization" element={<Visualization />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
