import { supabase } from '../../../lib/supabase.js'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, agencies(*)')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAgency(userId, updates) {
  const { data, error } = await supabase
    .from('agencies')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function insertVerificationDoc(userId, docType, filePath) {
  const { data, error } = await supabase
    .from('verification_documents')
    .insert({ user_id: userId, doc_type: docType, file_path: filePath })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getVerificationDocs(userId) {
  const { data, error } = await supabase
    .from('verification_documents')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
