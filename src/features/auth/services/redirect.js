/**
 * Single source of truth for post-authentication redirection.
 * Used by CallbackPage (email confirm/OAuth), LoginPage, RegisterPage.
 *
 * Routes reference:
 *   /managerIT     — platform_owner, moderator
 *   /pro           — pro_user, agency, agency_admin
 *   /mon-espace    — private_user, premium_seller, user (default logged-in)
 *   /onboarding    — new personal accounts that haven't set preferences yet
 */
export function postAuthRedirect(profile, user, { preferOnboarding = false } = {}) {
  const role = profile?.role || user?.user_metadata?.role
  const accountType = profile?.account_type || user?.user_metadata?.account_type

  // Admin / platform staff
  if (role === 'platform_owner' || role === 'moderator') return '/managerIT'

  // Professional
  if (accountType === 'professional' || ['pro_user', 'agency', 'agency_admin'].includes(role)) {
    return '/pro'
  }

  // Personal — first time (no preferences filled) → onboarding wizard
  const prefs = profile?.preferences
  const hasPrefs = Array.isArray(prefs) ? prefs.length > 0 : !!prefs
  if (preferOnboarding && !hasPrefs) return '/onboarding'

  // Default logged-in home
  return '/mon-espace'
}
