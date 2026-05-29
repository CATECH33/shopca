export const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v ?? '').trim())

export const isValidPassword = (v) =>
  typeof v === 'string' && v.length >= 6

export function validateRegisterForm({ email, password }) {
  if (!email)                return 'L\'e-mail est requis.'
  if (!isValidEmail(email))  return 'Adresse e-mail invalide.'
  if (!password)             return 'Le mot de passe est requis.'
  if (!isValidPassword(password)) return 'Le mot de passe doit comporter au moins 6 caractères.'
  return null
}

export function validateLoginForm({ email, password }) {
  if (!email)    return 'L\'e-mail est requis.'
  if (!password) return 'Le mot de passe est requis.'
  return null
}

export function friendlyAuthError(message = '') {
  if (/already registered|already exists/i.test(message))        return 'Cet e-mail est déjà utilisé.'
  if (/invalid login|invalid credentials/i.test(message))        return 'E-mail ou mot de passe incorrect.'
  if (/password should be at least/i.test(message))              return 'Le mot de passe doit comporter au moins 6 caractères.'
  if (/email not confirmed/i.test(message))                      return 'Vérifiez votre boîte mail pour confirmer votre compte.'
  if (/rate limit|only request this after|too many requests/i.test(message)) return 'Trop de tentatives. Veuillez patienter quelques secondes avant de réessayer.'
  if (/signup.*disabled|registrations.*disabled/i.test(message)) return 'Les inscriptions sont temporairement désactivées.'
  if (/network|fetch|failed to fetch/i.test(message))            return 'Erreur réseau. Vérifiez votre connexion et réessayez.'
  if (/token.*expired|invalid.*token|expired.*token/i.test(message)) return 'Ce lien a expiré ou est invalide. Veuillez refaire une demande de réinitialisation.'
  if (/same password|should be different/i.test(message))        return 'Le nouveau mot de passe doit être différent de l\'ancien.'
  return message || 'Une erreur est survenue.'
}
