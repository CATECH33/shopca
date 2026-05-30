import { supabase } from '../../../lib/supabase.js'

const fileExt = (file) => file.name.split('.').pop().toLowerCase()

export async function uploadAvatar(userId, file) {
  const path = `${userId}/avatar.${fileExt(file)}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
}

export async function uploadAgencyLogo(userId, file) {
  const path = `${userId}/logo.${fileExt(file)}`
  const { error } = await supabase.storage
    .from('agency-media')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  return supabase.storage.from('agency-media').getPublicUrl(path).data.publicUrl
}

export async function uploadAgencyCover(userId, file) {
  const path = `${userId}/cover.${fileExt(file)}`
  const { error } = await supabase.storage
    .from('agency-media')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  return supabase.storage.from('agency-media').getPublicUrl(path).data.publicUrl
}

// Returns the storage path (private bucket — no public URL)
export async function uploadKycDoc(userId, docType, file) {
  const path = `${userId}/${docType}.${fileExt(file)}`
  const { error } = await supabase.storage
    .from('kyc-documents')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  return path
}
