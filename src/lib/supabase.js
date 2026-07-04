import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const SUPABASE_URL       = supabaseUrl
export const SUPABASE_KEY_SET   = !!supabaseAnonKey
export const SUPABASE_IS_PLACEHOLDER = !supabaseUrl || !supabaseAnonKey

export const supabase = SUPABASE_IS_PLACEHOLDER
  ? (() => {
      console.error(
        '[SHOPCA] ⚠️  CONFIGURATION SUPABASE MANQUANTE\n' +
        '  VITE_SUPABASE_URL  : ' + (supabaseUrl  || '(vide — non défini dans .env)') + '\n' +
        '  VITE_SUPABASE_ANON_KEY : ' + (supabaseAnonKey ? '[défini]' : '(vide — non défini dans .env)') + '\n' +
        '  → Toutes les requêtes auth échoueront avec "Failed to fetch"\n' +
        '  → Vérifiez que .env existe à la racine du projet et que npm run dev a été relancé.'
      )
      return createClient('https://placeholder.supabase.co', 'placeholder-key')
    })()
  : createClient(supabaseUrl, supabaseAnonKey)
