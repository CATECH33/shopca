import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './features/auth/providers/AuthProvider.jsx'
import ProtectedRoute from './lib/ProtectedRoute.jsx'
import './index.css'

// ── Chargement immédiat (critique pour le rendu initial) ──────────────────────
import App from './App.jsx'

// ── Lazy loading (code splitting automatique) ─────────────────────────────────
const LoginPage              = lazy(() => import('./features/auth/pages/LoginPage.jsx'))
const RegisterPage           = lazy(() => import('./features/auth/pages/RegisterPage.jsx'))
const ProRegisterPage        = lazy(() => import('./features/pro/ProRegisterPage.jsx'))
const AgencyVerificationPage = lazy(() => import('./features/pro/AgencyVerificationPage.jsx'))
const ForgotPage             = lazy(() => import('./features/auth/pages/ForgotPage.jsx'))
const VerifyPendingPage      = lazy(() => import('./features/auth/pages/VerifyPendingPage.jsx'))
const ResetPage              = lazy(() => import('./features/auth/pages/ResetPage.jsx'))
const CallbackPage           = lazy(() => import('./features/auth/pages/CallbackPage.jsx'))
const LogoutPage             = lazy(() => import('./features/auth/pages/LogoutPage.jsx'))
const AccountPage            = lazy(() => import('./features/auth/pages/AccountPage.jsx'))
const OnboardingPage         = lazy(() => import('./features/auth/pages/OnboardingPage.jsx'))
const ListingsPage           = lazy(() => import('./features/listings/ListingsPage.jsx'))
const ListingDetailPage      = lazy(() => import('./features/listings/ListingDetailPage.jsx'))
const EarlyAccessPage        = lazy(() => import('./earlyaccess/EarlyAccessPage.jsx'))
const CRMPage                = lazy(() => import('./features/crm/CRMPage.jsx'))
const FormsPage              = lazy(() => import('./features/forms/FormsPage.jsx'))
const AgencesPage            = lazy(() => import('./features/agencies/AgencesPage.jsx'))
const TarifsPage             = lazy(() => import('./features/tarifs/TarifsPage.jsx'))
const SimulateurPage         = lazy(() => import('./features/simulateur/SimulateurPage.jsx'))
const EstimationPage         = lazy(() => import('./features/estimation/EstimationPage.jsx'))
const GuidesPage             = lazy(() => import('./features/guides/GuidesPage.jsx'))
const SubscriptionSuccessPage = lazy(() => import('./features/subscription/SubscriptionSuccessPage.jsx'))
const PersonalDashboardPage  = lazy(() => import('./features/dashboard/PersonalDashboardPage.jsx'))
const ProDashboardPage       = lazy(() => import('./features/pro/ProDashboardPage.jsx'))
const DebugAuthPage          = lazy(() => import('./features/debug/DebugAuthPage.jsx'))

// ── Back Office — ManagerIT (accès propriétaire uniquement) ──────────────────
const ManagerLayout       = lazy(() => import('./managerIT/ManagerLayout.jsx'))
const MgrDashboardPage    = lazy(() => import('./managerIT/pages/DashboardPage.jsx'))
const MgrUsersPage        = lazy(() => import('./managerIT/pages/UsersPage.jsx'))
const MgrProfessionalsPage = lazy(() => import('./managerIT/pages/ProfessionalsPage.jsx'))
const MgrListingsPage     = lazy(() => import('./managerIT/pages/ListingsPage.jsx'))
const MgrPaymentsPage     = lazy(() => import('./managerIT/pages/PaymentsPage.jsx'))
const MgrEmailsPage       = lazy(() => import('./managerIT/pages/EmailsPage.jsx'))
const MgrNotificationsPage = lazy(() => import('./managerIT/pages/NotificationsPage.jsx'))
const MgrSupportPage      = lazy(() => import('./managerIT/pages/SupportPage.jsx'))
const MgrModerationPage   = lazy(() => import('./managerIT/pages/ModerationPage.jsx'))
const MgrSettingsPage     = lazy(() => import('./managerIT/pages/SettingsPage.jsx'))
const MgrLogsPage         = lazy(() => import('./managerIT/pages/LogsPage.jsx'))

// ── Pages SEO ─────────────────────────────────────────────────────────────────
const AcheterPage        = lazy(() => import('./features/seo/AcheterPage.jsx'))
const LouerPage          = lazy(() => import('./features/seo/LouerPage.jsx'))
const ProgrammesNeufsPage = lazy(() => import('./features/seo/ProgrammesNeufsPage.jsx'))
const CityPage           = lazy(() => import('./features/seo/CityPage.jsx'))
const TypeCityPage       = lazy(() => import('./features/seo/TypeCityPage.jsx'))
const AgencesVillePage   = lazy(() => import('./features/seo/AgencesVillePage.jsx'))

