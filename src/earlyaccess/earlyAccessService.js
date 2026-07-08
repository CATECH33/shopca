import { supabase } from '../lib/supabase.js'

/* ── Fetch active early-access listings (public) ───────────────────────── */
export async function fetchEarlyAccessListings() {
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, city, price, property_type, transaction_type, surface, rooms, images, early_access_ends_at, early_access_pct, early_access_tag')
    .eq('early_access', true)
    .eq('status', 'active')
    .or(`early_access_ends_at.gt.${new Date().toISOString()},early_access_ends_at.is.null`)
    .order('early_access_ends_at', { ascending: true })

  if (error) throw error
  return (data || []).map(normalizeListing)
}

/* ── Fetch public stats (RPC, bypass RLS) ──────────────────────────────── */
export async function fetchEarlyAccessStats() {
  const { data, error } = await supabase.rpc('get_early_access_stats')
  if (error) throw error
  return {
    activeListings: data?.active_listings ?? 0,
    premiumUsers:   data?.premium_users ?? 0,
    txnMonth:       data?.txn_month ?? 0,
  }
}

/* ── Interest tracking ─────────────────────────────────────────────────── */
export async function markInterest(userId, listingId) {
  const { error } = await supabase
    .from('listing_interest')
    .upsert(
      { user_id: userId, listing_id: String(listingId) },
      { onConflict: 'user_id,listing_id' }
    )
  if (error) throw error
}

export async function fetchUserInterests(userId) {
  const { data, error } = await supabase
    .from('listing_interest')
    .select('listing_id')
    .eq('user_id', userId)
  if (error) throw error
  return new Set((data || []).map(r => r.listing_id))
}

export async function fetchInterestCounts(listingIds) {
  if (!listingIds?.length) return {}
  const { data, error } = await supabase
    .from('listing_interest')
    .select('listing_id')
    .in('listing_id', listingIds.map(String))
  if (error) throw error
  const counts = {}
  for (const row of data || []) {
    counts[row.listing_id] = (counts[row.listing_id] || 0) + 1
  }
  return counts
}

/* ── Alert channel toggles ─────────────────────────────────────────────── */
export async function updateAlertChannel(userId, column, value) {
  const { error } = await supabase
    .from('profiles')
    .update({ [column]: !!value })
    .eq('id', userId)
  if (error) throw error
}

/* ── Category classification for filter tabs ───────────────────────────── */
export function categoryFor(listing) {
  const t = (listing.property_type || '').toLowerCase()
  if (['maison', 'villa'].includes(t)) return 'house'
  if (t === 'studio' && listing.priceRaw > 0 && listing.priceRaw < 200000) return 'invest'
  return 'apt'
}

/* ── Format helpers ────────────────────────────────────────────────────── */
function normalizeListing(row) {
  const priceRaw = row.price || 0
  const priceLabel = priceRaw
    ? `${priceRaw.toLocaleString('fr-FR')} €`
    : 'Prix sur demande'
  const img = row.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=70'
  const l = {
    id: row.id,
    title: row.title,
    loc: row.city,
    price: priceLabel,
    priceRaw,
    property_type: row.property_type,
    size: row.surface || 0,
    rooms: row.rooms || 0,
    endsAt: row.early_access_ends_at ? new Date(row.early_access_ends_at).getTime() : Date.now() + 30 * 60 * 1000,
    pct: row.early_access_pct ?? 90,
    tag: row.early_access_tag || 'Early Access',
    img,
  }
  l.category = categoryFor(l)
  return l
}
