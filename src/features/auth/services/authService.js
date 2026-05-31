import { supabase } from '../../../lib/supabase.js'
import { updateProfile, updateAgency, insertVerificationDoc } from './profileService.js'

export { updateProfile, updateAgency, getProfile, getAgency, getVerificationDocs } from './profileService.js'
import { uploadAvatar, uploadAgencyLogo, uploadAgencyCover, uploadKycDoc } from './storageService.js'

// ── Sign up ───────────────────────────────────────────────────────────────────
// meta   — user_meta_data forwarded to handle_new_user trigger
// files  — { avatar?, logo?, cover?, kbis?, idDoc? } — File objects
export async function signUp(email, password, meta = {}, files = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: meta,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error

  const userId  = data.user?.id
  const session = data.session  // null when email confirmation is required

  // Upload files only when we have an active session (auto-confirm enabled)
  // or in the rare case Supabase returns a session directly.
  // When email confirmation is required there is no session and no auth.uid(),
  // so storage RLS would reject the upload — we skip gracefully.
  if (userId && session) {
    await uploadRegistrationFiles(userId, meta.account_type, files).catch((err) => {
      console.warn('[auth] File upload partial failure:', err)
    })
  }

  return data
}

async function uploadRegistrationFiles(userId, accountType, files) {
  const profilePatch = {}
  const agencyPatch  = {}

  if (files.avatar) {
    profilePatch.avatar_url = await uploadAvatar(userId, files.avatar)
  }

  if (accountType === 'professional') {
    if (files.logo)  agencyPatch.logo_url  = await uploadAgencyLogo(userId, files.logo)
    if (files.cover) agencyPatch.cover_url = await uploadAgencyCover(userId, files.cover)
  }

  const jobs = []

  if (Object.keys(profilePatch).length) {
    jobs.push(updateProfile(userId, profilePatch))
  }
  if (Object.keys(agencyPatch).length && accountType === 'professional') {
    jobs.push(updateAgency(userId, agencyPatch))
  }

  if (accountType === 'professional') {
    if (files.kbis) {
      jobs.push(
        uploadKycDoc(userId, 'kbis', files.kbis)
          .then((path) => insertVerificationDoc(userId, 'kbis', path))
      )
    }
    if (files.idDoc) {
      jobs.push(
        uploadKycDoc(userId, 'id_document', files.idDoc)
          .then((path) => insertVerificationDoc(userId, 'id_document', path))
      )
    }
  }

  await Promise.all(jobs)
}

// ── Resend confirmation email ─────────────────────────────────────────────────
export async function resendConfirmation(email) {
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) throw error
}

// ── Password reset request ────────────────────────────────────────────────────
export async function resetPasswordForEmail(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset`,
  })
  if (error) throw error
}

// ── Sign in ───────────────────────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// ── Sign out ──────────────────────────────────────────────────────────────────
// scope: 'local' (default) | 'global' (all devices) | 'others'
export async function signOut(scope = 'local') {
  const { error } = await supabase.auth.signOut({ scope })
  if (error) throw error
}

// ── OAuth ─────────────────────────────────────────────────────────────────────
export async function googleSignIn() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) throw error
}

// ── Verification doc upload ───────────────────────────────────────────────────
export async function uploadVerificationDoc(userId, docType, file) {
  const path = await uploadKycDoc(userId, docType, file)
  await insertVerificationDoc(userId, docType, path)
}

// ── Profile updates ───────────────────────────────────────────────────────────
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function updateUserMeta(data) {
  const { error } = await supabase.auth.updateUser({ data })
  if (error) throw error
}
