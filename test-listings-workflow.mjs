/**
 * End-to-end workflow test for listings:
 * - Create as draft
 * - Publish (submit for moderation → pending → active)
 * - Verify visibility in Mes annonces, /annonces, ManagerIT queries
 * - Change status: sold, rented, archived
 * - Verify notifications created at each step
 * - Delete
 */
import { createClient } from '@supabase/supabase-js'
const SUPA_URL = 'https://vvjmcrcakmmjuhpbtzbu.supabase.co'
const admin = createClient(SUPA_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const STAMP = Date.now()
const email = `listing.wf.${STAMP}@shopca.fr`
const pwd = 'W!' + STAMP
const results = []
const rec = (n, ok, d) => { results.push({ n, ok, d }); console.log(`  ${ok?'✅':'❌'} ${n}${d?' — '+d:''}`) }
const section = (n, m) => console.log(`\n══ [${n}] ${m} ══`)

let uid = null
let listingId = null

try {
  section(0, 'Setup: créer un user pro')
  const { data: u } = await admin.auth.admin.createUser({
    email, password: pwd, email_confirm: true,
    user_metadata: { account_type: 'professional', first_name: 'Work', last_name: 'Flow',
      company_name: 'WF Test', business_type: 'agence', siret: '99988877766655',
      address: '1', city: 'Paris', postal_code: '75001' },
  })
  uid = u.user.id
  console.log(`  ✅ user créé id=${uid.slice(0,8)}…`)

  const cleanNotifs = async () => {
    await admin.from('notifications').delete().eq('user_id', uid)
  }
  const getLastNotifType = async () => {
    const { data } = await admin.from('notifications').select('type, title').eq('user_id', uid).order('created_at', { ascending: false }).limit(1)
    return data?.[0]
  }

  section(1, 'CRÉATION: insert draft')
  await cleanNotifs()
  const draftRow = {
    user_id: uid, title: 'Studio test workflow ' + STAMP, description: 'Une description longue pour test workflow annonces bout en bout',
    price: 150000, city: 'Paris', district: 'Bastille',
    property_type: 'studio', transaction_type: 'vente',
    surface: 32, rooms: 1, images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    status: 'draft',
  }
  const { data: created, error: cErr } = await admin.from('listings').insert(draftRow).select().single()
  if (cErr) throw cErr
  listingId = created.id
  rec('Listing créé en draft', created.status === 'draft', `id=${listingId.slice(0,8)}…`)

  await new Promise(r => setTimeout(r, 500))
  const notif1 = await getLastNotifType()
  rec('Notification "listing_draft"', notif1?.type === 'listing_draft', notif1?.title)

  section(2, 'SOUMISSION: draft → pending (attente modération)')
  await cleanNotifs()
  const { error: e2 } = await admin.from('listings').update({ status: 'pending' }).eq('id', listingId)
  if (e2) throw e2
  await new Promise(r => setTimeout(r, 500))
  const notif2 = await getLastNotifType()
  rec('Notification "listing_pending"', notif2?.type === 'listing_pending', notif2?.title)

  section(3, 'PUBLICATION: pending → active (modération OK)')
  await cleanNotifs()
  const { error: e3 } = await admin.from('listings').update({ status: 'active' }).eq('id', listingId)
  if (e3) throw e3
  await new Promise(r => setTimeout(r, 500))
  const notif3 = await getLastNotifType()
  rec('Notification "listing_published"', notif3?.type === 'listing_published', notif3?.title)

  section(4, 'VISIBILITÉ publique (anon)')
  const anon = createClient(SUPA_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2am1jcmNha21tanVocGJ0emJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzE2NDAsImV4cCI6MjA5MzQwNzY0MH0.Vj-GurFPQm-EtQDg99MjYSFNKixvqOypNnDE9a-uuIE')
  const { data: pub } = await anon.from('listings').select('id, title, status').eq('id', listingId).maybeSingle()
  rec('Annonce active visible pour anon', pub?.status === 'active', pub?.title)

  section(5, 'MES ANNONCES (owner)')
  const persoClient = createClient(SUPA_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2am1jcmNha21tanVocGJ0emJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzE2NDAsImV4cCI6MjA5MzQwNzY0MH0.Vj-GurFPQm-EtQDg99MjYSFNKixvqOypNnDE9a-uuIE')
  await persoClient.auth.signInWithPassword({ email, password: pwd })
  const { data: mine } = await persoClient.from('listings').select('id, status').eq('user_id', uid)
  rec('Owner voit son annonce', (mine || []).some(l => l.id === listingId), `${mine?.length} annonce(s)`)

  section(6, 'REJET: active → rejected + motif')
  await cleanNotifs()
  const { error: e6 } = await admin.from('listings').update({ status: 'rejected', rejection_reason: 'Photos non conformes' }).eq('id', listingId)
  if (e6) throw e6
  await new Promise(r => setTimeout(r, 500))
  const notif6 = await getLastNotifType()
  rec('Notification "listing_rejected"', notif6?.type === 'listing_rejected', notif6?.title)

  section(7, 'REPUBLICATION + VENTE: active → sold')
  await admin.from('listings').update({ status: 'active' }).eq('id', listingId)
  await new Promise(r => setTimeout(r, 500))
  await cleanNotifs()
  await admin.from('listings').update({ status: 'sold' }).eq('id', listingId)
  await new Promise(r => setTimeout(r, 500))
  const notif7 = await getLastNotifType()
  rec('Notification "listing_sold"', notif7?.type === 'listing_sold', notif7?.title)
  // check active anon plus visible
  const { data: soldVisible } = await anon.from('listings').select('id, status').eq('id', listingId).maybeSingle()
  rec('Annonce vendue non visible pour anon', !soldVisible, `visible: ${!!soldVisible}`)

  section(8, 'LOCATION: sold → rented')
  await cleanNotifs()
  await admin.from('listings').update({ status: 'rented' }).eq('id', listingId)
  await new Promise(r => setTimeout(r, 500))
  const notif8 = await getLastNotifType()
  rec('Notification "listing_rented"', notif8?.type === 'listing_rented', notif8?.title)

  section(9, 'ARCHIVAGE: rented → archived')
  await cleanNotifs()
  await admin.from('listings').update({ status: 'archived' }).eq('id', listingId)
  await new Promise(r => setTimeout(r, 500))
  const notif9 = await getLastNotifType()
  rec('Notification "listing_archived"', notif9?.type === 'listing_archived', notif9?.title)

  section(10, 'EXPIRATION: archived → expired')
  await cleanNotifs()
  await admin.from('listings').update({ status: 'expired' }).eq('id', listingId)
  await new Promise(r => setTimeout(r, 500))
  const notif10 = await getLastNotifType()
  rec('Notification "listing_expired"', notif10?.type === 'listing_expired', notif10?.title)

  section(11, 'SUPPRESSION')
  const { error: dErr } = await admin.from('listings').delete().eq('id', listingId)
  rec('Delete réussi', !dErr, dErr?.message || 'ok')
  const { data: gone } = await admin.from('listings').select('id').eq('id', listingId).maybeSingle()
  rec('Annonce absente après delete', !gone, gone ? 'still exists' : 'ok')
  listingId = null

  section('BILAN', 'Résumé workflow')
  const ok = results.filter(r => r.ok).length
  console.log(`\n  ✅ ${ok} / ${results.length} vérifications OK`)
  const fails = results.filter(r => !r.ok)
  if (fails.length) {
    console.log('\n  ❌ Échecs:')
    fails.forEach(f => console.log(`    - ${f.n}: ${f.d}`))
  }
} finally {
  if (listingId) await admin.from('listings').delete().eq('id', listingId).catch(() => {})
  if (uid) await admin.auth.admin.deleteUser(uid).catch(() => {})
  console.log('\n[cleanup] user test supprimé')
}