// ── Fallback pendant le chargement lazy ───────────────────────────────────────
function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
      <svg className="animate-spin text-orange-500" width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
        <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
      </svg>
    </div>
  )
}

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
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ── Page d'accueil ── */}
                <Route path="/" element={<App />} />

                {/* ── Auth ── */}
                <Route path="/auth/login"          element={<LoginPage />} />
                <Route path="/auth/register"       element={<RegisterPage />} />
                <Route path="/auth/register/pro"   element={<ProRegisterPage />} />
                <Route path="/verification/agence" element={<AgencyVerificationPage />} />
                <Route path="/auth/forgot"         element={<ForgotPage />} />
                <Route path="/auth/verify-pending" element={<VerifyPendingPage />} />
                <Route path="/auth/reset"          element={<ResetPage />} />
                <Route path="/auth/callback"       element={<CallbackPage />} />
                <Route path="/auth/logout"         element={<LogoutPage />} />
                <Route path="/account"             element={<AccountPage />} />
                <Route path="/onboarding"          element={<OnboardingPage />} />

                {/* ── Annonces ── */}
                <Route path="/annonces"     element={<ListingsPage />} />
                <Route path="/annonces/:id" element={<ListingDetailPage />} />
                <Route path="/recherche"    element={<ListingsPage />} />

                {/* ── Pages SEO — Achat ── */}
                <Route path="/acheter"                       element={<AcheterPage />} />
                <Route path="/acheter/:ville"                element={<CityPage mode="achat" />} />
                <Route path="/acheter/:type/:ville"          element={<TypeCityPage mode="achat" />} />

                {/* ── Pages SEO — Location ── */}
                <Route path="/louer"                         element={<LouerPage />} />
                <Route path="/louer/:ville"                  element={<CityPage mode="location" />} />
                <Route path="/louer/:type/:ville"            element={<TypeCityPage mode="location" />} />

                {/* ── Pages SEO — Agences & Neufs ── */}
                <Route path="/agences"        element={<AgencesPage />} />
                <Route path="/agences/:ville" element={<AgencesVillePage />} />
                <Route path="/programmes-neufs" element={<ProgrammesNeufsPage />} />

                {/* ── Outils ── */}
                <Route path="/tarifs"       element={<TarifsPage />} />
                <Route path="/simulateur"   element={<SimulateurPage />} />
                <Route path="/estimation"   element={<EstimationPage />} />
                <Route path="/guides"       element={<GuidesPage />} />
                <Route path="/early-access" element={<EarlyAccessPage />} />

                {/* ── Abonnement ── */}
                <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />

                {/* ── Espaces protégés ── */}
                <Route path="/mon-espace" element={
                  <ProtectedRoute><PersonalDashboardPage /></ProtectedRoute>
                } />
                <Route path="/pro" element={
                  <ProtectedRoute anyOf={['pro_user', 'agency', 'agency_admin', 'super_admin']}>
                    <ProDashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/crm" element={
                  <ProtectedRoute anyOf={['pro_user', 'agency', 'agency_admin', 'super_admin']}>
                    <CRMPage />
                  </ProtectedRoute>
                } />
                <Route path="/forms" element={
                  <ProtectedRoute anyOf={['pro_user', 'agency', 'agency_admin', 'super_admin']}>
                    <FormsPage />
                  </ProtectedRoute>
                } />
                <Route path="/debug-auth" element={
                  <ProtectedRoute anyOf={['super_admin']}><DebugAuthPage /></ProtectedRoute>
                } />

                {/* ── Back Office ManagerIT (propriétaire uniquement, non indexé) ── */}
                <Route path="/managerIT" element={<ManagerLayout />}>
                  <Route index element={<Navigate to="/managerIT/dashboard" replace />} />
                  <Route path="dashboard"     element={<MgrDashboardPage />} />
                  <Route path="users"         element={<MgrUsersPage />} />
                  <Route path="professionals" element={<MgrProfessionalsPage />} />
                  <Route path="listings"      element={<MgrListingsPage />} />
                  <Route path="payments"      element={<MgrPaymentsPage />} />
                  <Route path="emails"        element={<MgrEmailsPage />} />
                  <Route path="notifications" element={<MgrNotificationsPage />} />
                  <Route path="support"       element={<MgrSupportPage />} />
                  <Route path="moderation"    element={<MgrModerationPage />} />
                  <Route path="settings"      element={<MgrSettingsPage />} />
                  <Route path="logs"          element={<MgrLogsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
