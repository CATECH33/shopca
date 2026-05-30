import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import LoginPage        from './features/auth/pages/LoginPage.jsx'
import RegisterPage     from './features/auth/pages/RegisterPage.jsx'
import ForgotPage       from './features/auth/pages/ForgotPage.jsx'
import VerifyPendingPage from './features/auth/pages/VerifyPendingPage.jsx'
import ResetPage          from './features/auth/pages/ResetPage.jsx'
import CallbackPage       from './features/auth/pages/CallbackPage.jsx'
import LogoutPage         from './features/auth/pages/LogoutPage.jsx'
import AccountPage        from './features/auth/pages/AccountPage.jsx'
import OnboardingPage    from './features/auth/pages/OnboardingPage.jsx'
import ListingsPage       from './features/listings/ListingsPage.jsx'
import ListingDetailPage  from './features/listings/ListingDetailPage.jsx'
import EarlyAccessPage  from './earlyaccess/EarlyAccessPage.jsx'
import CRMPage          from './features/crm/CRMPage.jsx'
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
          <Route path="/"                    element={<App />} />
          <Route path="/auth/login"          element={<LoginPage />} />
          <Route path="/auth/register"       element={<RegisterPage />} />
          <Route path="/auth/forgot"         element={<ForgotPage />} />
          <Route path="/auth/verify-pending" element={<VerifyPendingPage />} />
          <Route path="/auth/reset"          element={<ResetPage />} />
          <Route path="/auth/callback"      element={<CallbackPage />} />
          <Route path="/auth/logout"        element={<LogoutPage />} />
          <Route path="/account"             element={<AccountPage />} />
          <Route path="/onboarding"          element={<OnboardingPage />} />
          <Route path="/annonces"            element={<ListingsPage />} />
          <Route path="/annonces/:id"        element={<ListingDetailPage />} />
          <Route path="/early-access"        element={<EarlyAccessPage />} />
          <Route path="/crm"               element={<CRMPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
