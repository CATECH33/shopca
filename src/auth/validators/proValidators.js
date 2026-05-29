import { isValidEmail } from './authValidators.js'

export function validateProStep1({ companyName, siret, businessType, email, phone }) {
  if (!companyName.trim())          return 'Le nom de la société est requis.'
  if (!/^\d{14}$/.test(siret.replace(/\s/g, ''))) return 'Le SIRET doit contenir 14 chiffres.'
  if (!businessType)                return 'Sélectionnez un type d\'activité.'
  if (!isValidEmail(email))         return 'Adresse e-mail professionnelle invalide.'
  if (!phone.trim())                return 'Le numéro de téléphone est requis.'
  return null
}

export function validateProStep2({ description }) {
  if (description.length > 600)     return 'La description ne doit pas dépasser 600 caractères.'
  return null
}

export function validateProStep3() { return null }

export function validateProStep4() { return null }

export function validateProStep5({ plan }) {
  if (!plan) return 'Choisissez un abonnement.'
  return null
}

export function formatSiret(raw = '') {
  const digits = raw.replace(/\D/g, '').slice(0, 14)
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,5})/, (_, a, b, c, d) =>
    [a, b, c, d].filter(Boolean).join(' ')
  )
}
