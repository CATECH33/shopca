import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const Ic = {
  Euro:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M4 14h12"/><path d="M19.5 9.5A7.5 7.5 0 1 0 19.5 14.5"/></svg>,
  CreditCard:() => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  TrendUp:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  RotateCCW: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.11"/></svg>,
  AlertTri:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Star:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  FileText:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Percent:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  User:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Pause:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Play:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  XCircle:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Check:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Search:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  ChevronD:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronL:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  X:         () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Refresh:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Activity:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Copy:      () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
}

/* ── Constants ─────────────────────────────────────────────────────────────── */
const PAY_STATUS = {
  succeeded:{ label:'Réussi',     bg:'#DCFCE7', color:'#16A34A' },
  completed: { label:'Réussi',     bg:'#DCFCE7', color:'#16A34A' },
  pending:   { label:'En attente', bg:'#FEF3C7', color:'#D97706' },
  failed:    { label:'Échoué',     bg:'#FEE2E2', color:'#DC2626' },
  disputed:  { label:'Litige',     bg:'#FEF3C7', color:'#B45309' },
  refunded:  { label:'Remboursé',  bg:'#F3E8FF', color:'#7C3AED' },
}
const SUB_STATUS = {
  active:  { label:'Actif',     bg:'#DCFCE7', color:'#16A34A' },
  paused:  { label:'Suspendu',  bg:'#FEF3C7', color:'#D97706' },
  trialing:{ label:'Essai',     bg:'#DBEAFE', color:'#2563EB' },
  canceled:{ label:'Annulé',    bg:'#FEE2E2', color:'#DC2626' },
  inactive:{ label:'Inactif',   bg:'#F1F5F9', color:'#64748B' },
  past_due:{ label:'En retard', bg:'#FEF3C7', color:'#D97706' },
}
const PER = 25

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const eur  = (c) => c == null ? '—' : (c/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'})
const eur0 = (c) => c == null ? '—' : (c/100).toLocaleString('fr-FR',{maximumFractionDigits:0})+'€'
const fmtD = (s) => s ? new Date(s).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—'
const fmtT = (s) => {
  if (!s) return '—'
  const d=(Date.now()-new Date(s))/1000
  if (d<60) return 'À l\'instant'
  if (d<3600) return `il y a ${Math.floor(d/60)} min`
  if (d<86400) return `il y a ${Math.floor(d/3600)}h`
  if (d<86400*7) return `il y a ${Math.floor(d/86400)}j`
  return fmtD(s)
}
const displayUser = (u) => {
  if (!u) return 'Inconnu'
  if (u.first_name||u.last_name) return [u.first_name,u.last_name].filter(Boolean).join(' ')
  return u.email?.split('@')[0]||'—'
}
const shortId = (id) => id ? `…${id.slice(-8)}` : '—'

/* ── Mini components ───────────────────────────────────────────────────────── */
const Badge = ({status,map}) => { const s=map[status]??{label:status,bg:'#F1F5F9',color:'#64748B'}; return <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:99,background:s.bg,color:s.color,whiteSpace:'nowrap'}}>{s.label}</span> }
const Skel  = ({w='100%',h=13}) => <div style={{width:w,height:h,borderRadius:6,background:'#F1F5F9',animation:'pulse 1.4s ease-in-out infinite'}}/>
const Toast = ({msg,type,onClose}) => { useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t)},[onClose]); return <div style={{position:'fixed',bottom:24,right:24,zIndex:9999,background:type==='error'?'#FEF2F2':'#F0FDF4',border:`1px solid ${type==='error'?'#FECACA':'#BBF7D0'}`,color:type==='error'?'#991B1B':'#166534',borderRadius:12,padding:'12px 18px',fontSize:13,fontWeight:600,boxShadow:'0 8px 24px rgba(0,0,0,.12)',display:'flex',alignItems:'center',gap:8}}>{type==='success'?<Ic.Check/>:'⚠️'} {msg}</div> }
const Overlay = ({children,onClose}) => <div onClick={e=>{if(e.target===e.currentTarget)onClose()}} style={{position:'fixed',inset:0,zIndex:500,background:'rgba(15,23,42,.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(3px)'}}>{children}</div>

