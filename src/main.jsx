import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Login from './auth/Login.jsx'
import Register from './auth/Register.jsx'
import Forgot from './auth/Forgot.jsx'
import VerifyPending from './auth/VerifyPending.jsx'
import EarlyAccessPage from './earlyaccess/EarlyAccessPage.jsx'
import UserDashLayout from './userdash/UserDashLayout.jsx'
import UDOverview from './userdash/UDOverview.jsx'
import UDSavedSearches from './userdash/UDSavedSearches.jsx'
import UDNotifications from './userdash/UDNotifications.jsx'
import UDAIInsights from './userdash/UDAIInsights.jsx'
import UDSubscription from './userdash/UDSubscription.jsx'
import UDFavorites from './userdash/UDFavorites.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#0F172A' }}>
          <h2 style={{ color: '#DC2626' }}>Erreur au démarrage</h2>
          <pre style={{ background: '#FEF2F2', padding: 16, borderRadius: 8, fontSize: 13 }}>
            {this.state.error?.message}
          </pre>
          <p style={{ color: '#64748B', fontSize: 14 }}>
            Vérifiez que les variables <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> sont bien définies sur Vercel.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot" element={<Forgot />} />
          <Route path="/auth/verify-pending" element={<VerifyPending />} />
          <Route path="/early-access" element={<EarlyAccessPage />} />
          <Route path="/dashboard" element={<UserDashLayout />}>
            <Route index element={<UDOverview />} />
            <Route path="searches" element={<UDSavedSearches />} />
            <Route path="notifications" element={<UDNotifications />} />
            <Route path="insights" element={<UDAIInsights />} />
            <Route path="subscription" element={<UDSubscription />} />
            <Route path="favorites" element={<UDFavorites />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
