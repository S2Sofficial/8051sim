import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { initializeFirebase } from './config/firebase'

// Initialize Firebase on app start
try {
  initializeFirebase()
} catch (error) {
  console.error('Failed to initialize Firebase:', error)
  // App will still work, but authentication will not be available
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