/* ── KPI card ──────────────────────────────────────────────────────────────── */
function KpiCard({icon,label,value,sub,color='#6366F1',loading}) {
  return (
    <div style={{background:'#fff',borderRadius:14,border:'1px solid #E2E8F0',padding:'16px 20px',display:'flex',alignItems:'center',gap:14,boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
      <div style={{width:44,height:44,borderRadius:12,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',color,flexShrink:0}}>{icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:11,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>{label}</div>
        {loading?<Skel w={80} h={22}/>:<div style={{fontSize:20,fontWeight:800,color:'#0F172A',letterSpacing:'-0.02em',lineHeight:1}}>{value}</div>}
        {sub&&!loading&&<div style={{fontSize:11,color:'#94A3B8',marginTop:2}}>{sub}</div>}
      </div>
    </div>
  )
}

/* ── Bar chart ─────────────────────────────────────────────────────────────── */
function BarChart({data,color='#10B981'}) {
  if (!data||data.length===0) return <div style={{height:120,display:'flex',alignItems:'center',justifyContent:'center',color:'#94A3B8',fontSize:13}}>Aucune donnée</div>
  const max=Math.max(...data.map(d=>d.revenue||0))||1
  return (
    <div style={{display:'flex',alignItems:'flex-end',gap:6,height:100,padding:'0 4px'}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
          <div style={{fontSize:9,color:'#94A3B8',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',maxWidth:'100%',textAlign:'center'}}>
            {eur0(d.revenue)}
          </div>
          <div style={{width:'100%',borderRadius:'4px 4px 0 0',background:color,height:`${Math.max(4,(d.revenue/max)*70)}px`,transition:'height .3s',minHeight:4}}/>
          <div style={{fontSize:9,color:'#94A3B8',textAlign:'center',whiteSpace:'nowrap'}}>{(d.month||'').slice(5)}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Subscription Action Modal ─────────────────────────────────────────────── */
function SubActionModal({sub,action,onClose,onConfirm,loading}) {
  const cfg = {
    suspend:  {title:'Suspendre l\'abonnement',icon:'⏸️',color:'#D97706',btn:'Suspendre',   desc:'L\'utilisateur perdra l\'accès Premium immédiatement.'},
    reactivate:{title:'Réactiver l\'abonnement',icon:'▶️',color:'#16A34A',btn:'Réactiver',   desc:'L\'abonnement redevient actif.'},
    cancel:   {title:'Annuler l\'abonnement',   icon:'🚫',color:'#DC2626',btn:'Annuler définitivement',desc:'Action irréversible. L\'abonnement sera annulé en fin de période.'},
  }[action]||{}
  const user = sub.user_info||{}
  return (
    <Overlay onClose={onClose}>
      <div style={{background:'#fff',borderRadius:16,padding:28,width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:8}}>{cfg.icon}</div>
          <h3 style={{margin:0,fontSize:16,fontWeight:800}}>{cfg.title}</h3>
          <div style={{fontSize:12,color:'#64748B',marginTop:6,fontWeight:600}}>{displayUser(user)} · {sub.plan}</div>
        </div>
        <div style={{background:'#F8FAFC',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:12,color:'#64748B'}}>{cfg.desc}</div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'9px',borderRadius:10,border:'1px solid #E2E8F0',background:'#fff',fontSize:13,fontWeight:600,color:'#64748B',cursor:'pointer'}}>Annuler</button>
          <button onClick={onConfirm} disabled={loading}
            style={{flex:2,padding:'9px',borderRadius:10,border:'none',background:cfg.color,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',opacity:loading?.7:1}}>
            {loading?'…':cfg.btn}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Refund Modal ──────────────────────────────────────────────────────────── */
function RefundModal({payment,onClose,onConfirm,loading}) {
  const [ok,setOk]=useState(false)
  return (
    <Overlay onClose={onClose}>
      <div style={{background:'#fff',borderRadius:16,padding:28,width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:40,marginBottom:8}}>↩️</div>
          <h3 style={{margin:0,fontSize:16,fontWeight:800,color:'#7C3AED'}}>Rembourser ce paiement</h3>
          <div style={{fontSize:22,fontWeight:900,color:'#0F172A',margin:'12px 0'}}>{eur(payment.amount)}</div>
          <div style={{fontSize:12,color:'#64748B'}}>{displayUser(payment.user_info)} · {fmtD(payment.created_at)}</div>
        </div>
        <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:12,color:'#92400E'}}>
          ⚠️ Action <strong>irréversible</strong>. Pensez à déclencher le remboursement dans Stripe Dashboard.
        </div>
        <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer',marginBottom:16}}>
          <input type="checkbox" checked={ok} onChange={e=>setOk(e.target.checked)} style={{accentColor:'#7C3AED',width:16,height:16}}/>
          Je confirme le remboursement de {eur(payment.amount)}
        </label>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'9px',borderRadius:10,border:'1px solid #E2E8F0',background:'#fff',fontSize:13,fontWeight:600,color:'#64748B',cursor:'pointer'}}>Annuler</button>
          <button onClick={onConfirm} disabled={!ok||loading}
            style={{flex:2,padding:'9px',borderRadius:10,border:'none',background:'#7C3AED',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',opacity:(!ok||loading)?.4:1}}>
            {loading?'…':'Confirmer le remboursement'}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Main ──────────────────────────────────────────────────────────────────── */
export default function PaymentsPage() {
  const [tab,         setTab]        = useState('revenue')
  const [rev,         setRev]        = useState(null)
  const [revLoad,     setRevLoad]    = useState(true)
  const [payments,    setPayments]   = useState([])
  const [payTotal,    setPayTotal]   = useState(0)
  const [payLoad,     setPayLoad]    = useState(false)
  const [subs,        setSubs]       = useState([])
  const [subTotal,    setSubTotal]   = useState(0)
  const [subLoad,     setSubLoad]    = useState(false)
  const [refunds,     setRefunds]    = useState([])
  const [refundTotal, setRefundTotal]= useState(0)
  const [refundLoad,  setRefundLoad] = useState(false)
  const [actLoad,     setActLoad]    = useState(false)
  const [toast,       setToast]      = useState(null)
  const [page,        setPage]       = useState(1)
  const [search,      setSearch]     = useState('')
  const [filterStatus,setFStatus]    = useState('')
  const [sortBy,      setSortBy]     = useState('created_at_desc')
  const [subModal,    setSubModal]   = useState(null) // {sub, action}
  const [refModal,    setRefModal]   = useState(null)
  const debRef = useRef()

  const showToast=(msg,type='success')=>setToast({msg,type})

  /* ── fetch revenue ── */
  const fetchRev = useCallback(async()=>{
    setRevLoad(true)
    const {data}=await supabase.rpc('get_manager_revenue_stats')
    if(data) setRev(data)
    setRevLoad(false)
  },[])

  /* ── fetch payments ── */
  const fetchPay = useCallback(async(s,status,sort,p)=>{
    setPayLoad(true)
    const {data}=await supabase.rpc('get_manager_payments',{p_search:s||null,p_status:status||null,p_sort:sort,p_limit:PER,p_offset:(p-1)*PER})
    if(data){setPayments(data.payments||[]);setPayTotal(data.total||0)}
    setPayLoad(false)
  },[])

  /* ── fetch subscriptions ── */
  const fetchSubs = useCallback(async(s,p)=>{
    setSubLoad(true)
    const {data}=await supabase.rpc('get_manager_subscriptions',{p_search:s||null,p_limit:PER,p_offset:(p-1)*PER})
    if(data){setSubs(data.subscriptions||[]);setSubTotal(data.total||0)}
    setSubLoad(false)
  },[])

  /* ── fetch refunds ── */
  const fetchRefunds = useCallback(async(p)=>{
    setRefundLoad(true)
    const {data}=await supabase.rpc('get_manager_refunds',{p_limit:PER,p_offset:(p-1)*PER})
    if(data){setRefunds(data.refunds||[]);setRefundTotal(data.total||0)}
    setRefundLoad(false)
  },[])

  useEffect(()=>{fetchRev()},[fetchRev])
  useEffect(()=>{
    if(tab==='payments'||tab==='invoices'){clearTimeout(debRef.current);debRef.current=setTimeout(()=>fetchPay(search,filterStatus,sortBy,page),300)}
    if(tab==='subscriptions'){clearTimeout(debRef.current);debRef.current=setTimeout(()=>fetchSubs(search,page),300)}
    if(tab==='refunds')fetchRefunds(page)
  },[tab,search,filterStatus,sortBy,page,fetchPay,fetchSubs,fetchRefunds])

  /* ── sub actions ── */
  const doSubAction = async()=>{
    if(!subModal) return
    setActLoad(true)
    const {sub,action}=subModal
    const rpc = action==='suspend'?'manager_suspend_subscription':action==='reactivate'?'manager_reactivate_subscription':'manager_cancel_subscription'
    const {error}=await supabase.rpc(rpc,{p_sub_id:sub.id})
    setSubModal(null)
    setActLoad(false)
    if(error) showToast(error.message,'error')
    else { showToast(action==='suspend'?'Abonnement suspendu':action==='reactivate'?'Abonnement réactivé':'Abonnement annulé'); fetchSubs(search,page); fetchRev() }
  }

  /* ── refund action ── */
  const doRefund = async()=>{
    if(!refModal) return
    setActLoad(true)
    const {error}=await supabase.rpc('manager_update_payment',{p_payment_id:refModal.id,p_status:'refunded'})
    setRefModal(null)
    setActLoad(false)
    if(error) showToast(error.message,'error')
    else { showToast('Remboursement enregistré'); fetchPay(search,filterStatus,sortBy,page); fetchRev() }
  }

  const th={padding:'9px 14px',textAlign:'left',fontSize:10,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.08em',background:'#FAFAFA',borderBottom:'1px solid #F1F5F9',whiteSpace:'nowrap'}
  const td={padding:'11px 14px',borderBottom:'1px solid #F8FAFC',fontSize:12,color:'#0F172A',verticalAlign:'middle'}
  const inp={padding:'9px 12px',borderRadius:10,border:'1px solid #E2E8F0',fontSize:13,color:'#0F172A',outline:'none',boxSizing:'border-box'}
  const selS={...inp,appearance:'none',cursor:'pointer',paddingRight:32}
  const payPages=Math.ceil(payTotal/PER), subPages=Math.ceil(subTotal/PER), refPages=Math.ceil(refundTotal/PER)

  /* ── tab list ── */
  const TABS=[
    {key:'revenue',      label:'Revenus',       icon:<Ic.TrendUp/>},
    {key:'subscriptions',label:'Abonnements',   icon:<Ic.Star/>},
    {key:'payments',     label:'Paiements',     icon:<Ic.CreditCard/>},
    {key:'refunds',      label:'Remboursements',icon:<Ic.RotateCCW/>},
    {key:'invoices',     label:'Factures',      icon:<Ic.FileText/>},
    {key:'commissions',  label:'Commissions',   icon:<Ic.Percent/>},
  ]

  /* ── Pagination component ── */
  const Pagination=({cur,total:tot,onChange})=>tot<=1?null:(
    <div style={{padding:'14px 20px',borderTop:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <span style={{fontSize:12,color:'#94A3B8'}}>Page {cur}/{tot}</span>
      <div style={{display:'flex',gap:6}}>
        <button onClick={()=>onChange(Math.max(1,cur-1))} disabled={cur===1}
          style={{display:'flex',alignItems:'center',gap:4,padding:'6px 10px',borderRadius:8,border:'1px solid #E2E8F0',background:'#fff',fontSize:12,fontWeight:600,color:cur===1?'#CBD5E1':'#374151',cursor:cur===1?'default':'pointer'}}>
          <Ic.ChevronL/> Préc.
        </button>
        {Array.from({length:Math.min(5,tot)},(_,i)=>{const p=Math.max(1,Math.min(cur-2,tot-4))+i;return p<=tot?<button key={p} onClick={()=>onChange(p)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${p===cur?'#10B981':'#E2E8F0'}`,background:p===cur?'#10B981':'#fff',fontSize:12,fontWeight:700,color:p===cur?'#fff':'#374151',cursor:'pointer'}}>{p}</button>:null})}
        <button onClick={()=>onChange(Math.min(tot,cur+1))} disabled={cur===tot}
          style={{display:'flex',alignItems:'center',gap:4,padding:'6px 10px',borderRadius:8,border:'1px solid #E2E8F0',background:'#fff',fontSize:12,fontWeight:600,color:cur===tot?'#CBD5E1':'#374151',cursor:cur===tot?'default':'pointer'}}>
          Suiv. <Ic.ChevronR/>
        </button>
      </div>
    </div>
  )

  const PayTable=({rows,loading:l,cols,empty})=>(
    <div style={{background:'#fff',borderRadius:16,border:'1px solid #E2E8F0',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{cols.map((c,i)=><th key={i} style={{...th,textAlign:c.right?'right':'left'}}>{c.label}</th>)}</tr></thead>
          <tbody>
            {l?Array.from({length:6}).map((_,i)=><tr key={i}>{cols.map((_,j)=><td key={j} style={{padding:'12px 14px'}}><Skel w={j===0?160:70}/></td>)}</tr>)
              :rows.length===0?<tr><td colSpan={cols.length} style={{padding:'48px',textAlign:'center',color:'#94A3B8',fontSize:13}}>{empty}</td></tr>
              :rows}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.mgr-tr:hover td{background:#F8FAFC!important;cursor:pointer}.mgr-tr td{transition:background .1s}`}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:800,color:'#0F172A',margin:0,letterSpacing:'-0.02em'}}>Paiements</h1>
          <p style={{fontSize:12,color:'#94A3B8',margin:'4px 0 0'}}>Stripe · abonnements · remboursements · factures · commissions</p>
        </div>
        <button onClick={()=>{fetchRev();if(tab==='payments'||tab==='invoices')fetchPay(search,filterStatus,sortBy,page);if(tab==='subscriptions')fetchSubs(search,page);if(tab==='refunds')fetchRefunds(page)}}
          style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:10,border:'1px solid #E2E8F0',background:'#fff',fontSize:12,fontWeight:600,color:'#64748B',cursor:'pointer'}}>
          <Ic.Refresh/> Actualiser
        </button>
      </div>

      {/* KPI row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginBottom:20}}>
        <KpiCard icon={<Ic.TrendUp/>}    label="Revenu total"    value={eur(rev?.total_revenue)}    color="#10B981" sub={`${rev?.total_payments||0} transactions`} loading={revLoad}/>
        <KpiCard icon={<Ic.Euro/>}        label="Ce mois"         value={eur(rev?.month_revenue)}    color="#6366F1" loading={revLoad}/>
        <KpiCard icon={<Ic.Star/>}        label="MRR"             value={eur(rev?.mrr)}              color="#3B82F6" sub={`ARR: ${eur0(rev?.arr)}`} loading={revLoad}/>
        <KpiCard icon={<Ic.Star/>}        label="Abonnements"     value={rev?.active_subs??'—'}      color="#F59E0B" sub={`${rev?.paused_subs||0} sus. · ${rev?.canceled_subs||0} annulés`} loading={revLoad}/>
        <KpiCard icon={<Ic.RotateCCW/>}   label="Remboursés"      value={eur(rev?.total_refunded)}   color="#7C3AED" sub={`${rev?.refund_count||0} transactions`} loading={revLoad}/>
        <KpiCard icon={<Ic.Percent/>}      label="Commissions"     value={eur(rev?.commission_total)} color="#EF4444" sub={`${rev?.commission_rate||10}% · ${eur0(rev?.commission_month)} ce mois`} loading={revLoad}/>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:20,background:'#F8FAFC',borderRadius:12,padding:4,flexWrap:'wrap',width:'fit-content'}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>{setTab(t.key);setPage(1);setSearch('');setFStatus('')}}
            style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:9,border:'none',background:tab===t.key?'#fff':'transparent',color:tab===t.key?'#10B981':'#64748B',fontSize:12,fontWeight:tab===t.key?700:500,cursor:'pointer',boxShadow:tab===t.key?'0 1px 4px rgba(0,0,0,.08)':'none',transition:'all .15s'}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── REVENUS ── */}
      {tab==='revenue'&&(
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* MRR chart */}
          <div style={{background:'#fff',borderRadius:16,border:'1px solid #E2E8F0',padding:24,boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:'#0F172A'}}>Revenus mensuel (12 derniers mois)</div>
                <div style={{fontSize:12,color:'#94A3B8',marginTop:2}}>Paiements complétés uniquement</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:22,fontWeight:900,color:'#10B981'}}>{eur(rev?.month_revenue)}</div>
                <div style={{fontSize:11,color:'#94A3B8'}}>ce mois</div>
              </div>
            </div>
            {revLoad?<Skel h={100}/>:<BarChart data={rev?.monthly||[]} color="#10B981"/>}
          </div>

          {/* Commission chart */}
          <div style={{background:'#fff',borderRadius:16,border:'1px solid #E2E8F0',padding:24,boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:'#0F172A'}}>Commissions plateforme ({rev?.commission_rate||10}%)</div>
                <div style={{fontSize:12,color:'#94A3B8',marginTop:2}}>Frais retenus sur chaque transaction</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:22,fontWeight:900,color:'#EF4444'}}>{eur(rev?.commission_total)}</div>
                <div style={{fontSize:11,color:'#94A3B8'}}>total cumulé</div>
              </div>
            </div>
            {revLoad?<Skel h={100}/>:<BarChart data={(rev?.monthly||[]).map(m=>({...m,revenue:m.commission}))} color="#EF4444"/>}
          </div>

          {/* Stats grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
            {[
              {label:'Revenu mois précédent', val:eur(rev?.prev_month_revenue), color:'#6366F1'},
              {label:'MRR (actifs)',           val:eur(rev?.mrr),                color:'#3B82F6'},
              {label:'ARR projeté',            val:eur(rev?.arr),                color:'#3B82F6'},
              {label:'Commission ce mois',     val:eur(rev?.commission_month),   color:'#EF4444'},
              {label:'Abonnements actifs',     val:rev?.active_subs??'—',        color:'#10B981'},
              {label:'Abonnements suspendus',  val:rev?.paused_subs??'—',        color:'#D97706'},
            ].map(({label,val,color})=>(
              <div key={label} style={{background:'#fff',borderRadius:12,border:'1px solid #E2E8F0',padding:'14px 16px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
                <div style={{fontSize:10,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>{label}</div>
                {revLoad?<Skel w={80} h={22}/>:<div style={{fontSize:20,fontWeight:800,color}}>{val}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ABONNEMENTS ── */}
      {tab==='subscriptions'&&(
        <>
          <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
            <div style={{position:'relative',flex:'1 1 220px',minWidth:180}}>
              <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94A3B8',pointerEvents:'none',display:'flex'}}><Ic.Search/></span>
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Email, plan, Stripe ID…"
                style={{...inp,width:'100%',paddingLeft:34}}/>
            </div>
          </div>
          <PayTable loading={subLoad} empty="Aucun abonnement"
            cols={[{label:'Utilisateur'},{label:'Plan'},{label:'Statut'},{label:'Montant'},{label:'Période'},{label:'Stripe ID'},{label:'Début'},{label:'Actions',right:true}]}
            rows={subs.map(s=>{const u=s.user_info||{};return(
              <tr key={s.id} className="mgr-tr">
                <td style={td}><div style={{fontWeight:600}}>{displayUser(u)}</div><div style={{fontSize:11,color:'#94A3B8'}}>{u.email}</div></td>
                <td style={{...td,fontWeight:700}}>{s.plan||'—'}</td>
                <td style={td}><Badge status={s.status} map={SUB_STATUS}/></td>
                <td style={{...td,fontWeight:700,whiteSpace:'nowrap'}}>{eur(s.price_amount||s.price)}</td>
                <td style={{...td,fontSize:11,color:'#64748B'}}>{s.price_interval||'—'}</td>
                <td style={{...td,fontFamily:'monospace',fontSize:11,color:'#94A3B8'}}>{shortId(s.stripe_subscription_id)}</td>
                <td style={{...td,color:'#64748B',whiteSpace:'nowrap'}}>{fmtD(s.start_date||s.current_period_start)}</td>
                <td style={{...td,textAlign:'right'}} onClick={e=>e.stopPropagation()}>
                  <div style={{display:'flex',gap:4,justifyContent:'flex-end'}}>
                    {s.status==='active'&&(
                      <button onClick={()=>setSubModal({sub:s,action:'suspend'})}
                        style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:8,border:'1px solid #FDE68A',background:'#FFFBEB',color:'#D97706',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                        <Ic.Pause/> Suspendre
                      </button>
                    )}
                    {(s.status==='paused'||s.status==='canceled')&&(
                      <button onClick={()=>setSubModal({sub:s,action:'reactivate'})}
                        style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:8,border:'1px solid #BBF7D0',background:'#F0FDF4',color:'#16A34A',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                        <Ic.Play/> Réactiver
                      </button>
                    )}
                    {s.status!=='canceled'&&(
                      <button onClick={()=>setSubModal({sub:s,action:'cancel'})}
                        style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:8,border:'1px solid #FECACA',background:'#FEF2F2',color:'#EF4444',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                        <Ic.XCircle/> Annuler
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )})}
          />
          <Pagination cur={page} total={subPages} onChange={p=>{setPage(p)}}/>
        </>
      )}

      {/* ── PAIEMENTS ── */}
      {tab==='payments'&&(
        <>
          <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
            <div style={{position:'relative',flex:'1 1 220px',minWidth:180}}>
              <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94A3B8',pointerEvents:'none',display:'flex'}}><Ic.Search/></span>
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Email, montant…"
                style={{...inp,width:'100%',paddingLeft:34}}/>
            </div>
            <div style={{position:'relative'}}>
              <select value={filterStatus} onChange={e=>{setFStatus(e.target.value);setPage(1)}} style={{...selS,minWidth:150,color:filterStatus?'#6366F1':'#64748B',fontWeight:filterStatus?700:400}}>
                {[['','Tous statuts'],['succeeded','Réussi'],['pending','En attente'],['failed','Échoué'],['disputed','Litige'],['refunded','Remboursé']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
              <span style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#94A3B8',display:'flex'}}><Ic.ChevronD/></span>
            </div>
          </div>
          <PayTable loading={payLoad} empty="Aucun paiement"
            cols={[{label:'Utilisateur'},{label:'Montant'},{label:'Statut'},{label:'Description'},{label:'Stripe ID'},{label:'Date'},{label:'',right:true}]}
            rows={payments.map(p=>{const u=p.user_info||{};return(
              <tr key={p.id} className="mgr-tr">
                <td style={td}><div style={{fontWeight:600}}>{displayUser(u)}</div><div style={{fontSize:11,color:'#94A3B8'}}>{u.email}</div></td>
                <td style={{...td,fontWeight:800,color:p.status==='failed'?'#EF4444':'#0F172A',whiteSpace:'nowrap'}}>{eur(p.amount)}</td>
                <td style={td}><Badge status={p.status} map={PAY_STATUS}/></td>
                <td style={{...td,color:'#64748B',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.description||p.listing_info?.title||(p.subscription_info?.plan?`Abonnement ${p.subscription_info.plan}`:'—')}</td>
                <td style={{...td,fontFamily:'monospace',fontSize:11,color:'#94A3B8'}}>{shortId(p.stripe_payment_intent_id)}</td>
                <td style={{...td,color:'#64748B',whiteSpace:'nowrap'}}>{fmtT(p.created_at)}</td>
                <td style={{...td,textAlign:'right'}} onClick={e=>e.stopPropagation()}>
                  {['succeeded','completed'].includes(p.status)&&(
                    <button onClick={()=>setRefModal(p)}
                      style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:8,border:'1px solid #EDE9FE',background:'#F5F3FF',color:'#7C3AED',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                      <Ic.RotateCCW/> Rembourser
                    </button>
                  )}
                </td>
              </tr>
            )})}
          />
          <Pagination cur={page} total={payPages} onChange={p=>setPage(p)}/>
        </>
      )}

      {/* ── REMBOURSEMENTS ── */}
      {tab==='refunds'&&(
        <>
          {refunds.length>0&&<div style={{background:'#F5F3FF',borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:12,color:'#7C3AED',fontWeight:600}}>
            Total remboursé : {eur((rev?.total_refunded||0))}  ·  {refundTotal} transaction{refundTotal!==1?'s':''}
          </div>}
          <PayTable loading={refundLoad} empty="Aucun remboursement"
            cols={[{label:'Utilisateur'},{label:'Montant initial'},{label:'Montant remboursé'},{label:'Date paiement'},{label:'Date remboursement'},{label:'Stripe ID'}]}
            rows={refunds.map(r=>{const u=r.user_info||{};return(
              <tr key={r.id} className="mgr-tr">
                <td style={td}><div style={{fontWeight:600}}>{displayUser(u)}</div><div style={{fontSize:11,color:'#94A3B8'}}>{u.email}</div></td>
                <td style={{...td,textDecoration:'line-through',color:'#94A3B8'}}>{eur(r.amount)}</td>
                <td style={{...td,fontWeight:800,color:'#7C3AED'}}>{eur(r.refund_amount||r.amount)}</td>
                <td style={{...td,color:'#64748B',whiteSpace:'nowrap'}}>{fmtD(r.created_at)}</td>
                <td style={{...td,color:'#64748B',whiteSpace:'nowrap'}}>{fmtD(r.refunded_at)}</td>
                <td style={{...td,fontFamily:'monospace',fontSize:11,color:'#94A3B8'}}>{shortId(r.stripe_charge_id||r.stripe_payment_intent_id)}</td>
              </tr>
            )})}
          />
          <Pagination cur={page} total={refPages} onChange={p=>setPage(p)}/>
        </>
      )}

      {/* ── FACTURES ── */}
      {tab==='invoices'&&(
        <>
          <div style={{background:'#EFF6FF',borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:12,color:'#2563EB'}}>
            ℹ️ Les factures sont générées automatiquement à partir des paiements complétés. Numéro de facture = INV-[ID court].
          </div>
          <PayTable loading={payLoad} empty="Aucune facture"
            cols={[{label:'N° Facture'},{label:'Client'},{label:'Montant HT'},{label:'TVA (20%)'},{label:'Total TTC'},{label:'Date'},{label:'Statut'}]}
            rows={payments.filter(p=>['succeeded','completed'].includes(p.status)).map((p,idx)=>{
              const u=p.user_info||{}
              const ht=Math.round((p.amount||0)/1.2)
              const tva=(p.amount||0)-ht
              return(
                <tr key={p.id} className="mgr-tr">
                  <td style={{...td,fontFamily:'monospace',fontSize:11,fontWeight:700,color:'#6366F1'}}>INV-{p.id.slice(0,8).toUpperCase()}</td>
                  <td style={td}><div style={{fontWeight:600}}>{displayUser(u)}</div><div style={{fontSize:11,color:'#94A3B8'}}>{u.email}</div></td>
                  <td style={{...td,fontWeight:600}}>{eur(ht)}</td>
                  <td style={{...td,color:'#64748B'}}>{eur(tva)}</td>
                  <td style={{...td,fontWeight:800}}>{eur(p.amount)}</td>
                  <td style={{...td,color:'#64748B',whiteSpace:'nowrap'}}>{fmtD(p.created_at)}</td>
                  <td style={td}><Badge status="succeeded" map={PAY_STATUS}/></td>
                </tr>
              )
            })}
          />
          <Pagination cur={page} total={payPages} onChange={p=>setPage(p)}/>
        </>
      )}

      {/* ── COMMISSIONS ── */}
      {tab==='commissions'&&(
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
            {[
              {label:'Commission totale', val:eur(rev?.commission_total), color:'#EF4444', icon:'💰'},
              {label:'Ce mois',           val:eur(rev?.commission_month), color:'#F59E0B', icon:'📅'},
              {label:'Taux appliqué',     val:`${rev?.commission_rate||10}%`, color:'#6366F1', icon:'%'},
              {label:'Mois précédent',    val:eur(Math.round((rev?.prev_month_revenue||0)*((rev?.commission_rate||10)/100))), color:'#64748B', icon:'📊'},
            ].map(({label,val,color,icon})=>(
              <div key={label} style={{background:'#fff',borderRadius:14,border:'1px solid #E2E8F0',padding:'16px 20px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
                <div style={{fontSize:20,marginBottom:8}}>{icon}</div>
                {revLoad?<Skel w={80} h={24}/>:<div style={{fontSize:24,fontWeight:900,color,letterSpacing:'-0.02em'}}>{val}</div>}
                <div style={{fontSize:11,color:'#94A3B8',marginTop:4,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{background:'#fff',borderRadius:16,border:'1px solid #E2E8F0',padding:24,boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
            <div style={{fontSize:14,fontWeight:800,color:'#0F172A',marginBottom:16}}>Commissions mensuelles ({rev?.commission_rate||10}% des revenus)</div>
            {revLoad?<Skel h={100}/>:<BarChart data={(rev?.monthly||[]).map(m=>({...m,revenue:m.commission}))} color="#EF4444"/>}
          </div>
          <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:12,padding:'14px 16px',fontSize:12,color:'#92400E'}}>
            <strong>Note :</strong> Les commissions sont calculées automatiquement à {rev?.commission_rate||10}% sur les paiements complétés (status: succeeded/completed). Pour modifier le taux, contacter l'équipe technique.
          </div>
        </div>
      )}

      {/* Modals */}
      {subModal&&<SubActionModal sub={subModal.sub} action={subModal.action} onClose={()=>setSubModal(null)} onConfirm={doSubAction} loading={actLoad}/>}
      {refModal&&<RefundModal payment={refModal} onClose={()=>setRefModal(null)} onConfirm={doRefund} loading={actLoad}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  )
}
