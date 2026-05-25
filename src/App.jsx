import React, { useState, useEffect, useCallback, useRef } from 'react'
import LocationSearch from './components/LocationSearch.tsx'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useInView, useScroll, useTransform, animate } from 'framer-motion'
import { TrustGuarantees } from './lib/trustBadges.jsx'
import AdminPreview from './admin/AdminPreview.jsx'
import AlertsView          from './alerts/AlertsView.jsx'
import NotificationCenter from './notifications/NotificationCenter.jsx'
import { supabase } from './lib/supabase.js'

/* ============================================================================
   Inline SVG icons (no external lib)
   ============================================================================ */
const svgBase = (size = 20) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})

const Icons = {
  Search: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>),
  MapPin: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>),
  Home: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Building2: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>),
  Building: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>),
  Warehouse: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/></svg>),
  Users: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  Car: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>),
  Zap: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>),
  Shield: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>),
  Eye: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>),
  Star: (p) => (<svg {...svgBase(p?.size)} className={p?.className} fill={p?.fill || 'none'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
  Heart: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>),
  Bed: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>),
  Maximize: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>),
  ChevronDown: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="m6 9 6 6 6-6"/></svg>),
  ArrowRight: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>),
  Menu: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>),
  X: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>),
  Check: (p) => (<svg {...svgBase(p?.size)} className={p?.className} strokeWidth={3}><path d="M20 6 9 17l-5-5"/></svg>),
  Mail: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>),
  Lock: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
  User: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
  BuildingPro: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M8 10h.01"/></svg>),
  LogOut: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>),
  Loader: (p) => (<svg {...svgBase(p?.size)} className={`${p?.className || ''} animate-spin`}><line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/><line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/><line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/><line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/></svg>),
  AlertCircle: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>),
  Bell: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>),
  CheckCircle: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>),
  Facebook: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>),
  Instagram: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>),
  Twitter: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>),
  Linkedin: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>),
  PlusSquare: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>),
  Villa: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M3 12 L12 4 L21 12"/><path d="M5 10 V20 H19 V10"/><path d="M9 20 V14 H15 V20"/><path d="M19 5 V8"/></svg>),
  TrendingUp: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>),
  ShieldCheckBig: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>),
  Sparkles: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>),
  CreditCard: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>),
  BadgeCheck: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>),
  Send: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>),
  Home2: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Tag: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>),
  ChevronLeft: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="m15 18-6-6 6-6"/></svg>),
  ChevronRight: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="m9 18 6-6-6-6"/></svg>),
  EyeOff:   (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>),
  Upload:   (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>),
  Phone:    (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 11.9 19.79 19.79 0 0 1 1.12 3.27 2 2 0 0 1 3.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>),
  Globe:    (p) => (<svg {...svgBase(p?.size)} className={p?.className}><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>),
  FileText: (p) => (<svg {...svgBase(p?.size)} className={p?.className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>),
  Image:    (p) => (<svg {...svgBase(p?.size)} className={p?.className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>),
  IdCard:   (p) => (<svg {...svgBase(p?.size)} className={p?.className}><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M16 9h2"/><path d="M16 13h2"/><circle cx="8" cy="11" r="3"/><path d="M4 19v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1"/></svg>),
  Google:   (p) => (<svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" className={p?.className}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>),
}

/* ============================================================================
   Brand Logo (inline SVG — house + upward arrow)
   ============================================================================ */
function BrandLogo({ compact = false, dark = false }) {
  const navy = '#0F172A'
  const orange = '#FB923C'
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" aria-label="PASMAL">
        {/* House body */}
        <path
          d="M8 22 L24 8 L40 22 V40 a2 2 0 0 1-2 2 H10 a2 2 0 0 1-2-2 Z"
          stroke={navy} strokeWidth="2.6" strokeLinejoin="round" fill="white"
        />
        {/* Door */}
        <path d="M20 42 V30 a4 4 0 0 1 8 0 V42" stroke={navy} strokeWidth="2.2" fill="white" />
        {/* Upward arrow shaft */}
        <path d="M12 34 L22 24 L28 30 L40 14" stroke={orange} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Arrow head */}
        <path d="M32 12 L40 12 L40 20" stroke={orange} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && (
        <div className="leading-tight">
          <div className={`text-[20px] font-extrabold tracking-tight ${dark ? 'text-white' : 'text-navy-900'}`}>
            PAS<span className="text-orange-600">MAL</span>
          </div>
          <div className={`text-[10px] tracking-[0.2em] uppercase ${dark ? 'text-white/70' : 'text-navy-600'}`}>
            Premium Estate
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================================================
   Helpers & static data
   ============================================================================ */
const unsplash = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const HERO_IMG = unsplash('photo-1600607687939-ce8a6c25118c', 1920)

const FALLBACK_LISTINGS = [
  { id: 'f1', title: 'Studio cosy lumineux', location: 'Paris 11ᵉ · Bastille', price: 320000, rooms: 1, surface: 28, type: 'acheter', property_type: 'Studio', is_premium: true, image_url: unsplash('photo-1502672260266-1c1ef2d93688', 900) },
  { id: 'f2', title: 'T3 avec balcon vue dégagée', location: 'Lyon 6ᵉ · Foch', price: 485000, rooms: 3, surface: 65, type: 'acheter', property_type: 'T3', is_premium: true, image_url: unsplash('photo-1560448204-e02f11c3d0e2', 900) },
  { id: 'f3', title: 'Maison contemporaine', location: 'Bordeaux · Caudéran', price: 780000, rooms: 5, surface: 142, type: 'acheter', property_type: 'Maison', is_premium: true, image_url: unsplash('photo-1564013799919-ab600027ffc6', 900) },
  { id: 'f4', title: 'Colocation design 4 ch.', location: 'Nantes · Centre', price: 590, rooms: 4, surface: 110, type: 'colocation', property_type: 'Colocation', is_premium: false, image_url: unsplash('photo-1522708323590-d24dbb6b0267', 900) },
  { id: 'f5', title: 'Loft industriel rénové', location: 'Marseille · Joliette', price: 1450, rooms: 2, surface: 72, type: 'louer', property_type: 'T2', is_premium: true, image_url: unsplash('photo-1493809842364-78817add7ffb', 900) },
  { id: 'f6', title: 'Appartement haussmannien', location: 'Paris 8ᵉ · Monceau', price: 1250000, rooms: 4, surface: 98, type: 'acheter', property_type: 'T3', is_premium: true, image_url: unsplash('photo-1600585154340-be6161a56a0c', 900) },
  { id: 'f7', title: 'Studio étudiant moderne', location: 'Toulouse · Capitole', price: 620, rooms: 1, surface: 24, type: 'louer', property_type: 'Studio', is_premium: false, image_url: unsplash('photo-1554995207-c18c203602cb', 900) },
  { id: 'f8', title: 'Villa avec piscine', location: 'Nice · Cimiez', price: 2100000, rooms: 6, surface: 220, type: 'acheter', property_type: 'Maison', is_premium: true, image_url: unsplash('photo-1613490493576-7fde63acd811', 900) },
]

const formatPrice = (l) => {
  if (l.price_label) return l.price_label
  if (typeof l.price !== 'number') return l.price ?? ''
  const formatted = l.price.toLocaleString('fr-FR') + ' €'
  return l.type === 'louer' || l.type === 'colocation' ? `${formatted}/mois` : formatted
}

const CATEGORIES = [
  { label: 'Studio', icon: Icons.Home, value: 'Studio' },
  { label: 'T2', icon: Icons.Building2, value: 'T2' },
  { label: 'T3', icon: Icons.Building, value: 'T3' },
  { label: 'Maison', icon: Icons.Warehouse, value: 'Maison' },
  { label: 'Villa', icon: Icons.Villa, value: 'Villa' },
  { label: 'Colocation', icon: Icons.Users, value: 'Colocation' },
  { label: 'Parking', icon: Icons.Car, value: 'Parking' },
  { label: 'Investissement', icon: Icons.TrendingUp, value: 'Investissement' },
]

const AGENCIES = ['Foncia Premium', 'Century 21 Élite', 'PASMAL Verified', 'Sotheby\'s Realty', 'BARNES', 'Engel & Völkers']

const enrichWithMeta = (l, idx = 0) => {
  const seed = (typeof l.id === 'string' ? (l.id.charCodeAt(1) || idx + 1) : idx + 1)
  return {
    ...l,
    agency: l.agency || AGENCIES[seed % AGENCIES.length],
    trust_score: l.trust_score ?? (90 + ((idx * 7) % 9)),
    // Conversion psychology — deterministic but realistic-looking
    viewers: l.viewers ?? (4 + ((seed * 3 + idx * 5) % 24)),               // 4 → 27
    contacts_today: l.contacts_today ?? ((seed + idx * 2) % 8),             // 0 → 7
    is_new: l.is_new ?? ((seed + idx) % 4 === 0),
    is_urgent: l.is_urgent ?? ((seed + idx) % 7 === 1),
    is_popular: l.is_popular ?? (l.is_premium && (seed + idx) % 3 === 0),
  }
}

const REASONS = [
  { icon: Icons.Zap, title: 'Publication Express', text: 'Mettez votre bien en ligne en moins de 3 minutes grâce à notre éditeur intuitif.' },
  { icon: Icons.Shield, title: 'Paiement Sécurisé', text: 'Transactions protégées par séquestre certifié. Sérénité garantie de A à Z.' },
  { icon: Icons.Eye, title: 'Visibilité Maximale', text: "Diffusion premium auprès de 2,4M d'acquéreurs qualifiés chaque mois." },
]

const PLANS = [
  {
    name: 'Gratuit',
    price: '0',
    period: '€',
    duration: '7 jours en ligne',
    desc: 'Pour publier sans engagement et tester PASMAL.',
    features: [
      '3 photos par annonce',
      'Visibilité standard',
      'Messagerie incluse',
      'Annonce active 7 jours',
    ],
    cta: 'Commencer gratuitement',
    highlight: false,
  },
  {
    name: 'Pack Visibilité',
    price: '9,90',
    period: '€',
    duration: '30 jours en ligne',
    desc: "Le plus populaire — jusqu'à 4× plus de contacts qualifiés.",
    features: [
      '8 photos par annonce',
      'Boost visibilité +200%',
      'Annonce active 30 jours',
      'Statistiques de base',
      'Support prioritaire',
    ],
    cta: 'Choisir Visibilité',
    highlight: true,
    listingBadge: { label: 'Nouveau', tone: 'bg-orange-100 text-orange-700 ring-orange-200' },
  },
  {
    name: 'Premium',
    price: '14,90',
    period: '€',
    duration: '30 jours en ligne',
    desc: 'Pour vendre vite, en haut des résultats.',
    features: [
      '12 photos par annonce',
      'Top placement dans les résultats',
      'Analytics avancés',
      'Annonce active 30 jours',
      'Support dédié',
    ],
    cta: 'Passer Premium',
    highlight: false,
    listingBadge: { label: 'Urgent', tone: 'bg-rose-100 text-rose-700 ring-rose-200' },
  },
]

/* B2B — agency subscriptions (dark navy + orange) */
const AGENCY_PLANS = [
  {
    name: 'Starter',
    tagline: 'Agences indépendantes',
    price: 49,
    desc: 'Démarrez avec les essentiels pour gérer vos premières annonces.',
    features: [
      "Jusqu'à 20 annonces actives",
      'CRM basique pour vos leads',
      'Profil d\'agence personnalisable',
      'Messagerie sécurisée intégrée',
      'Support par e-mail (48h)',
    ],
    cta: 'Démarrer Starter',
    highlight: false,
  },
  {
    name: 'Pro',
    tagline: 'Agences en croissance',
    price: 129,
    desc: 'Le standard du marché — toutes les agences performantes l\'utilisent.',
    features: [
      'Annonces illimitées',
      'CRM avancé + pipeline Kanban',
      'Comptes multi-agents (5 inclus)',
      'Analytics complets en temps réel',
      'Boost visibilité +200%',
      'Support prioritaire 7j/7',
    ],
    cta: 'Passer Pro',
    highlight: true,
    badge: 'MOST POPULAR',
  },
  {
    name: 'Enterprise',
    tagline: 'Réseaux & groupes',
    price: 399,
    desc: 'Pour les groupes immobiliers et réseaux nationaux.',
    features: [
      'API REST + webhooks',
      'Visibilité premium garantie',
      'Account manager dédié',
      'Onboarding personnalisé',
      'SLA 99,9% + contrat sur mesure',
      'Comptes agents illimités',
    ],
    cta: 'Contacter les ventes',
    highlight: false,
    badge: 'ENTERPRISE',
  },
]

const TESTIMONIALS = [
  { name: 'Camille Lefèvre', role: 'Acquéreuse à Paris', text: "J'ai trouvé mon T3 en 11 jours. L'interface est limpide et les annonces sont vraiment qualitatives.", avatar: unsplash('photo-1494790108377-be9c29b29330', 200), rating: 5 },
  { name: 'Julien Moreau', role: 'Propriétaire bailleur', text: 'Pack Visibilité activé un lundi, mon studio loué le vendredi. Rapport qualité-prix imbattable.', avatar: unsplash('photo-1500648767791-00dcc994a43e', 200), rating: 5 },
  { name: 'Sofia Benali', role: 'Investisseuse', text: 'Le seul service Premium qui tient ses promesses. Annonces ciblées, contacts sérieux, zéro spam.', avatar: unsplash('photo-1438761681033-6461ffad8d80', 200), rating: 5 },
]

/* ============================================================================
   Auth Modal — redesigned with account-type selection
   ============================================================================ */
function AuthModal({ open, mode: initialMode = 'signup', onClose, onNavigatePro }) {
  const [mode,         setMode]         = useState(initialMode)
  const [accountType,  setAccountType]  = useState('personal')
  const [fullName,     setFullName]     = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [show,         setShow]         = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState('')

  useEffect(() => {
    if (open) {
      setMode(initialMode)
      setError(''); setSuccess(''); setEmail(''); setPassword(''); setFullName(''); setShow(false)
      setAccountType('personal')
    }
  }, [open, initialMode])

  if (!open) return null

  /* ── Backend logic (unchanged) ── */
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setSuccess('Connexion réussie — bienvenue !')
        setTimeout(() => onClose(), 700)
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { account_type: accountType, full_name: fullName } },
        })
        if (error) throw error
        setSuccess('Compte créé ! Vérifiez votre e-mail pour confirmer votre adresse.')
      }
    } catch (err) {
      const msg = err?.message || 'Une erreur est survenue.'
      if (/invalid login/i.test(msg))              setError('E-mail ou mot de passe incorrect.')
      else if (/already registered|already exists/i.test(msg)) setError('Cet e-mail est déjà utilisé.')
      else if (/password should be at least/i.test(msg))       setError('Le mot de passe doit comporter au moins 6 caractères.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setOauthLoading(true); setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/app` },
      })
      if (error) throw error
    } catch (err) {
      setError(err?.message || 'Impossible de se connecter avec Google.')
      setOauthLoading(false)
    }
  }

  const isSignup = mode === 'signup'

  const MODAL_FEATURES = [
    { text: 'Annonces vérifiées par notre équipe' },
    { text: 'Paiement sécurisé via Stripe' },
    { text: 'Réponse rapide des vendeurs' },
  ]

  const MODAL_BG = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-[#0B1F3A]/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal shell */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[96vh] flex flex-col lg:flex-row"
      >

        {/* ── LEFT — Visual branding panel ─────────────────────── */}
        <div className="hidden lg:flex lg:w-[42%] shrink-0 relative flex-col overflow-hidden bg-[#0B1F3A]">
          <img src={MODAL_BG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A]/90 to-[#0F2D50]/70" />

          {/* Animated glow blobs */}
          <motion.div
            className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-orange-500 opacity-20 blur-3xl pointer-events-none"
            animate={{ x: [0, 22, 0], y: [0, 16, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-10 right-0 w-56 h-56 rounded-full bg-indigo-500 opacity-10 blur-3xl pointer-events-none"
            animate={{ x: [0, -14, 0], y: [0, -12, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative z-10 flex flex-col h-full p-10">
            <BrandLogo dark />

            <div className="flex-1 flex flex-col justify-center mt-12">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Premium Estate
              </span>

              <h3 className="text-[1.6rem] xl:text-3xl font-extrabold text-white leading-snug mb-3">
                Trouvez votre prochain bien<br />
                <span className="text-orange-400">en toute confiance.</span>
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                La marketplace immobilière premium, vérifiée et sécurisée.
              </p>

              {/* Feature bullets */}
              <div className="space-y-4">
                {MODAL_FEATURES.map(({ text }, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                      <Icons.Check size={11} className="text-emerald-400" />
                    </div>
                    <span className="text-white/80 text-sm">{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-10 pt-8 border-t border-white/10">
              <div className="flex -space-x-2">
                {['JD', 'SB', 'ML', 'PK'].map((init) => (
                  <div key={init} className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-[#0B1F3A] flex items-center justify-center text-[9px] font-bold text-white">
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                <span className="text-white font-semibold">+2 000</span> utilisateurs<br />nous font confiance
              </p>
              <div className="ml-auto flex flex-col items-end">
                <div className="flex gap-0.5 mb-0.5">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width={11} height={11} viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-bold text-white">4.9/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT — Form panel ────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors z-20"
            aria-label="Fermer"
          >
            <Icons.X size={16} className="text-navy-900" />
          </button>

          <div className="px-7 sm:px-9 pt-8 pb-3">
            {/* Mobile logo */}
            <div className="lg:hidden mb-6"><BrandLogo compact /></div>

            {/* Tab switcher */}
            <div className="grid grid-cols-2 bg-slate-100 rounded-full p-1 mb-6">
              {[['signup', 'Créer un compte'], ['login', 'Connexion']].map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(''); setSuccess('') }}
                  className={`py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                    mode === m
                      ? 'bg-white text-navy-900 shadow-sm'
                      : 'text-slate-500 hover:text-navy-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight mb-1">
              {isSignup ? 'Créez votre compte' : 'Bon retour parmi nous'}
            </h2>
            <p className="text-slate-500 text-sm mb-5">
              {isSignup
                ? 'Rejoignez la marketplace immobilière premium.'
                : 'Connectez-vous pour accéder à vos annonces et favoris.'}
            </p>

          </div>

          {/* Account type selector — signup only */}
          <AnimatePresence>
            {isSignup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="px-7 sm:px-9 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { value: 'personal',     Icon: Icons.User,        label: 'Particulier',   sub: 'Pour vous' },
                    { value: 'professional', Icon: Icons.BuildingPro, label: 'Professionnel', sub: 'Pour votre agence' },
                  ].map(({ value, Icon, label, sub }) => {
                    const active = accountType === value
                    return (
                      <motion.button
                        key={value}
                        type="button"
                        onClick={() => setAccountType(value)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className={`relative rounded-2xl border-2 px-4 py-4 text-left transition-colors duration-200 ${
                          active
                            ? 'bg-orange-50 border-orange-500 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                          active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon size={17} />
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</div>
                        <div className="font-bold text-[#0F172A] text-sm mt-0.5">{sub}</div>
                        {active && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                            <Icons.Check size={10} className="text-white" />
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pro CTA — replaces form when professional account type selected */}
          <AnimatePresence>
            {isSignup && accountType === 'professional' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="px-7 sm:px-9 pb-7"
              >
                <div className="rounded-2xl bg-[#0B1F3A] p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-4">
                    <Icons.BuildingPro size={22} className="text-orange-400" />
                  </div>
                  <h3 className="text-white font-extrabold text-lg mb-2">Inscription professionnelle</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">
                    Agences, agents et promoteurs — bénéficiez d'un onboarding dédié avec vérification KYC, SIRET et carte professionnelle T.
                  </p>
                  <div className="space-y-2 mb-5 text-left">
                    {['Vérification KYC complète', 'Badge agence certifiée', 'Accès annonces illimitées'].map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Icons.Check size={9} className="text-emerald-400" />
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => { onClose(); onNavigatePro?.() }}
                    whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(234,88,12,0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    Démarrer l'inscription <Icons.ArrowRight size={16} />
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setAccountType('personal')}
                    className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    ← Revenir au compte particulier
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form fields — hidden when professional signup, shown for personal or login */}
          {!(isSignup && accountType === 'professional') && (
          <form className="px-7 sm:px-9 pb-7" onSubmit={submit}>
            <div className="space-y-3.5">
              {/* Full name — signup only */}
              <AnimatePresence>
                {isSignup && (
                  <motion.div
                    key="fullname"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nom complet</label>
                    <div className="flex items-center gap-3 px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-300 transition-all">
                      <Icons.User size={16} className="text-slate-400 shrink-0" />
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jean Kevin PEMOU"
                        className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">E-mail</label>
                <div className="flex items-center gap-3 px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-300 transition-all">
                  <Icons.Mail size={16} className="text-slate-400 shrink-0" />
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.fr"
                    className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Mot de passe</label>
                  {!isSignup && (
                    <button type="button" className="text-xs text-orange-600 hover:text-orange-700 font-medium">Oublié ?</button>
                  )}
                </div>
                <div className="flex items-center gap-3 px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-300 transition-all">
                  <Icons.Lock size={16} className="text-slate-400 shrink-0" />
                  <input
                    type={show ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none"
                  />
                  <button type="button" onClick={() => setShow(!show)} className="text-slate-400 hover:text-slate-700 transition-colors">
                    {show ? <Icons.EyeOff size={16}/> : <Icons.Eye size={16}/>}
                  </button>
                </div>
              </div>
            </div>

            {/* Error / success feedback */}
            {error && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm mt-4">
                <Icons.AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-sm mt-4">
                <Icons.CheckCircle size={16} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* CTA button — orange gradient + hover glow */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.015, boxShadow: '0 14px 36px rgba(234,88,12,0.32)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[15px] transition-colors mt-5 shadow-sm"
            >
              {loading
                ? <><Icons.Loader size={16} /> {isSignup ? 'Création…' : 'Connexion…'}</>
                : <>{isSignup ? 'Créer mon compte' : 'Se connecter'} <Icons.ArrowRight size={16} /></>
              }
            </motion.button>

            {/* Social proof bar */}
            <div className="flex items-center justify-center gap-4 mt-5">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {['JD','SB','ML','PK'].map(init => (
                    <div key={init} className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                      {init}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-slate-500">Déjà <span className="font-semibold text-[#0F172A]">+2 000</span> inscrits</span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width={11} height={11} viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#0F172A]">4.9<span className="font-normal text-slate-500">/5</span></span>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">
              En continuant, vous acceptez nos{' '}
              <a href="#" className="text-[#0F172A] hover:text-orange-600 underline underline-offset-2">CGU</a> et notre{' '}
              <a href="#" className="text-[#0F172A] hover:text-orange-600 underline underline-offset-2">politique de confidentialité</a>.
            </p>
          </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* ============================================================================
   User chip (logged in)
   ============================================================================ */
function UserChip({ user, role, onSignOut, onGoAdmin, onNavigate }) {
  const [open, setOpen] = useState(false)
  const rawName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || ''
  const displayName = rawName.split('@')[0] || 'Utilisateur'
  const initials = rawName
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'U'
  const isAdmin = ['admin', 'super_admin', 'moderator'].includes(role)

  const go = (view) => { setOpen(false); onNavigate?.(view) }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-navy-900 text-white text-[11px] font-bold flex items-center justify-center shadow-soft">
          {initials}
        </div>
        <span className="text-sm font-semibold text-navy-900 max-w-[170px] truncate">{displayName}</span>
        <Icons.ChevronDown size={14} className={`text-navy-700 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-cardHover border border-slate-100 overflow-hidden z-20 fade-in-up">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="text-xs text-slate-500">Connecté en tant que</div>
              <div className="text-sm font-semibold text-navy-900 truncate">{user?.email || displayName}</div>
            </div>
            <button onClick={() => go('profil')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50 text-left">
              <Icons.User size={16} className="text-slate-600" /> Mon profil
            </button>
            <button onClick={() => go('favoris')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50 text-left">
              <Icons.Heart size={16} className="text-slate-600" /> Mes favoris
            </button>
            <button onClick={() => go('mes-annonces')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50 text-left">
              <Icons.Home size={16} className="text-slate-600" /> Mes annonces
            </button>
            <button onClick={() => go('verification')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50 text-left">
              <Icons.BadgeCheck size={16} className="text-emerald-600" />
              Vérification agence
              <span className="ml-auto text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">Pro</span>
            </button>
            <button onClick={() => go('alerts')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50 text-left">
              <Icons.Bell size={16} className="text-orange-500" />
              Smart Alerts
              <span className="ml-auto text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 ring-1 ring-orange-200">Nouveau</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => { setOpen(false); onGoAdmin?.() }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 border-t border-slate-100"
              >
                <Icons.Sparkles size={16} className="text-orange-600" />
                <span>Backoffice</span>
                <span className="ml-auto text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 ring-1 ring-orange-200">Admin</span>
              </button>
            )}
            <button onClick={() => { setOpen(false); onSignOut() }} className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 ${isAdmin ? '' : 'border-t border-slate-100'}`}>
              <Icons.LogOut size={16} /> Déconnexion
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ============================================================================
   Header with multi-view nav
   ============================================================================ */
function Header({ currentView, setCurrentView, user, role, onSignIn, onPublish, onSignOut, transparent }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Transparent only on Home + before scrolling past hero
  const isOverlay = transparent && !scrolled
  const NAV_ITEMS = [
    ['acheter', 'Acheter'],
    ['louer', 'Louer'],
    ['investir', 'Investir'],
    ['publier', 'Publier une annonce'],
    ['tarifs', 'Tarifs'],
    ['alerts', 'Alertes'],
  ]
  const NavLink = ({ id, label }) => (
    <button
      onClick={() => setCurrentView(id)}
      className={`text-sm font-medium transition-colors ${
        currentView === id
          ? (isOverlay ? 'text-orange-400' : 'text-orange-600')
          : (isOverlay ? 'text-white/90 hover:text-orange-400' : 'text-navy-800 hover:text-orange-600')
      }`}
    >
      {label}
    </button>
  )
  return (
    <motion.header
      initial={false}
      animate={{
        backgroundColor: isOverlay ? 'rgba(11,31,58,0)' : 'rgba(255,255,255,0.82)',
        borderBottomColor: isOverlay ? 'rgba(255,255,255,0)' : 'rgba(241,245,249,1)',
        backdropFilter: isOverlay ? 'blur(0px)' : 'saturate(180%) blur(18px)',
      }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed top-0 inset-x-0 z-50 border-b"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <button onClick={() => setCurrentView('home')} className="flex items-center">
          <BrandLogo dark={isOverlay} />
        </button>
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_ITEMS.map(([id, l]) => <NavLink key={id} id={id} label={l} />)}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <NotificationCenter user={user} />
              <button
                onClick={() => navigate('/early-access')}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-full border ${
                  isOverlay
                    ? 'border-orange-400/50 text-orange-400 hover:bg-orange-400/10'
                    : 'border-orange-200 text-orange-600 hover:bg-orange-50'
                }`}
              >
                ⚡ Accès anticipé
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-full ${isOverlay ? 'text-white hover:text-orange-400' : 'text-navy-900 hover:text-orange-600'}`}
              >
                Mon espace
              </button>
              <UserChip user={user} role={role} onSignOut={onSignOut} onGoAdmin={() => setCurrentView('admin')} onNavigate={setCurrentView} />
            </>
          ) : (
            <button
              onClick={onSignIn}
              className={`text-sm font-medium transition-colors px-3 py-2 ${isOverlay ? 'text-white hover:text-orange-400' : 'text-navy-900 hover:text-orange-600'}`}
            >
              Connexion
            </button>
          )}
          <motion.button
            whileHover={{ y: -2, boxShadow: '0 20px 50px rgba(255, 107, 0, 0.25)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onPublish}
            className="text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors px-5 py-2.5 rounded-full shadow-soft"
          >
            Déposer une annonce
          </motion.button>
        </div>
        <div className="lg:hidden flex items-center gap-1">
          {user && <NotificationCenter user={user} />}
          <button className={`p-2 ${isOverlay ? 'text-white' : 'text-navy-900'}`} onClick={() => setOpen(!open)}>
            {open ? <Icons.X size={24} /> : <Icons.Menu size={24} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {[['home', 'Accueil'], ...NAV_ITEMS].map(([id, l]) => (
                <button key={id} onClick={() => { setCurrentView(id); setOpen(false) }} className="block text-navy-900 font-medium w-full text-left">{l}</button>
              ))}
              {user ? (
                <>
                  <button onClick={() => { navigate('/dashboard'); setOpen(false) }} className="w-full text-navy-900 font-medium text-left">Mon espace</button>
                  <button onClick={onSignOut} className="w-full text-navy-900 font-medium text-left">Déconnexion</button>
                </>
              ) : (
                <button onClick={onSignIn} className="w-full text-navy-900 font-medium text-left">Connexion</button>
              )}
              <button onClick={onPublish} className="w-full text-white bg-orange-600 px-4 py-2.5 rounded-full font-semibold">Déposer une annonce</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ============================================================================
   Search Bar
   ============================================================================ */
function SearchBar({ filters, setFilters, onSearch, floating = false }) {
  const tabs = [
    { id: 'acheter', label: 'Acheter' },
    { id: 'louer', label: 'Louer' },
    { id: 'investir', label: 'Investir' },
  ]
  const wrapper = floating
    ? 'w-full max-w-6xl mx-auto rounded-[28px] p-2 md:p-3 bg-white/80 backdrop-blur-xl border border-white/40 shadow-cardHover'
    : 'w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-cardHover p-2 md:p-3 border border-slate-100'

  const Field = ({ icon: I, label, children, divider = false }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors group ${divider ? 'border-l border-slate-100' : ''}`}>
      {I && <I size={20} className="text-orange-600 shrink-0 group-focus-within:scale-110 transition-transform" />}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{label}</div>
        {children}
      </div>
    </div>
  )

  return (
    <div className={wrapper}>
      <div className="flex items-center gap-1 px-2 pt-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilters({ ...filters, type: t.id })}
            className={`relative px-5 py-2.5 text-sm font-semibold rounded-full transition-all ${
              filters.type === t.id ? 'text-white' : 'text-navy-700 hover:bg-slate-100'
            }`}
          >
            {filters.type === t.id && (
              <motion.span layoutId="tabPill" className="absolute inset-0 bg-navy-900 rounded-full shadow-soft" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSearch() }} className="grid grid-cols-2 md:grid-cols-12 gap-2 mt-2">
        <div className="col-span-2 md:col-span-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 hover:bg-slate-50 focus-within:bg-orange-50/40 focus-within:shadow-[0_0_0_2px_rgba(251,146,60,0.22)] group">
            <Icons.MapPin size={20} className="text-orange-600 shrink-0 group-focus-within:scale-110 transition-transform duration-200" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Localisation</div>
              <LocationSearch
                bare
                value={filters.location}
                onChange={(name) => setFilters((f) => ({ ...f, location: name || '' }))}
                onSelect={(city) => {
                  if (city) {
                    setFilters((f) => ({ ...f, location: city.name }))
                    onSearch({ location: city.name })
                  } else {
                    setFilters((f) => ({ ...f, location: '' }))
                  }
                }}
                placeholder="Paris, Lyon, Bordeaux…"
              />
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <Field icon={Icons.Home} label="Type" divider>
            <select value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })} className="w-full bg-transparent text-navy-900 text-sm focus:outline-none appearance-none cursor-pointer">
              <option value="">Tous</option>
              <option>Studio</option><option>T2</option><option>T3</option><option>Maison</option><option>Villa</option><option>Colocation</option><option>Parking</option>
            </select>
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Budget" divider>
            <input type="number" value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })} placeholder="500 000 €" className="w-full bg-transparent text-navy-900 placeholder-slate-400 text-sm focus:outline-none" />
          </Field>
        </div>
        <div className="md:col-span-1">
          <Field label="Surface" divider>
            <input type="number" value={filters.surfaceMin || ''} onChange={(e) => setFilters({ ...filters, surfaceMin: e.target.value })} placeholder="m²" className="w-full bg-transparent text-navy-900 placeholder-slate-400 text-sm focus:outline-none" />
          </Field>
        </div>
        <div className="md:col-span-1">
          <Field label="Pièces" divider>
            <input type="number" value={filters.roomsMin || ''} onChange={(e) => setFilters({ ...filters, roomsMin: e.target.value })} placeholder="3+" className="w-full bg-transparent text-navy-900 placeholder-slate-400 text-sm focus:outline-none" />
          </Field>
        </div>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="col-span-2 md:col-span-2 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-2xl py-3 px-4 transition-colors hover:shadow-cardHover"
        >
          <Icons.Search size={20} />
          <span>Rechercher</span>
        </motion.button>
      </form>
    </div>
  )
}

/* ============================================================================
   Hero (home)
   ============================================================================ */
function Hero({ filters, setFilters, onSearch }) {
  const { scrollY } = useScroll()
  const yImg = useTransform(scrollY, [0, 500], [0, 120])
  const yText = useTransform(scrollY, [0, 500], [0, -40])
  const opacity = useTransform(scrollY, [0, 400], [1, 0.55])

  const reveal = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] } }),
  }

  return (
    <section className="relative pt-0 min-h-[100vh] flex items-center overflow-hidden">
      {/* Parallax background image */}
      <motion.div style={{ y: yImg }} className="absolute inset-0 will-change-transform">
        <img src={HERO_IMG} alt="Intérieur premium" className="w-full h-[120%] object-cover" />
        <div className="absolute inset-0 hero-overlay" />
      </motion.div>

      {/* Floating gradient blobs */}
      <motion.div
        className="blob absolute -top-32 -left-32 w-[460px] h-[460px] rounded-full bg-orange-600 pointer-events-none"
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="blob absolute -bottom-40 -right-32 w-[520px] h-[520px] rounded-full bg-navy-700 pointer-events-none"
        animate={{ x: [0, -30, 20, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div style={{ y: yText, opacity }} className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-10 py-32">
        <div className="max-w-4xl">
          <motion.div
            variants={reveal} initial="hidden" animate="show" custom={0}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium px-3.5 py-1.5 rounded-full mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            +12 480 biens premium disponibles
          </motion.div>
          <motion.h1
            variants={reveal} initial="hidden" animate="show" custom={1}
            className="text-white text-4xl md:text-6xl lg:text-[80px] font-extrabold leading-[1.02] tracking-tight"
          >
            Trouvez le bien immobilier <span className="text-gradient-orange">qui vous ressemble.</span>
          </motion.h1>
          <motion.p
            variants={reveal} initial="hidden" animate="show" custom={2}
            className="mt-6 text-white/85 text-lg md:text-xl max-w-2xl leading-relaxed"
          >
            Marketplace immobilière premium pour acheter, louer et investir intelligemment.
          </motion.p>
        </div>

        <motion.div variants={reveal} initial="hidden" animate="show" custom={3} className="mt-12 md:mt-14">
          <SearchBar filters={filters} setFilters={setFilters} onSearch={onSearch} floating />
        </motion.div>

        <motion.div
          variants={reveal} initial="hidden" animate="show" custom={4}
          className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 text-white/85 text-sm"
        >
          <div><span className="text-2xl font-bold text-white">2,4M</span> visiteurs / mois</div>
          <div className="w-px h-8 bg-white/25 hidden md:block" />
          <div><span className="text-2xl font-bold text-white">98%</span> de biens vérifiés</div>
          <div className="w-px h-8 bg-white/25 hidden md:block" />
          <div><span className="text-2xl font-bold text-white">4.9/5</span> avis clients</div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 z-10 pointer-events-none"
      >
        <div className="text-[10px] uppercase tracking-[0.3em]">Découvrir</div>
        <Icons.ChevronDown size={18} />
      </motion.div>
    </section>
  )
}

/* ============================================================================
   Compact Hero (for acheter/louer/publier views)
   ============================================================================ */
function PageHero({ title, subtitle, kicker }) {
  return (
    <section className="relative pt-32 pb-16 bg-gradient-to-b from-navy-900 to-navy-800 overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-600/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-orange-500 font-semibold text-sm tracking-wider uppercase mb-3">{kicker}</div>
        <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl">{title}</h1>
        {subtitle && <p className="text-white/75 mt-4 text-lg max-w-2xl">{subtitle}</p>}
      </div>
    </section>
  )
}

/* ============================================================================
   Categories
   ============================================================================ */
function Categories({ onPick }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Explorer</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Trouvez par catégorie</h2>
          </div>
          <a href="#" className="text-navy-700 hover:text-orange-600 font-medium text-sm flex items-center gap-1 transition-colors">
            Voir toutes les catégories <Icons.ArrowRight size={16} />
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((c) => {
            const Icon = c.icon
            return (
              <button key={c.label} onClick={() => onPick(c.value)} className="group bg-slate-50 hover:bg-white border border-transparent hover:border-orange-100 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all hover:shadow-card hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-orange-50 flex items-center justify-center shadow-soft transition-colors">
                  <Icon size={24} className="text-navy-900 group-hover:text-orange-600 transition-colors" />
                </div>
                <div className="text-navy-900 font-semibold text-sm">{c.label}</div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ============================================================================
   Listings grid
   ============================================================================ */
function Listings({ listings, loading, error, source, title = 'Biens à la une', kicker = 'Sélection' }) {
  return (
    <section id="listings" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">{kicker}</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">{title}</h2>
            <p className="text-slate-600 mt-2 max-w-xl">
              {loading
                ? 'Chargement de notre sélection…'
                : source === 'fallback'
                  ? 'Sélection éditoriale (mode démo — données live indisponibles).'
                  : `${listings.length} bien${listings.length > 1 ? 's' : ''} correspondant à votre recherche.`}
            </p>
          </div>
          <a href="#" className="text-white bg-navy-900 hover:bg-navy-700 rounded-full px-5 py-2.5 font-semibold text-sm flex items-center gap-2 transition-all hover:shadow-card">
            Voir tous les biens <Icons.ArrowRight size={16} />
          </a>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 px-4 py-3 bg-orange-50 border border-orange-100 text-orange-700 rounded-2xl text-sm">
            <Icons.AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>Impossible de charger les annonces ({error}). Affichage de la sélection démo.</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-soft animate-pulse">
                <div className="aspect-[4/3] bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-soft">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <Icons.Search size={24} className="text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-1">Aucun bien ne correspond</h3>
            <p className="text-slate-600 text-sm">{"Essayez d'élargir vos critères de recherche."}</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {listings.map((raw, idx) => {
              const l = enrichWithMeta(raw, idx)
              return (
                <motion.article
                  key={l.id}
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-cardHover transition-shadow duration-300 cursor-pointer"
                >
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img src={l.image_url || unsplash('photo-1560448204-e02f11c3d0e2', 900)} alt={l.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 900) }} />
                    {/* Gradient overlay for legibility */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

                    {l.is_premium && (
                      <div className="absolute top-4 left-4 flex items-center gap-1 bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-soft">
                        <Icons.Star size={12} fill="white" /> Premium
                      </div>
                    )}
                    {/* Trust score bottom-left */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur text-navy-900 text-[11px] font-bold px-2 py-1 rounded-full shadow-soft">
                      <Icons.ShieldCheckBig size={12} className="text-emerald-500" />
                      Score {l.trust_score}/100
                    </div>
                    {/* Agency badge bottom-right */}
                    <div className="absolute bottom-3 right-3 max-w-[55%] truncate bg-white/95 backdrop-blur text-navy-900 text-[11px] font-semibold px-2 py-1 rounded-full shadow-soft flex items-center gap-1">
                      <Icons.BadgeCheck size={12} className="text-orange-600" />
                      {l.agency}
                    </div>
                    <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-all hover:scale-110">
                      <Icons.Heart size={16} className="text-navy-900" />
                    </button>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-navy-900 leading-tight line-clamp-1 mb-1.5">{l.title}</h3>
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm mb-3">
                      <Icons.MapPin size={14} /> {l.location}
                    </div>

                    {/* Urgency / social-proof chips */}
                    {(l.is_urgent || l.is_new || l.is_popular) && (
                      <div className="flex items-center gap-1.5 flex-wrap mb-3">
                        {l.is_urgent && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                            className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.15em] px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                          >
                            <span className="relative flex w-1.5 h-1.5">
                              <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-75" />
                              <span className="relative w-1.5 h-1.5 rounded-full bg-rose-500" />
                            </span>
                            Urgent
                          </motion.span>
                        )}
                        {l.is_new && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.05 }}
                            className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.15em] px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 ring-1 ring-orange-200"
                          >
                            Nouveau
                          </motion.span>
                        )}
                        {l.is_popular && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.1 }}
                            className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.15em] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
                          >
                            <Icons.Star size={9} fill="currentColor" /> Populaire
                          </motion.span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-navy-700 mb-3">
                      <div className="flex items-center gap-1.5"><Icons.Bed size={16} className="text-orange-600" /> {l.rooms} p.</div>
                      <div className="w-px h-4 bg-slate-200" />
                      <div className="flex items-center gap-1.5"><Icons.Maximize size={16} className="text-orange-600" /> {l.surface} m²</div>
                    </div>

                    {/* Live activity strip — social proof */}
                    {(l.viewers > 0 || l.contacts_today > 0) && (
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-500 mb-3">
                        {l.viewers > 0 && (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="relative flex w-2 h-2">
                              <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-60 animate-ping" />
                              <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
                            </span>
                            <span><span className="font-semibold text-navy-900">{l.viewers}</span> regardent</span>
                          </span>
                        )}
                        {l.viewers > 0 && l.contacts_today > 0 && <span className="w-px h-3 bg-slate-200" />}
                        {l.contacts_today > 0 && (
                          <span className="inline-flex items-center gap-1.5">
                            <Icons.Mail size={11} className="text-orange-500" />
                            <span><span className="font-semibold text-navy-900">{l.contacts_today}</span> contact{l.contacts_today > 1 ? 's' : ''} aujourd'hui</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="text-xl font-extrabold text-navy-900">{formatPrice(l)}</div>
                      <span className="text-orange-600 text-sm font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Voir <Icons.ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}

/* ============================================================================
   Early Access teaser (home page banner)
   ============================================================================ */
function EarlyAccessTeaser() {
  const navigate = useNavigate()
  const MOCK = [
    { img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&q=60', price: '680 000 €', mins: 18 },
    { img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=300&q=60', price: '1 890 000 €', mins: 7  },
    { img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=300&q=60', price: '498 000 €', mins: 26 },
  ]
  return (
    <section className="py-20 bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#162E52] overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto px-6 lg:px-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/30 text-orange-400 text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Accès Anticipé · Premium
            </span>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4">
              Voyez les annonces<br />
              <span className="text-orange-400">avant tout le monde</span>
            </h2>
            <p className="text-slate-400 text-base mb-8 max-w-md">
              Les membres Premium accèdent aux nouvelles annonces <strong className="text-white">15 à 30 minutes avant le grand public</strong>. Dans l'immobilier, chaque minute compte.
            </p>
            <div className="space-y-3 mb-8">
              {[
                'Compteur en temps réel avant mise en ligne publique',
                'Alertes instantanées SMS, email et push',
                '"Vous voyez cette annonce avant 94% des utilisateurs"',
              ].map(t => (
                <div key={t} className="flex items-center gap-3 text-sm text-white/80">
                  <div className="w-5 h-5 rounded-full bg-orange-600/30 flex items-center justify-center shrink-0">
                    <Icons.Check size={11} className="text-orange-400" />
                  </div>
                  {t}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/early-access')}
                className="h-12 px-7 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition shadow-soft text-sm">
                Découvrir l'accès anticipé
              </motion.button>
              <span className="text-white/40 text-xs">À partir de 29€/mois</span>
            </div>
          </motion.div>

          {/* Right — blurred cards preview */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="relative flex gap-3">
            {MOCK.map((m, i) => (
              <div key={i} className={`relative flex-1 rounded-2xl overflow-hidden ${i === 1 ? 'mt-0' : 'mt-8'}`}>
                <img src={m.img} alt="" className="w-full h-52 object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent"/>
                {/* Blur overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-navy-900/30 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-xl bg-orange-600/80 flex items-center justify-center mb-2">
                    <Icons.Lock size={14} className="text-white"/>
                  </div>
                  <div className="text-white/80 text-xs font-bold text-center px-2">Réservé Premium</div>
                </div>
                {/* Countdown badge */}
                <div className="absolute top-2 right-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  −{m.mins} min
                </div>
                <div className="absolute bottom-2 left-2 text-white text-xs font-bold">{m.price}</div>
              </div>
            ))}
            {/* Glow */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-orange-500/20 pointer-events-none"/>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================================
   Why / Pricing / Testimonials / CTA / Footer
   ============================================================================ */
function WhyPasmal() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Pourquoi PASMAL</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Une expérience pensée pour vous</h2>
          <p className="text-slate-600 mt-4">Trois engagements simples qui font la différence entre une plateforme et une expérience premium.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REASONS.map((r) => {
            const Icon = r.icon
            return (
              <div key={r.title} className="group p-8 bg-slate-50 hover:bg-white border border-transparent hover:border-orange-100 rounded-3xl transition-all hover:shadow-card hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-soft mb-6">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">{r.title}</h3>
                <p className="text-slate-600 leading-relaxed">{r.text}</p>
                <a className="mt-5 inline-flex items-center gap-1.5 text-orange-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  En savoir plus <Icons.ArrowRight size={16} />
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ============================================================================
   Animated Counter (using framer-motion useInView + animate)
   ============================================================================ */
function Counter({ to, suffix = '', duration = 1.8 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return controls.stop
  }, [inView, to, duration])

  return <span ref={ref}>{value.toLocaleString('fr-FR')}{suffix}</span>
}

/* ============================================================================
   Trust Section
   ============================================================================ */
function TrustSection() {
  const counters = [
    { value: 124800, suffix: '+', label: 'Annonces publiées' },
    { value: 86400, suffix: '+', label: 'Utilisateurs vérifiés' },
    { value: 2400, suffix: '+', label: 'Agences partenaires' },
    { value: 98, suffix: '%', label: 'Taux de satisfaction' },
  ]
  const badges = [
    { icon: Icons.BadgeCheck, title: 'Agences vérifiées', text: 'Chaque agence est validée par notre équipe avant publication.', color: 'text-emerald-600 bg-emerald-50' },
    { icon: Icons.CreditCard, title: 'Paiements Stripe sécurisés', text: 'Encaissement protégé par Stripe Connect, conforme PSD2 et 3DS2.', color: 'text-indigo-600 bg-indigo-50' },
    { icon: Icons.Sparkles, title: 'Modération IA', text: 'Notre IA détecte instantanément les annonces frauduleuses ou en double.', color: 'text-orange-600 bg-orange-50' },
    { icon: Icons.ShieldCheckBig, title: 'Anti-arnaque', text: 'Numéro de téléphone vérifié, KYC, signalement instantané.', color: 'text-rose-600 bg-rose-50' },
  ]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-100/40 blur-3xl rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Confiance</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">
            La marketplace immobilière la plus sécurisée de France
          </h2>
          <p className="text-slate-600 mt-4">
            Vérification d'identité, paiement sécurisé, modération IA — nous prenons la confiance au sérieux.
          </p>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-14">
          {counters.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-slate-50 rounded-3xl p-6 md:p-8 text-center border border-slate-100"
            >
              <div className="text-3xl md:text-5xl font-extrabold text-navy-900 tracking-tight">
                <Counter to={c.value} suffix={c.suffix} />
              </div>
              <div className="text-slate-600 text-sm mt-2">{c.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {badges.map((b, i) => {
            const I = b.icon
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.55 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft hover:shadow-card transition-shadow"
              >
                <div className={`w-12 h-12 rounded-2xl ${b.color} flex items-center justify-center mb-4`}>
                  <I size={22} />
                </div>
                <h3 className="font-bold text-navy-900 mb-1.5">{b.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{b.text}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Tarifs</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Des prix simples, sans surprise</h2>
          <p className="text-slate-600 mt-4">Choisissez le pack adapté à vos besoins. Sans engagement, résiliable à tout moment.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              whileHover={{ y: -8 }}
              className={`relative rounded-3xl p-8 transition-shadow ${
                p.highlight
                  ? 'bg-navy-900 text-white border-2 border-orange-600 md:scale-[1.04] glow-orange'
                  : 'bg-white text-navy-900 shadow-soft hover:shadow-card border border-slate-100'
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full shadow-soft flex items-center gap-1">
                  <Icons.Star size={11} fill="white" /> LE PLUS CHOISI
                </div>
              )}
              <div className={`text-sm font-semibold mb-2 ${p.highlight ? 'text-orange-500' : 'text-orange-600'}`}>{p.name}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-extrabold tracking-tight">{p.price}</span>
                <span className={`text-sm ${p.highlight ? 'text-white/70' : 'text-slate-600'}`}>{p.period}</span>
              </div>
              {p.duration && (
                <div className={`text-[11px] font-semibold uppercase tracking-wider mb-4 ${p.highlight ? 'text-white/50' : 'text-slate-400'}`}>
                  {p.duration}
                </div>
              )}
              <p className={`text-sm mb-5 ${p.highlight ? 'text-white/75' : 'text-slate-600'}`}>{p.desc}</p>
              {p.listingBadge && (
                <div className={`mb-6 flex items-center gap-2 px-3 py-2 rounded-2xl ${p.highlight ? 'bg-white/10 ring-1 ring-white/15' : 'bg-slate-50 ring-1 ring-slate-100'}`}>
                  <span className={`inline-flex items-center text-[9px] font-extrabold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ring-1 ${p.listingBadge.tone}`}>
                    {p.listingBadge.label}
                  </span>
                  <span className={`text-[11px] ${p.highlight ? 'text-white/70' : 'text-slate-500'}`}>affiché sur vos annonces</span>
                </div>
              )}
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Icons.Check size={16} className={`mt-0.5 shrink-0 ${p.highlight ? 'text-orange-500' : 'text-orange-600'}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5 ${p.highlight ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-soft hover:shadow-cardHover' : 'bg-slate-100 hover:bg-navy-900 hover:text-white text-navy-900'}`}>
                {p.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* À la carte upsell — "Remonter en tête" boost */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 max-w-3xl mx-auto"
        >
          <div className="relative bg-white border border-orange-100 rounded-2xl p-5 md:p-6 shadow-soft hover:shadow-card transition-shadow overflow-hidden group">
            {/* Soft orange glow accent */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-orange-200/40 blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Lightning icon */}
              <motion.div
                whileHover={{ rotate: -8, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-soft shrink-0"
              >
                <Icons.Zap size={22} />
              </motion.div>

              {/* Copy */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-navy-900 text-base md:text-lg">Remonter en tête</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                    À la carte
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Propulsez votre annonce en première position des résultats pendant <strong className="text-navy-900">72 heures</strong>. Effet immédiat, sans engagement.
                </p>
              </div>

              {/* Price + CTA */}
              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto justify-between shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-navy-900 leading-none tracking-tight">4,90 €</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">paiement unique</div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-soft hover:shadow-cardHover transition-all hover:-translate-y-0.5 group-hover:gap-2"
                >
                  Booster <Icons.ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================================
   B2B — Agency Subscriptions (dark navy + orange)
   ============================================================ */
function AgencyPricing() {
  const [billing, setBilling] = useState('monthly')
  const yearly = billing === 'yearly'
  const yearlyFactor = 0.8 // -20% en annuel

  const computePrice = (base) => yearly ? Math.round(base * yearlyFactor) : base

  return (
    <section className="relative py-24 overflow-hidden bg-navy-900 text-white">
      {/* Decorative blobs */}
      <div className="absolute -top-40 left-1/4 w-[480px] h-[480px] rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-[520px] h-[520px] rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,107,0,0.10),transparent_55%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/85 text-xs font-semibold uppercase tracking-wider mb-4">
            <Icons.Building size={12} className="text-orange-400" />
            Solution Agences · B2B
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            La plateforme pensée pour <span className="text-gradient-orange">les pros de l'immobilier</span>
          </h2>
          <p className="text-white/70 mt-4 leading-relaxed">
            Conçu pour les agences, réseaux et groupes immobiliers. Pipeline de leads, comptes agents,
            analytics, API — tout pour scaler en confiance.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center bg-white/5 border border-white/10 p-1 rounded-full">
            {[
              { id: 'monthly', label: 'Mensuel' },
              { id: 'yearly',  label: 'Annuel · -20%' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBilling(b.id)}
                className={`relative text-sm font-semibold px-5 py-2 rounded-full transition ${
                  billing === b.id ? 'text-navy-900' : 'text-white/70 hover:text-white'
                }`}
              >
                {billing === b.id && (
                  <motion.span layoutId="agencyBilling" className="absolute inset-0 bg-white rounded-full shadow-soft" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
                )}
                <span className="relative flex items-center gap-1.5">
                  {b.label}
                  {b.id === 'yearly' && billing !== 'yearly' && <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">-20%</span>}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {AGENCY_PLANS.map((p, i) => {
            const price = computePrice(p.price)
            const yearlyTotal = computePrice(p.price) * 12
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
                whileHover={{ y: -8 }}
                className={`relative rounded-3xl p-7 lg:p-8 transition-shadow ${
                  p.highlight
                    ? 'bg-gradient-to-br from-navy-700 to-navy-800 border-2 border-orange-500 lg:scale-[1.04] glow-orange'
                    : 'bg-navy-800/80 backdrop-blur-sm border border-white/10 hover:border-white/20'
                }`}
              >
                {p.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-extrabold uppercase tracking-[0.18em] px-3 py-1 rounded-full shadow-soft flex items-center gap-1 ${
                    p.highlight
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-navy-900 ring-1 ring-white/20'
                  }`}>
                    {p.highlight && <Icons.Star size={11} fill="white" />}
                    {p.badge}
                  </div>
                )}

                <div className="text-orange-400 text-sm font-semibold mb-1">{p.name}</div>
                <div className="text-white/55 text-[11px] uppercase tracking-wider mb-4">{p.tagline}</div>

                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-5xl font-extrabold tracking-tight text-white">{price}</span>
                  <span className="text-sm text-white/60">€/mois</span>
                </div>
                <div className="text-[11px] text-white/40 mb-5">
                  {yearly ? `Soit ${yearlyTotal.toLocaleString('fr-FR')} € facturés annuellement` : 'Facturé mensuellement, résiliable à tout moment'}
                </div>

                <p className="text-sm text-white/75 mb-6 leading-relaxed">{p.desc}</p>

                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/85">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${p.highlight ? 'bg-orange-600/25 text-orange-400' : 'bg-white/10 text-white/80'}`}>
                        <Icons.Check size={11} />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                    p.highlight
                      ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-soft hover:shadow-cardHover'
                      : 'bg-white/10 hover:bg-white text-white hover:text-navy-900 border border-white/15'
                  }`}
                >
                  {p.cta} <Icons.ArrowRight size={14} />
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* "Inclus dans tous les plans" strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 max-w-6xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 items-center text-center md:text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-white/50 md:border-r border-white/10 md:pr-4">
                Inclus dans tous les plans
              </div>
              {[
                { icon: Icons.Shield, label: 'RGPD · hébergement FR' },
                { icon: Icons.CreditCard, label: 'Stripe Connect intégré' },
                { icon: Icons.Sparkles, label: 'Modération IA anti-fraude' },
              ].map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.label} className="flex items-center gap-2 text-sm text-white/85">
                    <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-orange-400" />
                    </span>
                    {f.label}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <div className="inline-flex flex-col md:flex-row items-center gap-3 md:gap-5 bg-white/5 border border-white/10 rounded-full p-2 pl-5">
            <div className="text-sm text-white/85 text-center md:text-left">
              Besoin d'une démo personnalisée ?
            </div>
            <button className="inline-flex items-center gap-2 bg-white text-navy-900 hover:bg-orange-50 font-semibold text-sm px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
              Parler à un expert <Icons.ArrowRight size={14} />
            </button>
          </div>
          <div className="text-[11px] text-white/40 mt-3">Réponse sous 24h ouvrées · ☎ 01 84 80 19 26</div>
        </motion.div>
      </div>
    </section>
  )
}

function Testimonials() {
  const [index, setIndex] = useState(0)
  const total = TESTIMONIALS.length

  // Auto-advance every 6s, pause on hover
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % total), 6000)
    return () => clearInterval(t)
  }, [paused, total])

  const go = (dir) => setIndex((i) => (i + dir + total) % total)

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Témoignages</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Ils nous font confiance</h2>
          </div>
          <div className="flex items-center gap-2 text-navy-700">
            <div className="flex">{[...Array(5)].map((_, i) => <Icons.Star key={i} size={20} fill="#FF6B00" className="text-orange-600" />)}</div>
            <span className="font-bold text-navy-900">4.9/5</span>
            <span className="text-sm text-slate-600">— 8 412 avis</span>
          </div>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Carousel viewport */}
          <div className="relative h-[360px] md:h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 60, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60, scale: 0.96 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 grid md:grid-cols-3 gap-6"
              >
                {/* Show 3 cards at a time, centered around current */}
                {[0, 1, 2].map((offset) => {
                  const t = TESTIMONIALS[(index + offset) % total]
                  const isCenter = offset === 1
                  return (
                    <div
                      key={offset}
                      className={`relative p-7 rounded-3xl border transition-all ${
                        isCenter
                          ? 'bg-white shadow-cardHover border-orange-100 md:scale-105 z-10'
                          : 'bg-slate-50 border-slate-100 hidden md:block'
                      }`}
                    >
                      <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-soft">
                        <Icons.Star size={16} fill="white" />
                      </div>
                      <div className="flex mb-4">{[...Array(t.rating)].map((_, i) => <Icons.Star key={i} size={16} fill="#FF6B00" className="text-orange-600" />)}</div>
                      <p className="text-navy-800 leading-relaxed mb-6 italic">"{t.text}"</p>
                      <div className="flex items-center gap-3">
                        <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-soft" />
                        <div>
                          <div className="font-semibold text-navy-900 text-sm">{t.name}</div>
                          <div className="text-slate-600 text-xs">{t.role}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between md:justify-end gap-3 mt-8">
            <div className="flex items-center gap-1.5 md:mr-auto">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Témoignage ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'bg-orange-600 w-8' : 'bg-slate-200 hover:bg-slate-300 w-1.5'}`}
                />
              ))}
            </div>
            <button onClick={() => go(-1)} className="w-11 h-11 rounded-full bg-slate-100 hover:bg-navy-900 hover:text-white text-navy-900 flex items-center justify-center transition-colors" aria-label="Précédent">
              <Icons.ChevronLeft size={18} />
            </button>
            <button onClick={() => go(1)} className="w-11 h-11 rounded-full bg-slate-100 hover:bg-navy-900 hover:text-white text-navy-900 flex items-center justify-center transition-colors" aria-label="Suivant">
              <Icons.ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTA({ onPublish }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 p-10 md:p-16">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-orange-600/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-orange-600/20 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Prêt à publier votre annonce ?</h2>
              <p className="mt-4 text-white/80 max-w-md">Rejoignez plus de 18 000 propriétaires qui font confiance à PASMAL pour vendre ou louer leur bien.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <button onClick={onPublish} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-7 py-3.5 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-cardHover">Déposer une annonce</button>
              <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-full transition-all">Voir une démo</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    if (!email) return
    setSent(true)
    setTimeout(() => { setSent(false); setEmail('') }, 2800)
  }
  return (
    <form onSubmit={submit} className="mt-5">
      <div className="text-white font-semibold text-sm mb-2">Newsletter PASMAL</div>
      <div className="text-white/60 text-xs mb-3">Les meilleures opportunités, chaque jeudi dans votre boîte.</div>
      <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full p-1 pl-4 focus-within:border-orange-500 transition-colors">
        <Icons.Mail size={14} className="text-white/70" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.fr"
          className="flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none py-2 min-w-0"
        />
        <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shrink-0">
          {sent ? (<><Icons.CheckCircle size={14} /> Inscrit</>) : (<>S'abonner <Icons.Send size={12} /></>)}
        </button>
      </div>
    </form>
  )
}

function Footer({ setCurrentView }) {
  const navigate = useNavigate()
  return (
    <footer className="bg-navy-900 text-white/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 pb-28 md:pb-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <BrandLogo dark />
            <p className="text-sm text-white/65 max-w-sm mt-4">Le marché immobilier premium qui connecte propriétaires exigeants et acquéreurs qualifiés.</p>
            <div className="flex items-center gap-3 mt-6">
              {[Icons.Facebook, Icons.Instagram, Icons.Twitter, Icons.Linkedin].map((I, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors">
                  <I size={16} className="text-white" />
                </a>
              ))}
            </div>
            <NewsletterForm />
          </div>
          <div>
            <div className="text-white font-semibold text-sm mb-4">Marketplace</div>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => setCurrentView('acheter')} className="hover:text-orange-500 transition-colors">Acheter</button></li>
              <li><button onClick={() => setCurrentView('louer')} className="hover:text-orange-500 transition-colors">Louer</button></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Colocation</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Estimation gratuite</a></li>
              <li><button onClick={() => navigate('/early-access')} className="hover:text-orange-500 transition-colors">⚡ Accès anticipé</button></li>
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-orange-500 transition-colors">Mon espace</button></li>
            </ul>
          </div>
          {[
            { title: 'Entreprise', links: ['À propos', 'Tarifs', 'Carrières', 'Presse'] },
            { title: 'Légal', links: ['CGU', 'Confidentialité', 'Cookies', 'Mentions légales'] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-white font-semibold text-sm mb-4">{col.title}</div>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="hover:text-orange-500 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/55">
          <div>© {new Date().getFullYear()} PASMAL — Le Marché Immobilier Premium. Tous droits réservés.</div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white">Plan du site</a>
            <a href="#" className="hover:text-white">Contact</a>
            <a href="#" className="hover:text-white">FR · €</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ============================================================================
   Mobile bottom navigation + sticky CTA
   ============================================================================ */
function MobileBottomNav({ currentView, setCurrentView, onPublish }) {
  const items = [
    { id: 'home', label: 'Accueil', icon: Icons.Home2 },
    { id: 'acheter', label: 'Acheter', icon: Icons.Search },
    { id: 'publier', label: 'Publier', icon: Icons.PlusSquare, primary: true, onClick: onPublish },
    { id: 'investir', label: 'Investir', icon: Icons.TrendingUp },
    { id: 'alerts',   label: 'Alertes',  icon: Icons.Bell },
  ]
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      <div className="grid grid-cols-5 gap-1">
        {items.map((it) => {
          const active = currentView === it.id
          const I = it.icon
          if (it.primary) {
            return (
              <button
                key={it.id}
                onClick={it.onClick || (() => setCurrentView(it.id))}
                className="relative flex flex-col items-center justify-end -mt-7"
              >
                <div className="w-14 h-14 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-cardHover ring-4 ring-white">
                  <I size={22} />
                </div>
                <div className="text-[10px] text-navy-900 font-semibold mt-1">{it.label}</div>
              </button>
            )
          }
          return (
            <button
              key={it.id}
              onClick={() => setCurrentView(it.id)}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors ${active ? 'text-orange-600' : 'text-navy-700 hover:text-navy-900'}`}
            >
              <I size={20} />
              <div className="text-[10px] font-medium">{it.label}</div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function MobileStickyCTA({ onPublish, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="md:hidden fixed bottom-[78px] inset-x-0 z-30 px-4 pointer-events-none"
        >
          <button
            onClick={onPublish}
            className="pointer-events-auto w-full bg-navy-900 text-white rounded-full px-5 py-3.5 font-semibold text-sm shadow-cardHover flex items-center justify-center gap-2"
          >
            <Icons.PlusSquare size={18} /> Déposer une annonce
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ============================================================================
   Profil view
   ============================================================================ */
function ProfilView({ user }) {
  const rawName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const email = user?.email || ''
  const initials = rawName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || email[0]?.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-2xl font-bold text-navy-900 mb-8">Mon profil</h1>

        {/* Avatar + name card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-navy-900 text-white text-xl font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div>
            <div className="text-lg font-semibold text-navy-900">{rawName || 'Utilisateur'}</div>
            <div className="text-sm text-slate-500">{email}</div>
          </div>
        </div>

        {/* Info fields */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 divide-y divide-slate-100">
          {[
            { label: 'Nom complet', value: rawName || '—' },
            { label: 'Adresse e-mail', value: email || '—' },
            { label: 'Méthode de connexion', value: user?.app_metadata?.provider === 'google' ? 'Google' : 'E-mail / mot de passe' },
            { label: 'Compte créé le', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
              <span className="text-sm font-medium text-navy-900">{value}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-slate-400 text-center">La modification du profil sera disponible prochainement.</p>
      </div>
    </div>
  )
}

/* ============================================================================
   Favoris view
   ============================================================================ */
function FavorisView({ user }) {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-2xl font-bold text-navy-900 mb-2">Mes favoris</h1>
        <p className="text-slate-500 mb-8">Les biens que vous avez mis de côté.</p>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
            <Icons.Heart size={28} className="text-orange-400" />
          </div>
          <p className="text-navy-900 font-semibold text-lg">Aucun favori pour l'instant</p>
          <p className="text-slate-400 text-sm text-center max-w-xs">
            Cliquez sur le cœur d'une annonce pour la retrouver ici facilement.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   Mes annonces view
   ============================================================================ */
function MesAnnoncesView({ user, onPublish }) {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 mb-1">Mes annonces</h1>
            <p className="text-slate-500 text-sm">Gérez vos biens publiés sur PASMAL.</p>
          </div>
          <button
            onClick={onPublish}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors px-5 py-2.5 rounded-full shadow-soft"
          >
            <Icons.PlusSquare size={16} /> Nouvelle annonce
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
            <Icons.Home size={28} className="text-orange-400" />
          </div>
          <p className="text-navy-900 font-semibold text-lg">Aucune annonce publiée</p>
          <p className="text-slate-400 text-sm text-center max-w-xs">
            Déposez votre première annonce et touchez des milliers d'acheteurs qualifiés.
          </p>
          <button
            onClick={onPublish}
            className="mt-2 text-sm font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2"
          >
            Déposer une annonce →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   PRO REGISTRATION FLOW — upload zone + steps + wrapper
   ============================================================================ */

/* ============================================================================
   Professional Registration Wizard — 5-step premium onboarding
   ============================================================================ */

const PRO_DRAFT_KEY = 'pasmal_pro_draft'

/* UploadZone — reusable file picker */
function UploadZone({ label, hint, accept, icon: Icon = Icons.Upload, file, onFile, optional = false }) {
  const ref = useRef(null)
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</span>
        {optional && <span className="text-[10px] text-slate-400">(optionnel)</span>}
      </div>
      <div
        onClick={() => ref.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all group ${
          file
            ? 'border-emerald-400 bg-emerald-50/60'
            : 'border-slate-200 hover:border-orange-300 bg-slate-50/60 hover:bg-orange-50/20'
        }`}
      >
        <input ref={ref} type="file" accept={accept} className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
        {file ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Icons.Check size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-emerald-700 truncate">{file.name}</div>
              <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB · fichier sélectionné</div>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); onFile(null) }}
              className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50">
              <Icons.X size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:border-orange-300 group-hover:bg-orange-50 flex items-center justify-center shrink-0 transition-colors">
              <Icon size={18} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-600 group-hover:text-navy-900 transition-colors">
                Cliquez pour importer
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{hint}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* Field — shared labeled input for wizard steps */
function Field({ label, icon: Icon, value, set, placeholder, hint, type = 'text', required = false }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</div>
      <div className="flex items-center gap-3 px-4 h-12 bg-white border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/25 focus-within:border-orange-300 transition-all">
        <Icon size={15} className="text-slate-400 shrink-0" />
        <input type={type} required={required} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
          className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
      </div>
      {hint && <div className="text-[11px] text-slate-400 mt-1">{hint}</div>}
    </div>
  )
}

/* AgencyPreviewCard — live right-side preview */
function AgencyPreviewCard({ agencyName, city, agencyType, logoUrl, plan }) {
  const TYPE_LABELS = { agence: 'Agence immobilière', agent: 'Agent indépendant', promoteur: 'Promoteur immobilier', investisseur: 'Investisseur' }
  const PLAN_STYLES = { starter: 'text-slate-600 bg-slate-50 border-slate-200', business: 'text-orange-600 bg-orange-50 border-orange-200', enterprise: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
  const PLAN_LABELS = { starter: 'Starter', business: 'Business ★', enterprise: 'Enterprise' }
  const initials = agencyName ? agencyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AG'
  return (
    <div className="sticky top-28">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
        Aperçu en direct
      </div>
      <motion.div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
        <div className="h-20 bg-gradient-to-br from-[#0B1F3A] via-[#0F2D50] to-[#1a3a5e] relative overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 75% 50%, rgba(249,115,22,0.25) 0%, transparent 60%)' }} />
        </div>
        <div className="px-5 -mt-7 mb-3 flex items-end justify-between">
          <div className="w-14 h-14 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl
              ? <img src={logoUrl} alt="" className="w-full h-full object-cover" />
              : <span className="text-white font-extrabold text-base">{initials}</span>
            }
          </div>
          {plan && PLAN_LABELS[plan] && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PLAN_STYLES[plan]}`}>{PLAN_LABELS[plan]}</span>
          )}
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-extrabold text-[#0F172A] text-base leading-tight">
              {agencyName || <span className="text-slate-300 font-normal text-sm">Nom de l'agence</span>}
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
              <Icons.BadgeCheck size={10} className="text-amber-500" />
              <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">En attente</span>
            </span>
          </div>
          <div className="text-xs text-slate-500 mb-3">
            {TYPE_LABELS[agencyType] || 'Type de structure'}{city ? ` · ${city}` : ''}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-50 rounded-xl p-2 text-center">
              <div className="text-base font-extrabold text-[#0F172A]">0</div>
              <div className="text-[10px] text-slate-500">Annonces</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 text-center">
              <div className="text-base font-extrabold text-[#0F172A]">—</div>
              <div className="text-[10px] text-slate-500">Avis clients</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
            <Icons.Check size={11} className="shrink-0" />
            <span>Vérification KYC en cours</span>
          </div>
        </div>
      </motion.div>
      <div className="mt-4 space-y-1.5">
        {[
          { label: 'Informations entreprise', done: !!agencyName },
          { label: 'Vérification identité',   done: false },
          { label: 'Branding agence',          done: !!logoUrl },
          { label: 'Abonnement choisi',        done: !!plan },
        ].map(({ label, done }) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${done ? 'bg-emerald-500' : 'bg-slate-200'}`}>
              {done && <Icons.Check size={8} className="text-white" />}
            </div>
            <span className={done ? 'text-[#0F172A] font-medium' : 'text-slate-400'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Step 1 — Informations entreprise */
function WizStep1({ agencyType, setAgencyType, agencyName, setAgencyName, siret, setSiret, phone, setPhone, city, setCity, address, setAddress, website, setWebsite }) {
  const TYPES = [
    { value: 'agence',       icon: Icons.Building,   label: 'Agence',       desc: 'Structure avec salariés' },
    { value: 'agent',        icon: Icons.User,        label: 'Agent',        desc: 'Auto-entrepreneur, EI' },
    { value: 'promoteur',    icon: Icons.Home2,       label: 'Promoteur',    desc: 'Construction & VEFA' },
    { value: 'investisseur', icon: Icons.TrendingUp,  label: 'Investisseur', desc: 'Patrimoine & gestion' },
  ]
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Informations entreprise</h2>
        <p className="text-slate-500 text-sm">Parlez-nous de votre structure professionnelle.</p>
      </div>
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Type de structure *</div>
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map(({ value, icon: Icon, label, desc }) => {
            const active = agencyType === value
            return (
              <motion.button key={value} type="button" onClick={() => setAgencyType(value)}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${active ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon size={16} />
                </div>
                <div className="text-sm font-bold text-[#0F172A]">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                {active && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                    <Icons.Check size={10} className="text-white" />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
      <div className="space-y-4">
        <Field label="Nom de l'agence *" icon={Icons.Building} value={agencyName} set={setAgencyName} placeholder="Agence Immobilière du Lac" required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="SIRET *" icon={Icons.BadgeCheck} value={siret} set={setSiret} placeholder="12345678900012" hint="14 chiffres" required />
          <Field label="Téléphone *" icon={Icons.Phone} value={phone} set={setPhone} placeholder="+33 6 12 34 56 78" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ville *" icon={Icons.MapPin} value={city} set={setCity} placeholder="Paris" required />
          <Field label="Site web" icon={Icons.Globe} value={website} set={setWebsite} placeholder="https://mon-agence.fr" />
        </div>
        <Field label="Adresse professionnelle" icon={Icons.MapPin} value={address} set={setAddress} placeholder="12 rue du Commerce, 75011 Paris" />
      </div>
    </div>
  )
}

/* Step 2 — Vérification identité */
function WizStep2({ fullName, setFullName, email, setEmail, password, setPassword, confirmPwd, setConfirmPwd, show, setShow }) {
  const score = [password.length >= 6, password.length >= 10, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length
  const bars   = ['bg-rose-400', 'bg-rose-400', 'bg-amber-400', 'bg-amber-400', 'bg-emerald-500']
  const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent']
  const match  = confirmPwd.length > 0 && password === confirmPwd
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Vérification identité</h2>
        <p className="text-slate-500 text-sm">Vos identifiants de connexion sécurisés.</p>
      </div>
      <div className="flex gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
        <Icons.Shield size={17} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">Vos informations sont protégées par chiffrement SSL 256-bit et ne seront jamais partagées.</p>
      </div>
      <div className="space-y-4">
        <Field label="Nom complet du responsable *" icon={Icons.User} value={fullName} set={setFullName} placeholder="Jean Kevin PEMOU" required />
        <Field label="E-mail professionnel *" icon={Icons.Mail} value={email} set={setEmail} placeholder="direction@agence.fr" type="email" required />
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mot de passe *</div>
          <div className="flex items-center gap-3 px-4 h-12 bg-white border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/25 focus-within:border-orange-300 transition-all">
            <Icons.Lock size={15} className="text-slate-400 shrink-0" />
            <input type={show ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
            <button type="button" onClick={() => setShow(!show)} className="text-slate-400 hover:text-slate-700 transition-colors">
              {show ? <Icons.EyeOff size={15} /> : <Icons.Eye size={15} />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[0,1,2,3,4].map(i => <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < score ? bars[score - 1] : 'bg-slate-200'}`} />)}
              </div>
              <div className="text-[11px] text-slate-500">Force : <span className="font-semibold">{labels[score - 1] || 'Trop court'}</span></div>
            </div>
          )}
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Confirmer le mot de passe *</div>
          <div className={`flex items-center gap-3 px-4 h-12 bg-white border rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/25 transition-all ${
            confirmPwd.length > 0 ? (match ? 'border-emerald-400' : 'border-rose-400') : 'border-slate-200 focus-within:border-orange-300'
          }`}>
            <Icons.Lock size={15} className="text-slate-400 shrink-0" />
            <input type={show ? 'text' : 'password'} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="••••••••" className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
            {confirmPwd.length > 0 && (match
              ? <Icons.Check size={15} className="text-emerald-500 shrink-0" />
              : <Icons.X size={15} className="text-rose-500 shrink-0" />
            )}
          </div>
          {confirmPwd.length > 0 && !match && <div className="text-[11px] text-rose-500 mt-1">Les mots de passe ne correspondent pas.</div>}
        </div>
      </div>
    </div>
  )
}

/* Step 3 — Branding agence */
function WizStep3({ logo, setLogo, logoUrl, description, setDescription, linkedin, setLinkedin }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Branding agence</h2>
        <p className="text-slate-500 text-sm">Donnez de la visibilité à votre marque.</p>
      </div>
      <UploadZone label="Logo de l'agence" hint="PNG ou JPG, fond transparent recommandé · max 5 Mo" accept="image/*"
        icon={Icons.Image} file={logo} onFile={setLogo} optional />
      {logoUrl && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <img src={logoUrl} alt="Aperçu" className="w-14 h-14 object-contain rounded-xl border border-emerald-200 bg-white" />
          <div>
            <div className="text-sm font-semibold text-emerald-700">Logo chargé</div>
            <div className="text-xs text-slate-500">{logo?.name} · {logo ? (logo.size / 1024).toFixed(0) : 0} KB</div>
          </div>
        </motion.div>
      )}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Description <span className="text-slate-400 normal-case font-normal text-[11px]">(optionnel)</span>
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={500}
          placeholder="Notre agence accompagne acheteurs et vendeurs depuis 2010, avec une expertise reconnue..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-300 transition-all resize-none" />
        <div className="text-right text-[10px] text-slate-400 mt-1">{description.length}/500</div>
      </div>
      <Field label="Page LinkedIn" icon={Icons.Linkedin} value={linkedin} set={setLinkedin} placeholder="https://linkedin.com/company/mon-agence" />
    </div>
  )
}

/* Step 4 — Abonnement & visibilité */
const PRO_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 29, yearly: 24,
    highlight: false,
    badge: null,
    features: ['5 annonces actives', 'Statistiques simples', 'Badge Pro', 'Support e-mail'],
  },
  {
    id: 'business',
    name: 'Business',
    monthly: 79, yearly: 66,
    highlight: true,
    badge: 'Recommandé',
    features: ['Annonces illimitées', 'CRM leads intégré', 'Boost visibilité ×3', 'Analytics avancés', 'Support prioritaire'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: 199, yearly: 166,
    highlight: false,
    badge: null,
    features: ['Multi-agents', 'Accès API complet', 'Support dédié', 'Import massif', 'SLA garanti'],
  },
]

function WizStep4({ plan, setPlan }) {
  const [billing, setBilling] = useState('monthly')
  const yearly = billing === 'yearly'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Abonnement & visibilité</h2>
        <p className="text-slate-500 text-sm">Choisissez le plan qui propulsera votre agence en tête des résultats.</p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={() => setBilling('monthly')}
          className={`text-sm font-semibold transition-colors ${billing === 'monthly' ? 'text-[#0F172A]' : 'text-slate-400 hover:text-slate-600'}`}>
          Mensuel
        </button>
        <button type="button" onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${yearly ? 'bg-orange-500' : 'bg-slate-200'}`}>
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${yearly ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <button type="button" onClick={() => setBilling('yearly')}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors ${yearly ? 'text-[#0F172A]' : 'text-slate-400 hover:text-slate-600'}`}>
          Annuel
          <AnimatePresence>
            {yearly && (
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                2 mois offerts
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PRO_PLANS.map((p) => {
          const active  = plan === p.id
          const price   = yearly ? p.yearly : p.monthly

          return (
            <motion.button key={p.id} type="button" onClick={() => setPlan(p.id)}
              whileHover={{ y: -5, scale: 1.015 }} whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className={`relative text-left rounded-3xl border-2 overflow-hidden transition-all duration-200 ${
                p.highlight
                  ? 'border-orange-500 bg-[#0B1F3A] shadow-2xl shadow-orange-500/25'
                  : active
                  ? 'border-orange-500 bg-white shadow-lg shadow-orange-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Glow behind highlighted card */}
              {p.highlight && (
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-orange-500 opacity-20 blur-3xl pointer-events-none" />
              )}

              <div className="p-5 relative z-10">
                {/* Radio + badge row */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-orange-500 bg-orange-500' : p.highlight ? 'border-white/30' : 'border-slate-300'}`}>
                    {active && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  {p.badge && (
                    <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {p.badge}
                    </span>
                  )}
                </div>

                {/* Plan name */}
                <div className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${p.highlight ? 'text-orange-400' : 'text-slate-500'}`}>
                  {p.name}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-1">
                  <motion.span key={`${p.id}-${billing}`}
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                    className={`text-3xl font-extrabold ${p.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                    {price}€
                  </motion.span>
                  <span className={`text-xs ${p.highlight ? 'text-slate-400' : 'text-slate-500'}`}>/mois</span>
                </div>
                {yearly && (
                  <div className={`text-[11px] mb-1 ${p.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                    soit {price * 12}€/an
                  </div>
                )}

                <div className={`h-px my-4 ${p.highlight ? 'bg-white/10' : 'bg-slate-100'}`} />

                {/* Features */}
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${p.highlight ? 'bg-orange-500/25' : 'bg-emerald-50'}`}>
                        <Icons.Check size={9} strokeWidth={3} className={p.highlight ? 'text-orange-400' : 'text-emerald-600'} />
                      </span>
                      <span className={p.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA strip on highlighted card */}
              {p.highlight && (
                <div className="px-5 pb-5 relative z-10">
                  <div className={`w-full py-2 rounded-xl text-center text-sm font-bold transition-colors ${active ? 'bg-orange-500 text-white' : 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'}`}>
                    {active ? 'Sélectionné ✓' : 'Choisir Business'}
                  </div>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Stripe secure mention */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Icons.CreditCard size={13} className="text-slate-400" />
        Paiement sécurisé via{' '}
        <span className="font-bold text-slate-500">Stripe</span>
        <span className="text-slate-300">·</span>
        Résiliable à tout moment
        <span className="text-slate-300">·</span>
        Pas d'engagement
      </div>
    </div>
  )
}

/* Step 5 — Confirmation & review */
function WizStep5Review({ fullName, email, agencyName, siret, agencyType, city, phone, website, logo, plan, legalDoc, idDoc, onEditPlan }) {
  const TYPE_LABELS = { agence: 'Agence immobilière', agent: 'Agent indépendant', promoteur: 'Promoteur', investisseur: 'Investisseur' }
  const rows = [
    { l: 'Structure',   v: TYPE_LABELS[agencyType] || '—' },
    { l: 'Agence',      v: agencyName || '—' },
    { l: 'SIRET',       v: siret || '—' },
    { l: 'Responsable', v: fullName || '—' },
    { l: 'E-mail',      v: email || '—' },
    { l: 'Ville',       v: city || '—' },
  ]
  const docs = [
    { label: 'Logo agence',           file: logo,     optional: true },
    { label: 'Document légal (KBIS)', file: legalDoc, optional: false },
    { label: "Pièce d'identité",      file: idDoc,    optional: false },
  ]
  const selectedPlan = PRO_PLANS.find((p) => p.id === plan) || PRO_PLANS[1]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Confirmation</h2>
        <p className="text-slate-500 text-sm">Vérifiez vos informations avant d'envoyer votre dossier.</p>
      </div>

      {/* Plan recap card */}
      <div className={`relative overflow-hidden rounded-2xl border-2 ${selectedPlan.highlight ? 'border-orange-500 bg-[#0B1F3A]' : 'border-slate-200 bg-white'}`}>
        {selectedPlan.highlight && (
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-500 opacity-15 blur-3xl pointer-events-none" />
        )}
        <div className="relative z-10 px-5 py-4">
          <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${selectedPlan.highlight ? 'text-orange-400' : 'text-slate-400'}`}>
            Plan sélectionné
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedPlan.highlight ? 'bg-orange-500/20' : 'bg-slate-100'}`}>
                {selectedPlan.highlight
                  ? <Icons.Sparkles size={18} className="text-orange-400" />
                  : selectedPlan.id === 'enterprise'
                    ? <Icons.ShieldCheckBig size={18} className="text-indigo-500" />
                    : <Icons.BadgeCheck size={18} className="text-slate-500" />
                }
              </div>
              <div>
                <div className={`font-extrabold text-base leading-tight ${selectedPlan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                  {selectedPlan.name}
                  {selectedPlan.badge && (
                    <span className="ml-2 text-[10px] font-extrabold bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider align-middle">
                      {selectedPlan.badge}
                    </span>
                  )}
                </div>
                <div className={`text-xs mt-0.5 ${selectedPlan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Facturation mensuelle · résiliable à tout moment
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-right">
                <span className={`text-2xl font-extrabold ${selectedPlan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                  {selectedPlan.monthly}€
                </span>
                <span className={`text-xs ${selectedPlan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>/mois</span>
              </div>
              <button type="button" onClick={onEditPlan}
                className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${selectedPlan.highlight ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'}`}>
                <Icons.ChevronLeft size={11} />
                Modifier
              </button>
            </div>
          </div>

          <div className={`h-px my-3 ${selectedPlan.highlight ? 'bg-white/10' : 'bg-slate-100'}`} />

          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {selectedPlan.features.map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-xs">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${selectedPlan.highlight ? 'bg-orange-500/25' : 'bg-emerald-50'}`}>
                  <Icons.Check size={8} strokeWidth={3} className={selectedPlan.highlight ? 'text-orange-400' : 'text-emerald-600'} />
                </span>
                <span className={selectedPlan.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Stripe badge */}
        <div className={`px-5 py-2.5 flex items-center gap-2 border-t ${selectedPlan.highlight ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
          <Icons.CreditCard size={12} className={selectedPlan.highlight ? 'text-slate-400' : 'text-slate-400'} />
          <span className={`text-[11px] ${selectedPlan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>
            Paiement sécurisé via <span className="font-bold text-slate-500">Stripe</span>
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Icons.Shield size={11} className="text-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-600">SSL</span>
          </div>
        </div>
      </div>

      {/* Info table */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-200 overflow-hidden">
        {rows.map(({ l, v }) => (
          <div key={l} className="flex items-center justify-between px-5 py-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{l}</span>
            <span className="text-sm font-medium text-[#0F172A] text-right max-w-[55%] truncate">{v}</span>
          </div>
        ))}
      </div>

      {/* Documents */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Documents</div>
        <div className="space-y-2.5">
          {docs.map(({ label, file, optional }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${file ? 'bg-emerald-500' : optional ? 'bg-slate-200' : 'bg-rose-400'}`}>
                {file ? <Icons.Check size={9} className="text-white" /> : <Icons.X size={9} className="text-white" />}
              </div>
              <span className="text-sm text-slate-700">{label}</span>
              {file && <span className="text-xs text-slate-400 truncate max-w-[140px]">{file.name}</span>}
              {!file && optional && <span className="text-xs text-slate-400">optionnel</span>}
              {!file && !optional && <span className="text-xs text-rose-500 font-medium">manquant</span>}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center leading-relaxed">
        En soumettant, vous acceptez nos <a href="#" className="underline hover:text-orange-600">CGU professionnelles</a> et notre <a href="#" className="underline hover:text-orange-600">politique de confidentialité</a>. Votre dossier sera examiné sous 24h.
      </p>
    </div>
  )
}

/* Success screen */
function ProSuccessScreen({ email, agencyName, plan, onHome }) {
  const PLAN_LABELS = { starter: 'Starter', business: 'Business', enterprise: 'Enterprise' }
  const PLAN_PRICES = { starter: '29€', business: '79€', enterprise: '199€' }
  const NEXT_STEPS = [
    { Icon: Icons.Mail,       label: 'E-mail de confirmation envoyé',           delay: 0.45 },
    { Icon: Icons.FileText,   label: "Dossier transmis à l'équipe KYC",         delay: 0.58 },
    { Icon: Icons.BadgeCheck, label: `Plan ${PLAN_LABELS[plan] || 'Business'} activé`, delay: 0.71 },
    { Icon: Icons.Shield,     label: 'Badge "Agence vérifiée" après validation', delay: 0.84 },
  ]
  return (
    <div className="relative min-h-screen bg-[#0B1F3A] flex items-center justify-center px-4 overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute -top-48 -left-48 w-[560px] h-[560px] rounded-full bg-orange-500 opacity-[0.08] blur-[110px]"
          animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-48 -right-48 w-[480px] h-[480px] rounded-full bg-indigo-500 opacity-[0.09] blur-[100px]"
          animate={{ scale: [1, 1.22, 1] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full text-center">

        {/* Animated check icon with pulse rings */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
          >
            <Icons.Check size={44} className="text-white" strokeWidth={2.5} />
          </motion.div>
          <motion.div className="absolute inset-0 rounded-3xl border-2 border-emerald-400/50"
            animate={{ scale: [1, 1.5, 1.8], opacity: [0.7, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }} />
          <motion.div className="absolute inset-0 rounded-3xl border-2 border-emerald-400/25"
            animate={{ scale: [1, 1.8, 2.2], opacity: [0.5, 0.1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.8 }} />
        </div>

        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-3xl font-extrabold text-white mb-2">Dossier envoyé !</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
          className="text-slate-400 mb-1">
          <span className="font-semibold text-white">{agencyName || 'Votre agence'}</span> est en cours de vérification.
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
          className="text-sm text-slate-500 mb-7">
          Confirmation envoyée à <span className="font-medium text-slate-300">{email}</span>
        </motion.p>

        {/* Plan badge */}
        <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.48, type: 'spring' }}
          className="inline-flex items-center gap-2.5 mb-7 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <Icons.Sparkles size={13} className="text-orange-400" />
          <span className="text-sm font-bold text-white">Plan {PLAN_LABELS[plan] || 'Business'}</span>
          <span className="text-slate-500">·</span>
          <span className="text-orange-400 font-bold">{PLAN_PRICES[plan] || '79€'}/mois</span>
        </motion.div>

        {/* Timeline */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-7 text-left space-y-3 backdrop-blur-sm">
          {NEXT_STEPS.map(({ Icon, label, delay }) => (
            <motion.div key={label} className="flex items-center gap-3"
              initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.4 }}>
              <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Icon size={13} className="text-emerald-400" />
              </div>
              <span className="text-sm text-slate-300">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* Delay notice */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-7">
          <Icons.AlertCircle size={12} />
          Délai de vérification estimé :
          <span className="font-semibold text-slate-400">24 à 48 h ouvrées</span>
        </motion.p>

        <motion.button onClick={onHome}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.02, boxShadow: '0 16px 40px rgba(234,88,12,0.35)' }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20">
          Retour à l'accueil
        </motion.button>
      </motion.div>
    </div>
  )
}

/* Main RegisterProView — 5-step premium onboarding */
function RegisterProView({ setCurrentView }) {
  const STEPS = [
    { n: 1, label: 'Entreprise',   desc: 'Structure & coordonnées' },
    { n: 2, label: 'Identité',     desc: 'Responsable & accès' },
    { n: 3, label: 'Branding',     desc: 'Logo & présentation' },
    { n: 4, label: 'Abonnement',   desc: 'Plan & visibilité' },
    { n: 5, label: 'Confirmation', desc: 'Vérification & envoi' },
  ]

  const [step,      setStep]      = useState(1)
  const [dir,       setDir]       = useState(1)
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState('')

  /* Step 1 — Entreprise */
  const [agencyType, setAgencyType] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [siret,      setSiret]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [city,       setCity]       = useState('')
  const [address,    setAddress]    = useState('')
  const [website,    setWebsite]    = useState('')

  /* Step 2 — Identité */
  const [fullName,   setFullName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [show,       setShow]       = useState(false)

  /* Step 3 — Branding */
  const [logo,        setLogo]        = useState(null)
  const [logoUrl,     setLogoUrl]     = useState('')
  const [description, setDescription] = useState('')
  const [linkedin,    setLinkedin]    = useState('')

  /* Step 4 — Plan */
  const [plan, setPlan] = useState('business')

  /* Step 5 — Docs */
  const [legalDoc, setLegalDoc] = useState(null)
  const [idDoc,    setIdDoc]    = useState(null)

  /* Autosave (non-sensitive fields) */
  useEffect(() => {
    try {
      localStorage.setItem(PRO_DRAFT_KEY, JSON.stringify({ agencyType, agencyName, siret, phone, city, address, website, fullName, email, description, linkedin, plan }))
    } catch {}
  }, [agencyType, agencyName, siret, phone, city, address, website, fullName, email, description, linkedin, plan])

  /* Restore draft on mount */
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(PRO_DRAFT_KEY) || '{}')
      if (d.agencyType)  setAgencyType(d.agencyType)
      if (d.agencyName)  setAgencyName(d.agencyName)
      if (d.siret)       setSiret(d.siret)
      if (d.phone)       setPhone(d.phone)
      if (d.city)        setCity(d.city)
      if (d.address)     setAddress(d.address)
      if (d.website)     setWebsite(d.website)
      if (d.fullName)    setFullName(d.fullName)
      if (d.email)       setEmail(d.email)
      if (d.description) setDescription(d.description)
      if (d.linkedin)    setLinkedin(d.linkedin)
      if (d.plan)        setPlan(d.plan)
    } catch {}
  }, [])

  /* Logo object URL */
  useEffect(() => {
    if (!logo) { setLogoUrl(''); return }
    const url = URL.createObjectURL(logo)
    setLogoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [logo])

  /* Per-step validation */
  const validate = (s) => {
    if (s === 1) {
      if (!agencyType) return 'Sélectionnez un type de structure.'
      if (!agencyName.trim()) return "Le nom de l'agence est requis."
      if (siret.replace(/\s/g, '').length !== 14) return 'Le SIRET doit comporter exactement 14 chiffres.'
      if (!phone.trim()) return 'Le téléphone professionnel est requis.'
      if (!city.trim()) return 'La ville est requise.'
    }
    if (s === 2) {
      if (!fullName.trim()) return 'Le nom du responsable est requis.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Adresse e-mail invalide.'
      if (password.length < 6) return 'Le mot de passe doit comporter au moins 6 caractères.'
      if (password !== confirmPwd) return 'Les mots de passe ne correspondent pas.'
    }
    if (s === 5) {
      if (!legalDoc) return 'Le document légal (KBIS) est requis.'
      if (!idDoc) return "La pièce d'identité est requise."
    }
    return null
  }

  const goTo = (n) => {
    if (n > step) {
      const err = validate(step)
      if (err) { setError(err); return }
    }
    setError('')
    setDir(n > step ? 1 : -1)
    setStep(n)
  }

  const submit = async () => {
    const err = validate(5)
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { account_type: 'professional', full_name: fullName, agency_name: agencyName, siret: siret.replace(/\s/g, ''), phone, website, city, address, agency_type: agencyType, plan, kyc_status: 'pending' } },
      })
      if (error) throw error
      try { localStorage.removeItem(PRO_DRAFT_KEY) } catch {}
      setSubmitted(true)
    } catch (err) {
      const msg = err?.message || ''
      if (/already registered|already exists/i.test(msg)) setError('Cet e-mail est déjà utilisé.')
      else if (/password/i.test(msg)) setError('Le mot de passe doit comporter au moins 6 caractères.')
      else setError(msg || 'Une erreur est survenue.')
    } finally { setLoading(false) }
  }

  if (submitted) return <ProSuccessScreen email={email} agencyName={agencyName} plan={plan} onHome={() => setCurrentView('home')} />

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] overflow-x-hidden">

      {/* ── Floating ambient lights ── */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <motion.div className="absolute -top-64 -left-64 w-[700px] h-[700px] rounded-full bg-orange-400 opacity-[0.035] blur-[130px]"
          animate={{ x: [0, 50, 0], y: [0, 35, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute top-1/2 -right-56 w-[550px] h-[550px] rounded-full bg-indigo-500 opacity-[0.04] blur-[110px]"
          animate={{ x: [0, -35, 0], y: [0, 45, 0] }} transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full bg-amber-400 opacity-[0.03] blur-[100px]"
          animate={{ x: [0, 25, 0], y: [0, -25, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-4 h-14">
            <button onClick={() => setCurrentView('home')}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-[#0F172A] transition-colors shrink-0">
              <Icons.ChevronLeft size={16} /> Accueil
            </button>
            <div className="flex-1 mx-3">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest">
                  {STEPS[step - 1].label}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{step} / {STEPS.length}</span>
              </div>
              <div className="relative h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
            <BrandLogo compact />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="flex gap-6 lg:gap-8 xl:gap-12">

          {/* ── Step sidebar (xl+) ── */}
          <div className="hidden xl:block w-52 shrink-0">
            <div className="sticky top-24">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-5 px-1">Progression</div>
              <div className="relative">
                {/* Vertical connector */}
                <div className="absolute left-[15px] top-5 bottom-5 w-px bg-slate-200" />
                <div className="space-y-1.5">
                  {STEPS.map((s) => {
                    const done   = s.n < step
                    const active = s.n === step
                    return (
                      <div key={s.n} className={`relative flex items-start gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 ${active ? 'bg-white shadow-sm border border-slate-100' : ''}`}>
                        <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5 transition-all duration-200 ${
                          done   ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                                 : active ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/40 ring-4 ring-orange-500/15'
                                 : 'bg-white border-2 border-slate-200 text-slate-300'
                        }`}>
                          {done ? <Icons.Check size={11} /> : s.n}
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <div className={`text-xs font-bold leading-snug transition-colors ${active ? 'text-[#0F172A]' : done ? 'text-slate-500' : 'text-slate-300'}`}>
                            {s.label}
                          </div>
                          {(active || done) && (
                            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.desc}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Main form card (center) ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-3xl border border-slate-100/80 shadow-xl shadow-slate-200/50 overflow-hidden">

              {/* Step content */}
              <div className="px-7 sm:px-10 pt-9 pb-8">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    initial={(d) => ({ opacity: 0, x: d * 36 })}
                    animate={{ opacity: 1, x: 0 }}
                    exit={(d) => ({ opacity: 0, x: d * -36 })}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step === 1 && <WizStep1 {...{ agencyType, setAgencyType, agencyName, setAgencyName, siret, setSiret, phone, setPhone, city, setCity, address, setAddress, website, setWebsite }} />}
                    {step === 2 && <WizStep2 {...{ fullName, setFullName, email, setEmail, password, setPassword, confirmPwd, setConfirmPwd, show, setShow }} />}
                    {step === 3 && <WizStep3 {...{ logo, setLogo, logoUrl, description, setDescription, linkedin, setLinkedin }} />}
                    {step === 4 && <WizStep4 {...{ plan, setPlan }} />}
                    {step === 5 && (
                      <div className="space-y-6">
                        <WizStep5Review {...{ fullName, email, agencyName, siret, agencyType, city, phone, website, logo, plan, legalDoc, idDoc, onEditPlan: () => goTo(4) }} />
                        <div className="space-y-3">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documents requis *</div>
                          <UploadZone label="Document légal (KBIS / Sirene)" hint="Extrait de moins de 3 mois · PDF ou image" accept=".pdf,image/*" icon={Icons.FileText} file={legalDoc} onFile={setLegalDoc} />
                          <UploadZone label="Pièce d'identité du responsable" hint="CNI ou passeport recto-verso" accept=".pdf,image/*" icon={Icons.IdCard} file={idDoc} onFile={setIdDoc} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mx-7 sm:mx-10 mb-2"
                  >
                    <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200/80 text-rose-700 rounded-2xl text-sm">
                      <Icons.AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-500" />
                      <span className="font-medium">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation footer */}
              <div className="flex items-center justify-between px-7 sm:px-10 py-5 border-t border-slate-100 bg-slate-50/60">
                <button type="button" onClick={() => step > 1 ? goTo(step - 1) : setCurrentView('home')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-[#0F172A] hover:bg-white border border-slate-200 transition-all hover:shadow-sm">
                  <Icons.ChevronLeft size={14} />
                  {step > 1 ? 'Retour' : 'Accueil'}
                </button>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Brouillon sauvegardé
                  </span>
                  {step < 5 ? (
                    <motion.button type="button" onClick={() => goTo(step + 1)}
                      whileHover={{ scale: 1.025, boxShadow: '0 14px 36px rgba(234,88,12,0.32)' }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-md shadow-orange-500/25">
                      Continuer <Icons.ArrowRight size={14} />
                    </motion.button>
                  ) : (
                    <motion.button type="button" onClick={submit} disabled={loading}
                      whileHover={!loading ? { scale: 1.025, boxShadow: '0 14px 36px rgba(234,88,12,0.32)' } : {}}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-md shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                      {loading
                        ? <><Icons.Loader size={14} /><span>Envoi en cours…</span></>
                        : <><span>Soumettre mon dossier</span><Icons.ArrowRight size={14} /></>
                      }
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Live preview (lg+) ── */}
          <div className="hidden lg:block w-60 xl:w-72 shrink-0 overflow-hidden">
            <AgencyPreviewCard agencyName={agencyName} city={city} agencyType={agencyType} logoUrl={logoUrl} plan={plan} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   Agency Verification — constants & components
   ============================================================================ */
const VSTATUS = {
  none:     { label: 'Non vérifié',           bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400',    Icon: Icons.AlertCircle },
  pending:  { label: 'Vérification en cours', bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400',    Icon: Icons.AlertCircle },
  verified: { label: 'Agence vérifiée',       bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500',  Icon: Icons.BadgeCheck },
  premium:  { label: 'Premium Partner',       bg: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500',   Icon: Icons.Sparkles },
}
const STATUS_ORDER = ['none', 'pending', 'verified', 'premium']

const REVIEW_STATE = {
  reviewing: { label: 'En cours d\'examen',  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   Icon: Icons.AlertCircle },
  approved:  { label: 'Dossier approuvé',    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', Icon: Icons.CheckCircle },
  rejected:  { label: 'Dossier refusé',      bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    Icon: Icons.AlertCircle },
}

const BENEFITS = [
  { id: 'badge',      Icon: Icons.BadgeCheck,      label: 'Badge vérifié',        desc: 'Un sceau officiel PASMAL affiché sur chaque annonce.',         minStatus: 'verified' },
  { id: 'seo',        Icon: Icons.TrendingUp,       label: 'Boost SEO',            desc: 'Vos annonces remontent en tête des résultats de recherche.',    minStatus: 'verified' },
  { id: 'visibility', Icon: Icons.Eye,              label: 'Meilleure visibilité', desc: 'Exposition prioritaire dans notre newsletter et les alertes.',   minStatus: 'verified' },
  { id: 'crm',        Icon: Icons.Users,            label: 'Accès CRM premium',    desc: 'Gérez tous vos contacts, leads et suivis depuis un seul outil.', minStatus: 'premium'  },
  { id: 'support',    Icon: Icons.Shield,           label: 'Support prioritaire',  desc: 'Un conseiller dédié répond en moins de 2 h ouvrées.',           minStatus: 'premium'  },
]

const VER_STEPS = [
  { n: 1, label: 'Compte créé',       key: 'none' },
  { n: 2, label: 'Documents soumis',  key: 'pending' },
  { n: 3, label: 'Vérifié',           key: 'verified' },
  { n: 4, label: 'Premium Partner',   key: 'premium' },
]

function VerificationBadge({ status, size = 'sm' }) {
  const cfg = VSTATUS[status] || VSTATUS.none
  const Icon = cfg.Icon
  const pad  = size === 'lg' ? 'px-4 py-2 text-sm gap-2' : 'px-2.5 py-1 text-xs gap-1.5'
  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${cfg.bg} ${cfg.text} ${cfg.border} ${pad}`}>
      <Icon size={size === 'lg' ? 16 : 12} />
      {cfg.label}
    </span>
  )
}

function AdminReviewPanel({ reviewState, setReviewState }) {
  const cfg = REVIEW_STATE[reviewState]
  const Icon = cfg.Icon
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Icons.Shield size={12} /> Revue admin
        </div>
        <div className="flex gap-1">
          {Object.keys(REVIEW_STATE).map((k) => (
            <button key={k} onClick={() => setReviewState(k)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${reviewState === k ? `${REVIEW_STATE[k].bg} ${REVIEW_STATE[k].text} ${REVIEW_STATE[k].border} border` : 'text-slate-400 hover:text-slate-600'}`}>
              {REVIEW_STATE[k].label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* body */}
      <div className={`px-5 py-4 border-l-4 ${reviewState === 'approved' ? 'border-emerald-400' : reviewState === 'rejected' ? 'border-rose-400' : 'border-amber-400'}`}>
        <div className={`flex items-start gap-3 ${cfg.text}`}>
          <Icon size={20} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-bold text-sm mb-0.5">{cfg.label}</div>
            {reviewState === 'reviewing' && (
              <p className="text-xs text-amber-600 leading-relaxed">Votre dossier est en cours d'examen par notre équipe. Délai estimé : 48 h ouvrées.</p>
            )}
            {reviewState === 'approved' && (
              <p className="text-xs text-emerald-600 leading-relaxed">Félicitations ! Votre agence a été vérifiée et votre badge est maintenant actif sur toutes vos annonces.</p>
            )}
            {reviewState === 'rejected' && (
              <>
                <p className="text-xs text-rose-600 leading-relaxed mb-2">Votre dossier n'a pas pu être validé. Motif : document illisible ou expiré.</p>
                <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2">
                  Soumettre à nouveau <Icons.ArrowRight size={11} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* doc checklist */}
      <div className="px-5 py-3 border-t border-slate-100">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Documents reçus</div>
        {[
          { label: 'Extrait KBIS',         ok: true },
          { label: 'Pièce d\'identité',     ok: reviewState !== 'rejected' },
          { label: 'Justificatif d\'adresse', ok: false },
        ].map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-2 text-xs py-0.5">
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${ok ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              {ok ? <Icons.Check size={8} strokeWidth={3} /> : <Icons.AlertCircle size={8} />}
            </span>
            <span className={ok ? 'text-slate-700' : 'text-slate-400'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgencyVerificationView({ setCurrentView }) {
  const [status,      setStatus]      = useState('none')
  const [reviewState, setReviewState] = useState('reviewing')

  const statusIdx   = STATUS_ORDER.indexOf(status)
  const cfg         = VSTATUS[status]

  return (
    <div className="min-h-screen bg-[#F8F9FB]">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-navy-900 transition-colors">
            <Icons.ChevronLeft size={16} /> Retour
          </button>
          <div className="font-bold text-navy-900 text-sm">Vérification agence</div>
          <VerificationBadge status={status} />
        </div>
      </div>

      {/* ── Demo switcher (dev helper) ── */}
      <div className="bg-[#0B1F3A] py-2 px-4 flex items-center justify-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Prévisualiser :</span>
        {STATUS_ORDER.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${status === s ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            {VSTATUS[s].label}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="flex gap-8 items-start">

          {/* ── CENTER content ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Banner — shown for none / pending */}
            <AnimatePresence>
              {(status === 'none' || status === 'pending') && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  className="relative overflow-hidden rounded-2xl bg-[#0B1F3A] px-6 py-5 flex items-center gap-4"
                >
                  {/* glow */}
                  <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-orange-500 opacity-15 blur-3xl pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0">
                    <Icons.TrendingUp size={22} className="text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-extrabold text-base mb-0.5">
                      Les agences vérifiées reçoivent <span className="text-orange-400">jusqu'à 4× plus</span> de contacts.
                    </div>
                    <div className="text-slate-400 text-xs">Complétez votre vérification pour booster immédiatement votre visibilité.</div>
                  </div>
                  {status === 'none' && (
                    <button onClick={() => setCurrentView('register-pro')}
                      className="shrink-0 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5">
                      Commencer <Icons.ArrowRight size={14} />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress steps */}
            <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Progression de la vérification</div>
              <div className="flex items-start gap-0">
                {VER_STEPS.map((s, i) => {
                  const done    = statusIdx > i
                  const active  = statusIdx === i
                  const last    = i === VER_STEPS.length - 1
                  return (
                    <React.Fragment key={s.n}>
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done ? 'bg-emerald-500 border-emerald-500 text-white' : active ? 'bg-orange-500 border-orange-500 text-white ring-4 ring-orange-500/20' : 'bg-white border-slate-200 text-slate-400'}`}>
                          {done ? <Icons.Check size={14} strokeWidth={3} /> : s.n}
                        </div>
                        <div className={`mt-2 text-[11px] font-semibold text-center leading-tight ${done ? 'text-emerald-600' : active ? 'text-orange-600' : 'text-slate-400'}`}>{s.label}</div>
                      </div>
                      {!last && (
                        <div className={`flex-1 h-0.5 mt-4 mx-1 rounded-full transition-all ${statusIdx > i ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>

            {/* Status-specific panel */}
            <AnimatePresence mode="wait">
              <motion.div key={status}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {status === 'none' && (
                  <div className="bg-white rounded-2xl border border-slate-200 px-6 py-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Icons.Shield size={28} className="text-slate-400" />
                    </div>
                    <h3 className="font-extrabold text-navy-900 text-lg mb-2">Votre agence n'est pas encore vérifiée</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">Soumettez vos documents pour obtenir le badge officiel PASMAL et multiplier vos contacts qualifiés.</p>
                    <button onClick={() => setCurrentView('register-pro')}
                      className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-7 py-3 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg">
                      Démarrer la vérification <Icons.ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {status === 'pending' && (
                  <AdminReviewPanel reviewState={reviewState} setReviewState={setReviewState} />
                )}

                {status === 'verified' && (
                  <div className="bg-white rounded-2xl border border-emerald-200 px-6 py-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <Icons.BadgeCheck size={24} className="text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-navy-900 text-base mb-1">Agence vérifiée PASMAL</h3>
                        <p className="text-slate-500 text-sm mb-3">Votre badge est actif. Vos annonces bénéficient d'une exposition prioritaire auprès de 2,4 M d'acheteurs qualifiés.</p>
                        <div className="flex flex-wrap gap-3">
                          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                            <span className="font-bold text-navy-900">4×</span> plus de contacts
                          </div>
                          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                            <span className="font-bold text-navy-900">Top 3</span> dans les recherches
                          </div>
                          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                            <span className="font-bold text-navy-900">Badge</span> sur toutes les annonces
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {status === 'premium' && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#0B1F3A] to-[#1a3a6e] rounded-2xl px-6 py-6 border border-orange-500/30">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-orange-500 opacity-10 blur-3xl pointer-events-none" />
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0">
                        <Icons.Sparkles size={22} className="text-orange-400" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-orange-500/20 border border-orange-400/30 text-orange-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                          <Icons.Sparkles size={10} /> Premium Partner
                        </div>
                        <h3 className="font-extrabold text-white text-base mb-1">Statut élite actif</h3>
                        <p className="text-slate-400 text-sm">Vous bénéficiez de tous les avantages PASMAL, d'un CRM intégré et d'un conseiller dédié.</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Benefits grid */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Avantages de la vérification</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BENEFITS.map(({ id, Icon, label, desc, minStatus }) => {
                  const unlocked = STATUS_ORDER.indexOf(status) >= STATUS_ORDER.indexOf(minStatus)
                  return (
                    <motion.div key={id} whileHover={unlocked ? { y: -2 } : {}}
                      className={`rounded-2xl border p-4 transition-all ${unlocked ? 'bg-white border-slate-200 hover:border-orange-200 hover:shadow-md' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${unlocked ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className={`text-sm font-bold ${unlocked ? 'text-navy-900' : 'text-slate-400'}`}>{label}</div>
                            {!unlocked && (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {VSTATUS[minStatus].label}
                              </span>
                            )}
                          </div>
                          <div className={`text-xs leading-relaxed ${unlocked ? 'text-slate-500' : 'text-slate-400'}`}>{desc}</div>
                        </div>
                        {unlocked && (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <Icons.Check size={10} strokeWidth={3} className="text-emerald-600" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT sidebar ── */}
          <div className="hidden lg:flex flex-col gap-4 w-72 shrink-0">

            {/* Badge preview card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-[#0B1F3A] px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 font-extrabold text-sm">AG</div>
                <div>
                  <div className="text-white font-bold text-sm">Agence Demo</div>
                  <div className="text-slate-400 text-xs">Paris, Île-de-France</div>
                </div>
              </div>
              <div className="px-4 py-3 border-b border-slate-100">
                <VerificationBadge status={status} size="sm" />
              </div>
              <div className="px-4 py-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Apparence sur vos annonces</div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-600 text-[10px] font-bold">AG</div>
                    <span className="text-xs font-semibold text-navy-900">Agence Demo</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full w-3/4 mb-1" />
                  <div className="h-2 bg-slate-200 rounded-full w-1/2 mb-2" />
                  <VerificationBadge status={status} size="sm" />
                </div>
              </div>
            </div>

            {/* Trust stats */}
            <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Chiffres de confiance</div>
              {[
                { label: 'Agences vérifiées',      val: '1 240+' },
                { label: 'Contacts générés / mois', val: '86 400' },
                { label: 'Satisfaction agences',   val: '4,8 / 5' },
                { label: 'Délai de vérification',  val: '48 h' },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs font-bold text-navy-900">{val}</span>
                </div>
              ))}
            </div>

            {/* CTA upgrade (shown for none/pending) */}
            <AnimatePresence>
              {(status === 'none' || status === 'pending') && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-4 text-white text-center"
                >
                  <Icons.Sparkles size={20} className="mx-auto mb-2 opacity-80" />
                  <div className="font-bold text-sm mb-1">Passez Premium Partner</div>
                  <div className="text-xs text-orange-100 mb-3">CRM intégré, conseiller dédié et badge élite.</div>
                  <button onClick={() => setCurrentView('tarifs')}
                    className="w-full bg-white text-orange-600 font-bold text-xs py-2 rounded-xl hover:bg-orange-50 transition-colors">
                    Voir les offres
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   Tarifs view (standalone page reusing Pricing)
   ============================================================================ */
function TarifsView({ onPublish }) {
  return (
    <>
      <PageHero kicker="Tarification" title="Des prix simples, un retour mesurable." subtitle="Pas d'engagement, résiliable en un clic. Annulez quand vous voulez." />
      <Pricing />
      <AgencyPricing />
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
            <Icons.Sparkles size={12} /> Garantie 30 jours satisfait ou remboursé
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-2">Une question sur nos tarifs ?</h3>
          <p className="text-slate-600 mb-6">Notre équipe vous répond en moins de 24h, du lundi au vendredi.</p>
          <button onClick={onPublish} className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-7 py-3.5 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
            Commencer maintenant <Icons.ArrowRight size={16} />
          </button>
        </div>
      </section>
    </>
  )
}

/* ============================================================================
   Investir view
   ============================================================================ */
function InvestirView({ listings, loading, error, source }) {
  const stats = [
    { label: 'Rendement brut moyen', value: 5.8, suffix: ' %', icon: Icons.TrendingUp },
    { label: 'Villes analysées', value: 240, suffix: '', icon: Icons.MapPin },
    { label: 'Investisseurs accompagnés', value: 1850, suffix: '+', icon: Icons.Users },
  ]
  return (
    <>
      <PageHero
        kicker="Investissement"
        title="Investissez dans la pierre, sans les pièges."
        subtitle="Données de rendement, fiscalité, simulation Pinel/LMNP et accompagnement humain."
      />
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-5 -mt-20 relative z-10">
          {stats.map((s, i) => {
            const I = s.icon
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
                className="bg-white rounded-3xl p-6 shadow-card border border-slate-100"
              >
                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                  <I size={22} />
                </div>
                <div className="text-3xl font-extrabold text-navy-900">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="text-slate-600 text-sm mt-1">{s.label}</div>
              </motion.div>
            )
          })}
        </div>
      </section>
      <Listings listings={listings} loading={loading} error={error} source={source} title="Biens à fort potentiel" kicker="Opportunités" />
    </>
  )
}

/* ============================================================================
   Publier view (placeholder form when authenticated)
   ============================================================================ */
const PROPERTY_TYPES = [
  { value: 'appartement', label: 'Appartement', Icon: Icons.Building },
  { value: 'maison',      label: 'Maison',      Icon: Icons.Home },
  { value: 'studio',      label: 'Studio',      Icon: Icons.Home2 },
  { value: 'villa',       label: 'Villa',       Icon: Icons.Villa },
  { value: 'terrain',     label: 'Terrain',     Icon: Icons.Maximize },
  { value: 'local',       label: 'Local Pro',   Icon: Icons.Warehouse },
]

const PUBLI_STEPS = ['Type', 'Infos', 'Localisation', 'Photos & Prix']

function PublierField({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

const inputCls = (err) =>
  `w-full px-4 py-3 bg-white border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition ${
    err ? 'border-red-400' : 'border-slate-200'
  }`

function PublierView({ user, onSignIn }) {
  const [step,      setStep]      = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [errors,    setErrors]    = useState({})
  const [form,      setForm]      = useState({
    transactionType: 'vente',
    propertyType:    '',
    title:           '',
    description:     '',
    surface:         '',
    rooms:           '',
    floor:           '',
    yearBuilt:       '',
    furnished:       false,
    address:         '',
    city:            '',
    zipcode:         '',
    department:      '',
    region:          '',
    price:           '',
    charges:         '',
    photos:          [],
  })
  const fileRef = useRef(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (step === 1 && !form.propertyType)   e.propertyType = 'Choisissez un type de bien'
    if (step === 2 && !form.title.trim())   e.title        = 'Le titre est obligatoire'
    if (step === 2 && !form.surface)        e.surface      = 'La surface est obligatoire'
    if (step === 3 && !form.city.trim())    e.city         = 'La ville est obligatoire'
    if (step === 4 && !form.price)          e.price        = 'Le prix est obligatoire'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 4)) }
  const back = () => { setErrors({}); setStep(s => Math.max(s - 1, 1)) }
  const submit = () => { if (validate()) setSubmitted(true) }

  const handleFiles = (files) => {
    const urls = [...files].slice(0, 6 - form.photos.length).map(f => URL.createObjectURL(f))
    set('photos', [...form.photos, ...urls])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  if (!user) {
    return (
      <>
        <PageHero kicker="Espace propriétaires" title="Publiez votre annonce en quelques minutes"
          subtitle="Diffusion premium auprès de 2,4M d'acquéreurs et locataires qualifiés." />
        <section className="py-20 bg-white">
          <div className="max-w-lg mx-auto px-6">
            <div className="bg-slate-50 rounded-3xl p-10 text-center border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white flex items-center justify-center mx-auto mb-5">
                <Icons.Lock size={28} />
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Connectez-vous pour publier</h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">Créez un compte gratuit en moins d'une minute.</p>
              <button onClick={onSignIn}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
                Créer un compte <Icons.ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </>
    )
  }

  if (submitted) {
    return (
      <>
        <PageHero kicker="Félicitations" title="Annonce publiée avec succès !"
          subtitle="Votre bien est maintenant visible par des milliers d'acquéreurs qualifiés." />
        <section className="py-20 bg-white">
          <div className="max-w-lg mx-auto px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <Icons.CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">Votre annonce est en ligne</h2>
            <p className="text-slate-500 mb-2">
              <span className="font-semibold text-navy-900">{form.title || 'Votre bien'}</span>
              {form.city && <> · {form.city}</>}
            </p>
            {form.price && (
              <p className="text-xl font-extrabold text-orange-600 mb-6">
                {Number(form.price).toLocaleString('fr-FR')} €{form.transactionType === 'location' ? '/mois' : ''}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <button onClick={() => { setSubmitted(false); setStep(1); setForm(f => ({ ...f, title: '', price: '', photos: [] })) }}
                className="px-6 py-3 rounded-full border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition">
                Publier un autre bien
              </button>
              <button className="px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition">
                Gérer mes annonces
              </button>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHero kicker="Espace propriétaires" title="Publiez votre annonce en quelques minutes"
        subtitle="Diffusion premium auprès de 2,4M d'acquéreurs et locataires qualifiés." />

      <section className="py-12 bg-white">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">

          {/* Progress steps */}
          <div className="flex items-center justify-between mb-10">
            {PUBLI_STEPS.map((label, i) => {
              const n = i + 1
              const done    = step > n
              const current = step === n
              return (
                <React.Fragment key={n}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      done    ? 'bg-emerald-500 text-white' :
                      current ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' :
                                'bg-slate-100 text-slate-400'
                    }`}>
                      {done ? <Icons.Check size={16} /> : n}
                    </div>
                    <span className={`text-[11px] font-medium hidden sm:block ${current ? 'text-orange-600' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {label}
                    </span>
                  </div>
                  {i < PUBLI_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded ${step > n ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Card */}
          <div className="bg-slate-50 rounded-3xl p-7 md:p-10 border border-slate-100">

            {/* ── Step 1 : Type ─────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-1">Type de transaction</h2>
                  <p className="text-sm text-slate-500 mb-4">Vous souhaitez vendre ou mettre en location ?</p>
                  <div className="flex gap-3">
                    {[['vente','Vendre'],['location','Louer']].map(([v, l]) => (
                      <button key={v} onClick={() => set('transactionType', v)}
                        className={`flex-1 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
                          form.transactionType === v
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'
                        }`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-1">Type de bien</h2>
                  <p className="text-sm text-slate-500 mb-4">Quelle est la nature de votre bien ?</p>
                  <div className="grid grid-cols-3 gap-3">
                    {PROPERTY_TYPES.map(({ value, label, Icon }) => (
                      <button key={value} onClick={() => { set('propertyType', value); setErrors({}) }}
                        className={`flex flex-col items-center gap-2.5 py-5 rounded-2xl border-2 transition-all ${
                          form.propertyType === value
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-orange-200 hover:text-slate-700'
                        }`}>
                        <Icon size={24} />
                        <span className="text-xs font-semibold">{label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.propertyType && <p className="text-red-500 text-xs mt-2">{errors.propertyType}</p>}
                </div>
              </div>
            )}

            {/* ── Step 2 : Informations ─────────────────────── */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-navy-900">Informations essentielles</h2>

                <PublierField label="Titre de l'annonce" error={errors.title}>
                  <input value={form.title} onChange={e => set('title', e.target.value)}
                    className={inputCls(errors.title)} placeholder="Beau 3 pièces lumineux proche métro" />
                </PublierField>

                <PublierField label="Description">
                  <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                    className={`${inputCls()} resize-none`}
                    placeholder="Décrivez votre bien : atouts, état, environnement…" />
                </PublierField>

                <div className="grid grid-cols-2 gap-4">
                  <PublierField label="Surface (m²)" error={errors.surface}>
                    <input type="number" value={form.surface} onChange={e => set('surface', e.target.value)}
                      className={inputCls(errors.surface)} placeholder="65" min="1" />
                  </PublierField>
                  <PublierField label="Pièces">
                    <input type="number" value={form.rooms} onChange={e => set('rooms', e.target.value)}
                      className={inputCls()} placeholder="3" min="1" />
                  </PublierField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <PublierField label="Étage">
                    <input type="number" value={form.floor} onChange={e => set('floor', e.target.value)}
                      className={inputCls()} placeholder="2" min="0" />
                  </PublierField>
                  <PublierField label="Année de construction">
                    <input type="number" value={form.yearBuilt} onChange={e => set('yearBuilt', e.target.value)}
                      className={inputCls()} placeholder="1985" min="1800" max="2025" />
                  </PublierField>
                </div>

                {form.transactionType === 'location' && (
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div onClick={() => set('furnished', !form.furnished)}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.furnished ? 'bg-orange-500' : 'bg-slate-200'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.furnished ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Bien meublé</span>
                  </label>
                )}
              </div>
            )}

            {/* ── Step 3 : Localisation ─────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-navy-900">Localisation</h2>

                <PublierField label="Adresse">
                  <input value={form.address} onChange={e => set('address', e.target.value)}
                    className={inputCls()} placeholder="12 rue de la Paix" />
                </PublierField>

                <PublierField label="Ville / Code postal" error={errors.city}>
                  <div className={`flex items-center gap-2 px-4 h-12 bg-white rounded-2xl border transition ${errors.city ? 'border-red-400' : 'border-slate-200 focus-within:border-orange-400 focus-within:shadow-orange-100/60 focus-within:shadow-md'}`}>
                    <Icons.MapPin size={14} className="text-orange-500 shrink-0" />
                    <LocationSearch
                      bare
                      value={form.city}
                      onChange={v => set('city', v)}
                      onSelect={city => {
                        if (city) {
                          set('city',       city.name)
                          set('zipcode',    city.zipcode)
                          set('department', city.department)
                          set('region',     city.region)
                        } else {
                          set('city', '')
                          set('zipcode', '')
                        }
                        setErrors(e => ({ ...e, city: undefined }))
                      }}
                      placeholder="Paris, Lyon, 69000…"
                    />
                  </div>
                </PublierField>

                {form.zipcode && (
                  <div className="grid grid-cols-2 gap-4">
                    <PublierField label="Code postal">
                      <input value={form.zipcode} onChange={e => set('zipcode', e.target.value)}
                        className={inputCls()} />
                    </PublierField>
                    <PublierField label="Département">
                      <input readOnly value={form.department}
                        className={`${inputCls()} bg-slate-50 text-slate-500 cursor-default`} />
                    </PublierField>
                  </div>
                )}

                {form.region && (
                  <PublierField label="Région">
                    <input readOnly value={form.region}
                      className={`${inputCls()} bg-slate-50 text-slate-500 cursor-default`} />
                  </PublierField>
                )}
              </div>
            )}

            {/* ── Step 4 : Photos & Prix ────────────────────── */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-navy-900">Photos & Prix</h2>

                {/* Drop zone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Photos <span className="normal-case font-normal text-slate-400">(max 6)</span>
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors bg-white hover:bg-orange-50/30">
                    <Icons.Upload size={28} className="text-slate-300" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-600">Glissez vos photos ici</p>
                      <p className="text-xs text-slate-400 mt-0.5">ou cliquez pour parcourir</p>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                      onChange={e => handleFiles(e.target.files)} />
                  </div>
                  {form.photos.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {form.photos.map((src, i) => (
                        <div key={i} className="relative w-20 h-16 rounded-xl overflow-hidden border border-slate-200">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => set('photos', form.photos.filter((_, j) => j !== i))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition">
                            <Icons.X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={form.transactionType === 'location' ? 'grid grid-cols-2 gap-4' : ''}>
                  <PublierField label={form.transactionType === 'location' ? 'Loyer (€/mois)' : 'Prix de vente (€)'} error={errors.price}>
                    <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                      className={inputCls(errors.price)}
                      placeholder={form.transactionType === 'location' ? '950' : '350 000'} min="0" />
                  </PublierField>
                  {form.transactionType === 'location' && (
                    <PublierField label="Charges (€/mois)">
                      <input type="number" value={form.charges} onChange={e => set('charges', e.target.value)}
                        className={inputCls()} placeholder="80" min="0" />
                    </PublierField>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 text-sm text-slate-600 space-y-1.5">
                  <div className="font-bold text-navy-900 mb-2">Récapitulatif</div>
                  {form.title       && <div><span className="text-slate-400">Titre :</span> {form.title}</div>}
                  {form.propertyType && <div><span className="text-slate-400">Type :</span> {form.propertyType} — {form.transactionType === 'location' ? 'location' : 'vente'}</div>}
                  {(form.surface || form.rooms) && (
                    <div>
                      <span className="text-slate-400">Surface :</span>
                      {form.surface && ` ${form.surface} m²`}
                      {form.rooms   && ` · ${form.rooms} pièce${Number(form.rooms) > 1 ? 's' : ''}`}
                    </div>
                  )}
                  {form.city && <div><span className="text-slate-400">Ville :</span> {form.city} {form.zipcode && `(${form.zipcode})`}</div>}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
              {step > 1 ? (
                <button onClick={back}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 transition">
                  <Icons.ChevronLeft size={16} /> Précédent
                </button>
              ) : <div />}

              {step < 4 ? (
                <button onClick={next}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-cardHover text-sm">
                  Suivant <Icons.ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={submit}
                  className="flex items-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-cardHover text-sm">
                  <Icons.Send size={15} /> Publier l'annonce
                </button>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  )
}

/* ============================================================================
   APP root
   ============================================================================ */
export default function App() {
  const navigate = useNavigate()

  /* ---------- Routing ---------- */
  const [currentView, setCurrentView] = useState('home') // home | acheter | louer | publier

  /* ---------- Auth ---------- */
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signup') // 'signup' | 'login'
  const [role, setRole] = useState(null) // 'admin' | 'agent' | 'user' | null

  // Fetch role from public.profiles table for the given user id
  const fetchRole = useCallback(async (uid) => {
    if (!uid) { setRole(null); return }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', uid)
        .single()
      if (error) throw error
      setRole(data?.role ?? null)
    } catch {
      setRole(null)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        const u = session?.user ?? null
        setUser(u)
        fetchRole(u?.id)
      })
      .catch(() => {})

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      fetchRole(u?.id)
    })

    return () => subscription?.unsubscribe?.()
  }, [fetchRole])

  // Admin guard — redirect non-admin away from backoffice
  useEffect(() => {
    if (currentView !== 'admin') return
    // Wait until we know the role (avoid flicker right after login)
    if (user && role === null) return
    if (!user || !['admin', 'super_admin', 'moderator'].includes(role)) {
      setCurrentView('home')
    }
  }, [currentView, user, role])

  // Auth guard — redirect to home when session ends on a protected view
  useEffect(() => {
    const authViews = ['profil', 'favoris', 'mes-annonces', 'verification', 'alerts', 'admin']
    if (!user && authViews.includes(currentView)) {
      setCurrentView('home')
    }
  }, [user, currentView])

  const openSignIn = () => navigate('/auth/login')
  const openSignUp = () => navigate('/auth/register')
  const handleSignOut = async () => {
    await supabase.auth.signOut().catch(() => {})
    setUser(null)
    setRole(null)
    setCurrentView('home')
  }
  const handlePublish = () => {
    if (!user) {
      navigate('/auth/register')
    } else {
      setCurrentView('publier')
    }
  }

  /* ---------- Listings + Filters ---------- */
  const [filters, setFilters] = useState({ type: 'acheter', location: '', propertyType: '', priceMax: '', surfaceMin: '', roomsMin: '' })
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [source, setSource] = useState('supabase')

  const fetchListings = useCallback(async (currentFilters) => {
    setLoading(true)
    setError('')

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      if (import.meta.env.DEV) console.error('[PASMAL] VITE_SUPABASE_URL manquant ou invalide — vérifier les variables d\'environnement Vercel/Vite.')
      const filtered = applyClientFilters(FALLBACK_LISTINGS, currentFilters)
      setListings(filtered.length ? filtered : FALLBACK_LISTINGS)
      setSource('fallback')
      setLoading(false)
      return
    }

    try {
      let query = supabase.from('listings').select('*')
      if (currentFilters.type) query = query.eq('type', currentFilters.type)
      if (currentFilters.propertyType) query = query.eq('property_type', currentFilters.propertyType)
      if (currentFilters.location) query = query.or(`city.ilike.%${currentFilters.location}%,district.ilike.%${currentFilters.location}%`)
      if (currentFilters.priceMax) query = query.lte('price', Number(currentFilters.priceMax))
      query = query.order('is_premium', { ascending: false }).limit(8)

      const { data, error } = await query
      if (error) throw error

      if (!data || data.length === 0) {
        const filtered = applyClientFilters(FALLBACK_LISTINGS, currentFilters)
        setListings(filtered.length ? filtered : FALLBACK_LISTINGS)
        setSource('fallback')
      } else {
        setListings(data); setSource('supabase')
      }
    } catch (err) {
      const isNetworkDown = err instanceof TypeError && err.message === 'Failed to fetch'
      const isCors = err?.message?.includes('CORS') || err?.message?.includes('NetworkError when attempting to fetch resource')

      let devHint = ''
      if (isNetworkDown) devHint = `[PASMAL] Réseau inaccessible — URL: ${import.meta.env.VITE_SUPABASE_URL}`
      else if (isCors) devHint = `[PASMAL] Erreur CORS — vérifier les origines dans Supabase Auth > URL Configuration`
      else devHint = `[PASMAL] Erreur Supabase: ${err?.message}`
      if (import.meta.env.DEV) console.error(devHint, err)

      setError(err?.message || 'Erreur réseau')
      const filtered = applyClientFilters(FALLBACK_LISTINGS, currentFilters)
      setListings(filtered.length ? filtered : FALLBACK_LISTINGS)
      setSource('fallback')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchListings(filters) // initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync filters.type with current page view (acheter/louer)
  useEffect(() => {
    if (currentView === 'acheter' || currentView === 'louer') {
      const next = { ...filters, type: currentView }
      setFilters(next)
      fetchListings(next)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (currentView === 'home') {
      fetchListings(filters)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (currentView === 'publier' || currentView === 'tarifs' || currentView === 'investir' || currentView === 'admin') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView])

  useEffect(() => {
    if (currentView === 'home') fetchListings(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type])

  const [selectedListing, setSelectedListing] = useState(null)
  const [selectedListingIdx, setSelectedListingIdx] = useState(0)
  const [prevView, setPrevView] = useState('home')

  const handleOpenListing = (raw, idx = 0) => {
    setSelectedListing(raw)
    setSelectedListingIdx(idx)
    setPrevView(currentView)
    setCurrentView('detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (overrides = {}) => {
    fetchListings({ ...filters, ...overrides })
    if (currentView === 'home') setCurrentView('results')
  }
  const handleCategoryPick = (propertyType) => {
    const next = { ...filters, propertyType }
    setFilters(next)
    fetchListings(next)
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        role={role}
        onSignIn={openSignIn}
        onPublish={handlePublish}
        onSignOut={handleSignOut}
        transparent={currentView === 'home'}
      />

      <main>
        {currentView === 'home' && (
          <>
            <Hero filters={filters} setFilters={setFilters} onSearch={handleSearch} />
            <Categories onPick={handleCategoryPick} />
            <Listings listings={listings} loading={loading} error={error} source={source} />
            <EarlyAccessTeaser />
            <WhyPasmal />
            <TrustSection />
            <Pricing />
            <AgencyPricing />
            <Testimonials />
            <TrustGuarantees />
            <CTA onPublish={handlePublish} />
          </>
        )}

        {currentView === 'results' && (
          <SearchResultsPage
            listings={listings}
            loading={loading}
            error={error}
            source={source}
            filters={filters}
            setFilters={setFilters}
            onSearch={handleSearch}
            onBack={() => setCurrentView('home')}
            onSelect={handleOpenListing}
          />
        )}

        {currentView === 'detail' && selectedListing && (
          <PropertyDetailPage
            listing={selectedListing}
            idx={selectedListingIdx}
            onBack={() => setCurrentView(prevView)}
            onOpenListing={handleOpenListing}
            similarListings={listings.filter(l => l.id !== selectedListing.id)}
          />
        )}

        {currentView === 'acheter' && (
          <>
            <PageHero kicker="Achat" title="Trouvez le bien à acheter qui vous ressemble." subtitle="Plus de 8 200 biens premium vérifiés, partout en France." />
            <section className="py-10 bg-white">
              <div className="max-w-7xl mx-auto px-6 lg:px-10 -mt-24 relative z-10">
                <SearchBar filters={filters} setFilters={setFilters} onSearch={handleSearch} />
              </div>
            </section>
            <Listings listings={listings} loading={loading} error={error} source={source} title="Biens à vendre" kicker="Résultats" />
            <TrustGuarantees />
            <CTA onPublish={handlePublish} />
          </>
        )}

        {currentView === 'louer' && (
          <>
            <PageHero kicker="Location" title="Le bon appartement, sans les mauvaises surprises." subtitle="Locations longue durée, meublées ou non, avec dossier sécurisé." />
            <section className="py-10 bg-white">
              <div className="max-w-7xl mx-auto px-6 lg:px-10 -mt-24 relative z-10">
                <SearchBar filters={filters} setFilters={setFilters} onSearch={handleSearch} />
              </div>
            </section>
            <Listings listings={listings} loading={loading} error={error} source={source} title="Biens à louer" kicker="Résultats" />
            <TrustGuarantees />
            <CTA onPublish={handlePublish} />
          </>
        )}

        {currentView === 'investir' && (
          <InvestirView listings={listings} loading={loading} error={error} source={source} />
        )}

        {currentView === 'tarifs' && (
          <TarifsView onPublish={handlePublish} />
        )}

        {currentView === 'publier' && (
          <PublierView user={user} onSignIn={openSignUp} />
        )}

        {currentView === 'admin' && role === 'admin' && (
          <AdminPreview />
        )}

        {currentView === 'profil' && (
          <ProfilView user={user} />
        )}

        {currentView === 'favoris' && (
          <FavorisView user={user} />
        )}

        {currentView === 'mes-annonces' && (
          <MesAnnoncesView user={user} onPublish={handlePublish} />
        )}

        {currentView === 'register-pro' && (
          <RegisterProView setCurrentView={setCurrentView} />
        )}

        {currentView === 'verification' && (
          <AgencyVerificationView setCurrentView={setCurrentView} />
        )}

        {currentView === 'alerts' && (
          <AlertsView user={user} />
        )}
      </main>

      <Footer setCurrentView={setCurrentView} />

      {/* Mobile UX */}
      <MobileStickyCTA onPublish={handlePublish} visible={currentView !== 'publier'} />
      <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} onPublish={handlePublish} />

      {/* AuthModal removed — auth is now handled by /auth/login and /auth/register pages */}
    </div>
  )
}

/* ============================================================================
   Search Results Page — Étape 6
   ============================================================================ */

function ResultsSkeleton({ viewMode }) {
  return viewMode === 'grid' ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-soft animate-pulse">
          <div className="aspect-[4/3] bg-slate-100" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-5 bg-slate-100 rounded w-2/5" />
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse flex h-36">
          <div className="w-48 bg-slate-100 shrink-0" />
          <div className="flex-1 p-5 space-y-3">
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
            <div className="h-5 bg-slate-100 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ResultsGrid({ listings, onSelect }) {
  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {listings.map((raw, idx) => {
        const l = enrichWithMeta(raw, idx)
        return (
          <motion.article
            key={l.id}
            onClick={() => onSelect?.(raw, idx)}
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } }}
            whileHover={{ y: -6 }}
            className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-cardHover transition-shadow duration-300 cursor-pointer"
          >
            <div className="relative overflow-hidden aspect-[4/3]">
              <img src={l.image_url || unsplash('photo-1560448204-e02f11c3d0e2', 900)} alt={l.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 900) }} />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
              {l.is_premium && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-soft">
                  <Icons.Star size={11} fill="white" /> Premium
                </div>
              )}
              <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-soft">
                <Icons.Heart size={14} />
              </button>
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur text-navy-900 text-[11px] font-bold px-2 py-1 rounded-full shadow-soft">
                <Icons.ShieldCheckBig size={12} className="text-emerald-500" /> Score {l.trust_score}/100
              </div>
            </div>
            <div className="p-5">
              <div className="font-bold text-navy-900 text-base mb-1 truncate">{l.title}</div>
              <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
                <Icons.MapPin size={13} className="text-orange-500 shrink-0" />
                <span className="truncate">{l.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-extrabold text-navy-900">{formatPrice(l)}</div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {l.rooms   && <span className="flex items-center gap-1"><Icons.Home size={12} /> {l.rooms}p.</span>}
                  {l.surface && <span className="flex items-center gap-1"><Icons.Maximize size={12} /> {l.surface}m²</span>}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2">{l.agency}</div>
            </div>
          </motion.article>
        )
      })}
    </motion.div>
  )
}

function ResultsList({ listings, onSelect }) {
  return (
    <div className="space-y-3">
      {listings.map((raw, idx) => {
        const l = enrichWithMeta(raw, idx)
        return (
          <motion.article
            key={l.id}
            onClick={() => onSelect?.(raw, idx)}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.35 }}
            className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-cardHover transition-all cursor-pointer flex items-stretch"
          >
            <div className="relative w-52 shrink-0 overflow-hidden">
              <img src={l.image_url || unsplash('photo-1560448204-e02f11c3d0e2', 900)} alt={l.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 900) }} />
              {l.is_premium && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                  <Icons.Star size={10} fill="white" /> Premium
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-between">
              <div>
                <div className="font-bold text-navy-900 text-base mb-1">{l.title}</div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Icons.MapPin size={13} className="text-orange-500 shrink-0" /> {l.location}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-4 flex-wrap mt-3">
                  <span className="text-xl font-extrabold text-navy-900">{formatPrice(l)}</span>
                  {l.rooms   && <span className="flex items-center gap-1 text-sm text-slate-500"><Icons.Home size={13} /> {l.rooms} p.</span>}
                  {l.surface && <span className="flex items-center gap-1 text-sm text-slate-500"><Icons.Maximize size={13} /> {l.surface} m²</span>}
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Icons.ShieldCheckBig size={12} className="text-emerald-500" /> Score {l.trust_score}/100
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{l.agency}</div>
              </div>
            </div>
            <div className="flex items-center pr-4">
              <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                <Icons.ArrowRight size={15} />
              </div>
            </div>
          </motion.article>
        )
      })}
    </div>
  )
}

function SearchResultsPage({ listings, loading, error, source, filters, setFilters, onSearch, onBack, onSelect }) {
  const [sortBy,   setSortBy]   = useState('relevance')
  const [viewMode, setViewMode] = useState('grid')

  const sorted = useMemo(() => {
    const arr = [...listings]
    if (sortBy === 'price-asc')  arr.sort((a, b) => (a.price||0) - (b.price||0))
    if (sortBy === 'price-desc') arr.sort((a, b) => (b.price||0) - (a.price||0))
    if (sortBy === 'surface')    arr.sort((a, b) => (b.surface||0) - (a.surface||0))
    return arr
  }, [listings, sortBy])

  const chips = [
    filters.location     && { key: 'location',     label: filters.location,                                           reset: { location: '' } },
    filters.propertyType && { key: 'propertyType',  label: filters.propertyType,                                        reset: { propertyType: '' } },
    filters.priceMax     && { key: 'priceMax',      label: `≤ ${Number(filters.priceMax).toLocaleString('fr-FR')} €`,  reset: { priceMax: '' } },
    filters.surfaceMin   && { key: 'surfaceMin',    label: `≥ ${filters.surfaceMin} m²`,                               reset: { surfaceMin: '' } },
    filters.roomsMin     && { key: 'roomsMin',      label: `${filters.roomsMin}+ pièces`,                              reset: { roomsMin: '' } },
  ].filter(Boolean)

  const removeChip = ({ reset }) => { const next = { ...filters, ...reset }; setFilters(next); onSearch(reset) }
  const resetAll   = () => {
    const next = { ...filters, location: '', propertyType: '', priceMax: '', surfaceMin: '', roomsMin: '' }
    setFilters(next); onSearch(next)
  }

  const typeLabel = filters.type === 'louer' ? 'à louer' : filters.type === 'investir' ? 'à investir' : 'à acheter'

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Breadcrumb bar ──────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-900 transition-colors">
            <Icons.ChevronLeft size={16} /> Accueil
          </button>
          <span className="text-slate-200">/</span>
          {loading
            ? <span className="h-4 w-36 bg-slate-100 rounded animate-pulse inline-block" />
            : <span className="text-sm text-slate-700">
                <span className="font-bold text-navy-900">{sorted.length} bien{sorted.length !== 1 ? 's' : ''}</span>
                {' '}{typeLabel}
                {filters.location && <span className="text-orange-600"> · {filters.location}</span>}
                {source === 'fallback' && <span className="ml-1.5 text-xs text-slate-400">(démo)</span>}
              </span>
          }
        </div>
      </div>

      {/* ── Refinement SearchBar ─────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5">
          <SearchBar filters={filters} setFilters={setFilters} onSearch={onSearch} />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trier par</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-orange-400 appearance-none cursor-pointer">
              <option value="relevance">Pertinence</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="surface">Surface</option>
            </select>
          </div>

          {/* Grid / List toggle */}
          <div className="flex items-center gap-0.5 p-1 bg-white border border-slate-200 rounded-xl">
            {[
              { id: 'grid', title: 'Grille', path: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></> },
              { id: 'list', title: 'Liste',  path: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></> },
            ].map(({ id, title, path }) => (
              <button key={id} onClick={() => setViewMode(id)} title={title}
                className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${viewMode === id ? 'bg-navy-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{path}</svg>
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {chips.map(chip => (
              <button key={chip.key} onClick={() => removeChip(chip)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-orange-600 text-white text-xs font-semibold rounded-full transition-colors">
                {chip.label} <Icons.X size={11} />
              </button>
            ))}
            {chips.length > 1 && (
              <button onClick={resetAll}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-500 border border-slate-200 rounded-full transition-colors">
                Tout effacer
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 mb-6 bg-orange-50 border border-orange-100 text-orange-700 rounded-2xl text-sm">
            <Icons.AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>Affichage de la sélection démo — {error}</span>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <ResultsSkeleton viewMode={viewMode} />
        ) : sorted.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-soft">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <Icons.Search size={24} className="text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">Aucun bien ne correspond</h3>
            <p className="text-slate-500 text-sm mb-6">Essayez d'élargir vos critères de recherche.</p>
            <button onClick={resetAll}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-full transition-colors">
              Réinitialiser les filtres
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <ResultsGrid listings={sorted} onSelect={onSelect} />
        ) : (
          <ResultsList listings={sorted} onSelect={onSelect} />
        )}
      </div>
    </div>
  )
}

/* ============================================================================
   Property Detail Page
   ============================================================================ */

const DPE_BANDS = {
  A: { color: '#00A651', textColor: 'white' },
  B: { color: '#51B948', textColor: 'white' },
  C: { color: '#BECE00', textColor: '#1a1a1a' },
  D: { color: '#FECB00', textColor: '#1a1a1a' },
  E: { color: '#FB7A08', textColor: 'white' },
  F: { color: '#EE3424', textColor: 'white' },
  G: { color: '#C50D13', textColor: 'white' },
}

function DPEBadge({ band = 'C' }) {
  const b = DPE_BANDS[band] || DPE_BANDS.C
  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-slate-500 font-medium w-28">Étiquette DPE</div>
      <div style={{ background: b.color, color: b.textColor }}
        className="px-3 py-1 rounded text-sm font-bold min-w-[32px] text-center">
        {band}
      </div>
    </div>
  )
}

const _DETAIL_DESCS = [
  "Magnifique bien en excellent état, idéalement situé dans un quartier prisé et calme. Lumineux et fonctionnel, il offre des prestations haut de gamme avec une vue dégagée.",
  "Rare sur le marché, ce bien d'exception vous séduira par son charme et sa qualité de construction. Exposition plein sud, volumes généreux, emplacement de premier choix.",
  "Coup de cœur assuré pour ce bien soigneusement rénové avec des matériaux nobles. Architecture élégante, intérieur design et moderne, à deux pas des commerces et transports.",
  "Dans une résidence sécurisée à l'architecture contemporaine, ce bien bénéficie de finitions haut de gamme et d'espaces parfaitement agencés. Idéal pour une première acquisition.",
]

const _DETAIL_FEATURES = [
  ['Double vitrage', 'Parquet bois', 'Cuisine équipée', 'Interphone vidéo'],
  ['Cave privative', 'Gardien 24h/24', 'Fibre optique', 'Digicode'],
  ['Parking inclus', 'Ascenseur', 'Terrasse', 'Cellier'],
  ['Balcon', 'Lumineux', 'Traversant', 'Parquet bois'],
]

function generateDetail(l, idx = 0) {
  const seed = typeof l.id === 'string' ? (l.id.charCodeAt(0) || idx + 1) : idx + 1
  return {
    dpe: ['A','B','C','C','D','D','E'][seed % 7],
    floor: (seed % 6) + 1,
    totalFloors: (seed % 4) + 4,
    yearBuilt: 1970 + (seed % 55),
    features: _DETAIL_FEATURES[seed % _DETAIL_FEATURES.length],
    description: _DETAIL_DESCS[seed % _DETAIL_DESCS.length],
    coOwnershipCharges: seed % 3 === 0 ? null : 150 + (seed % 12) * 25,
    propertyTax: 800 + (seed % 20) * 50,
  }
}

const _GALLERY_IDS = [
  'photo-1484154218962-a197022b5858',
  'photo-1556909114-f6e7ad7d3136',
  'photo-1512917774080-9991f1c4c750',
  'photo-1493809842364-78817add7ffb',
]

function PropertyDetailPage({ listing: raw, idx = 0, onBack, onOpenListing, similarListings = [] }) {
  const l = enrichWithMeta(raw, idx)
  const detail = generateDetail(l, idx)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [showContact, setShowContact] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    message: "Bonjour, je suis intéressé(e) par ce bien et souhaite obtenir plus d'informations.",
  })
  const [sent, setSent] = useState(false)

  const photos = [
    l.image_url || unsplash('photo-1560448204-e02f11c3d0e2', 1200),
    ..._GALLERY_IDS.map(id => unsplash(id, 900)),
  ]

  const handleSend = (e) => { e.preventDefault(); setSent(true) }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center gap-3">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-900 transition-colors">
            <Icons.ChevronLeft size={16} /> Retour
          </button>
          <span className="text-slate-200">/</span>
          <span className="text-sm text-slate-700 truncate max-w-xs md:max-w-none">{l.title}</span>
          {l.is_premium && (
            <span className="ml-auto flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
              <Icons.Star size={10} fill="currentColor" /> Premium
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">

          {/* ── Left col ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-200" style={{ aspectRatio: '16/9' }}>
              <img src={photos[photoIdx]} alt={l.title}
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 1200) }} />
              {photoIdx > 0 && (
                <button onClick={() => setPhotoIdx(i => i - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition">
                  <Icons.ChevronLeft size={18} />
                </button>
              )}
              {photoIdx < photos.length - 1 && (
                <button onClick={() => setPhotoIdx(i => i + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition">
                  <Icons.ChevronRight size={18} />
                </button>
              )}
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                {photoIdx + 1} / {photos.length}
              </div>
              <div className="absolute top-3 left-3 flex gap-2">
                {l.is_new     && <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Nouveau</span>}
                {l.is_urgent  && <span className="bg-red-500    text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Urgent</span>}
                {l.is_popular && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Populaire</span>}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((src, i) => (
                <button key={i} onClick={() => setPhotoIdx(i)}
                  className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === photoIdx ? 'border-orange-500' : 'border-transparent opacity-60 hover:opacity-90'}`}>
                  <img src={src} alt="" className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 200) }} />
                </button>
              ))}
            </div>

            {/* Key stats */}
            <div className="bg-white rounded-2xl p-5 shadow-soft">
              <h1 className="text-xl font-extrabold text-navy-900 mb-1">{l.title}</h1>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                <Icons.MapPin size={14} className="text-orange-500" /> {l.location}
              </div>
              <div className="flex items-center gap-6 flex-wrap border-t border-slate-100 pt-4">
                <div>
                  <div className="text-2xl font-extrabold text-navy-900">{formatPrice(l)}</div>
                  {l.type === 'louer' && <div className="text-xs text-slate-400 mt-0.5">charges incluses</div>}
                </div>
                {l.rooms && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-navy-900">{l.rooms}</div>
                    <div className="text-xs text-slate-400">pièces</div>
                  </div>
                )}
                {l.surface && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-navy-900">{l.surface} m²</div>
                    <div className="text-xs text-slate-400">surface</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-lg font-bold text-navy-900">{detail.floor}<span className="text-sm font-normal text-slate-400">/{detail.totalFloors}</span></div>
                  <div className="text-xs text-slate-400">étage</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-navy-900">{detail.yearBuilt}</div>
                  <div className="text-xs text-slate-400">construit</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 shadow-soft">
              <h2 className="font-bold text-navy-900 mb-3">Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{detail.description}</p>
            </div>

            {/* Characteristics + DPE */}
            <div className="bg-white rounded-2xl p-5 shadow-soft">
              <h2 className="font-bold text-navy-900 mb-4">Caractéristiques</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {detail.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <Icons.Check size={14} className="text-emerald-500 shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <DPEBadge band={detail.dpe} />
                {detail.coOwnershipCharges && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-xs text-slate-500 font-medium w-28">Charges copro.</span>
                    <span className="font-semibold text-slate-700">{detail.coOwnershipCharges} €/mois</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-slate-500 font-medium w-28">Taxe foncière</span>
                  <span className="font-semibold text-slate-700">{detail.propertyTax} €/an</span>
                </div>
              </div>
            </div>

            {/* Similar listings */}
            {similarListings.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <h2 className="font-bold text-navy-900 mb-4">Biens similaires</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similarListings.slice(0, 4).map((raw2, i) => {
                    const s = enrichWithMeta(raw2, i + 10)
                    return (
                      <div key={s.id}
                        className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => onOpenListing?.(raw2, i + 10)}>
                        <img src={s.image_url || unsplash('photo-1560448204-e02f11c3d0e2', 400)} alt={s.title}
                          className="w-20 h-16 rounded-xl object-cover shrink-0"
                          onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 400) }} />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-navy-900 truncate">{s.title}</div>
                          <div className="text-xs text-slate-400 truncate">{s.location}</div>
                          <div className="text-sm font-bold text-orange-600 mt-1">{formatPrice(s)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right col: sticky agent card ──────────────── */}
          <div className="mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-[72px] space-y-4">

              {/* Trust score */}
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Icons.ShieldCheckBig size={22} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-bold text-navy-900">Score de confiance</div>
                    <div className="text-xs text-slate-400">{l.agency}</div>
                  </div>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-extrabold text-navy-900">{l.trust_score}</span>
                  <span className="text-slate-400 text-sm mb-1">/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${l.trust_score}%` }} />
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Icons.Eye size={12} /> {l.viewers} vues</span>
                  {l.contacts_today > 0 && (
                    <span className="flex items-center gap-1"><Icons.Users size={12} /> {l.contacts_today} contacts</span>
                  )}
                </div>
              </div>

              {/* Contact card */}
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Icons.User size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 text-sm">Agence PASMAL</div>
                    <div className="text-xs text-slate-400">{l.agency}</div>
                  </div>
                </div>

                {!showContact && !sent ? (
                  <button onClick={() => setShowContact(true)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2">
                    <Icons.Mail size={16} /> Contacter l'agence
                  </button>
                ) : sent ? (
                  <div className="text-center py-4">
                    <Icons.CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
                    <div className="font-semibold text-navy-900">Message envoyé !</div>
                    <div className="text-xs text-slate-400 mt-1">L'agence vous répondra sous 24h.</div>
                  </div>
                ) : (
                  <form onSubmit={handleSend} className="space-y-3">
                    <input type="text" required placeholder="Votre nom" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                    <input type="email" required placeholder="Email" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                    <input type="tel" placeholder="Téléphone (optionnel)" value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                    <textarea rows={3} value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none" />
                    <button type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2">
                      <Icons.Send size={15} /> Envoyer
                    </button>
                    <button type="button" onClick={() => setShowContact(false)}
                      className="w-full text-xs text-slate-400 hover:text-slate-600 py-1">
                      Annuler
                    </button>
                  </form>
                )}

                {!sent && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
                    <Icons.Phone size={12} /> <span>01 23 45 67 89</span>
                  </div>
                )}
              </div>

              {/* Urgency signal */}
              {(l.is_urgent || l.viewers > 15) && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
                  <Icons.Zap size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-orange-700 text-sm">
                      {l.is_urgent ? 'Bien en forte demande' : 'Très consulté'}
                    </div>
                    <p className="text-orange-600 text-xs mt-0.5">
                      {l.viewers} personnes ont vu ce bien cette semaine. Ne tardez pas.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function applyClientFilters(items, f) {
  return items.filter((i) => {
    if (f.type && i.type !== f.type) return false
    if (f.propertyType && i.property_type !== f.propertyType) return false
    if (f.location && !`${i.city || ''} ${i.district || ''} ${i.location || ''}`.toLowerCase().includes(f.location.toLowerCase())) return false
    if (f.priceMax   && typeof i.price   === 'number' && i.price   > Number(f.priceMax))   return false
    if (f.surfaceMin && typeof i.surface === 'number' && i.surface < Number(f.surfaceMin)) return false
    if (f.roomsMin   && typeof i.rooms   === 'number' && i.rooms   < Number(f.roomsMin))   return false
    return true
  })
}
