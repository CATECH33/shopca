import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import LocationSearch from './components/LocationSearch.tsx'
import LocationAutocomplete from './components/LocationAutocomplete.jsx'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView, useScroll, useTransform, animate } from 'framer-motion'
import { TrustGuarantees } from './lib/trustBadges.jsx'
import AdminPreview from './admin/AdminPreview.jsx'
import AlertsView          from './alerts/AlertsView.jsx'
import AuthModal           from './features/auth/components/AuthModal.jsx'
import NotificationCenter from './notifications/NotificationCenter.jsx'
import { supabase } from './lib/supabase.js'
import LoggedInHome          from './components/LoggedInHome.jsx'
import PersonalDashboard     from './components/PersonalDashboard.jsx'
import ProfessionalDashboard from './components/ProfessionalDashboard.jsx'

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
  Key:      (p) => (<svg {...svgBase(p?.size)} className={p?.className}><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>),
  Info:     (p) => (<svg {...svgBase(p?.size)} className={p?.className}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>),
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
  { id: 'f1', title: 'Studio cosy lumineux',      location: 'Paris 11ᵉ · Bastille', price: 320000,  rooms: 1, surface: 28,  type: 'acheter', property_type: 'Studio',     is_premium: true,                   image_url: unsplash('photo-1502672260266-1c1ef2d93688', 900) },
  { id: 'f2', title: 'T3 avec balcon vue dégagée', location: 'Lyon 6ᵉ · Foch',      price: 485000,  rooms: 3, surface: 65,  type: 'acheter', property_type: 'T3',         is_exclusive: true,                 image_url: unsplash('photo-1560448204-e02f11c3d0e2', 900) },
  { id: 'f3', title: 'Maison contemporaine',        location: 'Bordeaux · Caudéran', price: 780000,  rooms: 5, surface: 142, type: 'acheter', property_type: 'Maison',                                         image_url: unsplash('photo-1564013799919-ab600027ffc6', 900) },
  { id: 'f4', title: 'Colocation design 4 ch.',     location: 'Nantes · Centre',     price: 590,     rooms: 4, surface: 110, type: 'colocation', property_type: 'Colocation',                                  image_url: unsplash('photo-1522708323590-d24dbb6b0267', 900) },
  { id: 'f5', title: 'Loft industriel rénové',      location: 'Marseille · Joliette',price: 1450,    rooms: 2, surface: 72,  type: 'louer',   property_type: 'T2',         is_premium: true,                   image_url: unsplash('photo-1493809842364-78817add7ffb', 900) },
  { id: 'f6', title: 'Appartement haussmannien',    location: 'Paris 8ᵉ · Monceau', price: 1250000, rooms: 4, surface: 98,  type: 'acheter', property_type: 'Appartement', is_prestige: true,                  image_url: unsplash('photo-1600585154340-be6161a56a0c', 900) },
  { id: 'f7', title: 'Studio étudiant moderne',     location: 'Toulouse · Capitole', price: 620,     rooms: 1, surface: 24,  type: 'louer',   property_type: 'Studio',                                         image_url: unsplash('photo-1554995207-c18c203602cb', 900) },
  { id: 'f8', title: 'Villa avec piscine',           location: 'Nice · Cimiez',      price: 2100000, rooms: 6, surface: 220, type: 'acheter', property_type: 'Villa',       is_prestige: true,                  image_url: unsplash('photo-1613490493576-7fde63acd811', 900) },
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

const HOW_IT_WORKS_TABS = [
  {
    id: 'acheteur', label: 'Acheteur', icon: Icons.Home, badge: '12 480 biens',
    steps: [
      { icon: Icons.Search,      title: 'Cherchez & filtrez',   desc: 'Accédez à + de 12 000 annonces vérifiées. Filtres avancés : surface, prix, DPE, quartier.' },
      { icon: Icons.Eye,         title: 'Visitez en confiance', desc: 'Chaque annonce est certifiée PASMAL Trust. Visite virtuelle 3D disponible sur tous les biens Premium.' },
      { icon: Icons.CheckCircle, title: 'Signez sereinement',   desc: 'Accompagnement juridique offert. De la promesse de vente à l\'acte authentique chez le notaire.' },
    ],
  },
  {
    id: 'vendeur', label: 'Vendeur', icon: Icons.PlusSquare, badge: '11 j délai moyen',
    steps: [
      { icon: Icons.Upload,      title: 'Publiez en 5 minutes', desc: 'Interface intuitive, photos optimisées automatiquement, description IA incluse dans l\'offre Premium.' },
      { icon: Icons.Sparkles,    title: 'Boostez votre visibilité', desc: 'Mise en avant en tête des résultats, alerte push aux acheteurs ciblés, accès anticipé Premium.' },
      { icon: Icons.BadgeCheck,  title: 'Vendez plus vite',     desc: 'Délai moyen de vente : 11 jours. Gestion des contacts et offres directement dans votre espace.' },
    ],
  },
  {
    id: 'investisseur', label: 'Investisseur', icon: Icons.TrendingUp, badge: '5,8 % rendement moy.',
    steps: [
      { icon: Icons.Zap,         title: 'Détectez les opportunités', desc: 'Alertes en temps réel sur les biens à fort potentiel locatif. Simulateur rendement intégré.' },
      { icon: Icons.Tag,         title: 'Analysez & comparez',   desc: 'Prix au m² par quartier, historique DPE, taux de vacance locative, fiscalité LMNP / Pinel.' },
      { icon: Icons.TrendingUp,  title: 'Maximisez votre rendement', desc: 'Accès exclusif aux dossiers off-market et aux ventes avant publication publique.' },
    ],
  },
]

const HOME_GUIDES = [
  { tag: 'Achat',          title: 'Primo-accédants : le guide complet 2026',          img: unsplash('photo-1554224155-6726b3ff858f', 400), time: '8 min' },
  { tag: 'Location',       title: 'Comprendre le bail de location en 5 points clés',  img: unsplash('photo-1560518883-ce09059eeffa', 400), time: '5 min' },
  { tag: 'Investissement', title: "LMNP : amortir son bien et réduire ses impôts",    img: unsplash('photo-1486325212027-8081e485255e', 400), time: '6 min' },
]

/* ============================================================================
   Auth Modal — legacy inline version (replaced by src/auth/AuthModal.jsx)
   ============================================================================ */
function _AuthModalLegacy({ open, mode: initialMode = 'signup', onClose, onNavigatePro }) {
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
            <button onClick={() => go('personal-dash')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50 text-left">
              <Icons.Home2 size={16} className="text-orange-500" />
              Mon tableau de bord
            </button>
            <button onClick={() => go('pro-dash')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50 text-left">
              <Icons.Building size={16} className="text-orange-500" />
              Dashboard Pro
              <span className="ml-auto text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 ring-1 ring-orange-200">Pro</span>
            </button>
            <Link to="/account" onClick={() => setOpen(false)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50">
              <Icons.User size={16} className="text-slate-600" /> Mon profil
            </Link>
            <button onClick={() => go('messages')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50 text-left">
              <Icons.Mail size={16} className="text-orange-500" />
              Messages
              <span className="ml-auto bg-orange-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </button>
            <button onClick={() => go('favoris')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50 text-left">
              <Icons.Heart size={16} className="text-slate-600" /> Mes favoris
            </button>
            <button onClick={() => go('mes-annonces')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50 text-left">
              <Icons.Home size={16} className="text-slate-600" /> Mes annonces
            </button>
            <Link to="/crm" onClick={() => setOpen(false)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50">
              <Icons.Users size={16} className="text-orange-500" />
              CRM Pro
              <span className="ml-auto text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 ring-1 ring-orange-200">Pro</span>
            </Link>
            <Link to="/forms" onClick={() => setOpen(false)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50">
              <Icons.FileText size={16} className="text-orange-500" />
              Formulaires
              <span className="ml-auto text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 ring-1 ring-orange-200">Pro</span>
            </Link>
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
            <Link to="/auth/logout" onClick={() => setOpen(false)} className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 ${isAdmin ? '' : 'border-t border-slate-100'}`}>
              <Icons.LogOut size={16} /> Déconnexion
            </Link>
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
    ['neuf', 'Programme Neuf'],
    ['marche', 'Tendances'],
    ['agences', 'Agences'],
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
              <button
                onClick={() => navigate('/crm')}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-full border ${
                  isOverlay
                    ? 'border-white/30 text-white/90 hover:text-orange-400 hover:border-orange-400/50'
                    : 'border-orange-200 text-orange-600 hover:bg-orange-50'
                }`}
              >
                <Icons.Users size={14} /> CRM
              </button>
              <button
                onClick={() => navigate('/forms')}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-full border ${
                  isOverlay
                    ? 'border-white/30 text-white/90 hover:text-orange-400 hover:border-orange-400/50'
                    : 'border-orange-200 text-orange-600 hover:bg-orange-50'
                }`}
              >
                <Icons.FileText size={14} /> Formulaires
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
              <LocationAutocomplete
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
   HowItWorks — tabbed 3-step explainer
   ============================================================================ */
function HowItWorks() {
  const [activeTab, setActiveTab] = useState('acheteur')
  const tab = HOW_IT_WORKS_TABS.find(t => t.id === activeTab)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* heading */}
        <div className="text-center mb-12">
          <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Comment ça marche</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
            Simple, rapide, sécurisé
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Que vous achetiez, vendiez ou investissiez — PASMAL vous guide à chaque étape.
          </p>
        </div>

        {/* tab strip */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {HOW_IT_WORKS_TABS.map(t => {
            const TabIcon = t.icon
            const isActive = t.id === activeTab
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <TabIcon size={15} />
                {t.label}
                <span className={`hidden sm:inline text-[11px] font-normal ${isActive ? 'text-orange-100' : 'text-slate-400'}`}>
                  {t.badge}
                </span>
              </button>
            )
          })}
        </div>

        {/* steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {tab.steps.map((step, i) => {
              const StepIcon = step.icon
              return (
                <div key={i} className="relative bg-slate-50 rounded-3xl p-8 flex flex-col gap-4 border border-slate-100 hover:border-orange-100 hover:shadow-card transition-all">
                  {/* step number */}
                  <div className="absolute top-6 right-6 w-7 h-7 rounded-full bg-orange-100 text-orange-500 text-xs font-extrabold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                    <StepIcon size={22} className="text-orange-500" />
                  </div>
                  <h3 className="font-bold text-[#0B1F3A] text-base">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}

/* ============================================================================
   HomeCities — top cities with avg price (reuses ACHAT_CITIES)
   ============================================================================ */
function HomeCities({ onSearch }) {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Par ville</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">Villes les plus recherchées</h2>
          </div>
          <button onClick={() => onSearch?.('France')} className="text-navy-700 hover:text-orange-600 font-medium text-sm flex items-center gap-1 transition-colors">
            Voir toutes les villes <Icons.ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {ACHAT_CITIES.map(city => (
            <button
              key={city.name}
              onClick={() => onSearch?.(city.name)}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer focus:outline-none"
            >
              <img src={city.img} alt={city.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                <div className="text-white font-bold text-sm truncate">{city.name}</div>
                <div className="text-white/70 text-[11px]">{(city.price / 1000).toFixed(0)}k €/m²</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================================
   HomeGuides — 3 editorial guides
   ============================================================================ */
function HomeGuides({ onViewAll }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Guides & conseils</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">L'immobilier, expliqué simplement</h2>
          </div>
          <button onClick={onViewAll} className="text-navy-700 hover:text-orange-600 font-medium text-sm flex items-center gap-1 transition-colors">
            Tous nos guides <Icons.ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOME_GUIDES.map(g => (
            <article key={g.title} className="group rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 hover:border-orange-100 hover:shadow-card transition-all cursor-pointer">
              <div className="aspect-video overflow-hidden">
                <img src={g.img} alt={g.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{g.tag}</span>
                  <span className="text-slate-400 text-xs">{g.time} de lecture</span>
                </div>
                <h3 className="text-[#0B1F3A] font-bold text-sm leading-snug group-hover:text-orange-600 transition-colors">{g.title}</h3>
              </div>
            </article>
          ))}
        </div>
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

        {/* À la carte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.45 }}
          className="mt-12 max-w-5xl mx-auto">
          <div className="text-center mb-7">
            <div className="text-orange-600 font-semibold text-xs tracking-wider uppercase mb-1">À la carte</div>
            <h3 className="text-xl font-extrabold text-navy-900">Boostez selon vos besoins</h3>
            <p className="text-slate-500 text-sm mt-1">Disponibles avec tous les plans, sans engagement.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                Icon: Icons.Zap,
                title: 'Remonter en tête',
                price: '4,90 €',
                sub: 'paiement unique',
                desc: 'Première position des résultats pendant 72h. Effet immédiat.',
                cta: 'Activer le boost',
                tag: null,
                color: '#F97316',
              },
              {
                Icon: Icons.Image,
                title: 'Pack Photos Pro',
                price: '49 €',
                sub: 'par annonce',
                desc: 'Photographe professionnel + retouches HDR livrées en 48h.',
                cta: 'Réserver un shoot',
                tag: 'Nouveau',
                color: '#6366F1',
              },
              {
                Icon: Icons.Sparkles,
                title: 'Estimation IA',
                price: '0 €',
                sub: 'gratuit',
                desc: 'Valeur vénale estimée en 30 secondes par notre modèle propriétaire.',
                cta: 'Estimer maintenant',
                tag: 'Gratuit',
                color: '#10B981',
              },
            ].map(({ Icon, title, price, sub, desc, cta, tag, color }, ai) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: ai * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative bg-white border border-slate-100 rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow overflow-hidden group cursor-pointer">
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                {tag && (
                  <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full border"
                    style={{ background: color + '15', color, borderColor: color + '60' }}>
                    {tag}
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ background: color + '18' }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="font-extrabold text-navy-900 mb-0.5">{title}</div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-xl font-extrabold text-navy-900">{price}</span>
                  <span className="text-xs text-slate-400">{sub}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{desc}</p>
                <button type="button"
                  className="w-full py-2 rounded-xl text-xs font-bold transition-all bg-slate-50 hover:bg-navy-900 hover:text-white border border-slate-100 hover:border-navy-900">
                  {cta}
                </button>
              </motion.div>
            ))}
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
              <li><button onClick={() => setCurrentView('estimation')} className="hover:text-orange-500 transition-colors">Estimation gratuite</button></li>
              <li><button onClick={() => setCurrentView('neuf')} className="hover:text-orange-500 transition-colors">Programme neuf</button></li>
              <li><button onClick={() => setCurrentView('simulateur')} className="hover:text-orange-500 transition-colors">Simulateur de prêt</button></li>
              <li><button onClick={() => setCurrentView('guides')} className="hover:text-orange-500 transition-colors">Guides & conseils</button></li>
              <li><button onClick={() => setCurrentView('marche')} className="hover:text-orange-500 transition-colors">Tendances du marché</button></li>
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
function ProfilView({ user, onPublish }) {
  const rawName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const email   = user?.email || ''
  const initials = rawName.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || email[0]?.toUpperCase() || 'U'
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '2026'
  const provider = user?.app_metadata?.provider === 'google' ? 'Google' : 'E-mail'

  const [tab,           setTab]           = useState('infos')
  const [editMode,      setEditMode]      = useState(false)
  const [editName,      setEditName]      = useState(rawName)
  const [editPhone,     setEditPhone]     = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const avatarInputRef = useRef(null)
  const [notifs, setNotifs] = useState({
    newListings: true, priceDrops: true, messages: true, offers: false, sms: false, push: true,
  })

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    const reader = new FileReader()
    reader.onload = ev => { setAvatarPreview(ev.target.result); setAvatarLoading(false) }
    reader.readAsDataURL(file)
  }

  const MOCK_ANNONCES = [
    { id: 'PSM-2441', title: 'T3 lumineux proche Bastille', city: 'Paris 11e', price: 580000, surface: 72, rooms: 3, status: 'active', views: 847, contacts: 12, daysLeft: 22, img: unsplash('photo-1502672260266-1c1ef2d93688', 300) },
    { id: 'PSM-2389', title: 'Studio meublé Croix-Rousse', city: 'Lyon 4e', price: 950, surface: 28, rooms: 1, status: 'active', views: 412, contacts: 6, daysLeft: 8, isLocation: true, img: unsplash('photo-1522708323590-d24dbb6b0267', 300) },
    { id: 'PSM-2201', title: 'Maison avec jardin 115m²', city: 'Bordeaux', price: 420000, surface: 115, rooms: 5, status: 'expired', views: 1240, contacts: 24, daysLeft: 0, img: unsplash('photo-1600585154340-be6161a56a0c', 300) },
  ]
  const MOCK_FAVORIS = [
    { id: 'F1', title: 'Appartement haussmannien 95m²', city: 'Paris 8e', price: 1250000, surface: 95, img: unsplash('photo-1484154218962-a197022b5858', 400) },
    { id: 'F2', title: 'Villa avec piscine', city: 'Nice', price: 890000, surface: 180, img: unsplash('photo-1493809842364-78817add7ffb', 400) },
    { id: 'F3', title: 'Loft industriel 88m²', city: 'Lyon', price: 320000, surface: 88, img: unsplash('photo-1556909114-f6e7ad7d3136', 400) },
  ]
  const MOCK_HISTORY = [
    { icon: Icons.Search,    color: 'orange',  text: 'Recherche : T3 Paris 11e ≤ 600 k€',         time: 'Il y a 2h' },
    { icon: Icons.Eye,       color: 'indigo',  text: 'Consulté : Appartement Bastille — PSM-2441', time: 'Il y a 3h' },
    { icon: Icons.Heart,     color: 'rose',    text: 'Ajouté aux favoris : Villa Nice',            time: 'Il y a 1j' },
    { icon: Icons.Bell,      color: 'emerald', text: 'Alerte créée : T2 Lyon ≤ 1 200 €/mois',     time: 'Il y a 2j' },
    { icon: Icons.Search,    color: 'orange',  text: 'Recherche : Maison Bordeaux avec jardin',    time: 'Il y a 3j' },
    { icon: Icons.Eye,       color: 'indigo',  text: 'Consulté : Maison Bordeaux — PSM-2201',      time: 'Il y a 3j' },
  ]
  const TRUST_BADGES = [
    { id: 'email',    label: 'E-mail vérifié',    icon: Icons.Mail,           done: !!email,     desc: 'Adresse confirmée' },
    { id: 'phone',    label: 'Téléphone',          icon: Icons.Phone,          done: !!editPhone, desc: 'Numéro confirmé' },
    { id: 'identity', label: 'Identité',           icon: Icons.IdCard,         done: false,       desc: 'Pièce d\'identité' },
    { id: 'active',   label: 'Membre actif',       icon: Icons.BadgeCheck,     done: true,        desc: 'Compte en règle' },
    { id: 'seller',   label: 'Certifié PASMAL',    icon: Icons.ShieldCheckBig, done: false,       desc: 'Validation équipe' },
  ]
  const trustScore = Math.round((TRUST_BADGES.filter(b => b.done).length / TRUST_BADGES.length) * 100)

  const TABS = [
    { id: 'infos',        label: 'Informations', icon: Icons.User },
    { id: 'statistiques', label: 'Statistiques', icon: Icons.TrendingUp },
    { id: 'annonces',     label: 'Mes annonces', icon: Icons.Building,   badge: MOCK_ANNONCES.filter(a => a.status === 'active').length },
    { id: 'favoris',      label: 'Favoris',      icon: Icons.Heart,      badge: MOCK_FAVORIS.length },
    { id: 'historique',   label: 'Historique',   icon: Icons.Eye },
    { id: 'parametres',   label: 'Paramètres',   icon: Icons.Bell },
  ]

  const inputCls2 = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition text-[#0B1F3A]'

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero banner ─────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0B1F3A] via-[#0e2040] to-[#162E52] pt-28 pb-0">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="flex items-end gap-6 pb-0">
            {/* Avatar with upload */}
            <div className="relative shrink-0 mb-4 group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-orange-500 text-white text-2xl font-extrabold flex items-center justify-center">{initials}</div>
                }
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                {avatarLoading
                  ? <Icons.Loader size={18} className="text-white animate-spin" />
                  : <Icons.Upload size={16} className="text-white" />
                }
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div className="flex-1 pb-4">
              <div className="text-white text-xl font-extrabold">{rawName || 'Utilisateur'}</div>
              <div className="text-white/60 text-sm">{email}</div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="text-white/40 text-xs flex items-center gap-1">
                  <Icons.BadgeCheck size={12} className="text-emerald-400" /> Membre depuis {memberSince}
                </span>
                <span className="text-white/40 text-xs">{provider}</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-6 pb-6">
              {[
                { value: MOCK_ANNONCES.filter(a => a.status === 'active').length, label: 'Annonces actives' },
                { value: MOCK_FAVORIS.length,  label: 'Favoris' },
                { value: `${trustScore}%`,     label: 'Score confiance' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-white text-xl font-extrabold">{s.value}</div>
                  <div className="text-white/40 text-[11px]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto pb-0 -mb-px">
            {TABS.map(t => {
              const TabIcon = t.icon
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                    tab === t.id
                      ? 'border-orange-400 text-white'
                      : 'border-transparent text-white/50 hover:text-white/80'
                  }`}>
                  <TabIcon size={14} />
                  {t.label}
                  {t.badge > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      tab === t.id ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60'
                    }`}>{t.badge}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

            {/* ── Infos ── */}
            {tab === 'infos' && (
              <div className="max-w-2xl">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="font-bold text-[#0B1F3A]">Informations personnelles</div>
                    {!editMode
                      ? <button onClick={() => setEditMode(true)} className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                          <Icons.PlusSquare size={13} /> Modifier
                        </button>
                      : <div className="flex gap-2">
                          <button onClick={() => setEditMode(false)} className="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">Annuler</button>
                          <button onClick={() => setEditMode(false)} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition">Enregistrer</button>
                        </div>
                    }
                  </div>

                  {editMode ? (
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nom complet</label>
                        <input value={editName} onChange={e => setEditName(e.target.value)} className={inputCls2} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Téléphone</label>
                        <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+33 6 00 00 00 00" className={inputCls2} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Adresse e-mail</label>
                        <input value={email} readOnly className={`${inputCls2} opacity-50 cursor-not-allowed`} />
                        <p className="text-[11px] text-slate-400 mt-1">L'e-mail ne peut pas être modifié ici.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {[
                        { label: 'Nom complet',          value: rawName || '—' },
                        { label: 'Adresse e-mail',        value: email || '—' },
                        { label: 'Téléphone',             value: editPhone || '—' },
                        { label: 'Méthode de connexion',  value: provider },
                        { label: 'Membre depuis',         value: memberSince },
                        { label: 'ID compte',             value: user?.id?.slice(0, 8).toUpperCase() + '…' || '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="px-6 py-4 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                          <span className="text-sm font-medium text-[#0B1F3A]">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trust badges */}
                <div className="mt-6 bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-bold text-[#0B1F3A] text-sm">Badges de confiance</div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${trustScore}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" />
                      </div>
                      <span className="text-xs font-bold text-orange-500">{trustScore}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {TRUST_BADGES.map((b, i) => {
                      const BIcon = b.icon
                      return (
                        <motion.div key={b.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                          className={`flex items-center gap-3 p-3 rounded-2xl border ${b.done ? 'bg-emerald-50/60 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${b.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            <BIcon size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-semibold ${b.done ? 'text-emerald-700' : 'text-slate-400'}`}>{b.label}</div>
                            <div className="text-[11px] text-slate-400">{b.desc}</div>
                          </div>
                          {b.done
                            ? <Icons.Check size={14} className="text-emerald-500 shrink-0" />
                            : <span className="text-[10px] font-semibold text-orange-500 border border-orange-200 px-2 py-0.5 rounded-full shrink-0">Compléter</span>
                          }
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Danger zone */}
                <div className="mt-6 bg-white rounded-3xl border border-rose-100 shadow-soft p-6">
                  <div className="font-bold text-[#0B1F3A] mb-1 text-sm">Zone de danger</div>
                  <p className="text-slate-500 text-xs mb-4">La suppression de votre compte est irréversible et entraîne la suppression de toutes vos annonces et données.</p>
                  <button className="text-xs font-semibold text-rose-500 hover:text-rose-600 border border-rose-200 hover:border-rose-400 px-4 py-2 rounded-xl transition">
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            )}

            {/* ── Statistiques ── */}
            {tab === 'statistiques' && (() => {
              const STAT_KPIS = [
                { label: 'Biens consultés',    value: 127, icon: Icons.Eye,        color: '#6366f1', bg: '#eef2ff' },
                { label: 'Recherches faites',  value: 43,  icon: Icons.Search,     color: '#f97316', bg: '#fff7ed' },
                { label: 'Contacts envoyés',   value: 8,   icon: Icons.Mail,       color: '#0ea5e9', bg: '#f0f9ff' },
                { label: 'Favoris ajoutés',    value: 12,  icon: Icons.Heart,      color: '#f43f5e', bg: '#fff1f2' },
              ]
              const TOP_SEARCHES = [
                { query: 'T3 Paris 11e ≤ 600 k€',      count: 14, last: 'Il y a 2h' },
                { query: 'Maison Lyon jardin ≤ 500 k€', count: 9,  last: 'Il y a 1j' },
                { query: 'Studio meublé Bordeaux',       count: 7,  last: 'Il y a 3j' },
                { query: 'Appartement Marseille 2p',     count: 5,  last: 'Il y a 5j' },
              ]
              /* 30-day activity sparkline — LCG seed */
              const W = 560; const H = 80; const pts = 30
              let seed = 42
              const raw = Array.from({ length: pts }, () => {
                seed = (seed * 1664525 + 1013904223) & 0xffffffff
                return 2 + ((seed >>> 0) % 8)
              })
              const maxV = Math.max(...raw)
              const coords = raw.map((v, i) => ({ x: (i / (pts - 1)) * W, y: H - (v / maxV) * (H - 6) }))
              const pathD = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
              const fillD = `${pathD} L${W},${H} L0,${H} Z`
              return (
                <div>
                  {/* KPI row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {STAT_KPIS.map(k => {
                      const KIcon = k.icon
                      return (
                        <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                          className="bg-white rounded-3xl border border-slate-100 shadow-soft p-5">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: k.bg }}>
                            <KIcon size={16} style={{ color: k.color }} />
                          </div>
                          <div className="text-2xl font-extrabold text-[#0B1F3A]">{k.value}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Activity chart */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-[#0B1F3A] text-sm">Activité — 30 derniers jours</div>
                      <span className="text-xs text-slate-400">Actions / jour</span>
                    </div>
                    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
                      <defs>
                        <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <path d={fillD} fill="url(#actGrad)" />
                      <path d={pathD} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" />
                      {coords.filter((_, i) => i % 5 === 0).map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#f97316" />
                      ))}
                    </svg>
                    <div className="flex justify-between text-[10px] text-slate-300 mt-1">
                      <span>J-30</span><span>J-20</span><span>J-10</span><span>Auj.</span>
                    </div>
                  </div>

                  {/* Top searches */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 font-bold text-[#0B1F3A] text-sm">Recherches les plus fréquentes</div>
                    <div className="divide-y divide-slate-50">
                      {TOP_SEARCHES.map((s, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                          <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                            <Icons.Search size={11} className="text-orange-500" />
                          </div>
                          <div className="flex-1 text-sm text-[#0B1F3A] font-medium truncate">{s.query}</div>
                          <span className="text-xs text-slate-400 shrink-0">{s.count}×</span>
                          <span className="text-[11px] text-slate-300 shrink-0 hidden sm:block">{s.last}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ── Annonces ── */}
            {tab === 'annonces' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="font-bold text-[#0B1F3A]">{MOCK_ANNONCES.length} annonce{MOCK_ANNONCES.length > 1 ? 's' : ''}</div>
                  <button onClick={onPublish} className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition">
                    <Icons.PlusSquare size={14} /> Nouvelle annonce
                  </button>
                </div>
                <div className="space-y-4">
                  {MOCK_ANNONCES.map(a => (
                    <div key={a.id} className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden flex items-stretch">
                      <div className="w-32 sm:w-44 shrink-0 overflow-hidden">
                        <img src={a.img} alt={a.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="font-bold text-[#0B1F3A] text-sm truncate">{a.title}</div>
                            <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              a.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>{a.status === 'active' ? 'Actif' : 'Expiré'}</span>
                          </div>
                          <div className="text-slate-500 text-xs flex items-center gap-1">
                            <Icons.MapPin size={11} className="text-orange-500" /> {a.city}
                          </div>
                          <div className="font-extrabold text-[#0B1F3A] mt-1">
                            {a.price.toLocaleString('fr-FR')} €{a.isLocation ? '/mois' : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="text-xs text-slate-400 flex items-center gap-1"><Icons.Eye size={11} /> {a.views} vues</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1"><Icons.Mail size={11} /> {a.contacts} contacts</span>
                          {a.status === 'active' && <span className="text-xs text-orange-500 font-medium">{a.daysLeft}j restants</span>}
                          {a.status === 'active'
                            ? <button className="ml-auto text-xs font-semibold text-indigo-600 hover:text-indigo-700 border border-indigo-200 px-3 py-1 rounded-xl transition">Modifier</button>
                            : <button onClick={onPublish} className="ml-auto text-xs font-semibold text-orange-600 hover:text-orange-700 border border-orange-200 px-3 py-1 rounded-xl transition">Relancer</button>
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Favoris ── */}
            {tab === 'favoris' && (
              <div>
                <div className="font-bold text-[#0B1F3A] mb-6">{MOCK_FAVORIS.length} bien{MOCK_FAVORIS.length > 1 ? 's' : ''} sauvegardé{MOCK_FAVORIS.length > 1 ? 's' : ''}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {MOCK_FAVORIS.map(f => (
                    <div key={f.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-card transition-all hover:-translate-y-1 cursor-pointer">
                      <div className="relative aspect-video overflow-hidden">
                        <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <button className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center text-rose-500 shadow hover:bg-rose-50 transition">
                          <Icons.Heart size={13} />
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="font-bold text-[#0B1F3A] text-sm truncate mb-0.5">{f.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                          <Icons.MapPin size={10} className="text-orange-500" /> {f.city}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="font-extrabold text-[#0B1F3A] text-sm">{f.price.toLocaleString('fr-FR')} €</div>
                          <div className="text-xs text-slate-400">{f.surface} m²</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Historique ── */}
            {tab === 'historique' && (
              <div className="max-w-2xl">
                <div className="font-bold text-[#0B1F3A] mb-6">Activité récente</div>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft divide-y divide-slate-50">
                  {MOCK_HISTORY.map((h, i) => {
                    const HIcon = h.icon
                    const colors = { orange: 'bg-orange-50 text-orange-500', indigo: 'bg-indigo-50 text-indigo-500', rose: 'bg-rose-50 text-rose-500', emerald: 'bg-emerald-50 text-emerald-500' }
                    return (
                      <div key={i} className="flex items-center gap-4 px-6 py-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors[h.color]}`}>
                          <HIcon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#0B1F3A] font-medium truncate">{h.text}</div>
                        </div>
                        <div className="text-xs text-slate-400 shrink-0">{h.time}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Paramètres ── */}
            {tab === 'parametres' && (
              <div className="max-w-2xl space-y-5">
                {[
                  { key: 'newListings', label: 'Nouvelles annonces',    desc: 'Soyez alerté en temps réel quand un bien correspond à vos critères.', channel: 'E-mail' },
                  { key: 'priceDrops',  label: 'Baisses de prix',        desc: "Recevez une notification quand le prix d'un de vos favoris baisse.", channel: 'Push' },
                  { key: 'messages',    label: 'Nouveaux messages',      desc: "Notifications quand un propriétaire ou acheteur vous répond.", channel: 'E-mail + SMS' },
                  { key: 'offers',      label: 'Offres et promotions',   desc: 'Recevez les offres exclusives et nouveautés PASMAL.', channel: 'E-mail' },
                  { key: 'sms',         label: 'Alertes SMS',            desc: 'Recevez les alertes urgentes par SMS (bien rare, baisse significative).', channel: 'SMS' },
                  { key: 'push',        label: 'Notifications push',     desc: 'Activez les notifications dans votre navigateur.', channel: 'Push' },
                ].map(s => (
                  <div key={s.key} className="bg-white rounded-3xl border border-slate-100 shadow-soft p-5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#0B1F3A] text-sm mb-0.5">{s.label}</div>
                      <div className="text-xs text-slate-500 leading-relaxed">{s.desc}</div>
                      <div className="text-[11px] text-slate-400 mt-1">Via : {s.channel}</div>
                    </div>
                    <button onClick={() => setNotifs(n => ({ ...n, [s.key]: !n[s.key] }))}
                      className={`shrink-0 w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${notifs[s.key] ? 'bg-orange-500' : 'bg-slate-200'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifs[s.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
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
const MOCK_MY_LISTINGS = [
  { id:'ml1', title:'T3 lumineux Bastille — 75m²',       city:'Paris',    price:485000, surface:75,  rooms:3, transaction:'vente',    plan:'visibilite', status:'active',   views:342, contacts:12, favorites:28, daysLeft:18, imgId:'photo-1502672260266-1c1ef2d93688', ref:'PSM-1084' },
  { id:'ml2', title:'Studio meublé Oberkampf — 26m²',    city:'Paris',    price:950,    surface:26,  rooms:1, transaction:'location', plan:'gratuit',    status:'expiring', views:89,  contacts:3,  favorites:7,  daysLeft:2,  imgId:'photo-1522708323590-d24dbb6b0267', ref:'PSM-2107' },
  { id:'ml3', title:'Maison 5p Caluire-et-Cuire — 132m²',city:'Lyon',     price:412000, surface:132, rooms:5, transaction:'vente',    plan:'premium',    status:'active',   views:527, contacts:24, favorites:45, daysLeft:22, imgId:'photo-1564013799919-ab600027ffc6', ref:'PSM-0938' },
  { id:'ml4', title:'Studio Chartrons — 30m²',            city:'Bordeaux', price:680,    surface:30,  rooms:1, transaction:'location', plan:'gratuit',    status:'archived', views:156, contacts:8,  favorites:12, daysLeft:0,  imgId:'photo-1484154218962-a197022b5858', ref:'PSM-0771' },
]

function MesAnnoncesView({ user, onPublish }) {
  const [activeTab,   setActiveTab]   = useState('all')
  const [boostTarget, setBoostTarget] = useState(null)
  const [listings,    setListings]    = useState(MOCK_MY_LISTINGS)

  const live         = listings.filter(l => l.status !== 'archived')
  const totalViews   = live.reduce((s, l) => s + l.views,    0)
  const totalContacts= live.reduce((s, l) => s + l.contacts, 0)
  const totalFavs    = live.reduce((s, l) => s + l.favorites,0)
  const convRate     = totalViews ? ((totalContacts / totalViews) * 100).toFixed(1) : '0.0'

  const archiveListing = id => setListings(p => p.map(l => l.id === id ? { ...l, status:'archived', daysLeft:0 } : l))
  const renewListing   = id => setListings(p => p.map(l => l.id === id ? { ...l, status:'active',   daysLeft:30 } : l))

  const TABS = [
    { id:'all',      label:'Toutes',           count:listings.length },
    { id:'active',   label:'Actives',           count:listings.filter(l=>l.status==='active').length },
    { id:'expiring', label:'Expirent bientôt',  count:listings.filter(l=>l.status==='expiring').length },
    { id:'archived', label:'Archivées',          count:listings.filter(l=>l.status==='archived').length },
  ]
  const filtered = activeTab==='all' ? listings
    : listings.filter(l => l.status === (activeTab==='active'?'active':activeTab==='expiring'?'expiring':'archived'))

  return (
    <motion.div key="mes-annonces"
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
      className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0B1F3A]">Mes annonces</h1>
            <p className="text-slate-500 text-sm mt-0.5">Suivez la performance et gérez vos biens publiés.</p>
          </div>
          <button onClick={onPublish}
            className="flex items-center gap-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 px-5 py-2.5 rounded-2xl shadow-sm transition-colors">
            <Icons.PlusSquare size={15} /> Nouvelle annonce
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:'Vues totales',    val:totalViews.toLocaleString('fr-FR'), Icon:Icons.Eye,        cls:'text-indigo-600 bg-indigo-50' },
            { label:'Contacts reçus',  val:totalContacts,                       Icon:Icons.Mail,       cls:'text-orange-600 bg-orange-50' },
            { label:'Favoris',         val:totalFavs,                            Icon:Icons.Heart,      cls:'text-rose-600 bg-rose-50' },
            { label:'Taux de contact', val:`${convRate}%`,                       Icon:Icons.TrendingUp, cls:'text-emerald-600 bg-emerald-50' },
          ].map(({ label, val, Icon, cls }, i) => (
            <motion.div key={label}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${cls}`}><Icon size={14} /></div>
              <div className="text-xl font-extrabold tracking-tight text-[#0B1F3A]">{val}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        {(() => {
          let seed = 137
          const rng = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 4294967295 }
          const data = Array.from({ length: 30 }, () => Math.round(12 + rng() * 18 + rng() * 8))
          const maxV = Math.max(...data, 1)
          const W = 480, H = 72
          const toX = i => (i / 29) * W
          const toY = v => H - (v / maxV) * H * 0.84 - 4
          const line = data.map((v, i) => `${i===0?'M':'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')
          const area = line + ` L${toX(29).toFixed(1)},${H} L0,${H} Z`
          return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-sm text-[#0B1F3A]">Performance — 30 derniers jours</h3>
                  <p className="text-[11px] text-slate-400">Vues cumulées · toutes annonces</p>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />Vues
                </span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:'68px'}} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradMA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#gradMA)" />
                <path d={line} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {data.filter((_,i)=>i%6===0).map((v,i)=>(
                  <circle key={i} cx={toX(i*6)} cy={toY(v)} r="3.5" fill="white" stroke="#6366F1" strokeWidth="2" />
                ))}
              </svg>
              <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-0.5">
                {['J-30','J-24','J-18','J-12','J-6','Auj.'].map(l=><span key={l}>{l}</span>)}
              </div>
            </div>
          )
        })()}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-200/50 w-fit flex-wrap">
          {TABS.map(({ id, label, count }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab===id ? 'bg-white shadow-sm text-[#0B1F3A]' : 'text-slate-500 hover:text-slate-700'}`}>
              {label}
              {count > 0 && <span className={`text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${activeTab===id ? 'bg-orange-100 text-orange-600' : 'bg-slate-300/60 text-slate-500'}`}>{count}</span>}
            </button>
          ))}
        </div>

        {/* Listings — ListingRowCard added next */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 text-center">
                <Icons.Home size={26} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Aucune annonce dans cette catégorie.</p>
              </motion.div>
            ) : filtered.map((l, i) => (
              <ListingRowCard key={l.id} listing={l} index={i}
                onBoost={() => setBoostTarget(l)}
                onArchive={() => archiveListing(l.id)}
                onRenew={() => renewListing(l.id)} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {boostTarget && <BoostModal key="boost" listing={boostTarget} onClose={() => setBoostTarget(null)} />}
      </AnimatePresence>
    </motion.div>
  )
}

function ListingRowCard({ listing: l, index, onBoost, onArchive, onRenew }) {
  const PLAN = {
    gratuit:    { label:'Gratuit',        cls:'bg-slate-100 text-slate-500' },
    visibilite: { label:'Pack Visibilité',cls:'bg-orange-100 text-orange-700' },
    premium:    { label:'Premium',        cls:'bg-[#0B1F3A]/10 text-[#0B1F3A]' },
  }
  const STATUS = {
    active:   { label:'Active',          dot:'bg-emerald-500', cls:'text-emerald-700 bg-emerald-50' },
    expiring: { label:'Expire bientôt',  dot:'bg-amber-500 animate-pulse', cls:'text-amber-700 bg-amber-50' },
    archived: { label:'Archivée',         dot:'bg-slate-400', cls:'text-slate-500 bg-slate-100' },
  }
  const plan   = PLAN[l.plan]   || PLAN.gratuit
  const status = STATUS[l.status] || STATUS.archived
  const isRent = l.transaction === 'location'
  const isArch = l.status === 'archived'

  let sp = l.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const spark = Array.from({ length: 7 }, () => { sp = (sp * 1103515245 + 12345) & 0x7fffffff; return (sp % 35) + 10 })
  const sparkMax = Math.max(...spark)

  return (
    <motion.div layout
      initial={{ opacity:0, y:8 }} animate={{ opacity: isArch ? 0.65 : 1, y:0 }}
      exit={{ opacity:0, scale:0.98 }} transition={{ delay: index * 0.04, duration:0.25 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <div className="flex items-stretch">

        {/* Thumbnail */}
        <div className="relative w-24 sm:w-28 shrink-0">
          <img src={`https://images.unsplash.com/${l.imgId}?auto=format&fit=crop&w=200&q=70`}
            alt="" className="w-full h-full object-cover" />
          {l.status === 'expiring' && (
            <div className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-[9px] font-extrabold text-center py-0.5">
              {l.daysLeft}j restant
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md flex items-center gap-1 ${status.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />{status.label}
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${plan.cls}`}>{plan.label}</span>
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${isRent ? 'bg-sky-50 text-sky-700' : 'bg-indigo-50 text-indigo-700'}`}>{l.transaction}</span>
            <span className="ml-auto text-[10px] text-slate-400 font-mono hidden sm:block">{l.ref}</span>
          </div>
          <h3 className="font-bold text-sm text-[#0B1F3A] truncate mb-0.5">{l.title}</h3>
          <div className="text-[11px] text-slate-500 mb-3">
            {l.city} · {l.surface} m² · {l.rooms} p. · <span className="font-bold text-[#0B1F3A]">{l.price.toLocaleString('fr-FR')} €{isRent ? '/mois' : ''}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[{ Icon:Icons.Eye, val:l.views, lbl:'vues' },{ Icon:Icons.Mail, val:l.contacts, lbl:'contacts' },{ Icon:Icons.Heart, val:l.favorites, lbl:'favoris' }].map(({ Icon, val, lbl }) => (
              <span key={lbl} className="flex items-center gap-1 text-[11px]">
                <Icon size={11} className="text-slate-400" />
                <span className="font-bold text-[#0B1F3A]">{val}</span>
                <span className="text-slate-400">{lbl}</span>
              </span>
            ))}
            <div className="ml-auto hidden sm:flex items-end gap-0.5 h-5">
              {spark.map((v, i) => (
                <div key={i} className="w-1.5 rounded-t-sm bg-indigo-200 group-hover:bg-indigo-400 transition-colors"
                  style={{ height: `${Math.round((v / sparkMax) * 20)}px` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 p-3 border-l border-slate-50 justify-center shrink-0">
          {!isArch && (
            <button onClick={onBoost}
              className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-xl transition-colors">
              <Icons.Zap size={11} />Boost
            </button>
          )}
          {!isArch ? (
            <button onClick={onArchive}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              Archiver
            </button>
          ) : (
            <button onClick={onRenew}
              className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
              Republier
            </button>
          )}
          {!isArch && (
            <button onClick={onRenew}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              Renouveler
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function BoostModal({ listing: l, onClose }) {
  const [sel, setSel]         = useState(1)
  const [busy, setBusy]       = useState(false)
  const [done, setDone]       = useState(false)

  const OPTS = [
    { label:'Remonter en tête', price:'4,90', desc:'72h en 1ère position',    Icon:Icons.Zap },
    { label:'Pack Visibilité',  price:'9,90', desc:'+200% vues · 30 jours',   Icon:Icons.TrendingUp, popular:true },
    { label:'Premium',          price:'14,90',desc:'Top résultats · 30 jours',Icon:Icons.Star },
  ]
  const pay = () => {
    setBusy(true)
    setTimeout(() => { setBusy(false); setDone(true) }, 1800)
    setTimeout(() => { setDone(false); onClose() }, 3200)
  }

  return (
    <>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div initial={{ opacity:0, scale:0.95, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95 }} transition={{ duration:0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

          <div className="bg-gradient-to-br from-[#0B1F3A] to-[#162E52] px-6 py-5 relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <Icons.X size={15} className="text-white/80" />
            </button>
            <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Booster l'annonce</div>
            <h3 className="text-white font-extrabold pr-8 truncate">{l.title}</h3>
            <p className="text-white/55 text-xs mt-0.5">{l.city} · {l.surface} m²</p>
          </div>

          <div className="p-5 space-y-2.5">
            {OPTS.map(({ label, price, desc, Icon, popular }, id) => (
              <button key={id} onClick={() => setSel(id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${sel===id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${sel===id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}><Icon size={16} /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#0B1F3A] flex items-center gap-1.5">
                    {label}
                    {popular && <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-orange-500 text-white uppercase">Pop.</span>}
                  </div>
                  <div className="text-[11px] text-slate-500">{desc}</div>
                </div>
                <div className="font-extrabold text-sm text-[#0B1F3A] shrink-0">{price} €</div>
                {sel===id && <Icons.CheckCircle size={15} className="text-orange-500 shrink-0" />}
              </button>
            ))}
          </div>

          <div className="px-5 pb-5">
            <button onClick={pay} disabled={busy || done}
              className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all disabled:opacity-80 flex items-center justify-center gap-2">
              {done ? <><Icons.CheckCircle size={15} />Boost activé !</>
                    : busy ? <><Icons.Loader size={14} />Redirection Stripe…</>
                    : <><Icons.CreditCard size={14} />Payer — {OPTS[sel]?.price} €</>}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
              <Icons.Shield size={10} /> Paiement sécurisé · Stripe
            </p>
          </div>
        </div>
      </motion.div>
    </>
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

/* ============================================================================
   SellerVerificationView — wizard 4 étapes pour vendeurs particuliers
   ============================================================================ */
const SELLER_VER_BENEFITS = [
  { icon: Icons.BadgeCheck,     color: '#10b981', label: 'Badge certifié',          desc: 'Visible sur toutes vos annonces et votre profil.' },
  { icon: Icons.TrendingUp,     color: '#f97316', label: '3× plus de contacts',     desc: 'Les acheteurs font davantage confiance aux vendeurs vérifiés.' },
  { icon: Icons.Shield,         color: '#6366f1', label: 'Annonces prioritaires',   desc: 'Remontée automatique dans les résultats de recherche.' },
  { icon: Icons.ShieldCheckBig, color: '#0ea5e9', label: 'Transaction sécurisée',   desc: 'Accès à l\'escrow PASMAL et aux outils de signature.' },
]

const DOC_TYPES = [
  { id: 'cni',      label: 'Carte d\'identité' },
  { id: 'passport', label: 'Passeport' },
  { id: 'permit',   label: 'Permis de conduire' },
]

/* ============================================================================
   OnboardingView — wizard 5 étapes pour les nouveaux utilisateurs
   ============================================================================ */
const OB_PROJECTS = [
  { id: 'acheter',   icon: Icons.Home,       label: 'Acheter',    desc: 'Trouver votre résidence principale ou secondaire.' },
  { id: 'louer',     icon: Icons.Building,   label: 'Louer',      desc: 'Trouver un appartement ou une maison à louer.' },
  { id: 'vendre',    icon: Icons.Tag,        label: 'Vendre',     desc: 'Publier votre bien et trouver un acheteur.' },
  { id: 'investir',  icon: Icons.TrendingUp, label: 'Investir',   desc: 'Constituer ou développer votre patrimoine.' },
]

const OB_CITIES = ['Paris','Lyon','Marseille','Toulouse','Nice','Nantes','Bordeaux','Strasbourg','Lille','Rennes','Montpellier','Grenoble']

function OnboardingView({ user, setCurrentView, setFilters }) {
  const [step,       setStep]       = useState(0)
  const [projects,   setProjects]   = useState([])
  const [budgetMax,  setBudgetMax]  = useState(400000)
  const [surface,    setSurface]    = useState(40)
  const [rooms,      setRooms]      = useState(0)
  const [city,       setCity]       = useState('')
  const [citySugg,   setCitySugg]   = useState([])
  const [alertEmail, setAlertEmail] = useState(true)
  const [alertPush,  setAlertPush]  = useState(true)
  const [alertFreq,  setAlertFreq]  = useState('immediate')

  const firstName = (user?.user_metadata?.full_name || user?.user_metadata?.name || '').split(' ')[0] || null
  const isRent    = projects.includes('louer') && !projects.includes('acheter') && !projects.includes('investir')
  const budgetMax_ = isRent ? 3000  : 1000000
  const budgetMin_ = isRent ? 300   : 50000
  const budgetStep = isRent ? 50    : 10000
  const budgetFmt  = isRent ? `${budgetMax.toLocaleString('fr-FR')} €/mois` : `${budgetMax.toLocaleString('fr-FR')} €`

  function toggleProject(id) {
    setProjects(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  function handleCityInput(v) {
    setCity(v)
    if (v.length >= 2) setCitySugg(OB_CITIES.filter(c => c.toLowerCase().startsWith(v.toLowerCase())).slice(0, 6))
    else setCitySugg([])
  }

  function finish() {
    const mainProject = projects[0] || 'acheter'
    setFilters(f => ({
      ...f,
      type:       mainProject,
      location:   city,
      priceMax:   String(budgetMax),
      surfaceMin: surface > 0 ? String(surface) : '',
      roomsMin:   rooms  > 0 ? String(rooms)   : '',
    }))
    setCurrentView('results')
  }

  const STEPS = ['Bienvenue', 'Projet', 'Critères', 'Alertes', 'Prêt !']
  const canNext = [true, projects.length > 0, true, true, true]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white pt-16">
      {/* Progress */}
      <div className="sticky top-16 z-10 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-xl mx-auto px-6 py-3 flex items-center gap-2">
          {STEPS.map((lbl, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-1.5 ${i <= step ? 'text-orange-600' : 'text-slate-300'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold border-2 transition-all shrink-0 ${
                  i < step  ? 'bg-emerald-500 border-emerald-500 text-white' :
                  i === step? 'bg-orange-500 border-orange-500 text-white' :
                              'bg-white border-slate-200 text-slate-400'}`}>
                  {i < step ? <Icons.Check size={9} /> : i + 1}
                </div>
                <span className={`hidden sm:block text-xs font-semibold ${i === step ? 'text-orange-600' : i < step ? 'text-emerald-600' : 'text-slate-300'}`}>{lbl}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="h-0.5 bg-slate-100">
          <motion.div animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600" />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">

          {/* ── Step 0 : Bienvenue ── */}
          {step === 0 && (
            <motion.div key="ob0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <div className="text-center mb-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-5 shadow-2xl">
                  <Icons.Home size={36} className="text-white" />
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="text-3xl font-extrabold text-[#0B1F3A] mb-2">
                  Bienvenue{firstName ? `, ${firstName}` : ''} !
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-slate-500 max-w-sm mx-auto">
                  En 2 minutes, personnalisez PASMAL pour trouver exactement ce que vous cherchez.
                </motion.p>
              </div>
              <div className="grid grid-cols-1 gap-3 mb-8">
                {[
                  { icon: Icons.Search,    color: '#f97316', label: 'Annonces sur mesure',    desc: 'Résultats filtrés selon vos critères dès la première visite.' },
                  { icon: Icons.Bell,      color: '#6366f1', label: 'Alertes personnalisées', desc: 'Recevez les nouvelles annonces avant tout le monde.' },
                  { icon: Icons.TrendingUp,color: '#10b981', label: 'Dashboard adapté',       desc: 'Vos favoris, messages et annonces au même endroit.' },
                ].map((b, i) => {
                  const BI = b.icon
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07 }}
                      className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-soft p-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: b.color + '18' }}>
                        <BI size={18} style={{ color: b.color }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[#0B1F3A]">{b.label}</div>
                        <div className="text-xs text-slate-500">{b.desc}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              <button onClick={() => setStep(1)}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-base rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2">
                C'est parti ! <Icons.ArrowRight size={18} />
              </button>
              <button onClick={() => setCurrentView('home')} className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 transition py-2">
                Passer l'onboarding
              </button>
            </motion.div>
          )}

          {/* ── Step 1 : Projet ── */}
          {step === 1 && (
            <motion.div key="ob1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#0B1F3A] mb-1">Quel est votre projet ?</h2>
                <p className="text-slate-500 text-sm">Vous pouvez en sélectionner plusieurs.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {OB_PROJECTS.map(p => {
                  const PI = p.icon; const sel = projects.includes(p.id)
                  return (
                    <button key={p.id} onClick={() => toggleProject(p.id)}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all ${sel ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'}`}>
                      {sel && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <Icons.Check size={10} className="text-white" />
                        </div>
                      )}
                      <PI size={24} className={`mb-3 ${sel ? 'text-orange-500' : 'text-slate-400'}`} />
                      <div className={`font-extrabold text-base mb-0.5 ${sel ? 'text-orange-700' : 'text-[#0B1F3A]'}`}>{p.label}</div>
                      <div className="text-xs text-slate-500 leading-snug">{p.desc}</div>
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-2xl transition">
                  ← Retour
                </button>
                <button onClick={() => setStep(2)} disabled={projects.length === 0}
                  className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 text-white font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2">
                  Suivant <Icons.ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2 : Critères ── */}
          {step === 2 && (
            <motion.div key="ob2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#0B1F3A] mb-1">Vos critères</h2>
                <p className="text-slate-500 text-sm">Nous affinerons les résultats selon vos préférences.</p>
              </div>
              <div className="space-y-6">
                {/* Budget */}
                {!projects.every(p => p === 'vendre') && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget maximum</label>
                      <span className="text-sm font-extrabold text-orange-600">{budgetFmt}</span>
                    </div>
                    <input type="range" min={budgetMin_} max={budgetMax_} step={budgetStep} value={budgetMax}
                      onChange={e => setBudgetMax(Number(e.target.value))}
                      className="w-full accent-orange-500 h-2 rounded-full cursor-pointer" />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>{budgetMin_.toLocaleString('fr-FR')} €{isRent ? '/mois' : ''}</span>
                      <span>{budgetMax_.toLocaleString('fr-FR')} €{isRent ? '/mois' : ''}</span>
                    </div>
                  </div>
                )}

                {/* Surface */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Surface minimum</label>
                    <span className="text-sm font-extrabold text-orange-600">{surface} m²</span>
                  </div>
                  <input type="range" min={10} max={300} step={5} value={surface} onChange={e => setSurface(Number(e.target.value))}
                    className="w-full accent-orange-500 h-2 rounded-full cursor-pointer" />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>10 m²</span><span>300 m²</span>
                  </div>
                </div>

                {/* Pièces */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Nombre de pièces</div>
                  <div className="flex gap-2">
                    {[{ v: 0, l: 'Peu importe' }, { v: 1, l: 'Studio' }, { v: 2, l: '2P' }, { v: 3, l: '3P' }, { v: 4, l: '4P' }, { v: 5, l: '5P+' }].map(({ v, l }) => (
                      <button key={v} onClick={() => setRooms(v)}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${rooms === v ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ville */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ville ou région</label>
                  <div className="relative">
                    <Icons.MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
                    <input type="text" value={city} onChange={e => handleCityInput(e.target.value)}
                      onBlur={() => setTimeout(() => setCitySugg([]), 150)}
                      placeholder="Paris, Lyon, Bordeaux…"
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition" />
                  </div>
                  {citySugg.length > 0 && (
                    <div className="absolute left-5 right-5 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden">
                      {citySugg.map(s => (
                        <button key={s} onMouseDown={() => { setCity(s); setCitySugg([]) }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 text-[#0B1F3A] font-medium transition-colors">
                          <Icons.MapPin size={11} className="text-orange-500 inline mr-2" />{s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-2xl transition">
                  ← Retour
                </button>
                <button onClick={() => setStep(3)}
                  className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2">
                  Suivant <Icons.ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3 : Alertes ── */}
          {step === 3 && (
            <motion.div key="ob3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#0B1F3A] mb-1">Comment vous alerter ?</h2>
                <p className="text-slate-500 text-sm">Soyez le premier informé des nouvelles annonces correspondant à vos critères.</p>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  { state: alertEmail, setter: setAlertEmail, label: 'Alertes par e-mail',          desc: 'Recevez les nouvelles annonces directement dans votre boîte.' },
                  { state: alertPush,  setter: setAlertPush,  label: 'Notifications push',           desc: 'Notifications instantanées sur votre navigateur ou téléphone.' },
                  { state: alertFreq === 'digest', setter: (v) => setAlertFreq(v ? 'daily' : 'immediate'), label: 'Résumé quotidien', desc: 'Un seul e-mail par jour avec toutes les nouvelles annonces.' },
                ].map(({ state, setter, label, desc }) => (
                  <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#0B1F3A] mb-0.5">{label}</div>
                      <div className="text-xs text-slate-500">{desc}</div>
                    </div>
                    <button onClick={() => setter(s => !s)}
                      className={`shrink-0 w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${state ? 'bg-orange-500' : 'bg-slate-200'}`}>
                      <motion.div animate={{ x: state ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-5 h-5 bg-white rounded-full shadow" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Fréquence */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 mb-8">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Fréquence des alertes</div>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'immediate', label: 'Immédiatement',    desc: 'Dès qu\'une annonce est publiée' },
                    { id: 'daily',     label: '1 fois par jour',  desc: 'Récapitulatif chaque matin' },
                    { id: 'weekly',    label: '1 fois par semaine', desc: 'Résumé hebdomadaire le lundi' },
                  ].map(f => (
                    <button key={f.id} onClick={() => setAlertFreq(f.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${alertFreq === f.id ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${alertFreq === f.id ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
                        {alertFreq === f.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${alertFreq === f.id ? 'text-orange-700' : 'text-[#0B1F3A]'}`}>{f.label}</div>
                        <div className="text-xs text-slate-400">{f.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-2xl transition">
                  ← Retour
                </button>
                <button onClick={() => setStep(4)}
                  className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2">
                  Terminer <Icons.Check size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4 : Prêt ! ── */}
          {step === 4 && (
            <motion.div key="ob4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: 'backOut' }}
              className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-2xl">
                <Icons.CheckCircle size={44} className="text-white" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="text-2xl font-extrabold text-[#0B1F3A] mb-2">Votre profil est prêt !</h2>
                <p className="text-slate-500 mb-8">Voici un résumé de vos préférences. Vous pouvez les modifier à tout moment dans votre profil.</p>
              </motion.div>

              {/* Summary */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 text-left mb-8">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Récapitulatif</div>
                <div className="space-y-3">
                  {[
                    { icon: Icons.Home,       label: 'Projet',      value: projects.map(p => OB_PROJECTS.find(op => op.id === p)?.label).join(', ') || '—' },
                    { icon: Icons.CreditCard, label: 'Budget max',  value: budgetFmt },
                    { icon: Icons.Maximize,   label: 'Surface min', value: `${surface} m²` },
                    { icon: Icons.Bed,        label: 'Pièces min',  value: rooms > 0 ? `${rooms}P` : 'Peu importe' },
                    { icon: Icons.MapPin,     label: 'Ville',       value: city || 'France entière' },
                    { icon: Icons.Bell,       label: 'Alertes',     value: alertEmail ? `E-mail · ${alertFreq === 'immediate' ? 'Immédiat' : alertFreq === 'daily' ? '1×/jour' : '1×/semaine'}` : 'Désactivées' },
                  ].map(({ icon: RI, label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2 text-slate-500">
                        <RI size={13} className="text-orange-500 shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#0B1F3A]">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex flex-col gap-3">
                <button onClick={finish}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-base rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2">
                  <Icons.Search size={18} /> Voir mes annonces personnalisées
                </button>
                <button onClick={() => setCurrentView('profil')}
                  className="w-full py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-[#0B1F3A] font-semibold rounded-2xl transition flex items-center justify-center gap-2">
                  <Icons.User size={16} /> Accéder à mon profil
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

function SellerVerificationView({ setCurrentView }) {
  const [step,       setStep]       = useState(0)   // 0=intro 1=identité 2=téléphone 3=succès
  const [docType,    setDocType]    = useState('cni')
  const [rectoFile,  setRectoFile]  = useState(null)
  const [versoFile,  setVersoFile]  = useState(null)
  const [rectoUrl,   setRectoUrl]   = useState(null)
  const [versoUrl,   setVersoUrl]   = useState(null)
  const [phone,      setPhone]      = useState('')
  const [codeSent,   setCodeSent]   = useState(false)
  const [codeVals,   setCodeVals]   = useState(['','','','','',''])
  const [codeError,  setCodeError]  = useState(false)
  const [verifying,  setVerifying]  = useState(false)
  const rectoRef = useRef(null)
  const versoRef = useRef(null)
  const codeRefs = useRef([])

  function pickFile(side, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      if (side === 'recto') { setRectoFile(file); setRectoUrl(ev.target.result) }
      else                  { setVersoFile(file); setVersoUrl(ev.target.result) }
    }
    reader.readAsDataURL(file)
  }

  function handleCodeInput(i, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...codeVals]; next[i] = val
    setCodeVals(next); setCodeError(false)
    if (val && i < 5) codeRefs.current[i + 1]?.focus()
  }

  function handleCodeKeyDown(i, e) {
    if (e.key === 'Backspace' && !codeVals[i] && i > 0) codeRefs.current[i - 1]?.focus()
  }

  function sendCode() {
    if (phone.replace(/\s/g,'').length < 10) return
    setCodeSent(true)
    setTimeout(() => codeRefs.current[0]?.focus(), 100)
  }

  function verifyCode() {
    const code = codeVals.join('')
    if (code.length < 6) return
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setStep(3)
    }, 1500)
  }

  const canSubmitId   = rectoUrl && (docType === 'passport' || versoUrl)
  const canVerifyCode = codeVals.join('').length === 6

  const STEP_LABELS = ['Bienvenue', 'Identité', 'Téléphone', 'Badge obtenu']

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Progress bar header */}
      <div className="sticky top-16 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-3">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : setCurrentView('home')}
            className="text-slate-400 hover:text-slate-700 transition shrink-0">
            <Icons.ChevronLeft size={20} />
          </button>
          <div className="flex-1 flex items-center gap-1">
            {STEP_LABELS.map((lbl, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1.5 ${i <= step ? 'text-orange-600' : 'text-slate-300'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                    i < step  ? 'bg-emerald-500 border-emerald-500 text-white' :
                    i === step? 'bg-orange-500 border-orange-500 text-white' :
                                'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {i < step ? <Icons.Check size={9} /> : i + 1}
                  </div>
                  <span className={`hidden sm:block text-xs font-semibold ${i === step ? 'text-orange-600' : i < step ? 'text-emerald-600' : 'text-slate-300'}`}>{lbl}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full mx-1 transition-all ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Progress fill */}
        <div className="h-0.5 bg-slate-100">
          <motion.div animate={{ width: `${(step / 3) * 100}%` }} transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">

          {/* ── STEP 0 : Bienvenue ── */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-5 shadow-xl">
                  <Icons.BadgeCheck size={30} className="text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-[#0B1F3A] mb-2">Devenez vendeur certifié</h1>
                <p className="text-slate-500 max-w-md mx-auto">Vérifiez votre identité en 2 minutes et obtenez le badge de confiance PASMAL — visible par 2,4 M d'acheteurs.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {SELLER_VER_BENEFITS.map((b, i) => {
                  const BI = b.icon
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 flex gap-3 items-start">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: b.color + '18' }}>
                        <BI size={16} style={{ color: b.color }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[#0B1F3A] mb-0.5">{b.label}</div>
                        <div className="text-xs text-slate-500 leading-relaxed">{b.desc}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 mb-6">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ce dont vous aurez besoin</div>
                {[
                  { icon: Icons.IdCard,  text: 'Pièce d\'identité en cours de validité (CNI, passeport ou permis)' },
                  { icon: Icons.Phone,   text: 'Votre numéro de téléphone mobile pour recevoir le code SMS' },
                  { icon: Icons.Loader,  text: 'Environ 2 à 5 minutes de votre temps' },
                ].map((it, i) => {
                  const II = it.icon
                  return (
                    <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                      <II size={15} className="text-orange-500 shrink-0" />
                      <span className="text-sm text-slate-600">{it.text}</span>
                    </div>
                  )
                })}
              </div>

              <button onClick={() => setStep(1)}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-base rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2">
                Commencer la vérification <Icons.ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ── STEP 1 : Identité ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-1">Pièce d'identité</h2>
                <p className="text-slate-500 text-sm">Choisissez votre type de document et photographiez les deux faces si nécessaire.</p>
              </div>

              {/* Doc type selector */}
              <div className="flex gap-2 mb-6">
                {DOC_TYPES.map(d => (
                  <button key={d.id} onClick={() => setDocType(d.id)}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                      docType === d.id
                        ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                    }`}>
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Upload zones */}
              <div className={`grid gap-4 mb-6 ${docType === 'passport' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {/* Recto */}
                {[
                  { side: 'recto', label: docType === 'passport' ? 'Page principale' : 'Recto', url: rectoUrl, ref: rectoRef, setter: (f) => pickFile('recto', f) },
                  ...(docType !== 'passport' ? [{ side: 'verso', label: 'Verso', url: versoUrl, ref: versoRef, setter: (f) => pickFile('verso', f) }] : []),
                ].map(({ side, label, url, ref: fRef, setter }) => (
                  <div key={side}>
                    <div className="text-xs font-semibold text-slate-500 mb-2">{label}</div>
                    <button onClick={() => fRef.current?.click()}
                      className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden relative ${
                        url ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-orange-400 hover:bg-orange-50'
                      }`}>
                      {url
                        ? <>
                            <img src={url} alt={label} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-80" />
                            <div className="relative z-10 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                              <Icons.Check size={14} className="text-white" />
                            </div>
                          </>
                        : <>
                            <Icons.Upload size={22} className="text-slate-400 mb-2" />
                            <span className="text-xs text-slate-500 font-medium">Cliquer ou glisser-déposer</span>
                            <span className="text-[11px] text-slate-400 mt-1">JPG, PNG, PDF — max 5 Mo</span>
                          </>
                      }
                    </button>
                    <input ref={fRef} type="file" accept="image/*,.pdf" className="hidden"
                      onChange={e => setter(e.target.files?.[0])} />
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
                <Icons.Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Vos documents sont chiffrés et stockés de manière sécurisée. Ils ne sont accessibles qu'à notre équipe de vérification et sont supprimés après validation.
                </p>
              </div>

              <button onClick={() => setStep(2)} disabled={!canSubmitId}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 text-white font-extrabold text-base rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2">
                Continuer <Icons.ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ── STEP 2 : Téléphone ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-1">Vérification du téléphone</h2>
                <p className="text-slate-500 text-sm">Entrez votre numéro mobile. Nous vous enverrons un code SMS à 6 chiffres.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Numéro de téléphone</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 shrink-0 font-medium">
                    🇫🇷 +33
                  </div>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={codeSent}
                    placeholder="6 12 34 56 78"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition disabled:opacity-60" />
                  <button onClick={sendCode} disabled={codeSent || phone.replace(/\s/g,'').length < 9}
                    className="shrink-0 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition whitespace-nowrap">
                    {codeSent ? 'Envoyé ✓' : 'Envoyer'}
                  </button>
                </div>

                {/* OTP inputs */}
                <AnimatePresence>
                  {codeSent && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                      <div className="mt-5">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Code reçu par SMS</label>
                        <div className="flex gap-2 justify-center mb-2">
                          {codeVals.map((v, i) => (
                            <input key={i} type="text" inputMode="numeric" maxLength={1} value={v}
                              ref={el => codeRefs.current[i] = el}
                              onChange={e => handleCodeInput(i, e.target.value)}
                              onKeyDown={e => handleCodeKeyDown(i, e)}
                              className={`w-11 h-12 text-center text-lg font-extrabold rounded-xl border-2 transition focus:outline-none bg-slate-50 ${
                                codeError ? 'border-rose-400 text-rose-600' :
                                v ? 'border-orange-400 text-orange-600' :
                                'border-slate-200 focus:border-orange-400 text-[#0B1F3A]'
                              }`} />
                          ))}
                        </div>
                        {codeError && (
                          <p className="text-xs text-rose-500 text-center mt-1">Code incorrect. Veuillez réessayer.</p>
                        )}
                        <p className="text-[11px] text-slate-400 text-center mt-2">
                          Code de démonstration : n'importe quel code à 6 chiffres.{' '}
                          <button onClick={() => { setCodeSent(false); setCodeVals(['','','','','','']) }}
                            className="text-orange-500 font-semibold hover:underline">
                            Renvoyer
                          </button>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={verifyCode} disabled={!canVerifyCode || verifying}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 text-white font-extrabold text-base rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2">
                {verifying
                  ? <><Icons.Loader size={18} className="animate-spin" /> Vérification…</>
                  : <><Icons.Check size={18} /> Vérifier le code</>
                }
              </button>
            </motion.div>
          )}

          {/* ── STEP 3 : Succès ── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: 'backOut' }}
              className="text-center">
              {/* Animated badge */}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.5, type: 'spring', bounce: 0.5 }}
                className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Icons.BadgeCheck size={52} className="text-white" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                  <Icons.Check size={12} /> Vendeur certifié PASMAL
                </div>
                <h2 className="text-2xl font-extrabold text-[#0B1F3A] mb-3">Félicitations, votre badge est actif !</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Votre identité a été vérifiée. Le badge certifié apparaît désormais sur toutes vos annonces et votre profil.</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { val: '3×', label: 'Plus de contacts' },
                    { val: 'Top', label: 'Dans les résultats' },
                    { val: '48h', label: 'Délai moyen' },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                      className="bg-white rounded-2xl border border-slate-100 shadow-soft py-4">
                      <div className="text-xl font-extrabold text-orange-500">{s.val}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Badge preview */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 mb-8 text-left">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Aperçu sur vos annonces</div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-sm">
                      {user?.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#0B1F3A] truncate">{user?.user_metadata?.full_name || 'Vendeur particulier'}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Icons.BadgeCheck size={11} className="text-emerald-500" />
                        <span className="text-[11px] text-emerald-600 font-semibold">Certifié PASMAL</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Vérifié</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setCurrentView('publier')}
                    className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2">
                    <Icons.PlusSquare size={18} /> Publier une annonce
                  </button>
                  <button onClick={() => setCurrentView('profil')}
                    className="flex-1 py-4 bg-white border border-slate-200 hover:border-slate-300 text-[#0B1F3A] font-semibold rounded-2xl transition-all flex items-center justify-center gap-2">
                    <Icons.User size={16} /> Voir mon profil
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
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
   AcheterView — Buyer landing page
   ============================================================================ */

const ACHAT_STEPS = [
  { icon: Icons.Search,     title: "Definir votre projet",    desc: "Budget, surface, localisation, criteres essentiels — posez les bases pour ne visiter que les biens qui vous correspondent vraiment." },
  { icon: Icons.MapPin,     title: "Rechercher et visiter",   desc: "Activez vos alertes PASMAL et recevez les nouvelles annonces en temps reel. Planifiez vos visites directement depuis l'annonce." },
  { icon: Icons.CreditCard, title: "Financer",                desc: "Simulez votre pret, obtenez votre accord de principe et comparez les offres bancaires grace a nos partenaires courtiers agrees." },
  { icon: Icons.CheckCircle,title: "Signer",                  desc: "De l'offre d'achat a l'acte notarie, notre equipe vous accompagne a chaque etape pour securiser votre acquisition en toute serenite." },
]

const ACHAT_AVANTAGES = [
  { icon: Icons.BadgeCheck, tone: 'emerald', title: "Annonces verifiees",       desc: "Chaque annonce est controlee par notre equipe : prix coherent, photos authentiques, informations legales completes." },
  { icon: Icons.Bell,       tone: 'orange',  title: "Alertes en temps reel",    desc: "Soyez le premier informe des nouvelles annonces correspondant a vos criteres. Parametrez jusqu'a 10 alertes personnalisees." },
  { icon: Icons.Eye,        tone: 'indigo',  title: "Visites virtuelles 3D",    desc: "Visitez virtuellement les biens depuis chez vous. Gagnez du temps et ne vous deplacez que pour les coups de coeur." },
  { icon: Icons.Shield,     tone: 'rose',    title: "Accompagnement juridique", desc: "Nos experts vous accompagnent de l'offre a la signature : compromis, conditions suspensives, acte notarie." },
]

const GUIDES_ACHAT = [
  { tag: 'Financement', title: "Tout savoir sur le PTZ en 2026",           desc: "Conditions, plafonds, zones eligibles : le guide complet du Pret a Taux Zero pour primo-accedants.",              img: unsplash('photo-1554224155-6726b3ff858f', 400), time: '5 min' },
  { tag: 'Immobilier',  title: "VEFA : acheter sur plan en toute serenite", desc: "Contrat de reservation, garanties GFA/GFI, livraison — comment eviter les pieges de l'achat sur plan.",          img: unsplash('photo-1486325212027-8081e485255e', 400), time: '7 min' },
  { tag: 'DPE',         title: "Decrypter le DPE avant d'acheter",          desc: "Classe energetique, passoires thermiques, travaux obligatoires : ce que vous devez savoir avant de signer.",        img: unsplash('photo-1467533003447-e295ff1b0435', 400), time: '4 min' },
]

const ACHAT_TONE = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-100'  },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-100'  },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-100'    },
}

const ACHAT_PROPERTY_TYPES = [
  { icon: Icons.Building,  label: 'Appartement', count: '4 120', color: 'orange' },
  { icon: Icons.Home,      label: 'Maison',       count: '2 810', color: 'indigo' },
  { icon: Icons.Villa,     label: 'Villa',        count: '890',   color: 'emerald' },
  { icon: Icons.Building2, label: 'Studio',       count: '1 340', color: 'rose' },
  { icon: Icons.Warehouse, label: 'Commerce',     count: '420',   color: 'orange' },
  { icon: Icons.Car,       label: 'Parking',      count: '620',   color: 'indigo' },
]

const ACHAT_CITIES = [
  { name: 'Paris',     dept: 'Ile-de-France',      price: 10200, img: unsplash('photo-1502672260266-1c1ef2d93688', 400) },
  { name: 'Lyon',      dept: 'Auvergne-Rhone',     price: 5100,  img: unsplash('photo-1613490493576-7fde63acd811', 400) },
  { name: 'Marseille', dept: 'PACA',               price: 3800,  img: unsplash('photo-1560448204-e02f11c3d0e2', 400) },
  { name: 'Bordeaux',  dept: 'Nouvelle-Aquitaine', price: 4900,  img: unsplash('photo-1600585154340-be6161a56a0c', 400) },
  { name: 'Nice',      dept: "Cote d'Azur",        price: 5800,  img: unsplash('photo-1493809842364-78817add7ffb', 400) },
  { name: 'Nantes',    dept: 'Pays de la Loire',   price: 3700,  img: unsplash('photo-1522708323590-d24dbb6b0267', 400) },
]

function AcheterView({ listings, loading, error, source, filters, setFilters, onSearch, onPublish }) {
  /* ── Simulateur de pret ──────────────────────────── */
  const [simPrix,   setSimPrix]   = useState('300000')
  const [simApport, setSimApport] = useState('60000')
  const [simDuree,  setSimDuree]  = useState('20')
  const [simTaux,   setSimTaux]   = useState('3.50')

  const prix   = parseFloat(simPrix.replace(/\s/g, ''))   || 0
  const apport = parseFloat(simApport.replace(/\s/g, '')) || 0
  const duree  = parseInt(simDuree)   || 20
  const taux   = parseFloat(simTaux.replace(',', '.')) || 3.5

  const capital    = Math.max(0, prix - apport)
  const r          = taux / 100 / 12
  const n          = duree * 12
  const mensualite = capital > 0 && r > 0
    ? (capital * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : 0
  const coutTotal  = mensualite * n
  const coutCredit = coutTotal - capital
  const assurance  = capital * 0.0015 / 12
  const pct        = prix > 0 ? Math.round(apport / prix * 100) : 0
  const fmt = (v) => v > 0 ? Math.round(v).toLocaleString('fr-FR') : '0'

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-navy-900 via-[#0e1f3a] to-[#162E52] overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-5">
              <Icons.Home size={12} /> Achat immobilier
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5">
              Trouvez le bien<br/>
              <span className="text-orange-400">qui vous ressemble.</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
              {"Plus de 8 200 biens premium verifies — appartements, maisons, villas — partout en France."}
            </p>

            {/* Counters */}
            <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap mt-8 mb-10">
              {[
                { value: 8200, suffix: '+', label: "biens a vendre" },
                { value: 342,  suffix: '',  label: "vendus ce mois" },
                { value: 98,   suffix: '%', label: "acheteurs satisfaits" },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }} className="text-center">
                  <div className="text-white text-2xl md:text-3xl font-extrabold">
                    <Counter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
          {/* SearchBar integre dans le hero */}
          <SearchBar filters={filters} setFilters={setFilters} onSearch={onSearch} floating />
        </div>
      </section>

      {/* ── Processus d'achat ────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Votre parcours</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Acheter, etape par etape</h2>
            <p className="text-slate-500 mt-3">{"De la recherche a la remise des cles, PASMAL vous accompagne a chaque etape."}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line desktop */}
            <div className="hidden lg:block absolute top-[54px] left-[calc(12.5%+8px)] right-[calc(12.5%+8px)] h-px bg-gradient-to-r from-orange-100 via-orange-300 to-orange-100 pointer-events-none" />

            {ACHAT_STEPS.map((s, i) => {
              const Ic = s.icon
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="relative flex flex-col items-center text-center z-10">
                  {/* Step number bubble */}
                  <div className="relative mb-5">
                    <div className="w-[108px] h-[108px] rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-cardHover">
                      <Ic size={36} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-orange-400 text-orange-600 text-xs font-extrabold flex items-center justify-center shadow-sm">
                      {i + 1}
                    </div>
                  </div>
                  <div className="font-extrabold text-navy-900 text-base mb-2">{s.title}</div>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Listings ─────────────────────────────────── */}
      <Listings listings={listings} loading={loading} error={error} source={source}
        title="Biens a vendre" kicker="Selection du moment" />

      {/* ── Types de biens ───────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Explorer</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Chercher par type de bien</h2>
            <p className="text-slate-500 mt-3">{"Selectionnez la categorie qui correspond a votre projet immobilier."}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ACHAT_PROPERTY_TYPES.map((pt, i) => {
              const t = ACHAT_TONE[pt.color]
              return (
                <motion.button key={pt.label}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  onClick={() => { setFilters(f => ({ ...f, propertyType: pt.label })); onSearch({ ...filters, propertyType: pt.label }) }}
                  className={`group bg-white hover:bg-orange-50 border ${t.border} hover:border-orange-300 rounded-3xl p-5 flex flex-col items-center gap-3 transition-all hover:-translate-y-1 shadow-soft hover:shadow-card`}>
                  <div className={`w-12 h-12 rounded-2xl ${t.bg} ${t.text} flex items-center justify-center`}>
                    <pt.icon size={24} />
                  </div>
                  <div className="font-bold text-navy-900 text-sm">{pt.label}</div>
                  <div className="text-slate-400 text-xs">{pt.count} biens</div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Simulateur de pret ───────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Outil gratuit</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Simulateur de pret immobilier</h2>
            <p className="text-slate-500 mt-3">Estimez votre mensualite et le cout total de votre credit en quelques secondes.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Inputs */}
            <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8">
              <div className="font-bold text-navy-900 text-lg mb-6">Votre projet</div>
              <div className="space-y-5">
                {[
                  { label: "Prix du bien (€)",      value: simPrix,   set: setSimPrix,   placeholder: '300 000' },
                  { label: "Apport personnel (€)",   value: simApport, set: setSimApport, placeholder: '60 000'  },
                  { label: "Duree du pret (ans)",    value: simDuree,  set: setSimDuree,  placeholder: '20'      },
                  { label: "Taux annuel (%)",         value: simTaux,   set: setSimTaux,   placeholder: '3.50'    },
                ].map(({ label, value, set, placeholder }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <input type="number" value={value} onChange={e => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-navy-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
                  </div>
                ))}
              </div>

              {/* Apport bar */}
              {prix > 0 && (
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Apport : {pct} %</span>
                    <span>Capital emprunte : {fmt(capital)} €</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <motion.div animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.4 }}
                      className={`h-full rounded-full ${pct >= 20 ? 'bg-emerald-500' : pct >= 10 ? 'bg-orange-500' : 'bg-rose-500'}`} />
                  </div>
                  <p className={`text-[11px] mt-1.5 font-medium ${pct >= 20 ? 'text-emerald-600' : pct >= 10 ? 'text-orange-500' : 'text-rose-500'}`}>
                    {pct >= 20 ? "Excellent apport — taux preferentiels accessibles" : pct >= 10 ? "Apport correct — negociation possible" : "Apport faible — taux majores probables"}
                  </p>
                </div>
              )}
            </div>

            {/* Results */}
            <div className="flex flex-col gap-4">
              {/* Main result */}
              <div className="bg-gradient-to-br from-navy-900 to-[#162E52] rounded-3xl p-8 text-center relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-orange-600/20 blur-2xl" />
                <div className="relative">
                  <div className="text-white/60 text-sm mb-1">Mensualite estimee</div>
                  <div className="text-white text-5xl font-extrabold tracking-tight">
                    {fmt(mensualite)} <span className="text-2xl text-white/60">€/mois</span>
                  </div>
                  <div className="text-white/50 text-xs mt-2">hors assurance emprunteur</div>
                </div>
              </div>

              {/* Detail metrics */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-3">
                <div className="font-bold text-navy-900 mb-1">Detail du financement</div>
                {[
                  { label: 'Capital emprunte',       value: `${fmt(capital)} €`,                    hi: false },
                  { label: 'Mensualite + assurance',  value: `${fmt(mensualite + assurance)} €/mois`, hi: true  },
                  { label: 'Assurance estimee',       value: `${fmt(assurance)} €/mois`,              hi: false },
                  { label: 'Cout total du credit',    value: `${fmt(coutCredit)} €`,                  hi: false },
                  { label: 'Cout total (bien + inter)', value: `${fmt(coutTotal + apport)} €`,         hi: false },
                ].map(({ label, value, hi }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-500 text-sm">{label}</span>
                    <span className={`text-sm font-bold ${hi ? 'text-orange-600' : 'text-navy-900'}`}>{value}</span>
                  </div>
                ))}
              </div>

              <p className="text-slate-400 text-xs text-center">
                {"Simulation indicative. Taux et assurance a titre d'exemple — consultez un courtier pour une offre personnalisee."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Avantages acheteur ───────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Pourquoi PASMAL</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Tout pour reussir votre achat</h2>
            <p className="text-slate-500 mt-3">{"Des outils et un accompagnement penses pour les acheteurs exigeants."}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ACHAT_AVANTAGES.map((a, i) => {
              const Ic = a.icon
              const t  = ACHAT_TONE[a.tone]
              return (
                <motion.div key={a.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`bg-white rounded-3xl border p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all ${t.border}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${t.bg} ${t.text}`}>
                    <Ic size={24} />
                  </div>
                  <div className="font-extrabold text-navy-900 text-base mb-2">{a.title}</div>
                  <p className="text-slate-500 text-sm leading-relaxed">{a.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Guides achat ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Ressources</div>
              <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">Guides pour acheteurs</h2>
            </div>
            <button className="flex items-center gap-1.5 text-navy-700 hover:text-orange-600 font-medium text-sm transition-colors">
              Tous les guides <Icons.ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GUIDES_ACHAT.map((g, i) => (
              <motion.article key={g.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-3xl border border-slate-100 shadow-soft hover:shadow-card overflow-hidden transition-all hover:-translate-y-1 cursor-pointer">
                <div className="relative h-44 overflow-hidden">
                  <img src={g.img} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
                  <span className="absolute top-4 left-4 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-navy-900">
                    {g.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-navy-900 text-base mb-2 leading-snug group-hover:text-orange-600 transition-colors">{g.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">{g.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Icons.Eye size={11} /> Lecture {g.time}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Lire <Icons.ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Villes tendance ──────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Marche</div>
              <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">Villes les plus recherchees</h2>
            </div>
            <span className="text-xs text-slate-400 italic">Prix medians — Mai 2026</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ACHAT_CITIES.map((c, i) => (
              <motion.button key={c.name}
                initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                onClick={() => { setFilters(f => ({ ...f, location: c.name })); onSearch({ ...filters, location: c.name }) }}
                className="group relative h-44 rounded-3xl overflow-hidden shadow-soft hover:shadow-cardHover transition-all hover:-translate-y-1 cursor-pointer">
                <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                  <div className="text-white font-extrabold text-base leading-tight">{c.name}</div>
                  <div className="text-white/70 text-xs mt-0.5">{c.price.toLocaleString('fr-FR')} €/m²</div>
                  <div className="text-white/50 text-[10px] mt-0.5">{c.dept}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <TrustGuarantees />
      <CTA onPublish={onPublish} />
    </>
  )
}

/* ============================================================================
   LouerView — Tenant landing page
   ============================================================================ */

const LOUER_TYPES = [
  { icon: Icons.Building,  label: 'Studio',     count: '1 240', color: 'orange' },
  { icon: Icons.Building,  label: 'T1',         count: '890',   color: 'indigo' },
  { icon: Icons.Building2, label: 'T2 / T3',    count: '2 100', color: 'emerald' },
  { icon: Icons.Home,      label: 'T4 et +',    count: '620',   color: 'orange' },
  { icon: Icons.Users,     label: 'Colocation', count: '480',   color: 'rose' },
  { icon: Icons.Sparkles,  label: 'Meublé',     count: '1 070', color: 'indigo' },
]

const LOUER_CITIES = [
  { name: 'Paris',     dept: 'Île-de-France',      price: 1450, img: unsplash('photo-1502672260266-1c1ef2d93688', 400) },
  { name: 'Lyon',      dept: 'Auvergne-Rhône',     price: 820,  img: unsplash('photo-1613490493576-7fde63acd811', 400) },
  { name: 'Marseille', dept: 'PACA',               price: 720,  img: unsplash('photo-1560448204-e02f11c3d0e2', 400) },
  { name: 'Bordeaux',  dept: 'Nouvelle-Aquitaine', price: 880,  img: unsplash('photo-1600585154340-be6161a56a0c', 400) },
  { name: 'Nice',      dept: "Côte d'Azur",        price: 960,  img: unsplash('photo-1493809842364-78817add7ffb', 400) },
  { name: 'Nantes',    dept: 'Pays de la Loire',   price: 750,  img: unsplash('photo-1522708323590-d24dbb6b0267', 400) },
]

const LOUER_STEPS = [
  { icon: Icons.Search,     title: "Rechercher et filtrer",    desc: "Affinez par ville, budget, surface, type de bien. Activez vos alertes pour recevoir les nouvelles annonces en temps reel." },
  { icon: Icons.Eye,        title: "Visiter et comparer",      desc: "Planifiez vos visites directement depuis l'annonce. Photos HD, plan du bien, quartier et transports en un coup d'oeil." },
  { icon: Icons.FileText,   title: "Constituer le dossier",    desc: "Deposez votre dossier locataire numerique en moins de 5 minutes : pieces justificatives securisees, validation instantanee." },
  { icon: Icons.CheckCircle,title: "Signer et emmenager",      desc: "Signature electronique du bail, remise des cles digitale. Tout se fait depuis votre espace, en toute securite juridique." },
]

const LOUER_AVANTAGES = [
  { icon: Icons.Shield,     tone: 'emerald', title: "Dossier 100 % securise",     desc: "Vos documents sont chiffres et transmis uniquement au proprietaire concerne. Aucune diffusion sans votre accord." },
  { icon: Icons.Bell,       tone: 'orange',  title: "Alertes instantanees",       desc: "Soyez le premier a recevoir les nouvelles annonces correspondant a vos criteres. Les bons biens partent vite." },
  { icon: Icons.BadgeCheck, tone: 'indigo',  title: "Annonces verifiees",          desc: "Chaque annonce est controlee : prix coherent avec le marche, photos authentiques, informations legales exactes." },
  { icon: Icons.Users,      tone: 'rose',    title: "Proprietaires certifies",     desc: "Louez l'esprit tranquille : chaque proprietaire est verifie, les litiges sont geres par notre equipe support." },
]

const GUIDES_LOUER = [
  { tag: 'Location',     title: "Comprendre le bail de location en 2026",          desc: "Durees, preavis, charges, depots de garantie : tout ce que la Loi Alur impose et protege pour le locataire.",  img: unsplash('photo-1554224155-6726b3ff858f', 400), time: '6 min' },
  { tag: 'Budget',       title: "Charges locatives : ce que vous devez vraiment",  desc: "Charges recup, provisions, regularisation annuelle — comment verifier que votre proprietaire ne surfacture pas.", img: unsplash('photo-1560518883-ce09059eeffa', 400), time: '4 min' },
  { tag: 'Installation', title: "Etat des lieux : le guide pour etre protege",      desc: "Comment realiser un etat des lieux d'entree irreprochable, photos incluses, pour recup integralement votre depot.", img: unsplash('photo-1486325212027-8081e485255e', 400), time: '5 min' },
]

const LOUER_TONE = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-100'  },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-100'  },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-100'    },
}

function LouerView({ listings, loading, error, source, filters, setFilters, onSearch, onPublish }) {
  /* ── Calculateur de budget locataire ─────────────── */
  const [simRevenu, setSimRevenu] = useState('2500')
  const [simPers,   setSimPers]   = useState('1')

  const revenu    = parseFloat(simRevenu.replace(/\s/g, '').replace(',', '.')) || 0
  const personnes = parseInt(simPers) || 1

  /* regle des 33 % ; minimum decent ; plafond raisonnable */
  const loyerMax     = Math.round(revenu * 0.33)
  const caution      = loyerMax              /* 1 mois Loi Alur */
  const chargesEst   = Math.round(loyerMax * 0.10)
  const totalMensuel = loyerMax + chargesEst
  const ratio        = revenu > 0 ? Math.min(loyerMax / revenu * 100, 100) : 0
  const fmt = (v) => v > 0 ? Math.round(v).toLocaleString('fr-FR') : '0'

  const effort = ratio >= 33 ? { label: "Effort standard (33 %)",      color: 'emerald' }
               : ratio >= 25 ? { label: "Effort confortable (< 33 %)", color: 'emerald' }
               :               { label: "Budget serre",                color: 'orange'  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#0B1F3A] via-[#0e2040] to-[#132d52] overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-5">
              <Icons.Key size={12} /> Location immobiliere
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5">
              Le logement ideal,<br/>
              <span className="text-orange-400">sans les mauvaises surprises.</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
              {"Plus de 5 400 locations verifiees — studios, T2, colocations, maisons — dans toutes les villes de France."}
            </p>

            {/* Counters */}
            <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap mt-8 mb-10">
              {[
                { value: 5400,  suffix: '+', label: "biens a louer" },
                { value: 48,    suffix: 'h', label: "mise en ligne" },
                { value: 97,    suffix: '%', label: "locataires satisfaits" },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }} className="text-center">
                  <div className="text-white text-2xl md:text-3xl font-extrabold">
                    <Counter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
          <SearchBar filters={filters} setFilters={setFilters} onSearch={onSearch} floating />
        </div>
      </section>

      {/* ── Etapes location ──────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Votre parcours</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Louer, etape par etape</h2>
            <p className="text-slate-500 mt-3">{"De la recherche a la remise des cles, PASMAL vous accompagne a chaque etape."}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-[54px] left-[calc(12.5%+8px)] right-[calc(12.5%+8px)] h-px bg-gradient-to-r from-indigo-100 via-indigo-300 to-indigo-100 pointer-events-none" />

            {LOUER_STEPS.map((s, i) => {
              const Ic = s.icon
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="relative flex flex-col items-center text-center z-10">
                  <div className="relative mb-5">
                    <div className="w-[108px] h-[108px] rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-cardHover">
                      <Ic size={36} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-indigo-400 text-indigo-600 text-xs font-extrabold flex items-center justify-center shadow-sm">
                      {i + 1}
                    </div>
                  </div>
                  <div className="font-extrabold text-navy-900 text-base mb-2">{s.title}</div>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Types de location ──────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Filtrer par type</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">Quel type de logement ?</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {LOUER_TYPES.map((t) => {
              const TypeIcon = t.icon
              return (
                <button key={t.label} className="group bg-white border border-transparent hover:border-indigo-100 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all hover:shadow-card hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center shadow-soft transition-colors">
                    <TypeIcon size={24} className="text-[#0B1F3A] group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="text-[#0B1F3A] font-semibold text-sm">{t.label}</div>
                  <div className="text-slate-400 text-xs">{t.count} biens</div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Listings ─────────────────────────────────── */}
      <Listings listings={listings} loading={loading} error={error} source={source}
        title="Biens a louer" kicker="Selection du moment" />

      {/* ── Villes populaires location ───────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Par ville</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">Villes les plus demandées</h2>
            </div>
            <button className="text-navy-700 hover:text-orange-600 font-medium text-sm flex items-center gap-1 transition-colors">
              Toutes les villes <Icons.ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {LOUER_CITIES.map(city => (
              <button key={city.name} className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer focus:outline-none">
                <img src={city.img} alt={city.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                  <div className="text-white font-bold text-sm truncate">{city.name}</div>
                  <div className="text-white/70 text-[11px]">à partir de {city.price} €/mois</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Calculateur de budget locataire ──────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Outil gratuit</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Quel loyer pouvez-vous vous permettre ?</h2>
            <p className="text-slate-500 mt-3">{"Calculez votre budget location en quelques secondes selon la regle des 33 %."}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Inputs */}
            <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8">
              <div className="font-bold text-navy-900 text-lg mb-6">Votre situation</div>
              <div className="space-y-5">
                {[
                  { label: "Revenus nets mensuels (€)",  value: simRevenu, set: setSimRevenu, placeholder: '2 500' },
                  { label: "Nombre de personnes",         value: simPers,   set: setSimPers,   placeholder: '1'     },
                ].map(({ label, value, set, placeholder }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <input type="number" value={value} onChange={e => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-navy-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
                  </div>
                ))}
              </div>

              {/* Effort barre */}
              {revenu > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Taux d'effort : {Math.round(ratio)} %</span>
                    <span>Loyer max : {fmt(loyerMax)} €/mois</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <motion.div animate={{ width: `${ratio}%` }} transition={{ duration: 0.4 }}
                      className={`h-full rounded-full ${effort.color === 'emerald' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                  </div>
                  <p className={`text-[11px] mt-1.5 font-medium ${effort.color === 'emerald' ? 'text-emerald-600' : 'text-orange-500'}`}>
                    {effort.label}
                  </p>
                </div>
              )}

              {/* Info Loi Alur */}
              <div className="mt-6 flex items-start gap-2.5 p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100">
                <Icons.Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-indigo-700 text-xs leading-relaxed">
                  {"La Loi Alur plafonne le depot de garantie a 1 mois de loyer hors charges pour les locations non meublees, 2 mois pour les meublees."}
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="flex flex-col gap-4">
              {/* Main card */}
              <div className="bg-gradient-to-br from-[#0B1F3A] to-[#162E52] rounded-3xl p-8 text-center relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-indigo-600/20 blur-2xl" />
                <div className="relative">
                  <div className="text-white/60 text-sm mb-1">Loyer maximum recommande</div>
                  <div className="text-white text-5xl font-extrabold tracking-tight">
                    {fmt(loyerMax)} <span className="text-2xl text-white/60">€/mois</span>
                  </div>
                  <div className="text-white/50 text-xs mt-2">hors charges locatives</div>
                </div>
              </div>

              {/* Detail */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-3">
                <div className="font-bold text-navy-900 mb-1">Detail budget location</div>
                {[
                  { label: "Loyer max (33 % revenus)",   value: `${fmt(loyerMax)} €/mois`,     hi: true  },
                  { label: "Charges estimees (~ 10 %)",  value: `${fmt(chargesEst)} €/mois`,   hi: false },
                  { label: "Total mensuel estime",        value: `${fmt(totalMensuel)} €/mois`, hi: false },
                  { label: "Depot de garantie (1 mois)", value: `${fmt(caution)} €`,            hi: false },
                  { label: "Budget a prevoir (M1)",       value: `${fmt(totalMensuel + caution)} €`, hi: false },
                ].map(({ label, value, hi }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-500 text-sm">{label}</span>
                    <span className={`text-sm font-bold ${hi ? 'text-indigo-600' : 'text-navy-900'}`}>{value}</span>
                  </div>
                ))}
              </div>

              <p className="text-slate-400 text-xs text-center">
                {"Simulation indicative basee sur la regle des 33 %. Certains proprietaires exigent des revenus 3x le loyer."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Avantages locataire ──────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Pourquoi PASMAL</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Tout pour louer sereinement</h2>
            <p className="text-slate-500 mt-3">{"Des outils et une protection penses pour les locataires exigeants."}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LOUER_AVANTAGES.map((a, i) => {
              const Ic = a.icon
              const t  = LOUER_TONE[a.tone]
              return (
                <motion.div key={a.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`bg-white rounded-3xl border p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all ${t.border}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${t.bg} ${t.text}`}>
                    <Ic size={24} />
                  </div>
                  <div className="font-extrabold text-navy-900 text-base mb-2">{a.title}</div>
                  <p className="text-slate-500 text-sm leading-relaxed">{a.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Guides location ──────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Ressources</div>
              <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">Guides pour locataires</h2>
            </div>
            <button className="flex items-center gap-1.5 text-navy-700 hover:text-orange-600 font-medium text-sm transition-colors">
              Tous les guides <Icons.ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GUIDES_LOUER.map((g, i) => (
              <motion.article key={g.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-3xl border border-slate-100 shadow-soft hover:shadow-card overflow-hidden transition-all hover:-translate-y-1 cursor-pointer">
                <div className="relative h-44 overflow-hidden">
                  <img src={g.img} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
                  <span className="absolute top-4 left-4 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-navy-900">
                    {g.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-navy-900 text-base mb-2 leading-snug group-hover:text-orange-600 transition-colors">{g.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">{g.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Icons.Eye size={11} /> Lecture {g.time}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Lire <Icons.ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <TrustGuarantees />
      <CTA onPublish={onPublish} />
    </>
  )
}

/* ============================================================================
   Tarifs view (standalone page reusing Pricing)
   ============================================================================ */
const TARIFS_FAQ = [
  {
    q: "Puis-je changer de plan en cours d'utilisation ?",
    a: "Oui, vous pouvez passer à un plan supérieur à tout moment. La différence de prix est calculée au prorata de votre période en cours. Pour passer à un plan inférieur, le changement prend effet à la prochaine échéance.",
  },
  {
    q: "Comment fonctionne le paiement ?",
    a: "Les paiements sont sécurisés via Stripe. Vous pouvez régler par carte bancaire (Visa, Mastercard, CB) ou virement SEPA pour les plans agences. Une facture est automatiquement générée après chaque transaction.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Absolument. Aucun engagement, aucune pénalité. Pour les annonces à la durée (Gratuit, Pack Visibilité, Premium), l'annonce reste en ligne jusqu'à expiration. Pour les abonnements agences, l'accès est maintenu jusqu'à la fin de la période payée.",
  },
  {
    q: "Y a-t-il des frais cachés ?",
    a: "Non. Le prix affiché est le prix payé, TVA incluse. Il n'y a pas de frais d'activation, de setup ou de commission sur vos transactions immobilières.",
  },
  {
    q: "Quelle est la différence entre visibilité standard et boostée ?",
    a: "La visibilité standard place votre annonce dans le flux normal des résultats de recherche. La visibilité boostée (+200 %) la propulse en tête des résultats sur les requêtes correspondantes, ce qui multiplie en moyenne par 4 le nombre de contacts reçus.",
  },
  {
    q: "Mon annonce reste-t-elle visible après expiration ?",
    a: "Non. A l'expiration, votre annonce est automatiquement desactivee et retiree des resultats de recherche. Elle reste accessible dans votre espace pour etre reactivee ou modifiee a tout moment.",
  },
]

const COMP_PERSO = {
  headers:   ['Gratuit', 'Pack Visibilité', 'Premium'],
  highlight: 1,
  rows: [
    { feature: 'Prix annonce',      values: ['0 €',       '9,90 €',      '14,90 €'] },
    { feature: 'Durée en ligne',    values: ['7 jours',   '30 jours',    '30 jours'] },
    { feature: 'Photos',            values: ['3',         '8',           '12'] },
    { feature: 'Visibilité',        values: ['Standard',  '+200 %',      'Top résultats'] },
    { feature: 'Badge sur annonce', values: [false,       '"Nouveau"',   '"Urgent"'] },
    { feature: 'Statistiques',      values: [false,       'Basiques',    'Avancées'] },
    { feature: 'Messagerie',        values: [true,        true,          true] },
    { feature: 'Support',           values: [false,       'Prioritaire', 'Dédié'] },
  ],
}

const COMP_PRO = {
  headers:   ['Starter', 'Pro', 'Enterprise'],
  highlight: 1,
  rows: [
    { feature: 'Annonces actives',  values: ['20',         'Illimitées',      'Illimitées'] },
    { feature: 'Agents inclus',     values: ['1',          '5',               'Illimités'] },
    { feature: 'CRM',               values: ['Basique',    'Avancé + Kanban', 'Avancé +'] },
    { feature: 'Analytics',         values: [false,        'Temps réel',      'Temps réel'] },
    { feature: 'Boost visibilité',  values: [false,        '+200 %',          'Garanti premium'] },
    { feature: 'API REST',          values: [false,        false,             true] },
    { feature: 'Support',           values: ['E-mail 48h', '7j/7',            'Account manager'] },
    { feature: 'SLA',               values: [false,        false,             '99,9 %'] },
  ],
}

const SIM_METRICS = {
  vendre: {
    gratuit:    { contacts: 2,  delai: 52 },
    visibilite: { contacts: 8,  delai: 18 },
    premium:    { contacts: 13, delai: 11 },
  },
  louer: {
    gratuit:    { contacts: 3,  delai: 28 },
    visibilite: { contacts: 11, delai: 8  },
    premium:    { contacts: 17, delai: 5  },
  },
}

const VERSUS_ROWS = [
  { label: 'Publication basique',     pasmal: '0 €',      seloger: '~299 €/mois', lbc: '~75 €/sem.' },
  { label: 'Publication boostée',     pasmal: '9,90 €',   seloger: 'inclus',      lbc: 'inclus' },
  { label: 'Sans engagement',         pasmal: true,       seloger: false,         lbc: true },
  { label: 'Audience qualifiée achat',pasmal: true,       seloger: true,          lbc: false },
  { label: 'Analytics vendeur',       pasmal: true,       seloger: false,         lbc: false },
  { label: 'CRM leads intégré',       pasmal: true,       seloger: false,         lbc: false },
  { label: 'Messagerie in-app',       pasmal: true,       seloger: true,          lbc: true },
]

function TarifsView({ onPublish }) {
  const [audience, setAudience] = useState('particulier')
  const [simMode,  setSimMode]  = useState('vendre')
  const [openFaq,  setOpenFaq]  = useState(null)

  const isPro = audience === 'pro'
  const comp  = isPro ? COMP_PRO : COMP_PERSO

  const CellVal = ({ val, hi }) => {
    if (val === true)  return <Icons.Check size={16} className={hi ? 'text-orange-500' : 'text-emerald-500'} />
    if (val === false) return <span className="text-slate-300 text-lg leading-none">—</span>
    return <span className={`text-sm font-semibold ${hi ? 'text-orange-600' : 'text-navy-900'}`}>{val}</span>
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-navy-900 via-[#0e1f3a] to-[#162E52] overflow-hidden">
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-5">
            <Icons.BadgeCheck size={12} /> Tarification transparente
          </div>
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Des prix simples,<br/>un retour mesurable.
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
            Sans engagement, sans frais cachés. Commencez gratuitement, upgradez quand vous en avez besoin.
          </p>

          {/* Audience toggle */}
          <div className="inline-flex items-center bg-white/10 border border-white/15 p-1 rounded-full mb-10">
            {[
              { id: 'particulier', label: 'Je suis particulier',    icon: Icons.User     },
              { id: 'pro',         label: 'Je suis professionnel',  icon: Icons.Building },
            ].map(({ id, label, icon: Ic }) => (
              <button key={id} onClick={() => setAudience(id)}
                className={`relative flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition ${
                  audience === id ? 'text-navy-900' : 'text-white/70 hover:text-white'
                }`}>
                {audience === id && (
                  <motion.span layoutId="audiencePill"
                    className="absolute inset-0 bg-white rounded-full shadow-soft"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
                )}
                <span className="relative flex items-center gap-2"><Ic size={15} /> {label}</span>
              </button>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { Ic: Icons.Shield,      text: 'Satisfait ou rembourse 30j' },
              { Ic: Icons.CheckCircle, text: 'Sans engagement' },
              { Ic: Icons.CreditCard,  text: 'Paiement securise Stripe' },
              { Ic: Icons.Users,       text: '1 850+ clients actifs' },
            ].map(({ Ic, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-white/60 text-sm">
                <Ic size={14} className="text-orange-400 shrink-0" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact chiffre ───────────────────────────────── */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 4,       suffix: '×',   label: 'Plus de contacts avec Pack Visibilite' },
              { value: 2400000, suffix: '',    label: 'Visiteurs par mois sur la plateforme' },
              { value: 11,      suffix: ' j',  label: 'Delai moyen pour trouver un acheteur' },
              { value: 98,      suffix: '%',   label: 'Proprietaires satisfaits de PASMAL' },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative">
                <div className="text-3xl md:text-4xl font-extrabold text-navy-900 tabular-nums">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="text-slate-500 text-sm mt-1.5 leading-tight">{s.label}</div>
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-4 w-px h-10 bg-slate-100 -translate-y-1/2" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans (conditionnel) ─────────────────────────── */}
      <AnimatePresence mode="wait">
        {!isPro ? (
          <motion.div key="perso"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
            <Pricing />
          </motion.div>
        ) : (
          <motion.div key="pro"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
            <AgencyPricing />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Simulateur de gain ───────────────────────────── */}
      {!isPro && (
        <section className="py-16 bg-gradient-to-br from-orange-50/60 to-amber-50/30 border-y border-orange-100/70">
          <div className="max-w-4xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3">
                <Icons.TrendingUp size={11} /> Simulateur
              </div>
              <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Estimez l'impact sur votre vente</h2>
              <p className="text-slate-500 text-sm mt-2">Contacts reçus et délai moyen constatés sur PASMAL selon votre plan.</p>
            </div>

            {/* Mode toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center bg-white border border-slate-200 p-1 rounded-full shadow-sm">
                {[{ id: 'vendre', label: 'Je vends' }, { id: 'louer', label: 'Je loue' }].map(({ id, label }) => (
                  <button key={id} onClick={() => setSimMode(id)}
                    className={`relative px-5 py-2 rounded-full text-sm font-bold transition-colors ${simMode === id ? 'text-white' : 'text-slate-600 hover:text-slate-800'}`}>
                    {simMode === id && (
                      <motion.span layoutId="simPill" className="absolute inset-0 bg-navy-900 rounded-full shadow-sm"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }} />
                    )}
                    <span className="relative">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Plans grid */}
            <AnimatePresence mode="wait">
              <motion.div key={simMode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'gratuit',    label: 'Gratuit',        price: '0 €',      color: '#94A3B8', accent: 'border-slate-200 bg-white'          },
                  { key: 'visibilite', label: 'Pack Visibilité', price: '9,90 €',   color: '#F97316', accent: 'border-orange-400 bg-orange-50 shadow-md', hi: true },
                  { key: 'premium',    label: 'Premium',         price: '14,90 €',  color: '#0B1F3A', accent: 'border-slate-300 bg-white'           },
                ].map(({ key, label, price, color, accent, hi }, pi) => {
                  const m = SIM_METRICS[simMode][key]
                  const maxC = simMode === 'vendre' ? 13 : 17
                  return (
                    <div key={key} className={`rounded-2xl border-2 p-5 transition-shadow ${accent}`}>
                      {hi && (
                        <div className="text-center mb-3">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-600 text-white">Le plus populaire</span>
                        </div>
                      )}
                      <div className="font-extrabold text-navy-900 mb-0.5">{label}</div>
                      <div className="text-xs text-slate-500 mb-5">{price} par annonce</div>

                      {/* Contacts bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Contacts / sem.</span>
                          <span className="text-sm font-extrabold" style={{ color }}>{m.contacts}</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            key={`${simMode}-${key}`}
                            initial={{ width: 0 }} animate={{ width: `${Math.round((m.contacts / maxC) * 100)}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut', delay: pi * 0.08 }}
                            className="h-full rounded-full" style={{ background: color }} />
                        </div>
                      </div>

                      {/* Délai */}
                      <div className="flex items-center justify-between pt-3.5 border-t border-black/[0.06]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Délai moyen</span>
                        <span className="text-sm font-extrabold text-navy-900">{m.delai} jours</span>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
            <p className="text-center text-[10px] text-slate-400 mt-5">Données moyennes constatées sur PASMAL. Résultats variables selon le bien, la ville et le marché.</p>
          </div>
        </section>
      )}

      {/* ── Tableau comparatif ───────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Comparatif</div>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">Tout ce qui est inclus</h2>
            <p className="text-slate-500 mt-2">Comparez les plans {isPro ? 'professionnels' : 'particuliers'} en un coup d'oeil.</p>
          </div>
          <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-soft overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 w-1/4">Fonctionnalite</th>
                  {comp.headers.map((h, i) => (
                    <th key={h} className={`px-6 py-4 text-center text-sm font-extrabold ${
                      i === comp.highlight
                        ? 'bg-navy-900 text-white'
                        : 'text-navy-900'
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comp.rows.map((row, ri) => (
                  <motion.tr key={row.feature}
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                    viewport={{ once: true }} transition={{ delay: ri * 0.04 }}
                    className={`border-b border-slate-50 last:border-0 ${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{row.feature}</td>
                    {row.values.map((val, ci) => (
                      <td key={ci} className={`px-6 py-4 text-center ${ci === comp.highlight ? 'bg-orange-50/60' : ''}`}>
                        <CellVal val={val} hi={ci === comp.highlight} />
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Témoignages ──────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Ils nous font confiance</div>
            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Ce que disent nos clients</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Icons.Star key={j} size={14} fill="#F97316" className="text-orange-500" />)}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div>
                    <div className="font-bold text-navy-900 text-sm">{t.name}</div>
                    <div className="text-slate-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Logos agences partenaires ────────────────────── */}
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-8">
            <div className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.22em]">
              {"Des milliers d'agences & particuliers nous font confiance"}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {['BARNES', 'FONCIA', 'ORPI', 'LAFORET', 'CENTURY 21', 'GUY HOQUET', 'NEXITY', 'ERA'].map((name) => (
              <span key={name}
                className="text-slate-200 hover:text-slate-400 font-extrabold text-base tracking-wider transition-colors cursor-default select-none">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Versus ───────────────────────────────────────── */}
      {!isPro && (
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-10">
              <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Pourquoi PASMAL ?</div>
              <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Comparez par vous-même</h2>
              <p className="text-slate-500 text-sm mt-2">Des fonctionnalités pro à une fraction du prix des grandes plateformes.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 shadow-soft overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 w-2/5" />
                    <th className="px-5 py-4 text-center bg-navy-900 text-white text-sm font-extrabold">
                      <div className="flex flex-col items-center gap-1">
                        <span>PASMAL</span>
                        <span className="text-orange-400 text-[10px] font-semibold">dès 0 €</span>
                      </div>
                    </th>
                    <th className="px-5 py-4 text-center text-slate-400 text-xs font-bold">SeLoger<br /><span className="text-[10px] font-normal">≈ 299 €/mois</span></th>
                    <th className="px-5 py-4 text-center text-slate-400 text-xs font-bold">LeBonCoin<br /><span className="text-[10px] font-normal">≈ 75 €/sem.</span></th>
                  </tr>
                </thead>
                <tbody>
                  {VERSUS_ROWS.map((row, ri) => (
                    <motion.tr key={row.label}
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                      transition={{ delay: ri * 0.04 }}
                      className={`border-b border-slate-50 last:border-0 ${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                      <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">{row.label}</td>
                      <td className="px-5 py-3.5 text-center bg-orange-50/40">
                        {row.pasmal === true
                          ? <Icons.CheckCircle size={16} className="text-orange-500 mx-auto" />
                          : row.pasmal === false
                          ? <span className="text-slate-300 text-base leading-none">—</span>
                          : <span className="text-sm font-bold text-orange-600">{row.pasmal}</span>}
                      </td>
                      {[row.seloger, row.lbc].map((v, ci) => (
                        <td key={ci} className="px-5 py-3.5 text-center">
                          {v === true
                            ? <Icons.Check size={15} className="text-emerald-500 mx-auto" />
                            : v === false
                            ? <span className="text-slate-300 text-base leading-none">—</span>
                            : <span className="text-xs text-slate-500 font-medium">{v}</span>}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-4">Tarifs indicatifs publics au 2026. Offres pouvant varier selon les packs et promotions en cours.</p>
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">FAQ</div>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">Questions frequentes</h2>
          </div>
          <div className="space-y-3">
            {TARIFS_FAQ.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border transition-all ${isOpen ? 'border-orange-200 shadow-soft' : 'border-slate-100 hover:border-slate-200'}`}>
                  <button onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left">
                    <span className={`font-semibold text-sm leading-snug ${isOpen ? 'text-orange-600' : 'text-navy-900'}`}>{item.q}</span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-slate-400">
                      <Icons.ChevronDown size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden">
                        <p className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Entreprise / Sur mesure ──────────────────────── */}
      <section className="py-10 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-navy-900 to-[#162E52] rounded-3xl p-8 md:p-10 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 left-1/4 w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                  <Icons.Building2 size={12} /> Sur mesure
                </div>
                <h3 className="text-white text-2xl font-extrabold mb-2">
                  Vous avez des besoins specifiques ?
                </h3>
                <p className="text-white/65 text-sm leading-relaxed max-w-md">
                  Volume important, integration API, multi-sites, SLA personnalise...
                  Notre equipe commerciale vous propose une offre adaptee a votre structure.
                </p>
                <div className="flex flex-wrap gap-2 mt-5">
                  {['API & webhooks', 'White-label', 'SLA garanti', 'Account manager', 'Onboarding dedie'].map((f) => (
                    <span key={f} className="text-xs font-semibold text-white/70 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <button className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-900/30 whitespace-nowrap">
                  <Icons.Phone size={15} /> Parler a un expert
                </button>
                <button className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold px-6 py-3 rounded-full transition-all text-sm whitespace-nowrap">
                  <Icons.Mail size={15} /> Envoyer un brief
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-navy-900 via-[#0e1f3a] to-[#162E52] relative overflow-hidden">
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Garantie 30 jours — satisfait ou rembourse
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Pret a booster vos annonces ?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            {"Rejoignez plus de 1 850 proprietaires et agences qui font confiance a PASMAL pour leurs transactions immobilieres."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onPublish}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
              Publier gratuitement <Icons.ArrowRight size={16} />
            </button>
            <button className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full transition-all">
              <Icons.Phone size={14} /> Parler a un conseiller
            </button>
          </div>
          <p className="text-white/40 text-xs mt-6">Aucune carte requise pour le plan gratuit · Resiliable en 1 clic</p>
        </div>
      </section>
    </>
  )
}

/* ============================================================================
   Investir view
   ============================================================================ */

const PLACEMENT_COMPARE = [
  { label: 'Immobilier locatif', returnPct: 5.8, risk: 2, color: '#F97316', riskLabel: 'Faible', desc: 'Revenus + valorisation' },
  { label: 'SCPI',               returnPct: 4.5, risk: 2, color: '#6366F1', riskLabel: 'Faible', desc: 'Pierre-papier mutualisée' },
  { label: 'Actions (CAC 40)',   returnPct: 7.2, risk: 5, color: '#10B981', riskLabel: 'Élevé',  desc: 'Dividendes + plus-values' },
  { label: 'Assurance vie',      returnPct: 2.8, risk: 1, color: '#8B5CF6', riskLabel: 'Très faible', desc: 'Fonds euros sécurisés' },
  { label: 'Livret A',           returnPct: 3.0, risk: 0, color: '#0EA5E9', riskLabel: 'Nul',    desc: 'Garanti par l\'État' },
]

const INVEST_REGIMES = [
  { id: 'nu',     label: 'Location nue',   taxFactor: 0.30, amortFactor: 0,     color: '#6366F1', tag: 'Revenus fonciers' },
  { id: 'lmnp',   label: 'LMNP',           taxFactor: 0.20, amortFactor: 0.03,  color: '#F97316', tag: 'BIC — Amortissements' },
  { id: 'pinel',  label: 'Pinel',          taxFactor: 0.18, amortFactor: 0,     color: '#10B981', tag: 'Réduction IR 12–21%' },
  { id: 'meuble', label: 'Meublé classique', taxFactor: 0.25, amortFactor: 0.025, color: '#8B5CF6', tag: 'BIC simplifié' },
]

const INVEST_STRATEGIES = [
  { icon: Icons.Building,  label: 'LMNP',         title: 'Location Meublée Non Pro',  desc: "Amortissez le bien comptablement et réduisez votre imposition sur les loyers à zéro pendant 10-20 ans.", yield: '4 – 6 %',       tone: 'orange' },
  { icon: Icons.Shield,    label: 'Pinel',         title: 'Dispositif Pinel',          desc: "Jusqu'à 21 % de réduction d'impôt sur 12 ans en zone éligible A, Abis ou B1.",                           yield: '−21 % impôts',  tone: 'indigo' },
  { icon: Icons.Users,     label: 'Colocation',    title: 'Colocation optimisée',      desc: "Louez chambre par chambre pour maximiser le rendement bien au-dessus du marché classique.",              yield: '6 – 9 %',       tone: 'emerald' },
  { icon: Icons.FileText,  label: 'Déficit',       title: 'Déficit Foncier',           desc: "Déduisez jusqu'à 10 700 €/an de travaux de rénovation de votre revenu global imposable.",               yield: '−10 700 €/an',  tone: 'rose' },
  { icon: Icons.Globe,     label: 'SCPI',          title: 'SCPI & Pierre-Papier',      desc: "Percevez des revenus locatifs sans gestion directe à partir de quelques centaines d'euros.",            yield: '4 – 5 %',       tone: 'sky' },
  { icon: Icons.Tag,       label: 'Nue-propriété', title: 'Nue-Propriété',             desc: "Achetez avec 30-40 % de décote et récupérez la pleine propriété après une période de démembrement.",    yield: '−40 % prix',    tone: 'amber' },
]

const TOP_CITIES = [
  { city: 'Marseille',   dept: 'Bouches-du-Rhône', brut: 6.2, net: 4.1, trend: '+2.1 %',  pop: 873076 },
  { city: 'Strasbourg',  dept: 'Bas-Rhin',          brut: 5.8, net: 4.0, trend: '+3.4 %',  pop: 285431 },
  { city: 'Toulouse',    dept: 'Haute-Garonne',     brut: 5.4, net: 3.9, trend: '+4.2 %',  pop: 493465 },
  { city: 'Nantes',      dept: 'Loire-Atlantique',  brut: 5.1, net: 3.7, trend: '+2.8 %',  pop: 320732 },
  { city: 'Lyon',        dept: 'Rhône',             brut: 4.8, net: 3.4, trend: '+8.4 %',  pop: 522228 },
  { city: 'Montpellier', dept: 'Hérault',           brut: 4.7, net: 3.2, trend: '+5.6 %',  pop: 295542 },
  { city: 'Bordeaux',    dept: 'Gironde',           brut: 4.2, net: 2.9, trend: '+9.7 %',  pop: 257068 },
  { city: 'Paris',       dept: 'Île-de-France',     brut: 3.2, net: 2.1, trend: '+8.4 %',  pop: 2145906 },
]

const FISCAL_CARDS = [
  {
    icon: Icons.Shield, tone: 'indigo',
    name: 'Loi Pinel',
    tag: "jusqu'à −21 %",
    desc: "Achetez neuf en zone éligible et louez pendant 6, 9 ou 12 ans. L'administration fiscale vous rembourse jusqu'à 21 % du prix d'achat sous forme de réduction d'impôt.",
    items: ["Logement neuf ou VEFA", "Zones A, Abis et B1", "Loyer et ressources plafonnés", "Réduction 9 % / 12 % / 21 %"],
  },
  {
    icon: Icons.Building, tone: 'orange',
    name: 'LMNP',
    tag: 'Revenus souvent non imposés',
    desc: "Le statut Loueur Meublé Non Professionnel permet d'amortir comptablement le bien, les meubles et les frais d'acquisition. Résultat : la base imposable descend souvent à zéro.",
    items: ["Meublé avec liste légale", "Recettes < 23 000 €/an", "Régime réel recommandé", "Amortissement sur 25 ans"],
  },
  {
    icon: Icons.FileText, tone: 'emerald',
    name: 'Déficit Foncier',
    tag: "jusqu'à −10 700 €/an",
    desc: "Les travaux de rénovation sur un bien loué nu sont déductibles du revenu foncier. Le surplus est imputé sur le revenu global dans la limite de 10 700 € par an, avec report sur 10 ans.",
    items: ["Location nue obligatoire", "Travaux déductibles uniquement", "Engagement de location 3 ans", "Report déficit jusqu'à 10 ans"],
  },
]

const toneMap = {
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-100',  badge: 'bg-orange-100 text-orange-700' },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-100',  badge: 'bg-indigo-100 text-indigo-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-100',    badge: 'bg-rose-100 text-rose-700' },
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-600',     border: 'border-sky-100',     badge: 'bg-sky-100 text-sky-700' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   badge: 'bg-amber-100 text-amber-700' },
}

const INVEST_TESTIMONIALS = [
  {
    name: 'Marc D.',     role: 'Investisseur — Studio Marseille',
    text: "6,8 % brut en LMNP. Le simulateur m'a permis de comparer 12 biens en 20 minutes. J'ai signé en 5 semaines, sans agence.",
    yield: '6,8 %', city: 'Marseille',
    avatar: unsplash('photo-1500648767791-00dcc994a43e', 200),
  },
  {
    name: 'Isabelle V.', role: 'Investisseuse — T3 Toulouse',
    text: "Régime LMNP réel : mes revenus locatifs sont non imposés depuis 2 ans. PASMAL m'a mis en contact avec un expert-comptable partenaire.",
    yield: '5,4 %', city: 'Toulouse',
    avatar: unsplash('photo-1438761681033-6461ffad8d80', 200),
  },
  {
    name: 'Thomas C.',   role: 'Investisseur — Colocation Lyon',
    text: "Colocation 4 chambres à Lyon : +480 €/mois de cashflow positif après toutes charges. La carte des rendements PASMAL a tout changé.",
    yield: '8,1 %', city: 'Lyon',
    avatar: unsplash('photo-1494790108377-be9c29b29330', 200),
  },
]

const GUIDES_INVEST = [
  { tag: 'Fiscalité',    title: "LMNP vs Pinel en 2026 : quel régime choisir ?",       desc: "Amortissement comptable contre réduction d'impôt directe — comparatif chiffré selon votre tranche marginale.", img: unsplash('photo-1554224155-6726b3ff858f', 400), time: '7 min' },
  { tag: 'Rendement',    title: "Colocation : boostez votre rendement à +8 %",          desc: "Découpage, bail solidaire, charges, assurance GLI — tout ce qu'il faut maîtriser pour maximiser le cashflow.",    img: unsplash('photo-1522708323590-d24dbb6b0267', 400), time: '5 min' },
  { tag: 'Financement',  title: "Financer son premier investissement locatif",            desc: "Apport optimal, SCI ou nom propre, effet levier bancaire : les stratégies des investisseurs aguerris.",            img: unsplash('photo-1486325212027-8081e485255e', 400), time: '6 min' },
]

function InvestirView({ listings, loading, error, source }) {
  /* ── Simulateur state ──────────────────────────────────── */
  const [simPrix,    setSimPrix]    = useState('300000')
  const [simLoyer,   setSimLoyer]   = useState('900')
  const [simCharges, setSimCharges] = useState('120')
  const [simTravaux, setSimTravaux] = useState('0')
  const [simRegime,  setSimRegime]  = useState('lmnp')
  const [projYears,  setProjYears]  = useState(20)

  const prix    = parseFloat(simPrix.replace(/\s/g, ''))    || 0
  const loyer   = parseFloat(simLoyer)   || 0
  const charges = parseFloat(simCharges) || 0
  const travaux = parseFloat(simTravaux.replace(/\s/g, '')) || 0
  const total   = prix + travaux

  const rendBrut     = total > 0 ? ((loyer * 12) / total * 100) : 0
  const rendNet      = total > 0 ? (((loyer - charges) * 12) / total * 100) : 0
  const cashflow     = loyer - charges
  const pointMort    = charges > 0 ? Math.ceil(total / ((loyer - charges) * 12)) : null

  const rendColor = (r) => r >= 6 ? 'text-emerald-600' : r >= 4 ? 'text-orange-500' : 'text-rose-500'

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-navy-900 via-[#0e1f3a] to-[#162E52] overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />
        {/* Floating grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-5">
                <Icons.TrendingUp size={12} /> Investissement immobilier
              </div>
              <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5">
                Faites travailler<br/>
                <span className="text-orange-400">votre capital</span><br/>
                dans la pierre.
              </h1>
              <p className="text-white/70 text-lg max-w-lg mb-8">
                {"Données de rendement en temps réel, simulateur fiscal, stratégies LMNP/Pinel et accompagnement par des experts certifiés."}
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
                  Simuler mon rendement <Icons.ArrowRight size={16} />
                </button>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full transition-all">
                  <Icons.Phone size={14} /> Parler à un expert
                </button>
              </div>
            </div>

            {/* Hero stats panel */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Icons.TrendingUp, value: '5,8 %',   label: 'Rendement brut moyen',      sub: 'toutes villes confondues' },
                { icon: Icons.MapPin,     value: '240',      label: 'Villes analysées',           sub: 'données temps réel' },
                { icon: Icons.Users,      value: '1 850+',   label: 'Investisseurs accompagnés',  sub: 'depuis 2022' },
                { icon: Icons.Sparkles,   value: '91 %',     label: "Taux de satisfaction",       sub: 'note moyenne 4,7/5' },
              ].map((s, i) => {
                const Ic = s.icon
                return (
                  <motion.div key={s.label}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-3">
                      <Ic size={18} />
                    </div>
                    <div className="text-white text-2xl font-extrabold">{s.value}</div>
                    <div className="text-white/80 text-sm font-medium mt-0.5">{s.label}</div>
                    <div className="text-white/40 text-xs mt-0.5">{s.sub}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stratégies d'investissement ──────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Approches</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Quelle stratégie vous correspond ?</h2>
            <p className="text-slate-600 mt-3">{"Six leviers éprouvés pour optimiser votre investissement selon votre profil fiscal et votre appétit au risque."}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INVEST_STRATEGIES.map((s, i) => {
              const Ic = s.icon
              const t  = toneMap[s.tone] || toneMap.orange
              return (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                  className={`group rounded-3xl border p-6 hover:shadow-card transition-all hover:-translate-y-1 cursor-pointer ${t.border} bg-white`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${t.bg} ${t.text}`}>
                      <Ic size={22} />
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.badge}`}>{s.yield}</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{s.label}</div>
                  <div className="text-navy-900 font-bold text-base mb-2">{s.title}</div>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                  <div className={`mt-4 flex items-center gap-1 text-xs font-semibold ${t.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    En savoir plus <Icons.ArrowRight size={13} />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Simulateur de rendement ───────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Outil gratuit</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Simulateur de rendement</h2>
            <p className="text-slate-600 mt-3">Renseignez votre projet et obtenez instantanément les indicateurs clés.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Inputs */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8">
              <div className="text-navy-900 font-bold text-lg mb-6">Votre projet</div>
              <div className="space-y-5">
                {[
                  { label: "Prix d'achat (€)", value: simPrix,    set: setSimPrix,    placeholder: '300 000' },
                  { label: 'Loyer mensuel (€)', value: simLoyer,   set: setSimLoyer,   placeholder: '900' },
                  { label: 'Charges/mois (€)',  value: simCharges, set: setSimCharges, placeholder: '120' },
                  { label: 'Travaux (€)',        value: simTravaux, set: setSimTravaux, placeholder: '0' },
                ].map(({ label, value, set, placeholder }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <input
                      type="number" value={value} onChange={e => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-navy-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition"
                    />
                  </div>
                ))}
              </div>
              <p className="text-slate-400 text-xs mt-5">{"* Simulation indicative — consulter un conseiller pour un bilan personnalisé."}</p>
            </div>

            {/* Results */}
            <div className="flex flex-col gap-4">
              {/* Main yields */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Rendement brut',  value: rendBrut, suffix: ' %' },
                  { label: 'Rendement net',   value: rendNet,  suffix: ' %' },
                ].map(({ label, value, suffix }) => (
                  <motion.div key={label}
                    animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 text-center">
                    <div className={`text-4xl font-extrabold ${rendColor(value)}`}>
                      {value.toFixed(1)}{suffix}
                    </div>
                    <div className="text-slate-600 text-sm mt-1 font-medium">{label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Secondary metrics */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
                <div className="text-navy-900 font-bold mb-1">Indicateurs complémentaires</div>
                {[
                  { label: 'Cashflow mensuel',  value: `${cashflow >= 0 ? '+' : ''}${cashflow.toLocaleString('fr-FR')} €`, ok: cashflow >= 0 },
                  { label: 'Loyers annuels',    value: `${(loyer * 12).toLocaleString('fr-FR')} €`,                        ok: loyer > 0 },
                  { label: 'Charges annuelles', value: `${(charges * 12).toLocaleString('fr-FR')} €`,                      ok: null },
                  { label: 'Retour sur invest.', value: pointMort ? `${pointMort} ans` : '—',                              ok: pointMort !== null && pointMort <= 20 },
                ].map(({ label, value, ok }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-500 text-sm">{label}</span>
                    <span className={`text-sm font-bold ${ok === true ? 'text-emerald-600' : ok === false ? 'text-rose-500' : 'text-navy-900'}`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Verdict */}
              <div className={`rounded-3xl p-5 flex items-start gap-3 ${
                rendBrut >= 5 ? 'bg-emerald-50 border border-emerald-100' :
                rendBrut >= 3 ? 'bg-orange-50 border border-orange-100' :
                'bg-slate-100 border border-slate-200'
              }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  rendBrut >= 5 ? 'bg-emerald-100 text-emerald-600' :
                  rendBrut >= 3 ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  {rendBrut >= 5 ? <Icons.CheckCircle size={16} /> : rendBrut >= 3 ? <Icons.Zap size={16} /> : <Icons.AlertCircle size={16} />}
                </div>
                <div>
                  <div className="font-bold text-navy-900 text-sm">
                    {rendBrut >= 5 ? "Excellent potentiel d'investissement" :
                     rendBrut >= 3 ? 'Rendement correct, optimisable' :
                     'Renseignez votre projet ci-contre'}
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    {rendBrut >= 5 ? "Ce bien dépasse le seuil de rentabilité optimal (5 %). Envisagez le régime LMNP pour défiscaliser." :
                     rendBrut >= 3 ? "Considérez le dispositif Pinel ou la colocation pour améliorer le cashflow." :
                     "Le simulateur se met à jour en temps réel au fil de votre saisie."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Régime fiscal comparé ────────────────────────── */}
      {(() => {
        const regimeResults = INVEST_REGIMES.map(r => {
          const taxableIncome = (loyer - charges) * 12 - prix * r.amortFactor
          const taxSaved      = Math.max(0, prix * r.amortFactor * r.taxFactor)
          const netIncome     = Math.max(0, taxableIncome) * (1 - r.taxFactor) + taxSaved
          const netYield      = total > 0 ? (netIncome / total * 100) : 0
          return { ...r, netYield }
        })
        const maxYield = Math.max(...regimeResults.map(r => r.netYield), 0.1)
        return (
          <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Optimisation fiscale</div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Quel régime est le plus avantageux ?</h2>
                <p className="text-slate-600 mt-3">Basé sur votre simulation — rendement net après impôt selon chaque dispositif.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
                {regimeResults.map((r, i) => {
                  const isActive = r.id === simRegime
                  const pct = maxYield > 0 ? (r.netYield / maxYield * 100) : 0
                  return (
                    <motion.button key={r.id}
                      initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
                      viewport={{ once:true }} transition={{ delay: i*0.08 }}
                      onClick={() => setSimRegime(r.id)}
                      className={`rounded-3xl p-6 text-left transition-all hover:-translate-y-1 border-2 ${isActive ? 'shadow-card' : 'border-slate-100 bg-white hover:shadow-soft'}`}
                      style={{ borderColor: isActive ? r.color : undefined, background: isActive ? `${r.color}0D` : undefined }}>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white mb-4 inline-block" style={{ background: r.color }}>{r.tag}</span>
                      <div className="text-navy-900 font-extrabold text-lg mb-0.5">{r.label}</div>
                      <div className="text-3xl font-extrabold mb-3" style={{ color: r.color }}>
                        {r.netYield.toFixed(1)}<span className="text-lg font-semibold"> %</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                        <div className="h-2 rounded-full transition-all duration-500" style={{ width:`${pct}%`, background: r.color }} />
                      </div>
                      <div className="text-xs text-slate-400 mt-2">Rendement net estimé / an</div>
                    </motion.button>
                  )
                })}
              </div>

              <p className="text-center text-slate-400 text-xs mt-6">* Simulation indicative basée sur les valeurs du simulateur ci-dessus. Consultez un conseiller fiscal.</p>
            </div>
          </section>
        )
      })()}

      {/* ── Projection patrimoniale ───────────────────────── */}
      {(() => {
        const steps     = Math.max(projYears, 1)
        const appreciation = 0.015
        const taxRate   = INVEST_REGIMES.find(r => r.id === simRegime)?.taxFactor ?? 0.25
        const annualNetRent = Math.max(0, (loyer - charges) * 12 * (1 - taxRate))
        const projData  = Array.from({ length: steps + 1 }, (_, y) => ({
          y,
          capital: total * Math.pow(1 + appreciation, y),
          cumRent: annualNetRent * y,
        })).map(d => ({ ...d, total: d.capital + d.cumRent }))
        const maxVal    = Math.max(...projData.map(d => d.total), 1)
        const svgW = 480, svgH = 160, pad = 10
        const toX = y => pad + (y / steps) * (svgW - pad * 2)
        const toY = v => svgH - pad - ((v / maxVal) * (svgH - pad * 2))
        const pathTotal   = projData.map((d,i) => `${i===0?'M':'L'}${toX(d.y)},${toY(d.total)}`).join(' ')
        const pathCapital = projData.map((d,i) => `${i===0?'M':'L'}${toX(d.y)},${toY(d.capital)}`).join(' ')
        const areaTotal   = `${pathTotal} L${toX(steps)},${svgH} L${toX(0)},${svgH} Z`
        const milestones  = [0, Math.round(steps/4), Math.round(steps/2), Math.round(steps*3/4), steps]
        const finalGain   = projData[steps].total - total
        const gainPct     = total > 0 ? finalGain / total * 100 : 0
        return (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Simulation long terme</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight mb-4">
                    Votre patrimoine<br/>dans <span className="text-orange-500">{projYears} ans</span>
                  </h2>
                  <p className="text-slate-600 mb-6">Valorisation du bien (hausse 1,5 %/an) + loyers nets cumulés sur la durée.</p>

                  {/* Year slider */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Horizon d'investissement</span>
                      <span className="font-bold text-navy-900">{projYears} ans</span>
                    </div>
                    <input type="range" min={5} max={30} step={5} value={projYears}
                      onChange={e => setProjYears(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full accent-orange-500 cursor-pointer" />
                    <div className="flex justify-between mt-1 text-slate-300" style={{ fontSize:10 }}>
                      {[5,10,15,20,25,30].map(y => <span key={y}>{y}</span>)}
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Valeur du bien', value: `${Math.round(projData[steps].capital).toLocaleString('fr-FR')} €`, color: '#0F172A' },
                      { label: 'Loyers nets cumulés', value: `${Math.round(projData[steps].cumRent).toLocaleString('fr-FR')} €`, color: '#6366F1' },
                      { label: 'Patrimoine total', value: `${Math.round(projData[steps].total).toLocaleString('fr-FR')} €`, color: '#F97316' },
                      { label: 'Gain vs mise', value: `+${gainPct.toFixed(0)} %`, color: '#10B981' },
                    ].map(k => (
                      <div key={k.label} className="bg-slate-50 rounded-2xl p-4">
                        <div className="text-xs text-slate-500 mb-1">{k.label}</div>
                        <div className="text-xl font-extrabold" style={{ color: k.color }}>{k.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SVG chart */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <div className="flex items-center gap-4 mb-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-orange-500 inline-block rounded"/>{' '}Patrimoine total</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-400 inline-block rounded"/>{' '}Valeur du bien</span>
                  </div>
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height:200 }}>
                    <defs>
                      <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#F97316" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    {[0.25,0.5,0.75,1].map(f => (
                      <line key={f} x1={pad} x2={svgW-pad} y1={toY(maxVal*f)} y2={toY(maxVal*f)} stroke="#E2E8F0" strokeWidth="0.5"/>
                    ))}
                    {/* Area fill */}
                    <path d={areaTotal} fill="url(#gradTotal)"/>
                    {/* Capital line */}
                    <path d={pathCapital} fill="none" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="4 3"/>
                    {/* Total line */}
                    <path d={pathTotal} fill="none" stroke="#F97316" strokeWidth="2.5"/>
                    {/* Year labels */}
                    {milestones.map(y => (
                      <text key={y} x={toX(y)} y={svgH-1} textAnchor="middle" style={{ fontSize:9, fill:'#94A3B8' }}>{y > 0 ? `${y}a` : ''}</text>
                    ))}
                    {/* Final dot */}
                    <circle cx={toX(steps)} cy={toY(projData[steps].total)} r="4" fill="#F97316"/>
                  </svg>
                  <div className="mt-2 text-center text-xs text-slate-400">Mise initiale : {total > 0 ? total.toLocaleString('fr-FR') : '—'} €</div>
                </div>
              </div>
            </div>
          </section>
        )
      })()}

      {/* ── Comparateur de placements ─────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Benchmark</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">L'immobilier vs les autres placements</h2>
            <p className="text-slate-600 mt-3">Rendement annuel moyen constaté sur 10 ans — risque et liquidité comparés.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {PLACEMENT_COMPARE.map((p, i) => {
              const maxR = 7.5
              const barW = (p.returnPct / maxR * 100).toFixed(1)
              return (
                <motion.div key={p.label}
                  initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }} transition={{ delay: i*0.07 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft flex items-center gap-5">
                  <div className="w-36 shrink-0">
                    <div className="font-bold text-navy-900 text-sm leading-tight">{p.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.desc}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width:0 }} whileInView={{ width:`${barW}%` }}
                          viewport={{ once:true }} transition={{ delay: i*0.07 + 0.2, duration:0.6 }}
                          className="h-full rounded-full" style={{ background: p.color }} />
                      </div>
                      <span className="text-base font-extrabold w-14 text-right" style={{ color: p.color }}>
                        {p.returnPct.toFixed(1)} %
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-slate-400 mb-1">Risque</div>
                    <div className="flex gap-1 justify-end">
                      {[1,2,3,4,5].map(d => (
                        <div key={d} className="w-2 h-2 rounded-sm" style={{ background: d <= p.risk ? p.color : '#E2E8F0' }} />
                      ))}
                    </div>
                    <div className="text-xs font-semibold mt-1" style={{ color: p.color }}>{p.riskLabel}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">Sources : IEIF, AMF, Banque de France — données 2015–2025. Les performances passées ne préjugent pas des performances futures.</p>
        </div>
      </section>

      {/* ── Top villes par rendement ─────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Cartographie</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Top villes investissement</h2>
              <p className="text-slate-500 mt-2">Rendements moyens constatés — données actualisées mensuellement.</p>
            </div>
            <div className="flex items-center gap-6 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-500 inline-block"/>Rendement brut</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-navy-900 inline-block"/>Rendement net</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['#', 'Ville', 'Département', 'Rendement brut', 'Rendement net', 'Tension (+12 mois)'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_CITIES.map((c, i) => (
                  <motion.tr key={c.city}
                    initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-bold">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-navy-900">{c.city}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{c.dept}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full bg-orange-500" style={{ width: `${c.brut * 10}px` }} />
                        <span className="font-extrabold text-orange-600">{c.brut.toFixed(1)} %</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full bg-navy-900" style={{ width: `${c.net * 10}px` }} />
                        <span className="font-bold text-navy-900">{c.net.toFixed(1)} %</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">{c.trend}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Annonces à fort potentiel ─────────────────────── */}
      <Listings listings={listings} loading={loading} error={error} source={source}
        title="Biens à fort potentiel" kicker="Opportunités sélectionnées" />

      {/* ── Témoignages investisseurs ─────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Retours clients</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">
              Ils ont investi avec PASMAL
            </h2>
            <p className="text-slate-500 mt-3">{"Des rendements réels, des investisseurs satisfaits."}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INVEST_TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-soft p-7 flex flex-col">
                {/* Yield badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Icons.Star key={j} size={13} fill="#F97316" className="text-orange-500" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-extrabold px-2.5 py-1 rounded-full">
                    <Icons.TrendingUp size={11} /> {t.yield} brut · {t.city}
                  </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed flex-1 mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div>
                    <div className="font-bold text-navy-900 text-sm">{t.name}</div>
                    <div className="text-slate-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Avantages fiscaux ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Fiscalité</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Optimisez votre fiscalité</h2>
            <p className="text-slate-600 mt-3">{"Les trois dispositifs les plus utilisés par nos investisseurs, expliqués simplement."}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {FISCAL_CARDS.map((f, i) => {
              const Ic = f.icon
              const t  = toneMap[f.tone] || toneMap.orange
              return (
                <motion.div key={f.name}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-3xl border border-slate-100 shadow-soft p-8 hover:shadow-card transition-shadow">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.bg} ${t.text}`}>
                      <Ic size={24} />
                    </div>
                    <div>
                      <div className="font-extrabold text-navy-900">{f.name}</div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.badge}`}>{f.tag}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">{f.desc}</p>
                  <ul className="space-y-2">
                    {f.items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                        <Icons.Check size={14} className="text-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className={`mt-6 w-full h-10 rounded-2xl text-sm font-semibold transition ${t.bg} ${t.text} hover:opacity-80`}>
                    {"En savoir plus"}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Guides investissement ────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Ressources</div>
              <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">Guides pour investisseurs</h2>
            </div>
            <button className="flex items-center gap-1.5 text-navy-700 hover:text-orange-600 font-medium text-sm transition-colors">
              Tous les guides <Icons.ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GUIDES_INVEST.map((g, i) => (
              <motion.article key={g.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-3xl border border-slate-100 shadow-soft hover:shadow-card overflow-hidden transition-all hover:-translate-y-1 cursor-pointer">
                <div className="relative h-44 overflow-hidden">
                  <img src={g.img} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
                  <span className="absolute top-4 left-4 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-navy-900">
                    {g.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-navy-900 text-base mb-2 leading-snug group-hover:text-orange-600 transition-colors">{g.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">{g.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Icons.Eye size={11} /> Lecture {g.time}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Lire <Icons.ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <TrustGuarantees />

      {/* ── CTA expert ───────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-navy-900 via-[#0e1f3a] to-[#162E52] relative overflow-hidden">
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center mx-auto mb-6">
            <Icons.Sparkles size={28} className="text-white" />
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            {"Un conseiller dédié, pour vous."}
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            {"Nos experts certifiés analysent votre situation, identifient les meilleures opportunités et vous accompagnent jusqu'à la signature."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
              <Icons.Phone size={16} /> Prendre rendez-vous
            </button>
            <button className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full transition-all">
              <Icons.Mail size={16} /> Nous écrire
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
            {['Consultation offerte', 'Réponse sous 24h', 'Experts certifiés AMF'].map(t => (
              <div key={t} className="flex items-center gap-2 text-white/60 text-sm">
                <Icons.CheckCircle size={15} className="text-emerald-400" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>
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

const PUBLI_FAQ = [
  {
    q: "Combien de temps avant que mon annonce soit en ligne ?",
    a: "Votre annonce est vérifiée par notre équipe dans les 24 heures ouvrées. En pratique, la plupart des annonces sont en ligne dans les 4 à 8 heures suivant la soumission.",
  },
  {
    q: "Puis-je modifier mon annonce après publication ?",
    a: "Oui, à tout moment depuis votre espace propriétaire. Vous pouvez modifier le titre, la description, les photos et le prix. Chaque modification de prix ou de surface déclenche une nouvelle vérification rapide.",
  },
  {
    q: "Comment sont gérés les contacts des acheteurs et locataires ?",
    a: "Les demandes arrivent dans votre messagerie PASMAL. Vous n'avez pas à divulguer vos coordonnées personnelles avant de le souhaiter. Pack Visibilité et Premium incluent des alertes SMS et e-mail en temps réel.",
  },
  {
    q: "Y a-t-il une commission sur la vente ou la location ?",
    a: "Non. PASMAL est une plateforme de mise en relation. Vous payez uniquement la publication de l'annonce — aucun frais caché, aucune commission sur la transaction, quel que soit le prix de vente ou le loyer.",
  },
  {
    q: "Que se passe-t-il quand mon annonce expire ?",
    a: "Elle est automatiquement désactivée et retirée des résultats. Vous recevez une notification 7 jours avant l'expiration pour la prolonger. Elle reste modifiable dans votre espace à tout moment.",
  },
]

const PUBLI_STEPS = [
  { label: 'Type',          icon: Icons.Home },
  { label: 'Description',   icon: Icons.FileText },
  { label: 'Localisation',  icon: Icons.MapPin },
  { label: 'Photos',        icon: Icons.Image },
  { label: 'Prix & Plan',   icon: Icons.Tag },
]

const PUBLI_DPE_OPTIONS = ['A','B','C','D','E','F','G']
const PUBLI_DPE_COLORS  = { A:'#00A651',B:'#51B948',C:'#BECE00',D:'#FECB00',E:'#FB7A08',F:'#EE3424',G:'#C50D13' }
const PUBLI_FEATURES    = ['Ascenseur','Parking','Cave','Balcon / Terrasse','Jardin','Piscine','Gardien','Interphone','Parquet','Double vitrage','Fibre optique','Climatisation']

const PUBLI_WIZARD_PLANS = [
  { id:'gratuit',    name:'Gratuit',         price:0,     days:7,  photos:3,  badge:null,           highlight:false, features:['3 photos','Visibilité standard','7 jours en ligne'] },
  { id:'visibilite', name:'Pack Visibilité', price:9.90,  days:30, photos:8,  badge:'Le plus choisi', highlight:true,  features:['8 photos','Boost +200 %','30 jours en ligne','Stats de base'] },
  { id:'premium',    name:'Premium',         price:14.90, days:30, photos:15, badge:'Vente rapide',  highlight:false, features:['15 photos','Mise en avant 7j','30 jours en ligne','Stats avancées'] },
]

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

const PUBLI_AVANTAGES = [
  { icon: Icons.Users,      tone: 'orange',  title: "2,4 M de visiteurs/mois",   desc: "Votre annonce exposee a la plus grande base d'acquéreurs et locataires qualifies de France." },
  { icon: Icons.Zap,        tone: 'emerald', title: "Publication en 5 minutes",   desc: "Formulaire guide en 4 etapes, validation automatique, mise en ligne sous 24 h ouvrées." },
  { icon: Icons.BadgeCheck, tone: 'indigo',  title: "Contacts 100 % verifies",    desc: "Chaque demande de contact est qualifiee : acheteurs avec budget confirme, locataires avec dossier valide." },
  { icon: Icons.TrendingUp, tone: 'rose',    title: "Stats en temps reel",        desc: "Suivez les vues, les clics et les demandes de contact depuis votre tableau de bord propriétaire." },
]

const PUBLI_PROCESS = [
  { icon: Icons.FileText,    step: 1, title: "Decrivez votre bien",     desc: "Type, surface, localisation, photos HD. Notre assistant vous guide a chaque champ en moins de 5 minutes." },
  { icon: Icons.CheckCircle, step: 2, title: "Nous validons l'annonce", desc: "Notre equipe verifie la coherence du prix et la qualite des photos. Mise en ligne sous 24 h ouvrées." },
  { icon: Icons.Bell,        step: 3, title: "Recevez les contacts",    desc: "Acheteurs et locataires vous contactent directement. Gerez tout depuis votre espace PASMAL." },
]

const PUBLI_TONE = {
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-100'  },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-100'  },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-100'    },
}

const PUBLI_PLANS = [
  {
    name: 'Gratuit',
    price: '0',
    period: 'annonce',
    highlight: false,
    features: ['1 photo', 'Visibilite standard', '30 jours en ligne', 'Contact par e-mail'],
  },
  {
    name: 'Pack Visibilite',
    price: '29',
    period: 'annonce',
    highlight: true,
    features: ['6 photos HD', 'Mise en avant 7 jours', '60 jours en ligne', 'Badge "Annonce verifiee"', 'Stats de visites'],
  },
  {
    name: 'Premium',
    price: '79',
    period: 'annonce',
    highlight: false,
    features: ['Photos illimitees', 'Mise en avant permanente', '90 jours en ligne', 'Alertes acheteurs cibles', 'Support prioritaire'],
  },
]

function PublierFAQ() {
  const [open, setOpen] = useState(null)
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">FAQ</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">Questions fréquentes</h2>
          <p className="text-slate-500 mt-3">Vendeurs et bailleurs — tout ce que vous devez savoir.</p>
        </div>
        <div className="space-y-3">
          {PUBLI_FAQ.map((item, i) => (
            <div key={i} className={`rounded-2xl border bg-white transition-all ${open === i ? 'border-emerald-200 shadow-soft' : 'border-slate-100'}`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <span className="font-semibold text-[#0B1F3A] text-sm">{item.q}</span>
                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${open === i ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Icons.ChevronDown size={14} className={`transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-slate-500 text-sm leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PublierCTAForte({ cta }) {
  return (
    <section className="py-20 bg-gradient-to-br from-[#0a1628] via-[#0e1f3a] to-[#0f2a1a] relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          1 248 annonces actives ce mois
        </div>
        <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
          Prêt à toucher vos premiers<br />
          <span className="text-orange-400">acheteurs qualifiés ?</span>
        </h2>
        <p className="text-white/70 text-base mb-10 max-w-xl mx-auto">
          Publiez gratuitement en 5 minutes. Aucun abonnement, aucun engagement. Passez au plan payant uniquement si vous souhaitez booster votre visibilité.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          {cta}
          <a href="#" className="text-white/60 hover:text-white text-sm font-medium transition-colors flex items-center gap-1">
            Voir les tarifs <Icons.ArrowRight size={14} />
          </a>
        </div>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {['Gratuit pour commencer', 'Aucun engagement', '100 % sécurisé'].map(badge => (
            <div key={badge} className="flex items-center gap-1.5 text-white/50 text-xs">
              <Icons.Check size={12} className="text-emerald-400 shrink-0" />
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PublierView({ user, onSignIn }) {
  const formRef = useRef(null)
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
    dpe:             '',
    features:        [],
    plan:            'visibilite',
  })
  const fileRef = useRef(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleFeature = (f) => setForm(prev => ({
    ...prev,
    features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f]
  }))

  const validate = () => {
    const e = {}
    if (step === 1 && !form.propertyType)   e.propertyType = 'Choisissez un type de bien'
    if (step === 2 && !form.title.trim())   e.title        = 'Le titre est obligatoire'
    if (step === 2 && !form.surface)        e.surface      = 'La surface est obligatoire'
    if (step === 3 && !form.city.trim())    e.city         = 'La ville est obligatoire'
    if (step === 5 && !form.price)          e.price        = 'Le prix est obligatoire'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 5)) }
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

  /* ── shared hero + landing sections ──────────────── */
  const LandingTop = ({ cta }) => (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#0a1628] via-[#0e1f3a] to-[#0f2a1a] overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-5">
            <Icons.Building size={12} /> Espace proprietaires
          </div>
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5">
            Publiez, attirez,<br/>
            <span className="text-orange-400">concluez.</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            {"Votre annonce exposee a 2,4 millions d'acquereurs et locataires qualifies. Publication en 5 minutes."}
          </p>

          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap mb-12">
            {[
              { value: 2400000, suffix: '',  label: "visiteurs / mois"      },
              { value: 5,       suffix: 'min', label: "pour publier"         },
              { value: 96,      suffix: '%', label: "proprietaires satisfaits" },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }} className="text-center">
                <div className="text-white text-2xl md:text-3xl font-extrabold">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {cta}
        </div>
      </section>

      {/* Avantages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Pourquoi PASMAL</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">La plateforme des proprietaires exigeants</h2>
            <p className="text-slate-500 mt-3">{"Des outils qui vendent, une audience qui convertit."}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PUBLI_AVANTAGES.map((a, i) => {
              const Ic = a.icon
              const t  = PUBLI_TONE[a.tone]
              return (
                <motion.div key={a.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`bg-white rounded-3xl border p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all ${t.border}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${t.bg} ${t.text}`}>
                    <Ic size={24} />
                  </div>
                  <div className="font-extrabold text-navy-900 text-base mb-2">{a.title}</div>
                  <p className="text-slate-500 text-sm leading-relaxed">{a.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comment ca marche */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Simple et rapide</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Publiez en 3 etapes</h2>
            <p className="text-slate-500 mt-3">{"De la redaction a la reception des contacts en moins de 24 h."}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
            <div className="hidden md:block absolute top-[52px] left-[calc(16.6%+8px)] right-[calc(16.6%+8px)] h-px bg-gradient-to-r from-emerald-100 via-emerald-400 to-emerald-100 pointer-events-none" />
            {PUBLI_PROCESS.map((s, i) => {
              const Ic = s.icon
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative flex flex-col items-center text-center z-10">
                  <div className="relative mb-5">
                    <div className="w-[104px] h-[104px] rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-cardHover">
                      <Ic size={36} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-emerald-400 text-emerald-600 text-xs font-extrabold flex items-center justify-center shadow-sm">
                      {s.step}
                    </div>
                  </div>
                  <div className="font-extrabold text-navy-900 text-base mb-2">{s.title}</div>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Apercu tarifs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Nos formules</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">Une formule pour chaque projet</h2>
            <p className="text-slate-500 mt-3">{"Commencez gratuitement, montez en puissance si besoin."}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PUBLI_PLANS.map((plan, i) => (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-3xl border p-7 flex flex-col relative overflow-hidden transition-all hover:-translate-y-1 ${
                  plan.highlight
                    ? 'bg-navy-900 border-orange-500 shadow-cardHover'
                    : 'bg-white border-slate-100 shadow-soft hover:shadow-card'
                }`}>
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400" />
                )}
                {plan.highlight && (
                  <span className="inline-block self-start mb-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Le plus populaire
                  </span>
                )}
                <div className={`text-lg font-extrabold mb-1 ${plan.highlight ? 'text-white' : 'text-navy-900'}`}>{plan.name}</div>
                <div className={`text-3xl font-extrabold mb-1 ${plan.highlight ? 'text-orange-400' : 'text-navy-900'}`}>
                  {plan.price === '0' ? 'Gratuit' : `${plan.price} €`}
                  {plan.price !== '0' && <span className={`text-sm font-medium ml-1 ${plan.highlight ? 'text-white/50' : 'text-slate-400'}`}>/ annonce</span>}
                </div>
                <div className={`w-full h-px my-4 ${plan.highlight ? 'bg-white/10' : 'bg-slate-100'}`} />
                <ul className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5">
                      <Icons.Check size={14} className={plan.highlight ? 'text-emerald-400 shrink-0' : 'text-emerald-500 shrink-0'} />
                      <span className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-slate-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublierFAQ />
      <PublierCTAForte cta={cta} />
    </>
  )

  if (!user) {
    return (
      <>
        <LandingTop cta={(
          <button onClick={onSignIn}
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full text-base transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
            Publier mon annonce <Icons.ArrowRight size={18} />
          </button>
        )} />
        {/* Login card */}
        <section className="py-20 bg-slate-50" id="publier-form">
          <div className="max-w-lg mx-auto px-6">
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-card">
              <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white flex items-center justify-center mx-auto mb-5">
                <Icons.Lock size={28} />
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Connectez-vous pour publier</h2>
              <p className="text-slate-500 mb-7 max-w-sm mx-auto">{"Creez un compte gratuit en moins d'une minute et publiez votre premiere annonce immediatement."}</p>
              <button onClick={onSignIn}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
                Creer un compte gratuit <Icons.ArrowRight size={16} />
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
        {/* Success hero */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#0a1628] via-[#0e1f3a] to-[#0f2a1a] overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-5">
              <Icons.CheckCircle size={12} /> Annonce publiee
            </div>
            <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
              Votre annonce est<br/><span className="text-emerald-400">en ligne !</span>
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              {"Votre bien est maintenant visible par des milliers d'acquereurs qualifies."}
            </p>
          </div>
        </section>
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
      <LandingTop cta={(
        <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full text-base transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
          Publier maintenant <Icons.ArrowRight size={18} />
        </button>
      )} />

      <section ref={formRef} className="py-12 bg-slate-50" id="publier-form">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-8">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Formulaire</div>
            <h2 className="text-2xl font-extrabold text-navy-900">Publier votre annonce</h2>
          </div>

          {/* Progress steps */}
          <div className="mb-8">
            {/* Progress bar */}
            <div className="relative h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                animate={{ width: `${((step - 1) / (PUBLI_STEPS.length - 1)) * 100}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
              />
            </div>
            {/* Step circles */}
            <div className="flex items-start justify-between">
              {PUBLI_STEPS.map((s, i) => {
                const n       = i + 1
                const done    = step > n
                const current = step === n
                const StepIc  = s.icon
                return (
                  <div key={n} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      done    ? 'bg-emerald-500 text-white shadow-sm' :
                      current ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 scale-110' :
                                'bg-slate-100 text-slate-400'
                    }`}>
                      {done ? <Icons.Check size={15} /> : <StepIc size={15} />}
                    </div>
                    <span className={`text-[10px] font-semibold text-center leading-tight hidden sm:block ${
                      current ? 'text-orange-600' : done ? 'text-emerald-600' : 'text-slate-400'
                    }`}>{s.label}</span>
                  </div>
                )
              })}
            </div>
            <div className="text-center mt-3">
              <span className="text-xs text-slate-400">Étape <span className="font-bold text-navy-900">{step}</span> / {PUBLI_STEPS.length}</span>
            </div>
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

                {/* DPE */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    DPE <span className="normal-case font-normal text-slate-400">(facultatif)</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PUBLI_DPE_OPTIONS.map(band => (
                      <button key={band} type="button" onClick={() => set('dpe', form.dpe === band ? '' : band)}
                        className={`w-10 h-10 rounded-xl font-extrabold text-sm transition-all ${form.dpe === band ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'opacity-70 hover:opacity-100'}`}
                        style={{ background: PUBLI_DPE_COLORS[band], color: ['C','D'].includes(band) ? '#1a1a1a' : 'white', ringColor: PUBLI_DPE_COLORS[band] }}>
                        {band}
                      </button>
                    ))}
                    {form.dpe && <span className="self-center text-xs text-slate-400 ml-1">Sélectionné : {form.dpe}</span>}
                  </div>
                </div>

                {/* Équipements */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Équipements <span className="normal-case font-normal text-slate-400">(facultatif)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PUBLI_FEATURES.map(f => {
                      const active = form.features.includes(f)
                      return (
                        <button key={f} type="button" onClick={() => toggleFeature(f)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left ${
                            active ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'
                          }`}>
                          <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${active ? 'bg-orange-500 border-orange-500' : 'border-slate-300'}`}>
                            {active && <Icons.Check size={9} className="text-white" />}
                          </div>
                          {f}
                        </button>
                      )
                    })}
                  </div>
                </div>
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

            {/* ── Step 4 : Photos ───────────────────────────── */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-1">Photos de votre bien</h2>
                  <p className="text-sm text-slate-500">La première photo sera la photo principale de l'annonce.</p>
                </div>

                <div
                  onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors bg-white hover:bg-orange-50/30 group">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                    <Icons.Upload size={26} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600">Glissez vos photos ici</p>
                    <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP — max 6 photos</p>
                  </div>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
                    Parcourir les fichiers
                  </span>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => handleFiles(e.target.files)} />
                </div>

                {form.photos.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">{form.photos.length} photo{form.photos.length > 1 ? 's' : ''} ajoutée{form.photos.length > 1 ? 's' : ''}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {form.photos.map((src, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[4/3]">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          {i === 0 && (
                            <div className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                              Principale
                            </div>
                          )}
                          <button type="button"
                            onClick={() => set('photos', form.photos.filter((_, j) => j !== i))}
                            className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition">
                            <Icons.X size={9} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">💡 La première photo est la plus importante — les acheteurs la voient en premier.</p>
                  </div>
                )}

                {form.photos.length === 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5">
                    <Icons.AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">Les annonces avec photos reçoivent <strong>3× plus de contacts</strong>. Vous pouvez passer cette étape et ajouter des photos plus tard.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 5 : Prix & Plan ──────────────────────── */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-1">Prix & formule de diffusion</h2>
                  <p className="text-sm text-slate-500">Définissez votre prix et choisissez la visibilité de votre annonce.</p>
                </div>

                {/* Prix */}
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

                {/* Plan selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Formule de diffusion</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PUBLI_WIZARD_PLANS.map(plan => {
                      const active = form.plan === plan.id
                      return (
                        <button key={plan.id} type="button" onClick={() => set('plan', plan.id)}
                          className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
                            active ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-200'
                          }`}>
                          {plan.badge && (
                            <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                              active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>{plan.badge}</span>
                          )}
                          <div className="font-extrabold text-navy-900 text-sm mb-0.5">{plan.name}</div>
                          <div className={`text-lg font-extrabold mb-2 ${active ? 'text-orange-600' : 'text-navy-900'}`}>
                            {plan.price === 0 ? 'Gratuit' : `${plan.price.toFixed(2).replace('.', ',')} €`}
                          </div>
                          <ul className="space-y-1">
                            {plan.features.map(f => (
                              <li key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Icons.Check size={10} className="text-emerald-500 shrink-0" /> {f}
                              </li>
                            ))}
                          </ul>
                          {active && (
                            <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                              <Icons.Check size={10} className="text-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Summary card */}
                <div className="bg-navy-900 rounded-2xl p-5 text-white">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Récapitulatif de votre annonce</div>
                  <div className="flex gap-4 items-start">
                    {form.photos.length > 0 ? (
                      <img src={form.photos[0]} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Icons.Image size={22} className="text-white/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-base leading-tight truncate">{form.title || 'Titre non renseigné'}</div>
                      {form.city && <div className="text-white/60 text-sm mt-0.5 flex items-center gap-1"><Icons.MapPin size={12}/>{form.city}{form.zipcode ? ` (${form.zipcode})` : ''}</div>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.surface && <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{form.surface} m²</span>}
                        {form.rooms   && <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{form.rooms} pièce{Number(form.rooms)>1?'s':''}</span>}
                        {form.dpe     && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: PUBLI_DPE_COLORS[form.dpe], color: ['C','D'].includes(form.dpe)?'#111':'white' }}>DPE {form.dpe}</span>}
                        {form.features.slice(0,3).map(f => <span key={f} className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{f}</span>)}
                        {form.features.length > 3 && <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">+{form.features.length-3}</span>}
                      </div>
                    </div>
                    {form.price && (
                      <div className="text-right shrink-0">
                        <div className="text-xl font-extrabold text-orange-400">
                          {Number(form.price).toLocaleString('fr-FR')} €{form.transactionType==='location'?'/mois':''}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                    <span>{form.photos.length} photo{form.photos.length!==1?'s':''}</span>
                    <span>Formule : {PUBLI_WIZARD_PLANS.find(p=>p.id===form.plan)?.name}</span>
                    <span>{PUBLI_WIZARD_PLANS.find(p=>p.id===form.plan)?.days} jours en ligne</span>
                  </div>
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

              {step < 5 ? (
                <button onClick={next}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-cardHover text-sm">
                  Suivant <Icons.ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={submit}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg text-sm">
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
   ADMIN VIEW — gateway landing page
   ============================================================================ */
const ADMIN_KPIS = [
  { icon: Icons.CreditCard, label: 'Revenus 30j',    value: 142580, suffix: ' €', trend: +18, color: 'orange' },
  { icon: Icons.Users,      label: 'Utilisateurs',   value: 8412,                      trend: +24, color: 'indigo' },
  { icon: Icons.Building,   label: 'Annonces',       value: 1248,                      trend: +12, color: 'emerald' },
  { icon: Icons.Sparkles,   label: 'Abonnements',    value: 384,                       trend: +9,  color: 'orange' },
  { icon: Icons.Building2,  label: 'Agences',        value: 142,                       trend: +3,  color: 'indigo' },
  { icon: Icons.Shield,     label: 'Alertes fraude', value: 7,                         trend: -2,  color: 'rose', alarm: true },
]

const ADMIN_MODULES = [
  { id: 'dashboard', icon: Icons.Eye,        label: 'Dashboard',    desc: 'Vue generale de la plateforme', color: 'orange' },
  { id: 'users',     icon: Icons.Users,      label: 'Utilisateurs', desc: '8 412 comptes actifs',          color: 'indigo' },
  { id: 'listings',  icon: Icons.Building,   label: 'Annonces',     desc: '1 248 actives · 14 en attente', color: 'emerald' },
  { id: 'agencies',  icon: Icons.Building2,  label: 'Agences',      desc: '142 certifiees · 2 en cours',   color: 'indigo' },
  { id: 'payments',  icon: Icons.CreditCard, label: 'Paiements',    desc: '142 580 € encaisses',      color: 'emerald' },
  { id: 'crm',       icon: Icons.Send,       label: 'CRM',          desc: 'Leads & contacts',              color: 'orange' },
  { id: 'reports',   icon: Icons.TrendingUp, label: 'Rapports',     desc: 'Analytiques & statistiques',    color: 'indigo' },
  { id: 'settings',  icon: Icons.Key,        label: 'Parametres',   desc: 'Configuration plateforme',      color: 'rose' },
]

const ADMIN_ACTIVITY = [
  { actor: 'PASMAL Trust', action: "a bloque l'annonce",  target: 'PSM-2418 (Lille)',    icon: Icons.Shield,     tone: 'rose',    time: 'Il y a 3 min' },
  { actor: 'Camille L.',   action: 'a contacte',          target: 'Studio Bastille',     icon: Icons.Mail,       tone: 'orange',  time: 'Il y a 8 min' },
  { actor: 'BARNES Lyon',  action: 'a soumis son Kbis',   target: 'Dossier #PSM-AG-204', icon: Icons.FileText,   tone: 'indigo',  time: 'Il y a 14 min' },
  { actor: 'Stripe',       action: 'a encaisse',          target: '+4 870 € Visibilite', icon: Icons.CreditCard, tone: 'emerald', time: 'Il y a 22 min' },
  { actor: 'PASMAL IA',    action: 'a detecte un doublon',target: '94% avec PSM-2401',   icon: Icons.Sparkles,   tone: 'rose',    time: 'Il y a 1h' },
]

const ADMIN_PLATFORM_STATUS = [
  { label: 'API PASMAL',   uptime: '99.98%' },
  { label: 'Supabase DB',  uptime: '100%'   },
  { label: 'Stripe',       uptime: '99.95%' },
  { label: 'CDN / Images', uptime: '100%'   },
]

const ADMIN_TONE = {
  orange:  { bg: 'bg-orange-500/15',  text: 'text-orange-400',  ring: 'ring-orange-500/30'  },
  indigo:  { bg: 'bg-indigo-500/15',  text: 'text-indigo-400',  ring: 'ring-indigo-500/30'  },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
  rose:    { bg: 'bg-rose-500/15',    text: 'text-rose-400',    ring: 'ring-rose-500/30'    },
}

/* ============================================================================
   Agences — constants + view
   ============================================================================ */
const AGENCIES_MOCK = [
  { id: 'barnes-paris',   name: 'BARNES Paris',         city: 'Paris',     region: 'Île-de-France',        logo: 'BA', color: '#0B1F3A', certified: 'trust',   rating: 4.9, reviews: 284, listings: 142, since: 2018, responseTime: '1h',  satisfaction: 98, score: 97, specialties: ['Luxe', 'Achat', 'Investissement'], desc: "Référence du marché parisien de prestige. Appartements haussmanniens, lofts de caractère, penthouses et propriétés d'exception.", imgId: 'photo-1502672260266-1c1ef2d93688' },
  { id: 'foncia-lyon',    name: 'FONCIA Lyon',          city: 'Lyon',      region: 'Auvergne-Rhône-Alpes', logo: 'FO', color: '#1D4ED8', certified: 'partner', rating: 4.5, reviews: 412, listings: 89,  since: 2019, responseTime: '3h',  satisfaction: 91, score: 84, specialties: ['Location', 'Gestion'],              desc: "Leader de la gestion locative à Lyon. Accompagnement propriétaires et locataires, syndic de copropriété.",                   imgId: 'photo-1522708323590-d24dbb6b0267' },
  { id: 'orpi-bordeaux',  name: 'ORPI Bordeaux',        city: 'Bordeaux',  region: 'Nouvelle-Aquitaine',   logo: 'OR', color: '#7C3AED', certified: 'partner', rating: 4.7, reviews: 198, listings: 67,  since: 2020, responseTime: '2h',  satisfaction: 95, score: 91, specialties: ['Achat', 'Vente'],                   desc: "Réseau coopératif implanté au cœur de Bordeaux. Spécialiste des biens anciens, pierres et chartrons bordelais.",            imgId: 'photo-1600585154340-be6161a56a0c' },
  { id: 'century21-nice', name: 'Century 21 Nice',      city: 'Nice',      region: 'PACA',                 logo: 'C2', color: '#0F766E', certified: 'trust',   rating: 4.8, reviews: 321, listings: 98,  since: 2017, responseTime: '2h',  satisfaction: 96, score: 94, specialties: ['Luxe', 'Achat', 'Location'],        desc: "Spécialiste niçois de l'immobilier haut de gamme. Appartements vue mer, villas Riviera, propriétés d'exception.",           imgId: 'photo-1493809842364-78817add7ffb' },
  { id: 'guy-hoquet',     name: 'Guy Hoquet Marseille', city: 'Marseille', region: 'PACA',                 logo: 'GH', color: '#B45309', certified: 'none',    rating: 4.3, reviews: 156, listings: 54,  since: 2021, responseTime: '6h',  satisfaction: 86, score: 73, specialties: ['Achat', 'Location', 'Neuf'],        desc: "Acteur majeur du marché marseillais, du studio hypercentre aux villas des quartiers résidentiels.",                          imgId: 'photo-1560448204-e02f11c3d0e2' },
  { id: 'laforet-nantes', name: 'Laforêt Nantes',       city: 'Nantes',    region: 'Pays de la Loire',     logo: 'LF', color: '#047857', certified: 'partner', rating: 4.6, reviews: 134, listings: 45,  since: 2020, responseTime: '4h',  satisfaction: 92, score: 87, specialties: ['Achat', 'Investissement'],           desc: "Cabinet fondé il y a 15 ans, spécialiste du premier achat et de l'investissement locatif nantais.",                         imgId: 'photo-1484154218962-a197022b5858' },
  { id: 'nexity-paris',   name: 'Nexity Paris',         city: 'Paris',     region: 'Île-de-France',        logo: 'NX', color: '#BE123C', certified: 'trust',   rating: 4.4, reviews: 567, listings: 213, since: 2016, responseTime: '2h',  satisfaction: 89, score: 88, specialties: ['Neuf', 'Investissement', 'Gestion'], desc: "Leader national de l'immobilier neuf. Programmes Pinel, LMNP et résidences services en Île-de-France.",                     imgId: 'photo-1556909114-f6e7ad7d3136' },
  { id: 'era-toulouse',   name: 'ERA Toulouse',         city: 'Toulouse',  region: 'Occitanie',            logo: 'ER', color: '#6D28D9', certified: 'partner', rating: 4.5, reviews: 89,  listings: 38,  since: 2022, responseTime: '5h',  satisfaction: 90, score: 80, specialties: ['Achat', 'Location', 'Viager'],      desc: "Référence sur la Ville Rose. Du studio étudiant à la villa avec piscine, en vente comme en location.",                       imgId: 'photo-1564013799919-ab600027ffc6' },
]

const AGENCY_REVIEWS_MAP = {
  'barnes-paris':   [
    { author: 'Marie T.',       rating: 5, date: 'Mars 2026',  text: 'Équipe très professionnelle, transaction rapide et sans accroc. Je recommande vivement !' },
    { author: 'Jean-Paul R.',   rating: 5, date: 'Fév. 2026',  text: 'Excellent suivi, disponibles à toute heure. Mon appartement vendu en 3 semaines.' },
    { author: 'Isabelle M.',    rating: 4, date: 'Jan. 2026',  text: 'Très bonne agence pour le marché parisien de luxe. Quelques délais de réponse à améliorer.' },
  ],
  'foncia-lyon':    [
    { author: 'Thomas B.',      rating: 5, date: 'Avr. 2026',  text: 'Gestion locative impeccable depuis 3 ans. Jamais eu de souci.' },
    { author: 'Sophie L.',      rating: 4, date: 'Mars 2026',  text: 'Réactifs et compétents. Légèrement cher mais le service le vaut.' },
    { author: 'Marc D.',        rating: 4, date: 'Fév. 2026',  text: 'Bonne agence, dossier traité rapidement.' },
  ],
  'orpi-bordeaux':  [
    { author: 'Claire V.',      rating: 5, date: 'Avr. 2026',  text: 'Achat de notre maison bordelaise géré avec professionnalisme. Merci !' },
    { author: 'Pierre N.',      rating: 5, date: 'Mars 2026',  text: 'Excellent conseil pour notre premier achat. On se sentait accompagnés.' },
    { author: 'Aurélie P.',     rating: 4, date: 'Jan. 2026',  text: 'Très bonne expérience, bien à l\'écoute de notre projet.' },
  ],
  'century21-nice': [
    { author: 'Hélène R.',      rating: 5, date: 'Avr. 2026',  text: 'Villa trouvée en moins d\'un mois. Service haut de gamme à tous les niveaux.' },
    { author: 'Laurent C.',     rating: 5, date: 'Mars 2026',  text: 'Connaissance parfaite du marché niçois. Conseillers très disponibles.' },
    { author: 'Nathalie B.',    rating: 5, date: 'Fév. 2026',  text: 'Prestation irréprochable, résultat au-delà de nos attentes.' },
  ],
  'guy-hoquet':     [
    { author: 'David K.',       rating: 4, date: 'Mars 2026',  text: 'Bon accompagnement dans l\'ensemble. Quelques délais un peu longs.' },
    { author: 'Sandra F.',      rating: 4, date: 'Fév. 2026',  text: 'Équipe sympathique et professionnelle. Je recommande.' },
    { author: 'Éric M.',        rating: 3, date: 'Jan. 2026',  text: 'Service correct, mais j\'ai dû relancer plusieurs fois.' },
  ],
  'laforet-nantes': [
    { author: 'Céline G.',      rating: 5, date: 'Mars 2026',  text: 'Premier achat réalisé sereinement grâce à l\'équipe Laforêt. Super expérience !' },
    { author: 'François A.',    rating: 5, date: 'Fév. 2026',  text: 'Très à l\'écoute, ils ont trouvé exactement ce que je cherchais.' },
    { author: 'Julie T.',       rating: 4, date: 'Jan. 2026',  text: 'Bonne agence, rapport qualité-prix satisfaisant.' },
  ],
  'nexity-paris':   [
    { author: 'Alain B.',       rating: 5, date: 'Avr. 2026',  text: 'Investissement Pinel géré de A à Z. Très professionnel.' },
    { author: 'Camille P.',     rating: 4, date: 'Mars 2026',  text: 'Programme neuf livré en temps et en heure. Bon suivi.' },
    { author: 'Bruno L.',       rating: 4, date: 'Fév. 2026',  text: 'Bonne expérience avec le service Nexity Paris.' },
  ],
  'era-toulouse':   [
    { author: 'Manon S.',       rating: 5, date: 'Mars 2026',  text: 'Vente de notre maison conclue en 5 semaines. Super équipe !' },
    { author: 'Julien M.',      rating: 4, date: 'Fév. 2026',  text: 'Bon conseil, agence sérieuse et disponible.' },
    { author: 'Christine B.',   rating: 5, date: 'Jan. 2026',  text: 'Très satisfaite, viager bien expliqué et bien géré.' },
  ],
}

const AGENCY_CERT = {
  trust:   { label: 'PASMAL Trust', bg: 'bg-orange-100', text: 'text-orange-600' },
  partner: { label: 'Partenaire',   bg: 'bg-indigo-100', text: 'text-indigo-600' },
  none:    null,
}

const AGENCY_FILTERS = ['Toutes', 'Luxe', 'Achat', 'Location', 'Investissement', 'Neuf', 'Gestion', 'Viager']

const AGENCY_LISTING_IMGS = [
  unsplash('photo-1502672260266-1c1ef2d93688', 400),
  unsplash('photo-1613490493576-7fde63acd811', 400),
  unsplash('photo-1560448204-e02f11c3d0e2', 400),
]

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={12} height={12} viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#F59E0B' : 'none'}
          stroke="#F59E0B" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

function AgencesView() {
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('Toutes')
  const [sortBy,    setSortBy]    = useState('score')
  const [viewMode,  setViewMode]  = useState('grid')
  const [selected,  setSelected]  = useState(null)
  const [contacted, setContacted] = useState(false)
  const [msgName,   setMsgName]   = useState('')
  const [msgEmail,  setMsgEmail]  = useState('')
  const [msgText,   setMsgText]   = useState('')

  const filtered = useMemo(() => {
    const list = AGENCIES_MOCK.filter(a => {
      const matchSearch = search.trim() === '' ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.city.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === 'Toutes' || a.specialties.includes(filter)
      return matchSearch && matchFilter
    })
    if (sortBy === 'rating')   list.sort((a, b) => b.rating   - a.rating)
    if (sortBy === 'listings') list.sort((a, b) => b.listings - a.listings)
    if (sortBy === 'reviews')  list.sort((a, b) => b.reviews  - a.reviews)
    if (sortBy === 'score')    list.sort((a, b) => b.score    - a.score)
    if (sortBy === 'response') list.sort((a, b) => parseInt(a.responseTime) - parseInt(b.responseTime))
    return list
  }, [search, filter, sortBy])

  const handleContact = (e) => { e.preventDefault(); setContacted(true) }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#0B1F3A] via-[#0e2040] to-[#0a1a35] overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-5">
            <Icons.BadgeCheck size={12} /> Agences certifiées PASMAL
          </div>
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5">
            Votre agence idéale,<br />
            <span className="text-orange-400">vérifiée et approuvée.</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
            Découvrez les agences partenaires PASMAL — sélectionnées pour leur sérieux, leurs résultats et la satisfaction de leurs clients.
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { value: AGENCIES_MOCK.length, label: 'agences référencées' },
              { value: '4,6', suffix: '/5', label: 'note moyenne' },
              { value: '1 850+', label: 'clients satisfaits' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-white text-2xl font-extrabold">{s.value}{s.suffix || ''}</div>
                <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search + filters ─────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une agence ou une ville…"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-orange-400 appearance-none cursor-pointer">
                <option value="score">Score PASMAL</option>
                <option value="rating">Note clients</option>
                <option value="listings">Annonces actives</option>
                <option value="reviews">Nombre d'avis</option>
                <option value="response">Temps de réponse</option>
              </select>
              <div className="flex items-center gap-0.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                {[
                  { id: 'grid', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></> },
                  { id: 'list', icon: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></> },
                ].map(v => (
                  <button key={v.id} onClick={() => setViewMode(v.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${viewMode === v.id ? 'bg-[#0B1F3A] text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">{v.icon}</svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {AGENCY_FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filter === f ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Agency results ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {/* Count */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-lg font-extrabold text-[#0B1F3A]">{filtered.length}</span>
          <span className="text-sm text-slate-500">agence{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-soft">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Icons.Search size={20} className="text-slate-400" />
            </div>
            <p className="text-[#0B1F3A] font-semibold">Aucune agence trouvée</p>
            <p className="text-slate-400 text-sm mt-1">Essayez un autre filtre ou une autre ville.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((agency, i) => {
              const cert = AGENCY_CERT[agency.certified]
              return (
                <motion.div key={agency.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(agency)}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
                  <div className="h-2" style={{ background: agency.color }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-extrabold shadow-sm" style={{ background: agency.color }}>
                        {agency.logo}
                      </div>
                      {cert && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cert.bg} ${cert.text}`}>{cert.label}</span>}
                    </div>
                    <div className="font-extrabold text-[#0B1F3A] text-base mb-0.5 group-hover:text-orange-600 transition-colors">{agency.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                      <Icons.MapPin size={11} className="text-orange-500" /> {agency.city}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {agency.specialties.map(s => (
                        <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <StarRow rating={agency.rating} />
                        <span className="text-xs font-bold text-[#0B1F3A]">{agency.rating}</span>
                        <span className="text-xs text-slate-400">({agency.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
                      <span className="flex items-center gap-1"><Icons.Mail size={10} className="text-orange-500" /> Rép. {agency.responseTime}</span>
                      <span className="flex items-center gap-1"><Icons.Check size={10} className="text-emerald-500" /> {agency.satisfaction}% satisf.</span>
                    </div>
                    {/* Score bar */}
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold">Score PASMAL</span>
                      <span className="text-[11px] font-extrabold text-orange-600">{agency.score}/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${agency.score}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.05, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${agency.color}, #f97316)` }} />
                    </div>
                  </div>
                  <div className="px-5 pb-4">
                    <div className="w-full py-2 rounded-xl text-xs font-semibold text-orange-600 bg-orange-50 group-hover:bg-orange-500 group-hover:text-white transition-all text-center">
                      Voir le profil →
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          /* List view */
          <div className="space-y-4">
            {filtered.map((agency, i) => {
              const cert = AGENCY_CERT[agency.certified]
              return (
                <motion.div key={agency.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(agency)}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden flex">
                  {/* Color strip */}
                  <div className="w-1.5 shrink-0 rounded-l-3xl" style={{ background: agency.color }} />
                  {/* Listing photo */}
                  <div className="w-32 sm:w-44 shrink-0 overflow-hidden">
                    <img src={unsplash(agency.imgId, 320)} alt={agency.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="font-extrabold text-[#0B1F3A] text-base group-hover:text-orange-600 transition-colors truncate">{agency.name}</span>
                          {cert && <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cert.bg} ${cert.text}`}>{cert.label}</span>}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-lg font-extrabold text-orange-600">{agency.score}</div>
                          <div className="text-[10px] text-slate-400">/ 100</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                        <Icons.MapPin size={11} className="text-orange-500" /> {agency.city} · {agency.region}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <StarRow rating={agency.rating} />
                        <span className="text-xs font-bold text-[#0B1F3A]">{agency.rating}</span>
                        <span className="text-xs text-slate-400">({agency.reviews} avis)</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {agency.specialties.map(s => (
                          <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Icons.Building size={11} /> {agency.listings} annonces</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Icons.Mail size={11} className="text-orange-500" /> Rép. {agency.responseTime}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Icons.Check size={11} className="text-emerald-500" /> {agency.satisfaction}% satisf.</span>
                      <div className="ml-auto flex gap-2 shrink-0">
                        <button onClick={e => { e.stopPropagation(); setSelected(agency); }}
                          className="text-xs font-semibold px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition">
                          Contacter
                        </button>
                        <button onClick={e => { e.stopPropagation(); setSelected(agency); }}
                          className="text-xs font-semibold px-3 py-1.5 border border-slate-200 hover:border-orange-400 text-slate-600 hover:text-orange-600 rounded-xl transition">
                          Voir annonces →
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Become partner CTA ───────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-[#0B1F3A] to-[#162E52] relative overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold uppercase tracking-widest mb-5">
            <Icons.Building2 size={12} /> Vous êtes une agence ?
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Rejoignez le réseau PASMAL
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Obtenez le badge de certification PASMAL Trust, accédez à nos 2,4 millions de visiteurs mensuels et bénéficiez d'outils pros exclusifs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
              Demander la certification
            </button>
            <button className="px-8 py-3.5 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold rounded-full transition-all text-sm">
              En savoir plus
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
            {['Visibilité x4', 'Badge certifié', 'Support dédié', 'Outils CRM'].map(b => (
              <div key={b} className="flex items-center gap-1.5 text-white/50 text-xs">
                <Icons.Check size={12} className="text-emerald-400 shrink-0" /> {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agency detail modal ──────────────────────── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => { setSelected(null); setContacted(false) }} />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-x-4 top-20 bottom-4 sm:inset-x-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[720px] z-50 bg-white rounded-3xl overflow-y-auto shadow-2xl"
            >
              {/* Modal header band */}
              <div className="h-3 rounded-t-3xl" style={{ background: selected.color }} />

              <div className="p-6 sm:p-8">
                {/* Close */}
                <button onClick={() => { setSelected(null); setContacted(false) }}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <Icons.X size={14} />
                </button>

                {/* Agency header */}
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shadow-md shrink-0"
                    style={{ background: selected.color }}>
                    {selected.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-xl font-extrabold text-[#0B1F3A]">{selected.name}</h2>
                      {AGENCY_CERT[selected.certified] && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${AGENCY_CERT[selected.certified].bg} ${AGENCY_CERT[selected.certified].text}`}>
                          {AGENCY_CERT[selected.certified].label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
                      <Icons.MapPin size={13} className="text-orange-500" /> {selected.city} · {selected.region}
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRow rating={selected.rating} />
                      <span className="text-sm font-bold text-[#0B1F3A]">{selected.rating}</span>
                      <span className="text-sm text-slate-400">({selected.reviews} avis)</span>
                    </div>
                  </div>
                </div>

                {/* Score de performance */}
                <div className="bg-gradient-to-r from-[#0B1F3A] to-[#162E52] rounded-2xl p-4 mb-5 flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <motion.circle cx="18" cy="18" r="15" fill="none" stroke="#f97316" strokeWidth="3"
                        strokeDasharray={`${(selected.score / 100) * 94.2} 94.2`} strokeLinecap="round"
                        initial={{ strokeDasharray: '0 94.2' }}
                        animate={{ strokeDasharray: `${(selected.score / 100) * 94.2} 94.2` }}
                        transition={{ duration: 1, ease: 'easeOut' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-extrabold text-sm">{selected.score}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-extrabold text-sm mb-0.5">Score PASMAL</div>
                    <div className="text-white/60 text-xs">Sur 100 — basé sur la réactivité, les avis et les performances.</div>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Annonces actives',  value: selected.listings },
                    { label: 'Sur PASMAL depuis', value: selected.since },
                    { label: 'Temps de réponse',  value: selected.responseTime },
                    { label: 'Satisfaction',       value: `${selected.satisfaction}%` },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                      <div className="text-xl font-extrabold text-[#0B1F3A]">{s.value}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {selected.specialties.map(s => (
                    <span key={s} className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">{s}</span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{selected.desc}</p>

                {/* Mock listings preview */}
                <div className="mb-6">
                  <div className="text-sm font-bold text-[#0B1F3A] mb-3">Annonces récentes</div>
                  <div className="grid grid-cols-3 gap-3">
                    {AGENCY_LISTING_IMGS.map((img, i) => (
                      <div key={i} className="rounded-2xl overflow-hidden aspect-video relative group cursor-pointer">
                        <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-2 text-white text-[11px] font-bold">
                          {(280000 + i * 85000).toLocaleString('fr-FR')} €
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avis clients */}
                {(() => {
                  const revs = AGENCY_REVIEWS_MAP[selected.id] || []
                  return revs.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-bold text-[#0B1F3A]">Avis clients</div>
                        <div className="flex items-center gap-1.5">
                          <StarRow rating={selected.rating} />
                          <span className="text-sm font-bold text-[#0B1F3A]">{selected.rating}</span>
                          <span className="text-xs text-slate-400">({selected.reviews} avis)</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {revs.map((r, ri) => (
                          <div key={ri} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-extrabold text-orange-600">
                                  {r.author[0]}
                                </div>
                                <span className="text-sm font-semibold text-[#0B1F3A]">{r.author}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <StarRow rating={r.rating} />
                                <span className="text-[11px] text-slate-400">{r.date}</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">"{r.text}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Contact form */}
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                  <div className="font-bold text-[#0B1F3A] text-sm mb-4">Contacter {selected.name}</div>
                  {contacted ? (
                    <div className="flex items-center gap-3 py-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Icons.CheckCircle size={18} className="text-emerald-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#0B1F3A] text-sm">Message envoyé !</div>
                        <div className="text-xs text-slate-500">{selected.name} vous répondra dans les 24h.</div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContact} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input value={msgName} onChange={e => setMsgName(e.target.value)} required placeholder="Votre nom"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition" />
                        <input type="email" value={msgEmail} onChange={e => setMsgEmail(e.target.value)} required placeholder="Votre e-mail"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition" />
                      </div>
                      <textarea rows={3} value={msgText} onChange={e => setMsgText(e.target.value)} required
                        placeholder="Votre message…"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
                      <button type="submit"
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors">
                        Envoyer le message
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}

/* ============================================================================
   MessagesView — Système de messagerie
   ============================================================================ */
const MOCK_CONVERSATIONS = [
  {
    id: 'c1',
    contact: { name: 'BARNES Paris', initials: 'BA', color: '#0B1F3A', isAgency: true },
    listing: { title: 'T3 lumineux Bastille', ref: 'PSM-2441', img: unsplash('photo-1502672260266-1c1ef2d93688', 120), price: 580000, surface: 72, rooms: 3, city: 'Paris 11e', dpe: 'C' },
    unread: 2,
    messages: [
      { id: 'm1', from: 'them', text: 'Bonjour, merci pour votre intérêt pour notre bien au Bastille. Comment puis-je vous aider ?', time: '09:14', date: '24 mai' },
      { id: 'm2', from: 'me', text: "Bonjour, je serais intéressé pour organiser une visite. Êtes-vous disponible en fin de semaine ?", time: '10:02', date: '24 mai' },
      { id: 'm3', from: 'them', text: 'Bien sûr ! Je vous propose samedi 25 mai à 10h00 ou 14h00. Quelle heure vous convient ?', time: '10:47', date: '24 mai' },
      { id: 'm4', from: 'them', text: 'Confirmez-vous votre disponibilité pour samedi matin ?', time: '11:02', date: '25 mai' },
      { id: 'm5', from: 'them', text: 'Nous sommes également disponibles dimanche en matinée si vous préférez.', time: '09:33', date: '26 mai' },
    ],
  },
  {
    id: 'c2',
    contact: { name: 'FONCIA Lyon', initials: 'FO', color: '#1D4ED8', isAgency: true },
    listing: { title: 'Studio meublé Croix-Rousse', ref: 'PSM-2389', img: unsplash('photo-1522708323590-d24dbb6b0267', 120), price: 950, surface: 28, rooms: 1, city: 'Lyon 4e', dpe: 'B', isLocation: true },
    unread: 0,
    messages: [
      { id: 'm1', from: 'me', text: 'Bonjour, le studio est-il encore disponible pour une entrée en septembre ?', time: '15:30', date: '22 mai' },
      { id: 'm2', from: 'them', text: 'Bonjour ! Oui, disponible dès le 1er septembre. Souhaitez-vous visiter ou postuler en ligne ?', time: '16:05', date: '22 mai' },
      { id: 'm3', from: 'me', text: 'Je préfèrerais visiter avant. Merci pour la réponse rapide !', time: '16:20', date: '22 mai' },
      { id: 'm4', from: 'them', text: 'Parfait, je vous envoie les créneaux disponibles demain matin.', time: '16:28', date: '22 mai' },
    ],
  },
  {
    id: 'c3',
    contact: { name: 'Thomas M.', initials: 'TM', color: '#7C3AED', isAgency: false },
    listing: { title: 'Maison Bordeaux 115 m²', ref: 'PSM-2201', img: unsplash('photo-1600585154340-be6161a56a0c', 120), price: 412000, surface: 115, rooms: 5, city: 'Bordeaux', dpe: 'D' },
    unread: 1,
    messages: [
      { id: 'm1', from: 'me', text: "Bonjour, je suis vendeur pour la maison de Bordeaux. Avez-vous des questions ?", time: '14:00', date: '25 mai' },
      { id: 'm2', from: 'them', text: 'Bonjour, seriez-vous ouvert à une contre-offre ?', time: '18:42', date: '25 mai' },
      { id: 'm3', from: 'them', text: 'Je propose 395 000 € pour un compromis signé avant le 15 juin.', time: '18:43', date: '25 mai' },
    ],
  },
  {
    id: 'c4',
    contact: { name: 'Nexity Paris', initials: 'NX', color: '#BE123C', isAgency: true },
    listing: { title: 'Appartement haussmannien 98 m²', ref: 'PSM-1840', img: unsplash('photo-1560448204-e02f11c3d0e2', 120), price: 1150000, surface: 98, rooms: 4, city: 'Paris 8e', dpe: 'E' },
    unread: 0,
    messages: [
      { id: 'm1', from: 'me', text: 'Bonjour, pouvez-vous me transmettre les diagnostics immobiliers du bien ?', time: '10:15', date: '20 mai' },
      { id: 'm2', from: 'them', text: "Bonjour, je vous envoie le dossier complet (DPE, amiante, électricité) par email aujourd'hui.", time: '11:00', date: '20 mai' },
      { id: 'm3', from: 'me', text: "Merci beaucoup, j'ai bien reçu les documents. Tout semble en ordre.", time: '14:33', date: '20 mai' },
      { id: 'm4', from: 'them', text: "Super ! N'hésitez pas si vous avez la moindre question avant la visite.", time: '14:45', date: '20 mai' },
    ],
  },
  {
    id: 'c5',
    contact: { name: 'Laforêt Nantes', initials: 'LF', color: '#047857', isAgency: true },
    listing: { title: 'T2 moderne Île de Nantes', ref: 'PSM-1762', img: unsplash('photo-1493809842364-78817add7ffb', 120), price: 245000, surface: 48, rooms: 2, city: 'Nantes', dpe: 'B' },
    unread: 0,
    messages: [
      { id: 'm1', from: 'them', text: 'Bonjour, suite à votre demande de contact — ce T2 est encore disponible et une visite peut être planifiée dès cette semaine.', time: '08:55', date: '18 mai' },
    ],
  },
]

const AUTO_REPLIES = {
  c1: ['Je vous confirme samedi à 10h ! À bientôt.', 'Parfait, je note votre visite — à samedi !'],
  c2: ['Voici les créneaux disponibles : lundi 16h ou mercredi 11h. Lequel vous convient ?', 'Bonne journée !'],
  c3: ['Je suis ouvert à la discussion. Quel est votre délai de signature ?', 'C\'est noté, je reviens vers vous rapidement.'],
  c4: ['N\'hésitez pas, je reste disponible pour toute question.', 'Bonne continuation !'],
  c5: ['Merci pour votre réponse, à bientôt !', 'Avec plaisir.'],
}

function MessagesView({ user }) {
  const [convs,        setConvs]        = useState(() => MOCK_CONVERSATIONS.map(c => ({ ...c, archived: false })))
  const [activeId,     setActiveId]     = useState('c1')
  const [input,        setInput]        = useState('')
  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState('all')
  const [mobileThread, setMobileThread] = useState(false)
  const [infoOpen,     setInfoOpen]     = useState(false)
  const [showNewMsg,   setShowNewMsg]   = useState(false)
  const [typing,       setTyping]       = useState(false)
  const [reactions,    setReactions]    = useState({})
  const [hoveredMsg,   setHoveredMsg]   = useState(null)
  const [attachFile,   setAttachFile]   = useState(null)
  const attachInputRef = useRef(null)
  const endRef         = useRef(null)

  const active     = convs.find(c => c.id === activeId)
  const totalUnread = convs.filter(c => !c.archived).reduce((s, c) => s + c.unread, 0)

  const filtered = convs.filter(c => {
    if (filter === 'archived') return c.archived
    if (filter === 'unread')   return !c.archived && c.unread > 0
    return !c.archived
  }).filter(c =>
    !search ||
    c.contact.name.toLowerCase().includes(search.toLowerCase()) ||
    c.listing.title.toLowerCase().includes(search.toLowerCase())
  )

  function openConv(id) {
    setActiveId(id)
    setMobileThread(true)
    setInfoOpen(false)
    setConvs(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c))
  }

  function sendMsg(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text && !attachFile) return
    const now  = new Date()
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const newMsg = { id: `m${Date.now()}`, from: 'me', text: text || '', time, date: "Aujourd'hui",
      ...(attachFile ? { attachment: { name: attachFile.name, size: attachFile.size } } : {}) }
    setConvs(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, newMsg] } : c))
    setInput(''); setAttachFile(null)
    setTyping(true)
    const pool = AUTO_REPLIES[activeId] || ['Merci pour votre message !', 'Je reviens vers vous rapidement.']
    const replyText = pool[Math.floor(Math.random() * pool.length)]
    setTimeout(() => {
      setTyping(false)
      const rt = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      setConvs(prev => prev.map(c => c.id === activeId
        ? { ...c, messages: [...c.messages, { id: `m${Date.now()}`, from: 'them', text: replyText, time: rt, date: "Aujourd'hui" }] }
        : c
      ))
    }, 1800)
  }

  function toggleReaction(msgId, emoji) {
    setReactions(prev => ({ ...prev, [msgId]: prev[msgId] === emoji ? null : emoji }))
  }

  function archiveConv(id) {
    setConvs(prev => prev.map(c => c.id === id ? { ...c, archived: true } : c))
    if (activeId === id) {
      const next = convs.find(c => c.id !== id && !c.archived)
      setActiveId(next?.id || null)
    }
  }

  function markUnread(id) {
    setConvs(prev => prev.map(c => c.id === id ? { ...c, unread: 1 } : c))
  }

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [active?.messages?.length, typing])

  const lastMsg = (c) => c.messages[c.messages.length - 1]
  const dpeColors = { A: '#22c55e', B: '#84cc16', C: '#eab308', D: '#f97316', E: '#ef4444', F: '#dc2626', G: '#991b1b' }

  return (
    <div className="pt-16 h-screen flex flex-col bg-slate-50">

      {/* Page header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-navy-900">Messagerie</h1>
          {totalUnread > 0 && (
            <span className="bg-orange-500 text-white text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center">{totalUnread}</span>
          )}
        </div>
        <button onClick={() => setShowNewMsg(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
          <svg viewBox="0 0 24 24" style={{ width:16,height:16 }} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Nouveau message
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* ── Conversations list ───────────────────────── */}
        <div className={`${mobileThread ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0 bg-white border-r border-slate-100`}>
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Icons.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 border border-slate-100" />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-slate-100 shrink-0">
            {[
              { id: 'all',      label: 'Tous' },
              { id: 'unread',   label: 'Non lus', badge: convs.filter(c => !c.archived && c.unread > 0).length },
              { id: 'archived', label: 'Archivés' },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1 border-b-2 transition-all ${
                  filter === f.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}>
                {f.label}
                {f.badge > 0 && <span className="bg-orange-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">{f.badge}</span>}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-sm">
                {filter === 'unread' ? 'Aucun message non lu.' : filter === 'archived' ? 'Aucune conversation archivée.' : 'Aucune conversation trouvée.'}
              </div>
            )}
            {filtered.map(c => {
              const lm    = lastMsg(c)
              const isAct = c.id === activeId
              return (
                <div key={c.id} className={`group relative border-b border-slate-50 ${isAct ? 'bg-orange-50 border-l-2 border-l-orange-500' : ''}`}>
                  <button onClick={() => openConv(c.id)}
                    className="w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-extrabold"
                      style={{ background: c.contact.color }}>
                      {c.contact.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm truncate ${c.unread > 0 ? 'font-extrabold text-navy-900' : 'font-semibold text-slate-700'}`}>
                          {c.contact.name}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">{lm?.date}</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">{c.listing.ref} · {c.listing.title}</div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className={`text-xs truncate ${c.unread > 0 ? 'text-navy-900 font-medium' : 'text-slate-400'}`}>
                          {lm?.from === 'me' ? 'Vous : ' : ''}{lm?.text}
                        </span>
                        {c.unread > 0 && (
                          <span className="ml-2 shrink-0 bg-orange-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  {/* Context actions */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                    <button onClick={() => markUnread(c.id)} title="Marquer non lu"
                      className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition shadow-sm">
                      <Icons.Eye size={10} className="text-slate-400" />
                    </button>
                    {!c.archived && (
                      <button onClick={() => archiveConv(c.id)} title="Archiver"
                        className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition shadow-sm">
                        <Icons.FileText size={10} className="text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Thread ──────────────────────────────────── */}
        {active && (
          <div className={`${mobileThread ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}>
            {/* Thread header */}
            <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center gap-3 shrink-0">
              <button onClick={() => setMobileThread(false)} className="md:hidden mr-1 text-slate-400 hover:text-slate-600">
                <Icons.ChevronLeft size={20} />
              </button>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                style={{ background: active.contact.color }}>
                {active.contact.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-navy-900 text-sm flex items-center gap-1.5">
                  {active.contact.name}
                  {active.contact.isAgency && (
                    <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">Agence</span>
                  )}
                </div>
                <div className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                  <img src={active.listing.img} alt="" className="w-4 h-4 rounded object-cover inline-block" />
                  {active.listing.ref} · {active.listing.title}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <Icons.Phone size={14} className="text-slate-500" />
                </button>
                <button onClick={() => setInfoOpen(o => !o)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${infoOpen ? 'bg-orange-100' : 'bg-slate-50 hover:bg-slate-100'}`}>
                  <Icons.Info size={14} className={infoOpen ? 'text-orange-600' : 'text-slate-500'} />
                </button>
              </div>
            </div>

            <div className="flex flex-1 min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1" style={{ background:'#F8FAFC' }}>
                {active.messages.map((msg, i) => {
                  const isMe     = msg.from === 'me'
                  const prev     = active.messages[i - 1]
                  const showDate = !prev || prev.date !== msg.date
                  const reaction = reactions[msg.id]
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="text-center text-[10px] text-slate-400 font-medium py-2">{msg.date}</div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        onMouseEnter={() => setHoveredMsg(msg.id)} onMouseLeave={() => setHoveredMsg(null)}>
                        {!isMe && (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold shrink-0 mr-2 mt-0.5 self-end"
                            style={{ background: active.contact.color }}>
                            {active.contact.initials}
                          </div>
                        )}
                        <div className="relative max-w-xs lg:max-w-sm xl:max-w-md">
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe ? 'bg-orange-600 text-white rounded-br-sm' : 'bg-white text-slate-800 shadow-sm rounded-bl-sm border border-slate-100'
                          }`}>
                            {msg.text}
                            {msg.attachment && (
                              <div className="mt-2 flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
                                <Icons.FileText size={13} className={isMe ? 'text-white/70' : 'text-slate-400'} />
                                <span className={`text-xs truncate ${isMe ? 'text-white/90' : 'text-slate-600'}`}>{msg.attachment.name}</span>
                              </div>
                            )}
                          </div>
                          <div className={`text-[10px] text-slate-400 mt-1 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {msg.time}
                            {isMe && (
                              <svg viewBox="0 0 24 24" style={{ width:10,height:10 }} fill="none" stroke="#94a3b8" strokeWidth="2.5">
                                <path d="M20 6 9 17l-5-5"/>
                              </svg>
                            )}
                          </div>
                          {/* Emoji reaction */}
                          {reaction && (
                            <div className="absolute -bottom-2 right-2 bg-white border border-slate-100 rounded-full px-1.5 text-sm shadow-sm cursor-pointer"
                              onClick={() => toggleReaction(msg.id, reaction)}>
                              {reaction}
                            </div>
                          )}
                          {/* Reaction picker on hover */}
                          {hoveredMsg === msg.id && !reaction && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                              className={`absolute -top-8 ${isMe ? 'right-0' : 'left-0'} bg-white border border-slate-100 rounded-full px-2 py-1 flex gap-1.5 shadow-md z-10`}>
                              {['👍','❤️','😂','😮','🙏'].map(em => (
                                <button key={em} onClick={() => toggleReaction(msg.id, em)} className="text-base hover:scale-125 transition-transform">{em}</button>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })}

                {/* Typing indicator */}
                {typing && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold shrink-0"
                      style={{ background: active.contact.color }}>
                      {active.contact.initials}
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
                      {[0,1,2].map(i => (
                        <motion.span key={i} animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full block" />
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={endRef} />
              </div>

              {/* ── Info panel ─────────────────────────────── */}
              <AnimatePresence>
                {infoOpen && (
                  <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border-l border-slate-100 overflow-hidden shrink-0 flex flex-col">
                    <div className="p-4 border-b border-slate-50">
                      <div className="font-bold text-sm text-[#0B1F3A] mb-0.5">Annonce concernée</div>
                      <div className="text-xs text-slate-400">{active.listing.ref}</div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      <img src={active.listing.img.replace('?auto', '?w=520&auto')} alt={active.listing.title}
                        className="w-full aspect-video object-cover" />
                      <div className="p-4">
                        <div className="font-bold text-sm text-[#0B1F3A] mb-1 leading-snug">{active.listing.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                          <Icons.MapPin size={10} className="text-orange-500" /> {active.listing.city}
                        </div>
                        <div className="text-lg font-extrabold text-[#0B1F3A] mb-3">
                          {(active.listing.price || 0).toLocaleString('fr-FR')} €{active.listing.isLocation ? '/mois' : ''}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {[
                            { icon: Icons.Maximize, val: `${active.listing.surface} m²` },
                            { icon: Icons.Bed,      val: `${active.listing.rooms} p.` },
                            { icon: Icons.Building, val: active.listing.dpe || '—' },
                          ].map((stat, i) => {
                            const SI = stat.icon
                            return (
                              <div key={i} className="bg-slate-50 rounded-xl flex flex-col items-center py-2 gap-0.5">
                                <SI size={12} className="text-slate-400" />
                                <span className="text-[11px] font-semibold text-[#0B1F3A]"
                                  style={i === 2 ? { color: dpeColors[active.listing.dpe] || '#64748b' } : {}}>
                                  {stat.val}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        <button className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition">
                          Voir l'annonce →
                        </button>
                      </div>
                      {/* Shared files placeholder */}
                      <div className="mx-4 mb-4 p-3 bg-slate-50 rounded-2xl">
                        <div className="text-xs font-semibold text-slate-500 mb-2">Fichiers partagés</div>
                        {[{ name: 'Diagnostics DPE.pdf', size: '1.2 Mo' }, { name: 'Plan du bien.pdf', size: '840 Ko' }].map(f => (
                          <div key={f.name} className="flex items-center gap-2 py-1.5">
                            <Icons.FileText size={12} className="text-orange-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-[#0B1F3A] truncate">{f.name}</div>
                              <div className="text-[10px] text-slate-400">{f.size}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="bg-white border-t border-slate-100 shrink-0">
              {attachFile && (
                <div className="px-4 pt-3 flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5">
                    <Icons.FileText size={12} className="text-orange-600" />
                    <span className="text-xs text-orange-700 font-medium">{attachFile.name}</span>
                    <button onClick={() => setAttachFile(null)} className="text-orange-400 hover:text-orange-600 ml-1">
                      <Icons.X size={11} />
                    </button>
                  </div>
                </div>
              )}
              <form onSubmit={sendMsg} className="px-4 py-3 flex gap-3 items-end">
                <button type="button" onClick={() => attachInputRef.current?.click()}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0">
                  <svg viewBox="0 0 24 24" style={{ width:15,height:15 }} fill="none" stroke="#64748B" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                </button>
                <input ref={attachInputRef} type="file" className="hidden"
                  onChange={e => setAttachFile(e.target.files?.[0] || null)} />
                <div className="flex-1 relative">
                  <textarea rows={1} value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(e) } }}
                    placeholder="Écrivez un message…"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-orange-400 resize-none leading-relaxed"
                    style={{ maxHeight: 120 }} />
                </div>
                <button type="submit" disabled={!input.trim() && !attachFile}
                  className="w-9 h-9 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 rounded-full flex items-center justify-center transition-colors shrink-0">
                  <svg viewBox="0 0 24 24" style={{ width:15,height:15 }} fill="none" stroke="white" strokeWidth="2">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!active && (
          <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icons.Mail size={28} className="text-slate-300" />
              </div>
              <div className="font-semibold text-slate-400">Sélectionnez une conversation</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Nouveau message modal ───────────────────────── */}
      <AnimatePresence>
        {showNewMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowNewMsg(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="font-bold text-[#0B1F3A]">Nouveau message</div>
                <button onClick={() => setShowNewMsg(false)} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                  <Icons.X size={13} className="text-slate-500" />
                </button>
              </div>
              <div className="p-4 border-b border-slate-50">
                <div className="relative">
                  <Icons.Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input placeholder="Rechercher un contact ou une annonce…"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl text-sm focus:outline-none border border-slate-100" />
                </div>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {MOCK_CONVERSATIONS.map(c => (
                  <button key={c.id} onClick={() => { openConv(c.id); setShowNewMsg(false) }}
                    className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                      style={{ background: c.contact.color }}>
                      {c.contact.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#0B1F3A]">{c.contact.name}</div>
                      <div className="text-xs text-slate-400 truncate">{c.listing.title}</div>
                    </div>
                    <Icons.ChevronRight size={14} className="text-slate-300 shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AdminView({ user }) {
  const [showBackoffice, setShowBackoffice] = useState(false)
  const [activeModule,   setActiveModule]   = useState('dashboard')

  const openModule = (id) => { setActiveModule(id); setShowBackoffice(true) }

  if (showBackoffice) return <AdminPreview initialModule={activeModule} />

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#060E1C]">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-16 pb-14"
        style={{ background: 'linear-gradient(135deg,#0a1628 0%,#0B1F3A 60%,#0d2040 100%)' }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Plateforme operationnelle
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2">
                Bonjour, {displayName.split(' ')[0]}&nbsp;
                <span className="not-italic">👋</span>
              </h1>
              <p className="text-white/50 text-sm capitalize mb-6">{today}</p>
              <button onClick={() => openModule('dashboard')}
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-2xl transition shadow-lg shadow-orange-900/30">
                Ouvrir le backoffice <Icons.ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {ADMIN_PLATFORM_STATUS.map((s) => (
                <div key={s.label}
                  className="flex items-center gap-2.5 bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <div>
                    <div className="text-white text-xs font-semibold">{s.label}</div>
                    <div className="text-white/40 text-[11px]">{s.uptime} uptime</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI strip ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 -mt-6 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {ADMIN_KPIS.map((k, i) => {
            const t = ADMIN_TONE[k.color] || ADMIN_TONE.orange
            return (
              <motion.div key={k.label}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className={`bg-[#0B1F3A] border border-white/10 rounded-2xl p-4 ring-1 ${t.ring}`}>
                <div className={`w-8 h-8 rounded-xl ${t.bg} flex items-center justify-center mb-2.5`}>
                  <k.icon size={16} className={t.text} />
                </div>
                <div className="text-white font-extrabold text-xl leading-none mb-1">
                  <Counter to={k.value} suffix={k.suffix || ''} />
                </div>
                <div className="text-white/50 text-[11px] leading-tight mb-1.5">{k.label}</div>
                <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  k.alarm
                    ? 'bg-rose-500/15 text-rose-400'
                    : k.trend >= 0
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-red-500/15 text-red-400'
                }`}>
                  {k.trend > 0 ? '+' : ''}{k.trend}%
                </span>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Modules + Activity ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Module grid — 2/3 */}
          <div className="lg:col-span-2">
            <h2 className="text-white font-bold text-lg mb-4">Modules</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ADMIN_MODULES.map((m, i) => {
                const t = ADMIN_TONE[m.color] || ADMIN_TONE.orange
                return (
                  <motion.button key={m.id}
                    initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.04, duration: 0.35 }}
                    onClick={() => openModule(m.id)}
                    className="group bg-[#0B1F3A] hover:bg-[#0f2845] border border-white/10 hover:border-white/20 rounded-2xl p-4 text-left transition-all">
                    <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center mb-3`}>
                      <m.icon size={18} className={t.text} />
                    </div>
                    <div className="text-white text-sm font-bold mb-0.5">{m.label}</div>
                    <div className="text-white/40 text-[11px] leading-snug">{m.desc}</div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Activity feed — 1/3 */}
          <div>
            <h2 className="text-white font-bold text-lg mb-4">Activite recente</h2>
            <div className="bg-[#0B1F3A] border border-white/10 rounded-2xl overflow-hidden">
              {ADMIN_ACTIVITY.map((a, i) => {
                const t = ADMIN_TONE[a.tone] || ADMIN_TONE.orange
                return (
                  <div key={i} className={`px-4 py-3.5 flex gap-3 ${i < ADMIN_ACTIVITY.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-xl ${t.bg} flex items-center justify-center mt-0.5`}>
                      <a.icon size={14} className={t.text} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white/90 text-xs font-semibold truncate">
                        <span className="text-white">{a.actor}</span> {a.action}
                      </div>
                      <div className="text-white/50 text-[11px] truncate">{a.target}</div>
                      <div className="text-white/30 text-[10px] mt-0.5">{a.time}</div>
                    </div>
                  </div>
                )
              })}
              <div className="px-4 py-3 border-t border-white/5">
                <button onClick={() => openModule('dashboard')}
                  className="text-orange-400 hover:text-orange-300 text-xs font-semibold flex items-center gap-1 transition">
                  Voir tout le journal <Icons.ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
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
      if (_event === 'SIGNED_UP') setCurrentView('onboarding')
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
    const authViews = ['profil', 'favoris', 'mes-annonces', 'verification', 'alerts', 'admin', 'messages']
    if (!user && authViews.includes(currentView)) {
      setCurrentView('home')
    }
  }, [user, currentView])

  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })
  const openSignIn  = () => setAuthModal({ open: true, mode: 'login'    })
  const openSignUp  = () => setAuthModal({ open: true, mode: 'register' })
  const closeAuth   = () => setAuthModal(o => ({ ...o, open: false }))
  const handleSignOut = async () => {
    await supabase.auth.signOut().catch(() => {})
    setUser(null)
    setRole(null)
    setCurrentView('home')
  }
  const handlePublish = () => {
    if (!user) {
      setAuthModal({ open: true, mode: 'register' })
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
    } else if (currentView === 'publier' || currentView === 'tarifs' || currentView === 'investir' || currentView === 'admin' || currentView === 'agences') {
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
  const [compareList, setCompareList] = useState([])
  const handleCompare = (raw) => setCompareList(prev =>
    prev.find(l => l.id === raw.id)
      ? prev.filter(l => l.id !== raw.id)
      : prev.length >= 3 ? prev : [...prev, raw]
  )

  const handleOpenListing = (raw, idx = 0) => {
    setSelectedListing(raw)
    setSelectedListingIdx(idx)
    setPrevView(currentView)
    setCurrentView('detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (overrides = {}) => {
    if (typeof overrides === 'string') overrides = { location: overrides }
    const merged = { ...filters, ...overrides }
    if (currentView === 'home') {
      const params = new URLSearchParams()
      if (merged.type)         params.set('type', merged.type)
      if (merged.location)     params.set('location', merged.location)
      if (merged.propertyType) params.set('propertyType', merged.propertyType)
      if (merged.priceMax)     params.set('priceMax', String(merged.priceMax))
      if (merged.surfaceMin)   params.set('surfaceMin', String(merged.surfaceMin))
      if (merged.roomsMin)     params.set('roomsMin', String(merged.roomsMin))
      navigate(`/annonces?${params.toString()}`)
      return
    }
    fetchListings(merged)
    setCurrentView('results')
  }
  const handleCategoryPick = (propertyType) => {
    const next = { ...filters, propertyType }
    setFilters(next)
    if (currentView === 'home') {
      const params = new URLSearchParams()
      if (next.type)         params.set('type', next.type)
      if (next.propertyType) params.set('propertyType', next.propertyType)
      if (next.location)     params.set('location', next.location)
      navigate(`/annonces?${params.toString()}`)
      return
    }
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
        {currentView === 'home' && user && (
          <LoggedInHome
            user={user}
            role={role}
            listings={listings}
            loading={loading}
            setCurrentView={setCurrentView}
            onSearch={handleSearch}
            setFilters={setFilters}
            onOpenListing={handleOpenListing}
            onPublish={handlePublish}
          />
        )}

        {currentView === 'home' && !user && (
          <>
            <Hero filters={filters} setFilters={setFilters} onSearch={handleSearch} />
            <Categories onPick={handleCategoryPick} />
            <HowItWorks />
            <Listings listings={listings} loading={loading} error={error} source={source} />
            <HomeCities onSearch={handleSearch} />
            <EarlyAccessTeaser />
            <WhyPasmal />
            <TrustSection />
            <Pricing />
            <AgencyPricing />
            <Testimonials />
            <HomeGuides onViewAll={() => setCurrentView('guides')} />
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
            onCompare={handleCompare}
            compareList={compareList}
          />
        )}

        {currentView === 'comparer' && (
          <ComparerView
            compareList={compareList}
            setCompareList={setCompareList}
            onBack={() => setCurrentView(prevView)}
            onOpenListing={handleOpenListing}
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
          <AcheterView
            listings={listings} loading={loading} error={error} source={source}
            filters={filters} setFilters={setFilters} onSearch={handleSearch}
            onPublish={handlePublish}
          />
        )}

        {currentView === 'louer' && (
          <LouerView
            listings={listings} loading={loading} error={error} source={source}
            filters={filters} setFilters={setFilters} onSearch={handleSearch}
            onPublish={handlePublish}
          />
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

        {currentView === 'agences' && <AgencesView />}

        {currentView === 'admin' && ['admin', 'super_admin', 'moderator'].includes(role) && (
          <AdminView user={user} />
        )}

        {currentView === 'messages' && (
          <MessagesView user={user} />
        )}

        {currentView === 'profil' && (
          <ProfilView user={user} onPublish={handlePublish} />
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
          <SellerVerificationView setCurrentView={setCurrentView} user={user} />
        )}

        {currentView === 'onboarding' && (
          <OnboardingView user={user} setCurrentView={setCurrentView} setFilters={setFilters} />
        )}

        {currentView === 'estimation' && (
          <EstimationView setCurrentView={setCurrentView} user={user} />
        )}

        {currentView === 'guides' && (
          <GuidesView setCurrentView={setCurrentView} />
        )}

        {currentView === 'marche' && (
          <MarcheView setCurrentView={setCurrentView} />
        )}

        {currentView === 'simulateur' && (
          <SimulateurView setCurrentView={setCurrentView} />
        )}

        {currentView === 'monespace' && (
          <MonEspaceView setCurrentView={setCurrentView} />
        )}

        {currentView === 'crm' && (
          <CrmView setCurrentView={setCurrentView} />
        )}

        {currentView === 'neuf' && (
          <NeufView setCurrentView={setCurrentView} />
        )}

        {currentView === 'alerts' && (
          <AlertsView user={user} />
        )}

        {currentView === 'personal-dash' && (
          <PersonalDashboard onExit={() => setCurrentView('home')} />
        )}

        {currentView === 'pro-dash' && (
          <ProfessionalDashboard onExit={() => setCurrentView('home')} />
        )}
      </main>

      <Footer setCurrentView={setCurrentView} />

      {/* Mobile UX */}
      <MobileStickyCTA onPublish={handlePublish} visible={currentView !== 'publier'} />
      <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} onPublish={handlePublish} />

      <AuthModal
        isOpen={authModal.open}
        onClose={closeAuth}
        initialMode={authModal.mode}
      />

      <CompareBar compareList={compareList} setCompareList={setCompareList} setCurrentView={setCurrentView} />
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

function ResultsGrid({ listings, onSelect, onCompare, compareList = [] }) {
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
              {onCompare && (
                <button
                  onClick={e => { e.stopPropagation(); onCompare(raw) }}
                  className={`mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold border transition-all ${compareList.some(c => c.id === raw.id) ? 'bg-orange-50 border-orange-300 text-orange-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-600'}`}>
                  {compareList.some(c => c.id === raw.id)
                    ? <><Icons.Check size={11} /> Ajouté à la comparaison</>
                    : <>+ Comparer ce bien</>}
                </button>
              )}
            </div>
          </motion.article>
        )
      })}
    </motion.div>
  )
}

function ResultsList({ listings, onSelect, onCompare, compareList = [] }) {
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
            <div className="flex flex-col items-center justify-center gap-2 pr-4">
              <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                <Icons.ArrowRight size={15} />
              </div>
              {onCompare && (
                <button
                  onClick={e => { e.stopPropagation(); onCompare(raw) }}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all whitespace-nowrap ${compareList.some(c => c.id === raw.id) ? 'bg-orange-50 border-orange-300 text-orange-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-orange-300 hover:text-orange-600'}`}>
                  {compareList.some(c => c.id === raw.id) ? '✓ Ajouté' : '+ Comparer'}
                </button>
              )}
            </div>
          </motion.article>
        )
      })}
    </div>
  )
}

function SearchResultsPage({ listings, loading, error, source, filters, setFilters, onSearch, onBack, onSelect, onCompare, compareList }) {
  const [sortBy,    setSortBy]    = useState('relevance')
  const [viewMode,  setViewMode]  = useState('grid')
  const [page,      setPage]      = useState(1)
  const [sideOpen,  setSideOpen]  = useState(false)
  const [fPriceMin, setFPriceMin] = useState('')
  const [fPriceMax, setFPriceMax] = useState('')
  const [fSurface,  setFSurface]  = useState('')
  const [fRooms,    setFRooms]    = useState(0)
  const [fType,      setFType]      = useState('')
  const [fDPE,       setFDPE]       = useState([])
  const [fParking,   setFParking]   = useState(false)
  const [fElevator,  setFElevator]  = useState(false)
  const [fCellar,    setFCellar]    = useState(false)
  const [fFloorMin,  setFFloorMin]  = useState('')
  const [fNewOnly,   setFNewOnly]   = useState(false)
  const [animCount,  setAnimCount]  = useState(0)
  const PER_PAGE = 9
  const DPE_COLORS = { A:'#00A651', B:'#51B948', C:'#BECE00', D:'#FECB00', E:'#FB7A08', F:'#EE3424', G:'#C50D13' }

  const filtered = useMemo(() => listings.filter(l => {
    if (fPriceMin  && (l.price||0)   < Number(fPriceMin))  return false
    if (fPriceMax  && (l.price||0)   > Number(fPriceMax))  return false
    if (fSurface   && (l.surface||0) < Number(fSurface))   return false
    if (fRooms     && (l.rooms||0)   < fRooms)             return false
    if (fType      && (l.type||'').toLowerCase() !== fType.toLowerCase()) return false
    if (fDPE.length > 0 && !fDPE.includes(l.dpe))         return false
    if (fParking   && !l.parking)   return false
    if (fElevator  && !l.elevator)  return false
    if (fCellar    && !l.cellar)    return false
    if (fFloorMin  && (l.floor||0)  < Number(fFloorMin))   return false
    if (fNewOnly   && !l.is_new)    return false
    return true
  }), [listings, fPriceMin, fPriceMax, fSurface, fRooms, fType, fDPE, fParking, fElevator, fCellar, fFloorMin, fNewOnly])

  useEffect(() => {
    let start = animCount
    const end = filtered.length
    if (start === end) return
    const step = Math.ceil(Math.abs(end - start) / 12)
    const timer = setInterval(() => {
      start = start < end ? Math.min(start + step, end) : Math.max(start - step, end)
      setAnimCount(start)
      if (start === end) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [filtered.length])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sortBy === 'price-asc')  arr.sort((a, b) => (a.price||0) - (b.price||0))
    if (sortBy === 'price-desc') arr.sort((a, b) => (b.price||0) - (a.price||0))
    if (sortBy === 'surface')    arr.sort((a, b) => (b.surface||0) - (a.surface||0))
    return arr
  }, [filtered, sortBy])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const paginated  = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  useEffect(() => setPage(1), [sortBy, fPriceMin, fPriceMax, fSurface, fRooms, fType, fDPE, listings])

  const activeLocalCount = [fPriceMin, fPriceMax, fSurface, fRooms > 0 ? 'x' : '', fType, fDPE.length > 0 ? 'x' : '', fParking ? 'x' : '', fElevator ? 'x' : '', fCellar ? 'x' : '', fFloorMin, fNewOnly ? 'x' : ''].filter(Boolean).length
  const resetLocal = () => { setFPriceMin(''); setFPriceMax(''); setFSurface(''); setFRooms(0); setFType(''); setFDPE([]); setFParking(false); setFElevator(false); setFCellar(false); setFFloorMin(''); setFNewOnly(false) }

  const chips = [
    filters.location     && { key: 'location',    label: filters.location,                                           type: 'global', reset: { location: '' } },
    filters.propertyType && { key: 'propertyType', label: filters.propertyType,                                       type: 'global', reset: { propertyType: '' } },
    filters.priceMax     && { key: 'priceMax',     label: `≤ ${Number(filters.priceMax).toLocaleString('fr-FR')} €`, type: 'global', reset: { priceMax: '' } },
    filters.surfaceMin   && { key: 'surfaceMin',   label: `≥ ${filters.surfaceMin} m²`,                              type: 'global', reset: { surfaceMin: '' } },
    filters.roomsMin     && { key: 'roomsMin',     label: `${filters.roomsMin}+ pièces`,                             type: 'global', reset: { roomsMin: '' } },
    fRooms > 0            && { key: 'fRooms',      label: `${fRooms}+ pièces`,   type: 'local', fn: () => setFRooms(0) },
    fDPE.length > 0       && { key: 'fDPE',        label: `DPE : ${fDPE.join(',')}`, type: 'local', fn: () => setFDPE([]) },
    fParking              && { key: 'fParking',    label: 'Parking',             type: 'local', fn: () => setFParking(false) },
    fElevator             && { key: 'fElevator',   label: 'Ascenseur',           type: 'local', fn: () => setFElevator(false) },
    fCellar               && { key: 'fCellar',     label: 'Cave',                type: 'local', fn: () => setFCellar(false) },
    fFloorMin             && { key: 'fFloorMin',   label: `≥ étage ${fFloorMin}`, type: 'local', fn: () => setFFloorMin('') },
    fNewOnly              && { key: 'fNewOnly',    label: 'Neuf seulement',      type: 'local', fn: () => setFNewOnly(false) },
    fPriceMin             && { key: 'fPriceMin',   label: `≥ ${Number(fPriceMin).toLocaleString('fr-FR')} €`, type: 'local', fn: () => setFPriceMin('') },
    (fPriceMax && !filters.priceMax) && { key: 'fPriceMax', label: `≤ ${Number(fPriceMax).toLocaleString('fr-FR')} €`, type: 'local', fn: () => setFPriceMax('') },
  ].filter(Boolean)

  const removeChip = (chip) => {
    if (chip.type === 'local') { chip.fn?.() }
    else { const next = { ...filters, ...chip.reset }; setFilters(next); onSearch(chip.reset) }
  }
  const resetAll   = () => {
    const next = { ...filters, location: '', propertyType: '', priceMax: '', surfaceMin: '', roomsMin: '' }
    setFilters(next); onSearch(next); resetLocal()
  }

  const typeLabel = filters.type === 'louer' ? 'à louer' : filters.type === 'investir' ? 'à investir' : 'à acheter'

  /* ── sidebar controls (shared desktop + mobile) ── */
  const SidebarContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="font-bold text-[#0B1F3A] text-sm">Filtres avancés</div>
        {activeLocalCount > 0 && (
          <button onClick={resetLocal} className="text-xs text-orange-600 hover:text-orange-700 font-semibold">
            Réinitialiser ({activeLocalCount})
          </button>
        )}
      </div>

      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Budget</div>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={fPriceMin} onChange={e => setFPriceMin(e.target.value)} placeholder="Min €"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition" />
          <input type="number" value={fPriceMax} onChange={e => setFPriceMax(e.target.value)} placeholder="Max €"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition" />
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Surface min. (m²)</div>
        <input type="number" value={fSurface} onChange={e => setFSurface(e.target.value)} placeholder="ex. 40"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition" />
      </div>

      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Pièces minimum</div>
        <div className="flex gap-1">
          {[0,1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setFRooms(n)}
              className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all ${
                fRooms === n ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {n === 0 ? 'Tt' : n === 5 ? '5+' : n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Type de bien</div>
        <div className="flex flex-col gap-1">
          {['', 'Appartement', 'Maison', 'Studio', 'Villa', 'Commerce'].map(t => (
            <button key={t || 'all'} onClick={() => setFType(t)}
              className={`w-full px-3 py-2 rounded-xl text-sm text-left font-medium transition-all ${
                fType === t ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              {t || 'Tous types'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">DPE</div>
        <div className="flex gap-1.5 flex-wrap">
          {['A','B','C','D','E','F','G'].map(band => {
            const active = fDPE.includes(band)
            return (
              <button key={band}
                onClick={() => setFDPE(prev => active ? prev.filter(d => d !== band) : [...prev, band])}
                style={active ? { background: DPE_COLORS[band], color: (band === 'C' || band === 'D') ? '#1a1a1a' : '#fff' } : {}}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  active ? 'shadow-md scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {band}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Étage minimum</div>
        <div className="flex gap-1">
          {[['', 'Tt'], ['1', '1'], ['2', '2'], ['3', '3+'], ['5', '5+'], ['10', '10+']].map(([v, lbl]) => (
            <button key={v} onClick={() => setFFloorMin(v)}
              className={`flex-1 h-8 rounded-xl text-xs font-bold transition-all ${
                fFloorMin === v ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>{lbl}</button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Équipements</div>
        <div className="space-y-2">
          {[
            { state: fParking,  setter: setFParking,  label: 'Parking / Garage' },
            { state: fElevator, setter: setFElevator, label: 'Ascenseur' },
            { state: fCellar,   setter: setFCellar,   label: 'Cave / Sous-sol' },
            { state: fNewOnly,  setter: setFNewOnly,  label: 'Programme neuf uniquement' },
          ].map(({ state, setter, label }) => (
            <button key={label} onClick={() => setter(s => !s)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                state ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}>
              {label}
              <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${state ? 'bg-orange-500' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${state ? 'translate-x-4' : ''}`} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  /* ── map placeholder ── */
  const MapView = () => (
    <div className="relative rounded-3xl overflow-hidden bg-[#1a2744] h-[580px]">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
      <div className="absolute top-1/3 left-1/4 w-60 h-60 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-44 h-44 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
      {paginated.slice(0, 8).map((raw, i) => {
        const l = enrichWithMeta(raw, i)
        const left = 8  + (i % 4) * 22 + (i > 3 ? 6 : 0)
        const top  = 10 + Math.floor(i / 4) * 42 + (i % 3) * 5
        return (
          <button key={l.id} onClick={() => onSelect?.(raw, i)}
            style={{ left: `${left}%`, top: `${top}%` }}
            className="absolute group z-10">
            <div className="bg-white rounded-full px-3 py-1.5 shadow-xl text-[11px] font-extrabold text-[#0B1F3A] whitespace-nowrap border-2 border-white hover:bg-orange-500 hover:text-white hover:border-orange-400 transition-all group-hover:-translate-y-1">
              {formatPrice(l)}
            </div>
            <div className="w-2 h-2 bg-white group-hover:bg-orange-500 rounded-full mx-auto -mt-0.5 shadow transition-colors" />
          </button>
        )
      })}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 pointer-events-none">
        <Icons.MapPin size={13} className="text-orange-400" />
        <span className="text-white/80 text-xs font-medium">Carte interactive — bientôt disponible</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Breadcrumb ─────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A] transition-colors">
            <Icons.ChevronLeft size={16} /> Accueil
          </button>
          <span className="text-slate-200">/</span>
          {loading
            ? <span className="h-4 w-36 bg-slate-100 rounded animate-pulse inline-block" />
            : <span className="text-sm text-slate-700">
                <span className="font-bold text-[#0B1F3A]">{sorted.length} bien{sorted.length !== 1 ? 's' : ''}</span>
                {' '}{typeLabel}
                {filters.location && <span className="text-orange-600"> · {filters.location}</span>}
                {source === 'fallback' && <span className="ml-1.5 text-xs text-slate-400">(démo)</span>}
              </span>
          }
        </div>
      </div>

      {/* ── SearchBar ─────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5">
          <SearchBar filters={filters} setFilters={setFilters} onSearch={onSearch} />
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex gap-8 items-start">

          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
              <SidebarContent />
            </div>
          </aside>

          {/* Main results */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <button onClick={() => setSideOpen(true)}
                className={`lg:hidden flex items-center gap-1.5 h-9 px-4 rounded-xl border text-sm font-semibold transition-colors ${
                  activeLocalCount > 0 ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-slate-200 text-slate-600'
                }`}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="11" y2="6"/><line x1="16" y1="6" x2="20" y2="6"/>
                  <line x1="4" y1="12" x2="8" y2="12"/><line x1="13" y1="12" x2="20" y2="12"/>
                  <line x1="4" y1="18" x2="9" y2="18"/><line x1="14" y1="18" x2="20" y2="18"/>
                  <line x1="11" y1="4" x2="11" y2="8"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="14" y1="16" x2="14" y2="20"/>
                </svg>
                Filtres{activeLocalCount > 0 ? ` (${activeLocalCount})` : ''}
              </button>

              <div className="flex items-center gap-2 mr-auto">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trier</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-orange-400 appearance-none cursor-pointer">
                  <option value="relevance">Pertinence</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="surface">Surface</option>
                </select>
              </div>

              <div className="flex items-center gap-0.5 p-1 bg-white border border-slate-200 rounded-xl">
                {[
                  { id: 'grid', title: 'Grille', path: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></> },
                  { id: 'list', title: 'Liste',  path: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></> },
                  { id: 'map',  title: 'Carte',  path: <><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></> },
                ].map(({ id, title, path }) => (
                  <button key={id} onClick={() => setViewMode(id)} title={title}
                    className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${viewMode === id ? 'bg-[#0B1F3A] text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{path}</svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick filter pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { label: 'DPE A-B', active: fDPE.includes('A') && fDPE.includes('B'), fn: () => setFDPE(prev => (prev.includes('A') && prev.includes('B')) ? prev.filter(d => d !== 'A' && d !== 'B') : [...new Set([...prev, 'A', 'B'])]) },
                { label: 'Parking',   active: fParking,  fn: () => setFParking(s => !s) },
                { label: 'Ascenseur', active: fElevator, fn: () => setFElevator(s => !s) },
                { label: 'Cave',      active: fCellar,   fn: () => setFCellar(s => !s) },
                { label: 'Neuf',      active: fNewOnly,  fn: () => setFNewOnly(s => !s) },
                { label: 'Étage 2+',  active: fFloorMin === '2', fn: () => setFFloorMin(v => v === '2' ? '' : '2') },
              ].map(({ label, active, fn }) => (
                <button key={label} onClick={fn}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    active ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-400 hover:text-orange-600'
                  }`}>
                  {active && <Icons.Check size={10} />} {label}
                </button>
              ))}
            </div>

            {/* Active chips */}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {chips.map(chip => (
                  <motion.button key={chip.key} layout initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    onClick={() => removeChip(chip)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-full transition-colors">
                    {chip.label} <Icons.X size={11} />
                  </motion.button>
                ))}
                {chips.length > 1 && (
                  <button onClick={resetAll}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-500 border border-slate-200 rounded-full transition-colors">
                    Tout effacer
                  </button>
                )}
              </div>
            )}

            {/* Animated result count */}
            {!loading && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-extrabold text-[#0B1F3A]">{animCount}</span>
                <span className="text-sm text-slate-500">bien{animCount !== 1 ? 's' : ''} {typeLabel}</span>
                {activeLocalCount > 0 && <span className="text-xs text-orange-600 font-semibold">· {activeLocalCount} filtre{activeLocalCount !== 1 ? 's' : ''} actif{activeLocalCount !== 1 ? 's' : ''}</span>}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 px-4 py-3 mb-5 bg-orange-50 border border-orange-100 text-orange-700 rounded-2xl text-sm">
                <Icons.AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>Affichage de la sélection démo — {error}</span>
              </div>
            )}

            {/* Results */}
            {loading ? (
              <ResultsSkeleton viewMode={viewMode === 'map' ? 'grid' : viewMode} />
            ) : sorted.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-soft">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                  <Icons.Search size={24} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-[#0B1F3A] mb-2">Aucun bien ne correspond</h3>
                <p className="text-slate-500 text-sm mb-6">Essayez d'élargir vos critères.</p>
                <button onClick={resetAll}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-full transition-colors">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : viewMode === 'map' ? (
              <MapView />
            ) : viewMode === 'grid' ? (
              <ResultsGrid listings={paginated} onSelect={onSelect} onCompare={onCompare} compareList={compareList} />
            ) : (
              <ResultsList listings={paginated} onSelect={onSelect} onCompare={onCompare} compareList={compareList} />
            )}

            {/* Pagination */}
            {!loading && sorted.length > PER_PAGE && viewMode !== 'map' && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:border-orange-400 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <Icons.ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, i, arr) => { if (i > 0 && n - arr[i - 1] > 1) acc.push('…'); acc.push(n); return acc }, [])
                  .map((n, i) => n === '…'
                    ? <span key={`e${i}`} className="text-slate-400 text-sm px-1">…</span>
                    : <button key={n} onClick={() => setPage(n)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                          page === n ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-600'
                        }`}>{n}</button>
                  )
                }
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:border-orange-400 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <Icons.ArrowRight size={16} />
                </button>
              </div>
            )}
            {!loading && sorted.length > 0 && viewMode !== 'map' && (
              <div className="text-center text-xs text-slate-400 mt-3">
                {sorted.length > PER_PAGE && <>Page {page} sur {totalPages} · </>}
                {sorted.length} résultat{sorted.length !== 1 ? 's' : ''}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Mobile sidebar drawer ─────────────────────── */}
      <AnimatePresence>
        {sideOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSideOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 h-full w-80 bg-white z-50 lg:hidden overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="font-bold text-[#0B1F3A]">Filtres</div>
                <button onClick={() => setSideOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Icons.X size={14} />
                </button>
              </div>
              <div className="p-6"><SidebarContent /></div>
              <div className="p-6 border-t border-slate-100">
                <button onClick={() => setSideOpen(false)}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-colors">
                  Voir les résultats ({sorted.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

/* ─── Étape 38: Estimateur de valeur ─────────────────────────────────── */
const EST_PROPERTY_TYPES = [
  { id:'appartement', label:'Appartement', icon: Icons.Building2 },
  { id:'maison',      label:'Maison',       icon: Icons.Home      },
  { id:'studio',      label:'Studio',       icon: Icons.Building  },
  { id:'villa',       label:'Villa',        icon: Icons.Villa     },
]
const EST_CITIES = [
  'Paris','Lyon','Marseille','Toulouse','Nice','Nantes','Bordeaux',
  'Strasbourg','Lille','Rennes','Montpellier','Grenoble','Toulon',
  'Angers','Tours','Dijon','Reims','Brest','Saint-Étienne','Le Havre',
]
const BASE_M2_EST = {
  Paris:10200,Lyon:4800,Marseille:3200,Bordeaux:4500,Nice:4700,Toulouse:3700,
  Nantes:3600,Strasbourg:3300,Lille:2900,Rennes:3400,Montpellier:3500,
  Grenoble:2800,Toulon:2800,Angers:2700,Tours:2700,Dijon:2600,
  Reims:2400,Brest:2300,'Saint-Étienne':1900,'Le Havre':2100,
}
const EST_DPE_COLORS = { A:'#047857',B:'#10B981',C:'#84CC16',D:'#F59E0B',E:'#F97316',F:'#EF4444',G:'#991B1B' }
const EST_ETATS = [
  { id:'renove',  label:'Rénové / Neuf',  desc:'Travaux récents ou programme neuf', mult:1.08 },
  { id:'bon',     label:'Bon état',        desc:'Entretenu, habitable sans travaux',  mult:1.0  },
  { id:'travaux', label:'À rénover',       desc:'Rafraîchissement nécessaire',         mult:0.85 },
]
const EST_STEPS = ['Type', 'Localisation', 'Caractéristiques', 'Atouts', 'Résultat']

function EstimationView({ setCurrentView }) {
  const [step,        setStep]        = useState(0)
  const [propType,    setPropType]    = useState('')
  const [city,        setCity]        = useState('')
  const [cityInput,   setCityInput]   = useState('')
  const [showCList,   setShowCList]   = useState(false)
  const [surface,     setSurface]     = useState(60)
  const [rooms,       setRooms]       = useState(3)
  const [yearBuilt,   setYearBuilt]   = useState(1990)
  const [dpe,         setDpe]         = useState('C')
  const [hasParking,  setHasParking]  = useState(false)
  const [hasCellar,   setHasCellar]   = useState(false)
  const [hasBalcony,  setHasBalcony]  = useState(false)
  const [hasTerrace,  setHasTerrace]  = useState(false)
  const [hasElevator, setHasElevator] = useState(false)
  const [hasView,     setHasView]     = useState(false)
  const [etat,        setEtat]        = useState('bon')
  const [loading,     setLoading]     = useState(false)
  const [animPrice,   setAnimPrice]   = useState(0)

  /* ── Price estimation ────────────────── */
  const cityBase = BASE_M2_EST[city] || 3200
  let ppm = cityBase
  if (propType === 'studio') ppm *= 1.08
  if (propType === 'villa')  ppm *= 1.30
  if (propType === 'maison') ppm *= 0.92
  const DPE_ADJ = { A:1.05,B:1.03,C:1.0,D:0.97,E:0.93,F:0.87,G:0.81 }
  ppm *= (DPE_ADJ[dpe] || 1.0)
  if (hasParking)  ppm += 90
  if (hasTerrace)  ppm += 140
  if (hasBalcony)  ppm += 70
  if (hasElevator) ppm += 40
  if (hasCellar)   ppm += 25
  if (hasView)     ppm += 180
  ppm *= (EST_ETATS.find(e => e.id === etat)?.mult || 1)
  const age = 2026 - yearBuilt
  if (age > 30) ppm *= 0.97
  if (age > 60) ppm *= 0.95
  const estMid  = Math.round(surface * ppm / 5000) * 5000
  const estMin  = Math.round(estMid * 0.87 / 5000) * 5000
  const estMax  = Math.round(estMid * 1.13 / 5000) * 5000
  const estPpm  = Math.round(ppm)
  const ppmDiff = Math.round((estPpm - cityBase) / cityBase * 100)
  const confidence = Math.min(95, 70 + (city?8:0) + (propType?5:0) + (yearBuilt>1950?5:0) + (dpe!=='C'?4:0) + (etat!=='bon'?3:0))
  const sellDays   = etat === 'renove' ? 32 : etat === 'travaux' ? 87 : 55

  /* ── Animate price count-up ──────────── */
  useEffect(() => {
    if (step !== 4) return
    setLoading(true)
    setAnimPrice(0)
    const t = setTimeout(() => {
      setLoading(false)
      const end = estMid; const t0 = performance.now(); const dur = 1100
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1)
        setAnimPrice(Math.round((1 - Math.pow(1-p, 3)) * end))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, 750)
    return () => clearTimeout(t)
  }, [step])

  const filteredCities = cityInput.length > 0
    ? EST_CITIES.filter(c => c.toLowerCase().startsWith(cityInput.toLowerCase())).slice(0, 6)
    : EST_CITIES.slice(0, 6)

  const canNext = ([!!propType, !!city, surface >= 10, true][step]) ?? true

  const goNext = () => { setStep(s => Math.min(4, s+1)); window.scrollTo({ top:0, behavior:'smooth' }) }
  const goBack = () => { setStep(s => Math.max(0, s-1)); window.scrollTo({ top:0, behavior:'smooth' }) }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 via-[#0e1f3a] to-[#162E52] pt-28 pb-14 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize:'48px 48px' }} />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-5">
            <Icons.Sparkles size={12} /> Estimation gratuite
          </div>
          <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Quelle est la valeur<br /><span className="text-orange-400">de votre bien ?</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base">
            Estimation personnalisée basée sur les données du marché et les caractéristiques de votre bien.
          </p>
        </div>
      </section>

      {/* Step progress */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-1">
            {EST_STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'bg-emerald-500 text-white'
                    : i === step ? 'bg-orange-500 text-white ring-4 ring-orange-200'
                    : 'bg-slate-100 text-slate-400'
                  }`}>
                    {i < step ? <Icons.Check size={13} /> : i+1}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${i === step ? 'text-orange-600' : 'text-slate-400'}`}>{label}</span>
                </div>
                {i < EST_STEPS.length-1 && (
                  <div className="flex-1 h-0.5 rounded-full mb-3" style={{ background: i < step ? '#10B981' : '#E2E8F0' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* Step 0 — Type de bien */}
          {step === 0 && (
            <motion.div key="est0" initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-32 }}>
              <h2 className="text-xl font-extrabold text-navy-900 mb-1">Type de bien</h2>
              <p className="text-slate-500 text-sm mb-6">Sélectionnez le type de votre propriété.</p>
              <div className="grid grid-cols-2 gap-4">
                {EST_PROPERTY_TYPES.map(t => {
                  const Ic = t.icon; const active = propType === t.id
                  return (
                    <button key={t.id} onClick={() => setPropType(t.id)}
                      className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all hover:-translate-y-0.5 ${active ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-200'}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Ic size={24} />
                      </div>
                      <span className={`font-semibold text-sm ${active ? 'text-orange-600' : 'text-navy-900'}`}>{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Step 1 — Localisation */}
          {step === 1 && (
            <motion.div key="est1" initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-32 }}>
              <h2 className="text-xl font-extrabold text-navy-900 mb-1">Localisation</h2>
              <p className="text-slate-500 text-sm mb-6">Dans quelle ville se situe votre bien ?</p>
              <div className="relative mb-3">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.MapPin size={16} /></div>
                <input type="text" placeholder="Tapez une ville…" value={cityInput}
                  onChange={e => { setCityInput(e.target.value); setCity(''); setShowCList(true) }}
                  onFocus={() => setShowCList(true)}
                  className="w-full bg-white border-2 border-slate-200 focus:border-orange-400 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-medium outline-none transition-colors" />
                {city && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"><Icons.Check size={16} /></div>}
              </div>
              {showCList && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden mb-4">
                  {filteredCities.length > 0 ? filteredCities.map(c => (
                    <button key={c} onClick={() => { setCity(c); setCityInput(c); setShowCList(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-orange-50 text-left transition-colors ${c === city ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-navy-900'}`}>
                      <Icons.MapPin size={13} className="text-slate-400 shrink-0" />
                      {c}
                      {BASE_M2_EST[c] && <span className="ml-auto text-xs text-slate-400">{BASE_M2_EST[c].toLocaleString('fr-FR')} €/m²</span>}
                    </button>
                  )) : <div className="px-4 py-4 text-sm text-slate-400 text-center">Aucune ville trouvée</div>}
                </div>
              )}
              {city && (
                <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex items-center gap-3">
                  <Icons.MapPin size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-emerald-800">{city}</div>
                    <div className="text-xs text-emerald-600">Prix moyen : {(BASE_M2_EST[city]||3200).toLocaleString('fr-FR')} €/m²</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 2 — Caractéristiques */}
          {step === 2 && (
            <motion.div key="est2" initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-32 }} className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-navy-900 mb-1">Caractéristiques</h2>
                <p className="text-slate-500 text-sm">Renseignez les détails de votre bien.</p>
              </div>
              {/* Surface */}
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-navy-900 text-sm">Surface habitable</span>
                  <span className="text-2xl font-extrabold text-orange-500">{surface} <span className="text-base font-normal text-slate-400">m²</span></span>
                </div>
                <input type="range" min={10} max={400} step={5} value={surface}
                  onChange={e => setSurface(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-orange-500 cursor-pointer" />
                <div className="flex justify-between mt-2 text-xs text-slate-300"><span>10 m²</span><span>200 m²</span><span>400 m²</span></div>
              </div>
              {/* Rooms */}
              <div className="bg-white rounded-2xl p-5 shadow-soft flex items-center justify-between">
                <span className="font-semibold text-navy-900 text-sm">Nombre de pièces</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setRooms(r => Math.max(1, r-1))}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-orange-100 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-colors text-lg font-bold leading-none">−</button>
                  <span className="text-xl font-extrabold text-navy-900 w-8 text-center">{rooms}</span>
                  <button onClick={() => setRooms(r => Math.min(12, r+1))}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-orange-100 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-colors text-lg font-bold leading-none">+</button>
                </div>
              </div>
              {/* Year built */}
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-navy-900 text-sm">Année de construction</span>
                  <span className="text-2xl font-extrabold text-navy-900">{yearBuilt}</span>
                </div>
                <input type="range" min={1880} max={2024} step={1} value={yearBuilt}
                  onChange={e => setYearBuilt(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-indigo-500 cursor-pointer" />
                <div className="flex justify-between mt-2 text-xs text-slate-300"><span>1880</span><span>1950</span><span>2000</span><span>2024</span></div>
              </div>
              {/* DPE */}
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="font-semibold text-navy-900 text-sm mb-3">Classe DPE</div>
                <div className="flex gap-2 flex-wrap">
                  {['A','B','C','D','E','F','G'].map(d => (
                    <button key={d} onClick={() => setDpe(d)}
                      className={`w-11 h-11 rounded-xl font-extrabold text-sm border-2 transition-all ${dpe===d ? 'text-white border-transparent scale-110 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:scale-105'}`}
                      style={{ background: dpe===d ? EST_DPE_COLORS[d] : undefined }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Atouts */}
          {step === 3 && (
            <motion.div key="est3" initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-32 }} className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-navy-900 mb-1">Atouts du bien</h2>
                <p className="text-slate-500 text-sm">Sélectionnez les équipements et précisez l'état général.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="font-semibold text-navy-900 text-sm mb-4">Équipements et prestations</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key:'parking',  label:'Parking',    state:hasParking,  set:setHasParking  },
                    { key:'balcony',  label:'Balcon',     state:hasBalcony,  set:setHasBalcony  },
                    { key:'terrace',  label:'Terrasse',   state:hasTerrace,  set:setHasTerrace  },
                    { key:'cellar',   label:'Cave',       state:hasCellar,   set:setHasCellar   },
                    { key:'elevator', label:'Ascenseur',  state:hasElevator, set:setHasElevator },
                    { key:'view',     label:'Belle vue',  state:hasView,     set:setHasView     },
                  ].map(f => (
                    <button key={f.key} onClick={() => f.set(v => !v)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-sm font-medium transition-all ${f.state ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'}`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${f.state ? 'bg-orange-500 border-orange-500' : 'border-slate-300'}`}>
                        {f.state && <Icons.Check size={11} className="text-white" />}
                      </div>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="font-semibold text-navy-900 text-sm mb-4">État général du bien</div>
                <div className="space-y-2.5">
                  {EST_ETATS.map(e => (
                    <button key={e.id} onClick={() => setEtat(e.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${etat===e.id ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-200'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${etat===e.id ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
                        {etat===e.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${etat===e.id ? 'text-orange-700' : 'text-navy-900'}`}>{e.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{e.desc}</div>
                      </div>
                      <div className="ml-auto text-xs font-bold shrink-0" style={{ color: e.mult >= 1 ? '#10B981' : '#EF4444' }}>
                        {e.mult >= 1 ? `+${Math.round((e.mult-1)*100)}%` : `${Math.round((e.mult-1)*100)}%`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4 — Résultat */}
          {step === 4 && (
            <motion.div key="est4" initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-32 }} className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <Icons.Loader size={32} className="text-orange-500" />
                  </div>
                  <div className="text-navy-900 font-semibold">Analyse en cours…</div>
                  <div className="text-slate-400 text-sm">Données marché · DPE · Prestations</div>
                </div>
              ) : (
                <>
                  {/* Main price card */}
                  <div className="bg-gradient-to-br from-navy-900 to-[#162E52] rounded-2xl p-7 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-52 h-52 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                    <div className="text-white/60 text-sm mb-2">Valeur estimée</div>
                    <div className="text-5xl font-extrabold tracking-tight mb-1" style={{ color:'#FB923C' }}>
                      {animPrice.toLocaleString('fr-FR')} <span className="text-2xl font-semibold" style={{ color:'rgba(255,255,255,0.5)' }}>€</span>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-5">
                      <div className="text-center">
                        <div className="text-white/40 text-xs">Fourchette basse</div>
                        <div className="text-white/80 font-bold text-sm mt-0.5">{estMin.toLocaleString('fr-FR')} €</div>
                      </div>
                      <div className="w-px h-8 bg-white/20" />
                      <div className="text-center">
                        <div className="text-white/40 text-xs">Fourchette haute</div>
                        <div className="text-white/80 font-bold text-sm mt-0.5">{estMax.toLocaleString('fr-FR')} €</div>
                      </div>
                    </div>
                  </div>

                  {/* Key metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label:'Prix/m²', value:`${estPpm.toLocaleString('fr-FR')} €`, sub: ppmDiff > 0 ? `+${ppmDiff}% moy.` : `${ppmDiff}% moy.`, color: ppmDiff >= 0 ? '#10B981' : '#EF4444' },
                      { label:'Fiabilité', value:`${confidence}%`, sub:'confiance', color: confidence>=85 ? '#10B981' : '#F97316' },
                      { label:'Délai vente', value:`${sellDays}j`, sub:'estimé', color:'#6366F1' },
                    ].map(m => (
                      <div key={m.label} className="bg-white rounded-2xl p-4 text-center shadow-soft">
                        <div className="text-xs text-slate-400 mb-1">{m.label}</div>
                        <div className="font-extrabold text-lg" style={{ color:m.color }}>{m.value}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{m.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Market comparison */}
                  {city && (
                    <div className="bg-white rounded-2xl p-5 shadow-soft">
                      <div className="font-semibold text-navy-900 text-sm mb-4">Comparaison marché — {city}</div>
                      {[
                        { label:'Votre bien', value:estPpm, color:'#F97316' },
                        { label:`Moy. ${city}`,  value:cityBase, color:'#6366F1' },
                      ].map(bar => {
                        const max = Math.max(estPpm, cityBase) * 1.15
                        return (
                          <div key={bar.label} className="mb-3 last:mb-0">
                            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                              <span>{bar.label}</span>
                              <span className="font-bold">{bar.value.toLocaleString('fr-FR')} €/m²</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full"
                                initial={{ width:0 }} animate={{ width:`${(bar.value/max)*100}%` }}
                                transition={{ duration:0.9, ease:'easeOut', delay:0.2 }}
                                style={{ background:bar.color }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Confidence gauge */}
                  <div className="bg-white rounded-2xl p-5 shadow-soft">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-navy-900 text-sm">Indice de fiabilité</span>
                      <span className="text-lg font-extrabold" style={{ color: confidence>=85 ? '#10B981' : '#F97316' }}>{confidence}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <motion.div className="h-full rounded-full"
                        initial={{ width:0 }} animate={{ width:`${confidence}%` }}
                        transition={{ duration:1, ease:'easeOut', delay:0.5 }}
                        style={{ background: confidence>=85 ? '#10B981' : '#F97316' }} />
                    </div>
                    <p className="text-xs text-slate-400">Basé sur {city ? `les données de ${city}` : 'les données nationales'}, les caractéristiques saisies et les tendances du marché.</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-white rounded-2xl p-5 shadow-soft">
                    <div className="font-semibold text-navy-900 text-sm mb-3">Récapitulatif</div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      {[
                        ['Type',    EST_PROPERTY_TYPES.find(t => t.id===propType)?.label || '—'],
                        ['Ville',   city || '—'],
                        ['Surface', `${surface} m²`],
                        ['Pièces',  rooms],
                        ['Construit', yearBuilt],
                        ['DPE',     dpe],
                        ['État',    EST_ETATS.find(e => e.id===etat)?.label || '—'],
                        ['Atouts',  [hasParking&&'Parking',hasBalcony&&'Balcon',hasTerrace&&'Terrasse',hasCellar&&'Cave',hasElevator&&'Ascenseur',hasView&&'Vue'].filter(Boolean).join(', ')||'Aucun'],
                      ].map(([k,v]) => (
                        <div key={k}>
                          <div className="text-xs text-slate-400">{k}</div>
                          <div className="text-sm font-semibold text-navy-900 truncate">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-3 pt-1">
                    <button onClick={() => setCurrentView('publier')}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm">
                      <Icons.PlusSquare size={16} /> Publier mon annonce sur PASMAL
                    </button>
                    <button onClick={() => setCurrentView('simulateur')}
                      className="w-full bg-white border-2 border-slate-200 hover:border-orange-300 text-navy-900 font-semibold py-3.5 rounded-2xl transition-colors text-sm flex items-center justify-center gap-2">
                      <Icons.CreditCard size={15} /> Simuler mon financement
                    </button>
                    <button onClick={() => setCurrentView('home')}
                      className="w-full bg-white border-2 border-slate-200 hover:border-orange-300 text-navy-900 font-semibold py-3.5 rounded-2xl transition-colors text-sm">
                      Retour à l'accueil
                    </button>
                  </div>

                  <p className="text-center text-xs text-slate-400 leading-relaxed">
                    Estimation indicative non contractuelle. Basée sur les données de marché disponibles et les informations saisies.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav buttons */}
        {step < 4 && (
          <div className="flex items-center gap-3 mt-8">
            {step > 0 && (
              <button onClick={goBack}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 transition-colors">
                <Icons.ChevronLeft size={16} /> Retour
              </button>
            )}
            <button onClick={goNext} disabled={!canNext}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${canNext ? 'bg-orange-600 hover:bg-orange-700 text-white hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
              {step === 3 ? 'Voir mon estimation' : 'Continuer'} <Icons.ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

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
  const seed = typeof l.id === 'string' ? (l.id.charCodeAt(0) || idx + 1) : idx + 1

  const pricePerSqm    = l.surface ? Math.round((l.price || 400000) / l.surface) : null
  const cityAvgPerSqm  = pricePerSqm ? Math.round(pricePerSqm * (0.88 + (seed % 10) * 0.025)) : null
  const historyBase    = l.price || 400000
  const historyValues  = [0.94, 0.96, 0.97, 0.985, 1.0, 1.02].map(f => Math.round(historyBase * f))
  const historyMax     = Math.max(...historyValues)
  const HISTORY_MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun']
  const neighScores    = [70 + ((seed*3)%28), 60+((seed*7)%35), 65+((seed*5)%30), 55+((seed*11)%40)]
  const NEIGH_ITEMS    = [
    { label: 'Transports', color: '#6366F1', bg: '#EEF2FF' },
    { label: 'Écoles',     color: '#10B981', bg: '#ECFDF5' },
    { label: 'Commerces',  color: '#F97316', bg: '#FFF7ED' },
    { label: 'Calme',      color: '#0EA5E9', bg: '#F0F9FF' },
  ]
  const DPE_ALL = ['A','B','C','D','E','F','G']
  const DPE_RANGES = { A:'≤ 50', B:'51–90', C:'91–150', D:'151–230', E:'231–330', F:'331–450', G:'> 450' }
  const DPE_WIDTHS  = { A:28, B:40, C:52, D:64, E:76, F:88, G:100 }

  const [photoIdx,    setPhotoIdx]    = useState(0)
  const [showLightbox,setShowLightbox]= useState(false)
  const [favd,        setFavd]        = useState(false)
  const [priceAlert,  setPriceAlert]  = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [loanYears,   setLoanYears]   = useState(20)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    message: "Bonjour, je suis intéressé(e) par ce bien et souhaite obtenir plus d'informations.",
  })
  const [sent, setSent] = useState(false)

  const photos = [
    l.image_url || unsplash('photo-1560448204-e02f11c3d0e2', 1200),
    ..._GALLERY_IDS.map(id => unsplash(id, 900)),
  ]

  const loanAmount  = (l.price || 400000) * 0.9
  const mRate       = 3.5 / 100 / 12
  const nPay        = loanYears * 12
  const monthly     = Math.round(loanAmount * mRate * Math.pow(1+mRate, nPay) / (Math.pow(1+mRate, nPay) - 1))
  const totalCost   = monthly * nPay - Math.round(loanAmount)

  const handleSend  = (e) => { e.preventDefault(); setSent(true) }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
            onClick={() => setShowLightbox(false)}>
            <motion.img initial={{ scale:0.85 }} animate={{ scale:1 }} exit={{ scale:0.85 }}
              src={photos[photoIdx]} alt={l.title}
              className="max-h-[88vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()} />
            <button onClick={() => setShowLightbox(false)}
              className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition">
              <Icons.X size={20} />
            </button>
            {photoIdx > 0 && (
              <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => i-1) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition">
                <Icons.ChevronLeft size={22} />
              </button>
            )}
            {photoIdx < photos.length-1 && (
              <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => i+1) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition">
                <Icons.ChevronRight size={22} />
              </button>
            )}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((_,i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setPhotoIdx(i) }}
                  className={`w-2 h-2 rounded-full transition-colors ${i===photoIdx?'bg-white':'bg-white/30'}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="relative rounded-2xl overflow-hidden bg-slate-200" style={{ aspectRatio:'16/9' }}>
              <img src={photos[photoIdx]} alt={l.title} className="w-full h-full object-cover"
                onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 1200) }} />
              {photoIdx > 0 && (
                <button onClick={() => setPhotoIdx(i => i-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition">
                  <Icons.ChevronLeft size={18} />
                </button>
              )}
              {photoIdx < photos.length-1 && (
                <button onClick={() => setPhotoIdx(i => i+1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition">
                  <Icons.ChevronRight size={18} />
                </button>
              )}
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                {photoIdx+1} / {photos.length}
              </div>
              <div className="absolute top-3 left-3 flex gap-2">
                {l.is_new     && <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Nouveau</span>}
                {l.is_urgent  && <span className="bg-red-500    text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Urgent</span>}
                {l.is_popular && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Populaire</span>}
              </div>
              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => setFavd(f => !f)}
                  className="w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition">
                  <svg viewBox="0 0 24 24" style={{ width:18, height:18, color: favd ? '#EF4444' : '#94A3B8' }}
                    fill={favd ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <button onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}) }}
                  className="w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition">
                  <svg viewBox="0 0 24 24" style={{ width:16, height:16 }} fill="none" stroke="#64748B" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </button>
                <button onClick={() => setShowLightbox(true)}
                  className="w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition">
                  <Icons.Maximize size={15} className="text-slate-500" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((src,i) => (
                <button key={i} onClick={() => setPhotoIdx(i)}
                  className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${i===photoIdx?'border-orange-500':'border-transparent opacity-60 hover:opacity-90'}`}>
                  <img src={src} alt="" className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 200) }} />
                </button>
              ))}
            </div>

            {/* Key stats */}
            <div className="bg-white rounded-2xl p-5 shadow-soft">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  <h1 className="text-xl font-extrabold text-navy-900 mb-1">{l.title}</h1>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Icons.MapPin size={14} className="text-orange-500" /> {l.location}
                  </div>
                </div>
                {l.type !== 'louer' && pricePerSqm && cityAvgPerSqm && (
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400">Prix au m²</div>
                    <div className="text-base font-bold text-navy-900">{pricePerSqm.toLocaleString('fr-FR')} €</div>
                    <div style={{ color: pricePerSqm<=cityAvgPerSqm ? '#059669' : '#EA580C' }} className="text-xs font-medium">
                      {pricePerSqm<=cityAvgPerSqm ? '▼' : '▲'} {Math.abs(Math.round((pricePerSqm-cityAvgPerSqm)/cityAvgPerSqm*100))}% moy. ville
                    </div>
                  </div>
                )}
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

            {/* Virtual visit CTA */}
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-white font-bold mb-1">Visite virtuelle disponible</div>
                <p className="text-indigo-200 text-sm">Explorez ce bien en 360° depuis chez vous, sans rendez-vous.</p>
              </div>
              <button className="shrink-0 bg-white text-indigo-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors whitespace-nowrap flex items-center gap-2">
                <svg viewBox="0 0 24 24" style={{ width:14,height:14 }} fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Lancer la visite
              </button>
            </div>

            {/* Quartier */}
            <div className="bg-white rounded-2xl p-5 shadow-soft">
              <h2 className="font-bold text-navy-900 mb-4">Le quartier</h2>

              {/* Fake map */}
              <div className="relative rounded-xl overflow-hidden bg-[#1e2d4d] mb-5" style={{ height:190 }}>
                <svg className="absolute inset-0 w-full h-full" style={{ opacity:0.18 }}>
                  <defs>
                    <pattern id="detailGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#6B7FCC" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#detailGrid)"/>
                </svg>
                <svg className="absolute inset-0 w-full h-full" style={{ opacity:0.35 }}>
                  <line x1="0" y1="95" x2="100%" y2="95" stroke="#4B5F9E" strokeWidth="9"/>
                  <line x1="185" y1="0" x2="185" y2="100%" stroke="#4B5F9E" strokeWidth="6"/>
                  <line x1="360" y1="0" x2="360" y2="100%" stroke="#4B5F9E" strokeWidth="3"/>
                  <line x1="0" y1="138" x2="100%" y2="138" stroke="#4B5F9E" strokeWidth="3"/>
                  <rect x="30" y="20" width="120" height="58" rx="4" fill="#8B9FD4" fillOpacity="0.3"/>
                  <rect x="205" y="20" width="90" height="58" rx="4"  fill="#8B9FD4" fillOpacity="0.3"/>
                  <rect x="315" y="20" width="70" height="58" rx="4"  fill="#8B9FD4" fillOpacity="0.3"/>
                  <rect x="30"  y="110" width="105" height="62" rx="4" fill="#8B9FD4" fillOpacity="0.3"/>
                  <rect x="205" y="110" width="130" height="62" rx="4" fill="#8B9FD4" fillOpacity="0.3"/>
                </svg>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full z-10">
                  <div className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap">
                    {formatPrice(l)}
                  </div>
                  <div style={{ width:12, height:12, background:'#F97316', transform:'rotate(45deg)', margin:'-6px auto 0' }} />
                </div>
                <div className="absolute bottom-2 right-3 text-white/25" style={{ fontSize:10 }}>© PASMAL Maps</div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {NEIGH_ITEMS.map((item,i) => (
                  <div key={item.label} className="p-3 rounded-xl" style={{ background: item.bg }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-600">{item.label}</span>
                      <span className="text-xs font-bold" style={{ color: item.color }}>{neighScores[i]}/100</span>
                    </div>
                    <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${neighScores[i]}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Amenities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                {[
                  { icon:'🚇', text:'Métro — 3 min à pied' },
                  { icon:'🏫', text:'École primaire — 200 m' },
                  { icon:'🛒', text:'Supermarché — 100 m' },
                  { icon:'🌳', text:'Parc municipal — 300 m' },
                  { icon:'🚌', text:'Bus direct — 1 min' },
                  { icon:'💊', text:'Pharmacie — 150 m' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 py-1.5 border-b border-slate-50 text-sm text-slate-600">
                    <span>{icon}</span> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Characteristics + Full DPE */}
            <div className="bg-white rounded-2xl p-5 shadow-soft">
              <h2 className="font-bold text-navy-900 mb-4">Caractéristiques</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {detail.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <Icons.Check size={14} className="text-emerald-500 shrink-0" /> {f}
                  </div>
                ))}
              </div>

              {/* Full DPE A-G scale */}
              <div className="border-t border-slate-100 pt-5 mb-4">
                <div className="text-sm font-semibold text-navy-900 mb-3">Diagnostic de Performance Énergétique (DPE)</div>
                <div className="space-y-1.5">
                  {DPE_ALL.map(band => {
                    const b = DPE_BANDS[band]
                    const isActive = band === detail.dpe
                    return (
                      <div key={band} className="flex items-center gap-3" style={{ opacity: isActive ? 1 : 0.5, transform: isActive ? 'scale(1.02)' : 'none', transformOrigin: 'left' }}>
                        <div style={{ width:`${DPE_WIDTHS[band]}%`, background: b.color, color: b.textColor, minHeight:32, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px', fontSize:13, fontWeight:700 }}>
                          <span>{band}</span>
                          {isActive && <span style={{ fontSize:10, fontWeight:600 }}>{DPE_RANGES[band]} kWh/m²/an</span>}
                        </div>
                        {isActive && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                            <span className="text-xs font-bold text-orange-600">Ce bien</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
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

            {/* Price history chart */}
            {l.type !== 'louer' && (
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <h2 className="font-bold text-navy-900 mb-1">Historique de prix</h2>
                <p className="text-xs text-slate-400 mb-5">Évolution estimée sur les 6 derniers mois</p>
                <div className="flex items-end gap-2" style={{ height:96 }}>
                  {historyValues.map((val,i) => {
                    const pct = (val / historyMax) * 100
                    const isLast = i === historyValues.length-1
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute left-1/2 -translate-x-1/2 bg-navy-900 text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
                          style={{ bottom:'calc(100% + 4px)', fontSize:10, padding:'2px 6px' }}>
                          {(val/1000).toFixed(0)}k €
                        </div>
                        <div className="w-full rounded-t-lg transition-all duration-300"
                          style={{ height:`${pct}%`, background: isLast ? '#F97316' : '#C7D2FE' }} />
                        <span className="text-slate-400" style={{ fontSize:10 }}>{HISTORY_MONTHS[i]}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex items-center gap-2 text-emerald-600 text-xs font-medium">
                  <Icons.TrendingUp size={14} />
                  +{((historyValues[5]/historyValues[0]-1)*100).toFixed(1)}% sur la période
                </div>
              </div>
            )}

            {/* Similar listings */}
            {similarListings.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <h2 className="font-bold text-navy-900 mb-4">Biens similaires</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similarListings.slice(0,4).map((raw2,i) => {
                    const s = enrichWithMeta(raw2, i+10)
                    return (
                      <div key={s.id}
                        className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => onOpenListing?.(raw2, i+10)}>
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

          {/* ── Right col: sticky ──────────────────────────── */}
          <div className="mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-[72px] space-y-4">

              {/* Price quick card */}
              <div className="bg-navy-900 rounded-2xl p-5 text-white">
                <div className="text-2xl font-extrabold mb-0.5">{formatPrice(l)}</div>
                {pricePerSqm && (
                  <div className="text-white/50 text-sm mb-4">{pricePerSqm.toLocaleString('fr-FR')} €/m²</div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setPriceAlert(a => !a)}
                    style={{ background: priceAlert ? '#F97316' : 'rgba(255,255,255,0.1)' }}
                    className="flex-1 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity text-white">
                    <Icons.Bell size={13} />
                    {priceAlert ? 'Alerte activée' : 'Alerte prix'}
                  </button>
                  <button onClick={() => setFavd(f => !f)}
                    style={{ background: favd ? '#EF4444' : 'rgba(255,255,255,0.1)' }}
                    className="flex-1 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity text-white">
                    <svg viewBox="0 0 24 24" style={{ width:13,height:13 }} fill={favd ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {favd ? 'En favoris' : 'Sauvegarder'}
                  </button>
                </div>
              </div>

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
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width:`${l.trust_score}%` }} />
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
                      className="w-full text-xs text-slate-400 hover:text-slate-600 py-1">Annuler</button>
                  </form>
                )}
                {!sent && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
                    <Icons.Phone size={12} /> <span>01 23 45 67 89</span>
                  </div>
                )}
              </div>

              {/* Mortgage calculator */}
              {l.type !== 'louer' && typeof l.price === 'number' && (
                <div className="bg-white rounded-2xl p-5 shadow-soft">
                  <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <Icons.CreditCard size={16} className="text-indigo-500" />
                    Simulateur de prêt
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span>Durée du prêt</span>
                        <span className="font-bold text-navy-900">{loanYears} ans</span>
                      </div>
                      <input type="range" min={10} max={25} step={5} value={loanYears}
                        onChange={e => setLoanYears(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full accent-indigo-600 cursor-pointer" />
                      <div className="flex justify-between mt-1" style={{ fontSize:10, color:'#CBD5E1' }}>
                        <span>10 ans</span><span>15</span><span>20</span><span>25 ans</span>
                      </div>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-3.5 text-center">
                      <div className="text-xs text-slate-500 mb-0.5">Mensualité estimée</div>
                      <div className="text-3xl font-extrabold text-indigo-700">{monthly.toLocaleString('fr-FR')} <span className="text-lg">€</span></div>
                      <div className="text-xs text-slate-400 mt-0.5">Apport 10% · Taux 3,5% · {loanYears} ans</div>
                    </div>
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Montant emprunté</span>
                        <span className="font-semibold text-slate-700">{Math.round(loanAmount).toLocaleString('fr-FR')} €</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Coût total du crédit</span>
                        <span className="font-semibold text-slate-700">{totalCost.toLocaleString('fr-FR')} €</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

/* ─── Étape 40: Guides & Conseils ────────────────────────────────────── */
const ALL_GUIDES = [
  { id:'primo',       cat:'Achat',          featured:true,
    title:'Primo-accédants : le guide complet 2026',
    excerpt:'Budget, apport, PTZ, frais de notaire... tout ce qu\'il faut savoir avant de signer.',
    img:unsplash('photo-1554224155-6726b3ff858f', 900), time:'8 min', date:'12 mai 2026', author:'Sophie Marchand',
    content:[
      { h:'Définir votre budget',     p:'Calculez votre capacité d\'emprunt : le taux d\'endettement ne doit pas dépasser 35 % de vos revenus nets. Consultez un courtier pour comparer les offres de plusieurs banques et simuler votre mensualité.' },
      { h:'Le Prêt à Taux Zéro',      p:'Le PTZ peut financer jusqu\'à 40 % du prix selon la zone géographique. Réservé aux primo-accédants achetant leur résidence principale, il ne nécessite pas de remboursement d\'intérêts et s\'ajoute à votre prêt principal.' },
      { h:'Les frais de notaire',      p:'Prévoyez 7-8 % du prix dans l\'ancien (2-3 % dans le neuf). Ces frais incluent droits de mutation, honoraires du notaire et débours. Négligeables dans le neuf, ils pèsent lourd dans l\'ancien.' },
      { h:'Checklist avant signature', p:'Vérifiez le DPE, les charges de copropriété, la taxe foncière, les travaux votés et le règlement de copropriété. Un diagnostiqueur professionnel peut vous éviter de mauvaises surprises.' },
    ],
  },
  { id:'bail',        cat:'Location',
    title:'Comprendre le bail de location en 5 points',
    excerpt:'Durée, dépôt de garantie, charges récupérables : vos droits et obligations.',
    img:unsplash('photo-1560518883-ce09059eeffa', 900), time:'5 min', date:'8 mai 2026', author:'Lucas Dupont',
    content:[
      { h:'Durée du bail',             p:'Un bail non meublé est conclu pour 3 ans, 1 an en meublé. À l\'échéance, renouvellement automatique sauf congé donné dans les délais : 3 mois côté bailleur, 1 mois côté locataire en zone tendue.' },
      { h:'Le dépôt de garantie',      p:'Limité à 1 mois en location vide, 2 mois en meublé. Il doit être restitué dans les 2 mois suivant la restitution des clés, déductions de réparations justifiées.' },
      { h:'Les charges récupérables',  p:'Le bailleur peut récupérer entretien des parties communes, eau, chauffage collectif... La liste exhaustive est fixée par décret. Un décompte annuel doit être envoyé au locataire.' },
    ],
  },
  { id:'lmnp',        cat:'Investissement',
    title:'LMNP : amortir son bien et réduire ses impôts',
    excerpt:'Le statut LMNP offre des avantages fiscaux puissants souvent méconnus des investisseurs.',
    img:unsplash('photo-1486325212027-8081e485255e', 900), time:'6 min', date:'3 mai 2026', author:'Marie Lefèvre',
    content:[
      { h:'Qu\'est-ce que le LMNP ?',  p:'La Location Meublée Non Professionnelle permet de louer un bien meublé avec une fiscalité avantageuse. Vous devez percevoir moins de 23 000 € de loyers annuels ou que ceux-ci représentent moins de 50 % de vos revenus globaux.' },
      { h:'L\'amortissement comptable', p:'Au régime réel, vous amortissez le bien sur 25-40 ans et les meubles sur 7-10 ans. Cet amortissement vient en déduction des loyers et peut réduire votre imposition à zéro sur de nombreuses années.' },
      { h:'Micro-BIC vs réel',         p:'Le micro-BIC offre un abattement de 50 %. Le régime réel est plus avantageux si vos charges (crédit, travaux, amortissement) dépassent 50 % des recettes. Un expert-comptable peut vous accompagner.' },
    ],
  },
  { id:'taux',        cat:'Financement',
    title:'Comment négocier le meilleur taux immobilier',
    excerpt:'Apport, dossier solide, courtier... les leviers pour décrocher les meilleures conditions.',
    img:unsplash('photo-1560472354-b33ff0c44a43', 900), time:'7 min', date:'28 avr. 2026', author:'Pierre Morel',
    content:[
      { h:'Construire un dossier solide', p:'Les banques regardent : stabilité professionnelle (CDI préféré), taux d\'endettement, apport (idéalement 10-20 %), comportement bancaire (pas de découvert, épargne régulière). Préparez 3 mois de relevés et vos 3 dernières fiches de paie.' },
      { h:'Faire appel à un courtier',    p:'Un courtier compare les offres de nombreuses banques et négocie en votre nom. Sa rémunération est en général à la charge de la banque retenue. Economies potentielles : plusieurs milliers d\'euros.' },
      { h:'L\'assurance emprunteur',      p:'Depuis la loi Lemoine, vous pouvez changer d\'assurance emprunteur à tout moment. La délégation d\'assurance peut vous économiser 30 à 70 % sur ce poste, soit plusieurs dizaines de milliers sur la durée du prêt.' },
    ],
  },
  { id:'vendre',      cat:'Vente',
    title:'Vendre au meilleur prix : les 7 règles d\'or',
    excerpt:'Estimation, home staging, timing de mise en vente... les secrets des vendeurs performants.',
    img:unsplash('photo-1600585154340-be6161a56a0c', 900), time:'6 min', date:'22 avr. 2026', author:'Sophie Marchand',
    content:[
      { h:'Bien estimer son bien',  p:'Une surestimation fera fuir les acheteurs et rallongera les délais. Consultez plusieurs agents et les bases notariales pour les ventes récentes dans votre quartier. PASMAL propose une estimation gratuite en ligne.' },
      { h:'Le home staging',        p:'La valorisation immobilière permet de vendre 10-15 % plus cher et 2-3× plus vite. Dépersonnalisez, désencombrez, rafraîchissez les peintures et soignez les photos (lumière naturelle, grand angle).' },
      { h:'Choisir le bon moment',  p:'Le printemps (mars-juin) est la meilleure période de mise en vente pour les résidences principales. Évitez les fêtes et l\'été. Une annonce publiée un jeudi obtient en moyenne 22 % de contacts supplémentaires.' },
    ],
  },
  { id:'dpe',         cat:'Travaux & DPE',
    title:'DPE F et G : les aides à la rénovation en 2026',
    excerpt:'MaPrimeRénov\', CEE, éco-PTZ... tour d\'horizon des dispositifs disponibles pour rénover.',
    img:unsplash('photo-1558618666-fcd25c85cd64', 900), time:'9 min', date:'15 avr. 2026', author:'Lucas Dupont',
    content:[
      { h:'L\'urgence énergétique',  p:'Les logements G sont interdits à la location depuis 2025. Les F suivront en 2028. La rénovation thermique n\'est plus seulement un choix mais une nécessité pour les propriétaires bailleurs.' },
      { h:'MaPrimeRénov\'',          p:'Ce dispositif de l\'ANAH finance jusqu\'à 70 % des travaux pour les ménages les plus modestes. Isolation, pompe à chaleur, ventilation... sont éligibles. Les démarches se font sur maprimerenov.gouv.fr.' },
      { h:'L\'éco-PTZ',              p:'Jusqu\'à 50 000 € sans intérêts pour un bouquet de travaux de rénovation. Cumulable avec MaPrimeRénov\' et accessible sans conditions de ressources depuis 2022. Durée de remboursement jusqu\'à 20 ans.' },
    ],
  },
  { id:'copro',       cat:'Achat',
    title:'Acheter en copropriété : les pièges à éviter',
    excerpt:'Charges, travaux votés, syndic, règlement... ce qu\'il faut absolument vérifier avant de signer.',
    img:unsplash('photo-1484154218962-a197022b5858', 900), time:'6 min', date:'5 avr. 2026', author:'Pierre Morel',
    content:[
      { h:'Les documents à analyser', p:'Exigez les 3 derniers PV d\'assemblée générale, le règlement de copropriété, le carnet d\'entretien et les relevés de charges des 3 dernières années pour cerner la santé financière de la copropriété.' },
      { h:'Les travaux votés',        p:'Des travaux votés mais non payés seront à votre charge après la vente. Le diagnostic technique global (DTG) alerte sur les travaux à prévoir sur 10 ans. Demandez-le systématiquement.' },
    ],
  },
  { id:'meuble',      cat:'Location',
    title:'Location meublée : équipements obligatoires et avantages',
    excerpt:'Liste du mobilier imposé, loyer majoré, bail mobilité : tout ce qu\'il faut savoir.',
    img:unsplash('photo-1493809842364-78817add7ffb', 900), time:'4 min', date:'1 avr. 2026', author:'Sophie Marchand',
    content:[
      { h:'Le mobilier obligatoire', p:'La liste réglementaire inclut : literie, volets/rideaux en chambre, plaques de cuisson, four ou micro-ondes, réfrigérateur, table et sièges, étagères de rangement, luminaires et matériel d\'entretien ménager.' },
      { h:'Les avantages fiscaux',   p:'En régime LMNP, l\'amortissement comptable peut annuler l\'imposition sur les loyers. Le micro-BIC offre 50 % d\'abattement contre 30 % en location nue. Un avantage fiscal significatif sur le long terme.' },
    ],
  },
  { id:'rendement',   cat:'Investissement',
    title:'Calculer le rendement locatif net-net d\'un investissement',
    excerpt:'Rendement brut, net, net-net : les vraies formules pour comparer des biens objectivement.',
    img:unsplash('photo-1556909114-f6e7ad7d3136', 900), time:'5 min', date:'25 mar. 2026', author:'Marie Lefèvre',
    content:[
      { h:'Le rendement brut',     p:'Rendement brut = (loyer annuel / prix d\'achat) × 100. Simple à calculer mais peu représentatif de la réalité car il ignore les charges, la fiscalité et les frais d\'acquisition.' },
      { h:'Le rendement net',      p:'Rendement net = ((loyer annuel – charges) / (prix + frais)) × 100. Plus précis, il intègre les charges locatives, la taxe foncière, les frais d\'acquisition et l\'assurance.' },
      { h:'Le rendement net-net',  p:'Le rendement net-net intègre également la fiscalité applicable (TMI + prélèvements sociaux, ou régime LMNP). C\'est la seule mesure vraiment comparable entre deux investissements à régimes fiscaux différents.' },
    ],
  },
]
const GUIDE_CATS = ['Tous', 'Achat', 'Location', 'Vente', 'Investissement', 'Financement', 'Travaux & DPE']
const GUIDE_CAT_COLORS = { Achat:'#F97316', Location:'#6366F1', Vente:'#10B981', Investissement:'#0EA5E9', Financement:'#F59E0B', 'Travaux & DPE':'#8B5CF6' }

function GuidesView({ setCurrentView }) {
  const [searchQ,  setSearchQ]  = useState('')
  const [cat,      setCat]      = useState('Tous')
  const [openId,   setOpenId]   = useState(null)

  const filtered = ALL_GUIDES.filter(g => {
    const matchCat  = cat === 'Tous' || g.cat === cat
    const matchQ    = !searchQ || g.title.toLowerCase().includes(searchQ.toLowerCase()) || g.excerpt.toLowerCase().includes(searchQ.toLowerCase())
    return matchCat && matchQ
  })
  const featured  = filtered.find(g => g.featured) || filtered[0]
  const rest       = filtered.filter(g => g !== featured)
  const openGuide  = ALL_GUIDES.find(g => g.id === openId)

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 via-[#0e1f3a] to-[#162E52] pt-28 pb-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize:'48px 48px' }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-5">
            <Icons.FileText size={12} /> Guides & conseils
          </div>
          <h1 className="text-white text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            L'immobilier,<br /><span className="text-orange-400">expliqué simplement.</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-8">
            Tous les guides dont vous avez besoin pour acheter, louer, vendre et investir en toute confiance.
          </p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search size={17} /></div>
            <input type="text" placeholder="Rechercher un guide..." value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="w-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/40 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:bg-white/15 focus:border-white/40 transition-all" />
          </div>
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap mt-8">
            {[
              { value:`${ALL_GUIDES.length}`, label:'guides disponibles' },
              { value:'4–9 min', label:'temps de lecture' },
              { value:'100 %', label:'gratuit' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-white text-xl font-extrabold">{s.value}</div>
                <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category filters */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center gap-2 overflow-x-auto">
          {GUIDE_CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${cat === c ? 'text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              style={{ background: cat === c ? (GUIDE_CAT_COLORS[c] || '#0B1F3A') : undefined }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-12">

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
              <Icons.Search size={24} className="text-orange-400" />
            </div>
            <div className="font-bold text-navy-900 mb-2">Aucun guide trouvé</div>
            <div className="text-slate-400 text-sm mb-4">Essayez d'autres mots-clés ou une autre catégorie.</div>
            <button onClick={() => { setSearchQ(''); setCat('Tous') }}
              className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold">Réinitialiser</button>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-card transition-all cursor-pointer"
                onClick={() => setOpenId(featured.id)}>
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative overflow-hidden" style={{ minHeight:280 }}>
                    <img src={featured.img} alt={featured.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 absolute inset-0"
                      onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 900) }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 pointer-events-none" />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">À la une</span>
                      <span className="text-white text-[10px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: GUIDE_CAT_COLORS[featured.cat] || '#0B1F3A' }}>{featured.cat}</span>
                    </div>
                  </div>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                      <span>{featured.date}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{featured.time} de lecture</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{featured.author}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 mb-4 group-hover:text-orange-600 transition-colors leading-snug">{featured.title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">{featured.excerpt}</p>
                    <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      Lire le guide <Icons.ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Article grid */}
            {rest.length > 0 && (
              <div>
                <h2 className="text-xl font-extrabold text-navy-900 mb-6">
                  {cat === 'Tous' ? 'Tous les guides' : `Guides — ${cat}`}
                </h2>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden" animate="show"
                  variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.07 } } }}>
                  {rest.map(g => (
                    <motion.article key={g.id}
                      variants={{ hidden:{ opacity:0, y:16 }, show:{ opacity:1, y:0 } }}
                      onClick={() => setOpenId(g.id)}
                      className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all cursor-pointer">
                      <div className="relative overflow-hidden aspect-video">
                        <img src={g.img} alt={g.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 600) }} />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                        <span className="absolute top-3 left-3 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                          style={{ background: GUIDE_CAT_COLORS[g.cat] || '#0B1F3A' }}>{g.cat}</span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5">
                          <span>{g.time} de lecture</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{g.date}</span>
                        </div>
                        <h3 className="font-bold text-navy-900 text-sm leading-snug group-hover:text-orange-600 transition-colors mb-2">{g.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{g.excerpt}</p>
                        <div className="flex items-center gap-1.5 text-orange-600 text-xs font-semibold mt-4 group-hover:gap-2.5 transition-all">
                          Lire <Icons.ArrowRight size={13} />
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Article detail overlay */}
      <AnimatePresence>
        {openGuide && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={() => setOpenId(null)} />
            <motion.div
              initial={{ opacity:0, y:40, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:0.97 }}
              transition={{ type:'spring', damping:30, stiffness:300 }}
              className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl top-16 bottom-4 z-[110] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              {/* Header image */}
              <div className="relative h-48 shrink-0 overflow-hidden">
                <img src={openGuide.img} alt={openGuide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button onClick={() => setOpenId(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm">
                  <Icons.X size={16} />
                </button>
                <div className="absolute bottom-4 left-5 flex items-center gap-2">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: GUIDE_CAT_COLORS[openGuide.cat] || '#0B1F3A' }}>{openGuide.cat}</span>
                  <span className="text-white/80 text-xs">{openGuide.time} de lecture</span>
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <span>{openGuide.author}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>{openGuide.date}</span>
                </div>
                <h1 className="text-2xl font-extrabold text-navy-900 leading-snug mb-4">{openGuide.title}</h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 border-l-4 border-orange-200 pl-4 italic">{openGuide.excerpt}</p>
                <div className="space-y-6">
                  {openGuide.content.map((section, i) => (
                    <motion.div key={i}
                      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay: i*0.08 }}>
                      <h2 className="font-bold text-navy-900 mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                          style={{ background: GUIDE_CAT_COLORS[openGuide.cat] || '#0B1F3A' }}>{i+1}</span>
                        {section.h}
                      </h2>
                      <p className="text-slate-600 text-sm leading-relaxed pl-8">{section.p}</p>
                    </motion.div>
                  ))}
                </div>
                {/* Related */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="text-sm font-bold text-navy-900 mb-4">Guides similaires</div>
                  <div className="space-y-3">
                    {ALL_GUIDES.filter(g => g.id !== openGuide.id && g.cat === openGuide.cat).slice(0,2).concat(
                      ALL_GUIDES.filter(g => g.id !== openGuide.id && g.cat !== openGuide.cat).slice(0,1)
                    ).slice(0,3).map(g => (
                      <button key={g.id} onClick={() => setOpenId(g.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-left transition-colors">
                        <img src={g.img} alt="" className="w-14 h-10 rounded-xl object-cover shrink-0"
                          onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 100) }} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-navy-900 truncate">{g.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{g.time} de lecture</div>
                        </div>
                        <Icons.ChevronRight size={14} className="text-slate-300 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
                {/* CTA */}
                <div className="mt-6 bg-gradient-to-r from-navy-900 to-[#162E52] rounded-2xl p-5 text-center">
                  <div className="text-white font-bold mb-1 text-sm">Prêt à passer à l'action ?</div>
                  <p className="text-white/60 text-xs mb-4">Trouvez votre bien idéal sur PASMAL.</p>
                  <button onClick={() => { setOpenId(null); setCurrentView('results') }}
                    className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                    Voir les annonces <Icons.ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Étape 39: Comparateur d'annonces ───────────────────────────────── */
const DPE_ORDER_CMP = { A:0, B:1, C:2, D:3, E:4, F:5, G:6 }

function CompareBar({ compareList, setCompareList, setCurrentView }) {
  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
          transition={{ type:'spring', damping:30, stiffness:280 }}
          className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t-2 border-orange-500 shadow-2xl">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2.5 flex-1 flex-wrap">
                {[0,1,2].map(i => {
                  const raw = compareList[i]
                  if (!raw) return (
                    <div key={i} className="flex items-center justify-center w-36 h-14 rounded-xl border-2 border-dashed border-slate-200 text-[11px] text-slate-400 shrink-0">
                      + Ajouter
                    </div>
                  )
                  const l = enrichWithMeta(raw, i)
                  return (
                    <div key={raw.id} className="relative flex items-center gap-2.5 bg-slate-50 rounded-xl p-2 pr-3 shrink-0">
                      <img src={l.image_url || unsplash('photo-1560448204-e02f11c3d0e2', 80)} alt=""
                        className="w-12 h-10 rounded-lg object-cover shrink-0"
                        onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 80) }} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-navy-900 max-w-[110px] truncate">{l.title}</div>
                        <div className="text-xs font-semibold text-orange-600">{formatPrice(l)}</div>
                      </div>
                      <button onClick={() => setCompareList(p => p.filter(x => x.id !== raw.id))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-300 hover:bg-red-500 hover:text-white text-slate-600 rounded-full flex items-center justify-center transition-colors"
                        style={{ fontSize:13, lineHeight:1 }}>×</button>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => setCompareList([])}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors whitespace-nowrap">
                  Tout effacer
                </button>
                <button onClick={() => setCurrentView('comparer')} disabled={compareList.length < 2}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${compareList.length >= 2 ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                  Comparer ({compareList.length}/3)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ============================================================================
   Étape 41 — Tendances du Marché
   ============================================================================ */
const MARCHE_CITIES_DATA = [
  { city:'Paris',       ppm:10200, prev:10800, color:'#F97316', yield:2.8, days:58 },
  { city:'Lyon',        ppm:4800,  prev:3800,  color:'#6366F1', yield:4.2, days:42 },
  { city:'Nice',        ppm:4700,  prev:4000,  color:'#8B5CF6', yield:3.9, days:52 },
  { city:'Bordeaux',    ppm:4500,  prev:4200,  color:'#10B981', yield:4.0, days:45 },
  { city:'Toulouse',    ppm:3700,  prev:3100,  color:'#F59E0B', yield:5.1, days:48 },
  { city:'Nantes',      ppm:3600,  prev:3400,  color:'#EC4899', yield:4.5, days:40 },
  { city:'Montpellier', ppm:3500,  prev:2900,  color:'#14B8A6', yield:5.3, days:55 },
  { city:'Marseille',   ppm:3200,  prev:2600,  color:'#0EA5E9', yield:5.8, days:68 },
  { city:'Grenoble',    ppm:2800,  prev:2500,  color:'#84CC16', yield:5.6, days:50 },
  { city:'Lille',       ppm:2900,  prev:2600,  color:'#FB7185', yield:5.4, days:46 },
]
const MARCHE_HISTORY = {
  Paris:       [10800, 11200, 10900, 10600, 10300, 10100, 10200],
  Lyon:        [3800,  4100,  4400,  4600,  4700,  4750,  4800],
  Nice:        [4000,  4200,  4400,  4600,  4650,  4680,  4700],
  Bordeaux:    [4200,  4500,  4600,  4500,  4400,  4420,  4500],
  Toulouse:    [3100,  3200,  3400,  3500,  3600,  3650,  3700],
  Montpellier: [2900,  3000,  3200,  3300,  3400,  3450,  3500],
}
const MARCHE_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026]
const MARCHE_CHART_COLORS = { Paris:'#F97316', Lyon:'#6366F1', Nice:'#8B5CF6', Bordeaux:'#10B981', Toulouse:'#F59E0B', Montpellier:'#14B8A6' }
const MARCHE_SEGMENTS = [
  { label:'Appartements T1-T2',    trend:'+2.1 %', volume:'142 000', Icon: Icons.Building2, color:'#F97316' },
  { label:'Appartements T3-T4',    trend:'+0.8 %', volume:'198 000', Icon: Icons.Building2, color:'#6366F1' },
  { label:'Maisons individuelles', trend:'-1.2 %', volume:'215 000', Icon: Icons.Home,      color:'#10B981' },
  { label:'Biens de prestige',     trend:'+4.3 %', volume:'38 000',  Icon: Icons.Star,      color:'#F59E0B' },
]
const MARCHE_PREDICTIONS = [
  { Icon: Icons.TrendingUp, color:'#10B981', title:'Reprise progressive en province', desc:'Les experts anticipent un rebond de +2 à +4 % sur les marchés de province en 2026, portés par la baisse des taux directeurs.', confidence:72 },
  { Icon: Icons.MapPin,     color:'#F97316', title:'Paris stabilisé ±2 %',            desc:'La capitale devrait rester stable dans un contexte de taux encore contraints et de hausse du stock disponible.', confidence:65 },
  { Icon: Icons.TrendingUp, color:'#6366F1', title:'Investissement locatif en hausse', desc:'Les villes moyennes (Toulouse, Montpellier, Nantes) affichent les meilleures perspectives de rendement brut 2026.', confidence:80 },
]

/* ============================================================================
   Étape 42 — Simulateur de financement
   ============================================================================ */
const SIMUL_PRESETS = [
  { label:'Studio Paris',    prix:280000, apport:40000 },
  { label:'T3 Lyon',         prix:350000, apport:60000 },
  { label:'Maison Bordeaux', prix:480000, apport:80000 },
  { label:'Investissement',  prix:200000, apport:30000 },
]

function SliderField({ label, value, onChange, min, max, step, fmt: format }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-navy-700">{label}</span>
        <span className="text-sm font-bold text-orange-600">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500" />
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>{format(min)}</span><span>{format(max)}</span>
      </div>
    </div>
  )
}

/* ============================================================================
   Étape 43 — Programme Neuf
   ============================================================================ */
const NEUF_PROGRAMS = [
  { id:'p1', featured:true,  name:'Les Terrasses du Lac',      developer:'Nexity',               city:'Bordeaux',   hood:'Bordeaux Lac',  type:'Appartements', priceFrom:249000, priceTo:485000, dpe:'A', delivery:'T3 2026', total:48, avail:14, img:unsplash('photo-1545324418-cc1a3fa10c00',900), features:['Parking inclus','Terrasse','Ascenseur','Digicode'], lots:[{t:'T2',surf:'44–52 m²',price:'249 000 – 285 000 €',nb:3},{t:'T3',surf:'62–75 m²',price:'320 000 – 368 000 €',nb:7},{t:'T4',surf:'86–98 m²',price:'415 000 – 485 000 €',nb:4}], desc:'Un programme d\'exception au cœur du nouveau Bordeaux, alliant architecture contemporaine et confort de vie premium. Prestations haut de gamme, exposition plein sud, vue dégagée.' },
  { id:'p2',                 name:'Olympe Résidences',          developer:'Bouygues Immobilier',  city:'Lyon',       hood:'Confluence',    type:'Appartements', priceFrom:285000, priceTo:620000, dpe:'A', delivery:'T1 2027', total:72, avail:28, img:unsplash('photo-1486325212027-8081e485255e',900), features:['Cave','Balcon','Gardien','Fibre optique'],             lots:[{t:'T2',surf:'48–58 m²',price:'285 000 – 320 000 €',nb:8},{t:'T3',surf:'68–80 m²',price:'385 000 – 440 000 €',nb:12},{t:'T4',surf:'95–115 m²',price:'510 000 – 620 000 €',nb:8}], desc:'Face au Rhône, vivez dans un lieu d\'exception au sein du quartier Confluence avec des prestations 5 étoiles et un accès direct aux commerces et transports.' },
  { id:'p3',                 name:'Villa Azur Résidence',       developer:'Kaufman & Broad',      city:'Nice',       hood:'Cimiez',        type:'Appartements', priceFrom:320000, priceTo:780000, dpe:'A', delivery:'T4 2026', total:36, avail:9,  img:unsplash('photo-1600607687939-ce8a6c25118c',900), features:['Piscine','Parking 2 places','Vue mer','Pergola'],     lots:[{t:'T2',surf:'52–60 m²',price:'320 000 – 370 000 €',nb:2},{t:'T3',surf:'72–88 m²',price:'460 000 – 560 000 €',nb:5},{t:'T4+',surf:'100–140 m²',price:'640 000 – 780 000 €',nb:2}], desc:'Sur les hauteurs de Cimiez, ce programme rare offre une vue panoramique sur la mer et les toits de Nice. Résidence sécurisée avec piscine commune et jardins privatifs.' },
  { id:'p4',                 name:'Le Carré Montaigne',         developer:'Vinci Immobilier',     city:'Paris',      hood:'15e arrdt',     type:'Appartements', priceFrom:480000, priceTo:1200000, dpe:'B', delivery:'T2 2027', total:60, avail:22, img:unsplash('photo-1560518883-ce09059eeffa',900), features:['Gardien 24h','Conciergerie','Salle sport','Toiture terrasse'], lots:[{t:'T2',surf:'46–54 m²',price:'480 000 – 560 000 €',nb:6},{t:'T3',surf:'68–82 m²',price:'720 000 – 890 000 €',nb:10},{t:'T4',surf:'98–120 m²',price:'980 000 – 1,2 M€',nb:6}], desc:'Au cœur du 15e arrondissement de Paris, une adresse de prestige signée Vinci. Architecture haussmannienne réinterprétée, espaces communs luxueux, domotique intégrée.' },
  { id:'p5',                 name:'Domaine des Pins',           developer:'Eiffage Immobilier',   city:'Toulouse',   hood:'Balma',         type:'Maisons',      priceFrom:295000, priceTo:450000, dpe:'A', delivery:'T2 2026', total:24, avail:7,  img:unsplash('photo-1600585154340-be6161a56a0c',900), features:['Jardin privatif','Garage double','Pompe à chaleur','Panneaux solaires'], lots:[{t:'T3',surf:'85 m²',price:'295 000 €',nb:3},{t:'T4',surf:'105 m²',price:'345 000 €',nb:3},{t:'T5',surf:'125 m²',price:'410 000 – 450 000 €',nb:1}], desc:'Un écrin de verdure à quelques minutes de Toulouse. Maisons individuelles contemporaines avec jardins paysagers, sobriété énergétique exemplaire (DPE A).' },
  { id:'p6',                 name:'Nantes Horizon',             developer:'Icade Promotion',      city:'Nantes',     hood:'Île de Nantes', type:'Appartements', priceFrom:220000, priceTo:390000, dpe:'A', delivery:'T4 2026', total:54, avail:31, img:unsplash('photo-1613490493576-7fde63acd811',900), features:['Vélo-box','Loggia','Domotique','Charges réduites'],    lots:[{t:'T1',surf:'28–35 m²',price:'220 000 – 248 000 €',nb:8},{t:'T2',surf:'46–56 m²',price:'268 000 – 315 000 €',nb:15},{t:'T3',surf:'66–78 m²',price:'340 000 – 390 000 €',nb:8}], desc:'Sur l\'Île de Nantes en pleine mutation, ce programme bénéficie d\'un emplacement stratégique à 5 minutes à pied du tramway et du futur campus universitaire.' },
]
const NEUF_CITIES   = ['Toutes les villes', 'Bordeaux', 'Lyon', 'Nice', 'Paris', 'Toulouse', 'Nantes']
const NEUF_TYPES    = ['Tous types', 'Appartements', 'Maisons']
const NEUF_BUDGETS  = ['Tous budgets', '< 300 000 €', '300 – 500 000 €', '500 000 – 1 M€', '> 1 M€']
const DPE_COLORS_NF = { A:'#047857', B:'#10B981', C:'#84CC16' }
const NEUF_AVANTAGES = [
  { Icon: Icons.CreditCard, title:'TVA réduite à 5,5 %', desc:'En zone ANRU ou primo-accédants, bénéficiez d\'une TVA réduite et économisez jusqu\'à 30 000 €.' },
  { Icon: Icons.Shield, title:'Frais de notaire réduits', desc:'Seulement 2 à 3 % contre 7 à 8 % dans l\'ancien — une économie immédiate sur le prix d\'achat.' },
  { Icon: Icons.Star, title:'Garanties constructeur', desc:'Garantie décennale, parfait achèvement, biennale : vous êtes protégé 10 ans après la livraison.' },
  { Icon: Icons.Zap, title:'DPE A ou B garanti', desc:'RE2020 et RT2012 : performances énergétiques exemplaires, charges réduites et confort thermique supérieur.' },
  { Icon: Icons.TrendingUp, title:'PTZ — Prêt à Taux Zéro', desc:'Finançable jusqu\'à 40 % du prix avec le PTZ pour les primo-accédants en zone éligible.' },
]

function NeufProgramCard({ prog, onOpen, featured }) {
  const availPct = prog.total > 0 ? (prog.avail / prog.total) * 100 : 0
  const soldPct  = 100 - availPct
  const urgent   = prog.avail <= 10

  if (featured) return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
      onClick={() => onOpen(prog)}
      className="relative rounded-3xl overflow-hidden cursor-pointer group h-72 md:h-80">
      <img src={prog.img} alt={prog.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent" />
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex gap-2">
            <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide">Programme vedette</span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ background: DPE_COLORS_NF[prog.dpe] || '#64748b' }}>DPE {prog.dpe}</span>
          </div>
          {urgent && <span className="bg-red-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">⚡ {prog.avail} lots restants</span>}
        </div>
        <div>
          <div className="text-white/70 text-xs mb-1">{prog.developer} · {prog.city}, {prog.hood}</div>
          <h3 className="text-white text-2xl font-extrabold mb-2">{prog.name}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-orange-300 font-bold">À partir de {Math.round(prog.priceFrom/1000)} 000 €</span>
            <span className="text-white/60">· Livraison {prog.delivery}</span>
            <span className="text-white/60">· {prog.type}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full" style={{ width:`${soldPct}%` }} />
            </div>
            <span className="text-white/80 text-xs shrink-0">{prog.avail} lots disponibles / {prog.total}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      onClick={() => onOpen(prog)}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg cursor-pointer group transition-all overflow-hidden">
      <div className="relative h-44 overflow-hidden">
        <img src={prog.img} alt={prog.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="bg-white/90 text-navy-900 text-[10px] font-bold px-2 py-0.5 rounded-full">NEUF</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: DPE_COLORS_NF[prog.dpe] || '#64748b' }}>DPE {prog.dpe}</span>
        </div>
        {urgent && <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">⚡ Derniers lots</span>}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="h-1 bg-white/25 rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 rounded-full" style={{ width:`${soldPct}%` }} />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="text-[11px] text-slate-400 mb-0.5">{prog.developer} · {prog.hood}</div>
        <h3 className="font-bold text-navy-900 text-sm leading-tight mb-2">{prog.name}</h3>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span>Livraison {prog.delivery}</span>
          <span className={urgent ? 'text-red-500 font-semibold' : 'text-slate-500'}>{prog.avail} lots dispo</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">À partir de</div>
            <div className="text-base font-extrabold text-navy-900">{Math.round(prog.priceFrom/1000)} 000 €</div>
          </div>
          <span className="text-xs font-semibold text-orange-600 group-hover:text-orange-700 transition-colors flex items-center gap-1">
            Voir les lots <Icons.ArrowRight size={12} />
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function NeufDetailModal({ prog, onClose, setCurrentView }) {
  if (!prog) return null
  const availPct = prog.total > 0 ? (prog.avail / prog.total) * 100 : 0
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-[150] bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ opacity:0, scale:0.96, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.96, y:20 }}
          transition={{ type:'spring', damping:28, stiffness:300 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[88vh] flex flex-col">
          {/* Header image */}
          <div className="relative h-52 flex-shrink-0">
            <img src={prog.img} alt={prog.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-slate-600 hover:text-navy-900 transition-colors">
              <Icons.X size={14} />
            </button>
            <div className="absolute bottom-4 left-5 right-5">
              <div className="text-white/70 text-xs mb-0.5">{prog.developer} · {prog.city}, {prog.hood}</div>
              <h2 className="text-white text-xl font-extrabold">{prog.name}</h2>
            </div>
          </div>
          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            {/* Badges + availability */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">NEUF · {prog.type}</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: DPE_COLORS_NF[prog.dpe] || '#64748b' }}>DPE {prog.dpe}</span>
              <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">Livraison {prog.delivery}</span>
              <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">{prog.avail} lots disponibles / {prog.total}</span>
            </div>
            {/* Availability bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Avancement des réservations</span>
                <span className="font-semibold">{Math.round(100 - availPct)} % réservé</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width:0 }} animate={{ width:`${100 - availPct}%` }} transition={{ duration:0.7, ease:'easeOut' }}
                  className="h-full rounded-full bg-orange-500" />
              </div>
            </div>
            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">{prog.desc}</p>
            {/* Lots table */}
            <div>
              <h3 className="text-sm font-bold text-navy-900 mb-2">Lots disponibles</h3>
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <div className="grid text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-2.5 border-b border-slate-100 bg-slate-50"
                  style={{ gridTemplateColumns:'60px 1fr 1fr 60px' }}>
                  <div>Type</div><div>Surface</div><div>Prix</div><div>Dispo</div>
                </div>
                {prog.lots.map((l, i) => (
                  <div key={i} className="grid items-center px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-orange-50/50 transition-colors"
                    style={{ gridTemplateColumns:'60px 1fr 1fr 60px' }}>
                    <span className="bg-navy-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg w-fit">{l.t}</span>
                    <span className="text-sm text-slate-600">{l.surf}</span>
                    <span className="text-sm font-semibold text-navy-900">{l.price}</span>
                    <span className={`text-sm font-bold ${l.nb === 0 ? 'text-slate-300' : l.nb <= 2 ? 'text-red-500' : 'text-emerald-600'}`}>{l.nb === 0 ? '—' : l.nb}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Features */}
            <div>
              <h3 className="text-sm font-bold text-navy-900 mb-2">Prestations incluses</h3>
              <div className="flex flex-wrap gap-2">
                {prog.features.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-xl">
                    <Icons.Check size={11} className="text-emerald-500" /> {f}
                  </span>
                ))}
              </div>
            </div>
            {/* CTAs */}
            <div className="flex gap-3 pt-1">
              <button onClick={() => { onClose(); setCurrentView('simulateur') }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-navy-900 font-semibold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2">
                <Icons.CreditCard size={14} /> Simuler le financement
              </button>
              <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2">
                <Icons.Phone size={14} /> Être contacté
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Mon Espace constants ─────────────────────────────────────────────────

const ME_VIEWS_DATA = [
  { day:'Lun', v:8 }, { day:'Mar', v:12 }, { day:'Mer', v:18 },
  { day:'Jeu', v:22 }, { day:'Ven', v:14 }, { day:'Sam', v:6 }, { day:'Dim', v:4 },
]
const ME_FAVO_TYPES = [
  { label:'Appartement', count:7, color:'#F97316' },
  { label:'Maison',      count:3, color:'#64748B' },
  { label:'Studio',      count:2, color:'#94A3B8' },
  { label:'Autre',       count:1, color:'#CBD5E1' },
]
const ME_RECENT = [
  { id:1, label:'Appartement 3P · Paris 11e',  price:'450 000 €', grad:'linear-gradient(135deg,#1e3a6e,#2563eb)' },
  { id:2, label:'Maison 5P · Lyon 6e',         price:'780 000 €', grad:'linear-gradient(135deg,#4c1d95,#7c3aed)' },
  { id:3, label:'Studio · Marseille 8e',       price:'210 000 €', grad:'linear-gradient(135deg,#064e3b,#059669)' },
]

function MonEspaceView({ setCurrentView }) {
  const [tab, setTab] = useState('dashboard')

  const NAV = [
    { id:'dashboard',    label:"Vue d'ensemble",          Icon:Icons.Home       },
    { id:'searches',     label:'Recherches sauvegardées', Icon:Icons.Search     },
    { id:'notifs',       label:'Notifications',            Icon:Icons.Bell,  badge:3 },
    { id:'insights',     label:'Insights IA',              Icon:Icons.Sparkles   },
    { id:'subscription', label:'Abonnement',               Icon:Icons.CreditCard },
    { id:'favorites',    label:'Favoris',                  Icon:Icons.Heart      },
    { id:'profile',      label:'Mon profil',               Icon:Icons.User       },
  ]

  const W = 380, H = 100, maxV = 24
  const pts = ME_VIEWS_DATA.map((d, i) => ({
    x: i * (W / (ME_VIEWS_DATA.length - 1)),
    y: (1 - d.v / maxV) * H,
  }))
  const linePath = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`
    const prev = pts[i - 1]
    const cpx = (prev.x + p.x) / 2
    return `${acc} C ${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`
  }, '')
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`

  const favoTotal = ME_FAVO_TYPES.reduce((a, t) => a + t.count, 0)
  const fr = 42, fcirc = 2 * Math.PI * fr
  let fcum = 0
  const donutSegs = ME_FAVO_TYPES.map(t => {
    const dash = t.count / favoTotal * fcirc
    const off  = -fcum
    fcum += dash
    return { ...t, dash, off }
  })

  return (
    <div className="fixed inset-0 z-[120] flex" style={{ background:'#0D1B2E' }}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <div className="w-64 flex flex-col flex-shrink-0" style={{ background:'#0D1B2E', borderRight:'1px solid #1e3a5f' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 h-16 flex-shrink-0" style={{ borderBottom:'1px solid #1e3a5f' }}>
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
            <Icons.Home size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white tracking-wide">PASMAL</div>
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest">Premium Estate</div>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-5 px-3">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-2">Navigation</p>
          <div className="space-y-0.5">
            {NAV.map(({ id, label, Icon, badge }) => (
              <button key={id} onClick={() => setTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                style={{ background:tab === id ? '#F97316' : 'transparent', color:tab === id ? '#fff' : '#94a3b8' }}>
                <Icon size={15} />
                <span className="flex-1 text-[13px]">{label}</span>
                {badge && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{ background:tab === id ? 'rgba(255,255,255,0.25)' : '#F97316', color:'#fff' }}>{badge}</span>
                )}
              </button>
            ))}
            <div className="my-3" style={{ borderTop:'1px solid #1e3a5f' }} />
            <button onClick={() => setCurrentView('crm')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left text-slate-500 hover:text-white hover:bg-white/5">
              <Icons.Users size={15} />
              <span className="text-[13px]">CRM</span>
            </button>
          </div>
        </div>

        {/* Upgrade card */}
        <div className="mx-3 mb-4 rounded-2xl p-4" style={{ background:'linear-gradient(135deg,#c2410c,#f97316)' }}>
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <Icons.Zap size={15} className="text-white" />
          </div>
          <p className="text-white font-extrabold text-sm mb-0.5">Passer à Pro</p>
          <p className="text-orange-100 text-[11px] leading-relaxed mb-3">Alertes illimitées + IA avancée</p>
          <button onClick={() => setCurrentView('tarifs')}
            className="flex items-center gap-1.5 bg-white text-orange-600 text-xs font-extrabold px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors">
            Voir les offres <Icons.ArrowRight size={11} />
          </button>
        </div>
      </div>

      {/* ── Main ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="h-16 flex items-center gap-4 px-8 flex-shrink-0" style={{ background:'#0f1f35', borderBottom:'1px solid #1e3a5f' }}>
          <div className="flex items-center gap-2 px-4 h-9 rounded-xl" style={{ background:'#1e3a5f', width:240 }}>
            <Icons.Search size={13} className="text-slate-500 flex-shrink-0" />
            <input placeholder="Rechercher..." className="flex-1 text-sm text-slate-300 bg-transparent outline-none placeholder-slate-500" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors" style={{ background:'#1e3a5f' }}>
              <Icons.Sparkles size={14} />
            </button>
            <div className="relative">
              <button className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors" style={{ background:'#1e3a5f' }}>
                <Icons.Bell size={14} />
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">3</span>
            </div>
            <div className="flex items-center gap-2 px-3 h-8 rounded-xl" style={{ background:'#1e3a5f' }}>
              <div className="w-5 h-5 rounded-lg bg-orange-500 flex items-center justify-center text-white text-[9px] font-extrabold flex-shrink-0">ME</div>
              <span className="text-sm text-white font-semibold">Mon</span>
              <Icons.ChevronDown size={12} className="text-slate-400" />
            </div>
            <button onClick={() => setCurrentView('home')}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors" style={{ background:'#1e3a5f' }}>
              <Icons.X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          {tab === 'dashboard' && (
            <>
              {/* Title row */}
              <div className="flex items-start justify-between mb-7">
                <div>
                  <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-1">Mon Espace</p>
                  <h1 className="text-3xl font-extrabold text-white">Bonjour 👋</h1>
                  <p className="text-slate-400 text-sm mt-1">Voici ce qui se passe sur votre espace PASMAL.</p>
                </div>
                <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-2xl transition-all shadow-sm flex-shrink-0">
                  <Icons.PlusSquare size={14} /> Nouvelle alerte
                </button>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { Icon:Icons.Bell,       color:'#F97316', val:'5',   label:'Alertes actives',  sub:'2 nouvelles correspondances' },
                  { Icon:Icons.Heart,      color:'#EC4899', val:'12',  label:'Favoris',           sub:'3 collections créées'         },
                  { Icon:Icons.Eye,        color:'#8B5CF6', val:'47',  label:'Annonces vues',     sub:'Cette semaine'                 },
                  { Icon:Icons.CreditCard, color:'#10B981', val:'Pro', label:'Abonnement',        sub:"Actif jusqu'au 22/06"          },
                ].map(({ Icon, color, val, label, sub }) => (
                  <div key={label} className="rounded-2xl p-5" style={{ background:'#1e3a5f', border:'1px solid #2d4a6f' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:color + '22' }}>
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div className="text-2xl font-extrabold text-white mb-0.5">{val}</div>
                    <div className="text-sm font-semibold text-white mb-0.5">{label}</div>
                    <div className="text-xs text-slate-400">{sub}</div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                {/* Area chart */}
                <div className="col-span-3 rounded-2xl p-6" style={{ background:'#1e3a5f', border:'1px solid #2d4a6f' }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-base font-bold text-white">Annonces consultées</p>
                      <p className="text-xs text-slate-400 mt-0.5">7 derniers jours</p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full" style={{ background:'#10B98122', color:'#34d399' }}>+18% VS SEM. PASSÉE</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col justify-between text-[10px] text-slate-600 py-0.5 flex-shrink-0" style={{ height:100 }}>
                      {[24, 18, 12, 6, 0].map(v => <span key={v}>{v}</span>)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height:100, display:'block' }}>
                        <defs>
                          <linearGradient id="meAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F97316" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#F97316" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill="url(#meAreaGrad)" />
                        <path d={linePath} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {pts.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#F97316" stroke="#1e3a5f" strokeWidth="2" />
                        ))}
                      </svg>
                      <div className="flex justify-between mt-1.5">
                        {ME_VIEWS_DATA.map(d => <span key={d.day} className="text-[10px] text-slate-500">{d.day}</span>)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Donut chart */}
                <div className="col-span-2 rounded-2xl p-6" style={{ background:'#1e3a5f', border:'1px solid #2d4a6f' }}>
                  <p className="text-base font-bold text-white mb-0.5">Favoris par type</p>
                  <p className="text-xs text-slate-400 mb-5">{favoTotal} biens sauvegardés</p>
                  <div className="flex items-center gap-5">
                    <svg viewBox="0 0 120 120" width="100" height="100" style={{ flexShrink:0 }}>
                      <circle cx="60" cy="60" r={fr} fill="none" stroke="#0f172a" strokeWidth="18" />
                      {donutSegs.map((seg, i) => (
                        <circle key={i} cx="60" cy="60" r={fr} fill="none"
                          stroke={seg.color} strokeWidth="18"
                          strokeDasharray={`${seg.dash} ${fcirc - seg.dash}`}
                          strokeDashoffset={seg.off}
                          transform="rotate(-90 60 60)" />
                      ))}
                    </svg>
                    <div className="space-y-2.5 flex-1">
                      {ME_FAVO_TYPES.map(t => (
                        <div key={t.label} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:t.color }} />
                            <span className="text-xs text-slate-300 truncate">{t.label}</span>
                          </div>
                          <span className="text-xs font-bold text-white flex-shrink-0">{t.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recently viewed */}
              <div className="rounded-2xl p-6" style={{ background:'#1e3a5f', border:'1px solid #2d4a6f' }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-base font-bold text-white">Consultées récemment</p>
                    <p className="text-xs text-slate-400 mt-0.5">Vos dernières annonces visitées</p>
                  </div>
                  <button className="text-orange-500 hover:text-orange-400 text-sm font-semibold flex items-center gap-1.5 transition-colors">
                    Voir les favoris <Icons.ArrowRight size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {ME_RECENT.map(p => (
                    <div key={p.id} className="rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-0.5 transition-transform">
                      <div className="h-36 relative" style={{ background:p.grad }}>
                        <div className="absolute inset-0" style={{ background:'linear-gradient(to top,rgba(0,0,0,0.55),transparent)' }} />
                        <div className="absolute bottom-3 left-3 right-10">
                          <div className="text-white font-bold text-sm leading-tight">{p.label}</div>
                          <div className="text-orange-300 text-xs font-semibold mt-0.5">{p.price}</div>
                        </div>
                        <button className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center" style={{ background:'rgba(255,255,255,0.15)', backdropFilter:'blur(4px)' }}>
                          <Icons.Heart size={13} className="text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab !== 'dashboard' && (
            <div className="flex items-center justify-center" style={{ minHeight:'60vh' }}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:'#1e3a5f' }}>
                  <Icons.Sparkles size={28} style={{ color:'#F97316' }} />
                </div>
                <p className="text-white font-bold text-lg mb-1">{NAV.find(n => n.id === tab)?.label}</p>
                <p className="text-slate-400 text-sm">Fonctionnalité à venir.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── CRM constants ────────────────────────────────────────────────────────

const CRM_LEADS_DATA = [
  { id:1,  fn:'Sophie',  ln:'Martin',   ini:'SM', email:'sophie.m@email.com',     phone:'06 12 34 56 78', src:'Leboncoin', prop:'Appt 3P Paris 11',  budget:450000,  score:87, status:'nouveau',     profile:'Acheteur sérieux', tags:['URGENT','FINANCEMENT OK'],  date:'2026-05-20', notes:'Cherche pour juillet, financement accordé.'    },
  { id:2,  fn:'Thomas',  ln:'Dupont',   ini:'TD', email:'thomas.d@gmail.com',     phone:'06 23 45 67 89', src:'SeLoger',   prop:'Villa 5P Lyon',      budget:780000,  score:72, status:'nouveau',     profile:'Investisseur',     tags:['INVESTISSEMENT'],           date:'2026-05-21', notes:'Investisseur Lyon, cherche rendement > 5 %.'   },
  { id:3,  fn:'Amina',   ln:'Benali',   ini:'AB', email:'a.benali@hotmail.fr',    phone:'06 34 56 78 90', src:'PAP',       prop:'Studio Paris 15',    budget:210000,  score:55, status:'contacte',    profile:'Faible intention', tags:['INCERTAIN'],                date:'2026-05-19', notes:'Indécise, compare plusieurs options.'           },
  { id:4,  fn:'Romain',  ln:'Lefèvre',  ini:'RL', email:'r.lefevre@pro.fr',       phone:'06 45 67 89 01', src:"Bien'ici",  prop:'Appt 4P Bordeaux',   budget:320000,  score:91, status:'contacte',    profile:'Acheteur sérieux', tags:['URGENT','CASH'],            date:'2026-05-22', notes:'Acheteur cash, décision très rapide.'           },
  { id:5,  fn:'Lucie',   ln:'Moreau',   ini:'LM', email:'lucie.moreau@gmail.com', phone:'06 56 78 90 12', src:'SeLoger',   prop:'Maison Nantes',       budget:550000,  score:80, status:'visite',      profile:'Acheteur sérieux', tags:['FAMILLE'],                  date:'2026-05-18', notes:'Famille avec 2 enfants, besoin jardin.'         },
  { id:6,  fn:'Hugo',    ln:'Bernard',  ini:'HB', email:'h.bernard@outlook.com',  phone:'06 67 89 01 23', src:'Leboncoin', prop:'Loft Paris 10',       budget:380000,  score:68, status:'visite',      profile:'Investisseur',     tags:['LOCATION'],                 date:'2026-05-17', notes:'Veut louer après achat, cherche rendement.'     },
  { id:7,  fn:'Clara',   ln:'Petit',    ini:'CP', email:'c.petit@email.fr',       phone:'06 78 90 12 34', src:'PAP',       prop:'Appt 2P Paris 9',    budget:290000,  score:63, status:'negociation', profile:'Acheteur sérieux', tags:['AGENCE','MANDAT'],          date:'2026-05-15', notes:'En cours de négociation, offre déposée.'        },
  { id:8,  fn:'Maxime',  ln:'Girard',   ini:'MG', email:'m.girard@gmail.com',     phone:'06 89 01 23 45', src:"Bien'ici",  prop:'Villa Cannes',        budget:1200000, score:76, status:'negociation', profile:'Acheteur sérieux', tags:['PREMIUM','CASH'],           date:'2026-05-14', notes:'Client premium, villa vue mer.'                 },
  { id:9,  fn:'Julie',   ln:'Blanc',    ini:'JB', email:'j.blanc@pro.fr',         phone:'06 90 12 34 56', src:'SeLoger',   prop:'T2 Marseille 8',      budget:220000,  score:45, status:'gagne',       profile:'Acheteur sérieux', tags:['LOCATION'],                 date:'2026-05-10', notes:'Vendu ! Signature chez notaire.'                },
  { id:10, fn:'Pierre',  ln:'Lambert',  ini:'PL', email:'p.lambert@email.com',    phone:'06 01 23 45 67', src:'PAP',       prop:'Maison Nice',         budget:650000,  score:33, status:'perdu',       profile:'Faible intention', tags:[],                           date:'2026-05-08', notes:'A choisi une autre agence.'                     },
  { id:11, fn:'Marie',   ln:'Cohen',    ini:'MC', email:'m.cohen@gmail.com',      phone:'06 12 34 56 79', src:"Bien'ici",  prop:'Studio Lyon 3',       budget:180000,  score:58, status:'gagne',       profile:'Acheteur sérieux', tags:['INVESTISSEMENT'],           date:'2026-05-05', notes:'Investisseur, LMNP Lyon.'                       },
  { id:12, fn:'David',   ln:'Rousseau', ini:'DR', email:'d.rousseau@pro.fr',      phone:'06 23 45 67 90', src:'SeLoger',   prop:'Appt 5P Bordeaux',    budget:490000,  score:42, status:'perdu',       profile:'Faible intention', tags:[],                           date:'2026-04-28', notes:'Budget trop serré après simulation.'            },
]
const CRM_PIPELINE = [
  { id:'nouveau',     label:'Nouveau lead',  color:'#94A3B8' },
  { id:'contacte',    label:'Contacté',      color:'#3B82F6' },
  { id:'visite',      label:'Visite prévue', color:'#8B5CF6' },
  { id:'negociation', label:'Négociation',   color:'#F59E0B' },
  { id:'gagne',       label:'Gagné',         color:'#10B981' },
]
const CRM_CONV_DATA = [
  { m:'Janv', leads:15, conv:5  },
  { m:'Févr', leads:18, conv:7  },
  { m:'Mars', leads:22, conv:9  },
  { m:'Avr',  leads:25, conv:11 },
  { m:'Mai',  leads:28, conv:13 },
]
const CRM_SOURCES = [
  { label:'SeLoger',  pct:32, color:'#3B82F6' },
  { label:'Leboncoin',pct:28, color:'#F97316' },
  { label:'PAP',      pct:18, color:'#8B5CF6' },
  { label:"Bien'ici", pct:14, color:'#10B981' },
  { label:'Autre',    pct:8,  color:'#94A3B8' },
]
const CRM_TEMPLATES = [
  { emoji:'👋', label:'Prise de contact',       delay:'Immédiat'        },
  { emoji:'🔔', label:'Relance J+3',            delay:'Après 3 jours'   },
  { emoji:'📅', label:'Confirmation de visite', delay:'Visite prévue'   },
  { emoji:'💬', label:'Suivi post-visite',      delay:'Après la visite' },
  { emoji:'🏡', label:'Offre personnalisée',    delay:'Négociation'     },
]

function CrmView({ setCurrentView }) {
  const [tab, setTab]             = useState('kanban')
  const [dark, setDark]           = useState(false)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)
  const [leads, setLeads]         = useState(CRM_LEADS_DATA)
  const [editNotes, setEditNotes]   = useState(false)
  const [notesVal, setNotesVal]     = useState('')
  const [draggingId, setDraggingId] = useState(null)
  const [dragOver, setDragOver]     = useState(null)
  const [newLeadOpen, setNewLeadOpen] = useState(false)
  const [newForm, setNewForm] = useState({ nom:'', email:'', phone:'', src:'', prop:'', budget:'', profile:'', notes:'' })
  const [newFormErr, setNewFormErr] = useState('')

  const total    = leads.length
  const gagne    = leads.filter(l => l.status === 'gagne').length
  const conv     = Math.round((gagne / total) * 100)
  const negoc    = leads.filter(l => l.status === 'negociation').length
  const perdus   = leads.filter(l => l.status === 'perdu').length
  const scoreAvg = Math.round(leads.reduce((a, l) => a + l.score, 0) / total)

  const S = {
    nouveau:     { label:'Nouveau lead',  bg:'#1e293b' },
    contacte:    { label:'Contacté',      bg:'#2563EB' },
    visite:      { label:'Visite prévue', bg:'#7C3AED' },
    negociation: { label:'Négociation',   bg:'#D97706' },
    gagne:       { label:'Gagné',         bg:'#059669' },
    perdu:       { label:'Perdu',         bg:'#DC2626' },
  }
  const P = {
    'Acheteur sérieux': { bg:'#D1FAE5', text:'#065F46', emoji:'🎯' },
    'Investisseur':     { bg:'#DBEAFE', text:'#1E40AF', emoji:'📈' },
    'Faible intention': { bg:'#F1F5F9', text:'#475569', emoji:'👤' },
    'Agence':           { bg:'#FEF3C7', text:'#92400E', emoji:'🏢' },
  }

  const sColor    = s => s >= 80 ? '#10B981' : s >= 60 ? '#F97316' : '#EF4444'
  const fmtBudget = n => n >= 1000000 ? (n / 1000000).toFixed(1) + ' M€' : (n / 1000).toFixed(0) + ' 000 €'
  const AVCOLS    = { S:'#3B82F6',T:'#8B5CF6',A:'#F97316',R:'#10B981',L:'#F59E0B',H:'#06B6D4',C:'#EC4899',M:'#6366F1',J:'#84CC16',P:'#F43F5E',D:'#14B8A6' }
  const avColor   = ini => AVCOLS[ini[0]] || '#94A3B8'

  const bg   = dark ? '#0f172a' : '#f8fafc'
  const card = dark ? '#1e293b' : '#ffffff'
  const bdr  = dark ? '#334155' : '#e2e8f0'
  const txt  = dark ? '#f1f5f9' : '#0f172a'
  const sub  = dark ? '#94a3b8' : '#64748b'

  const Av = ({ ini, sz = 36 }) => (
    <div className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0 select-none"
      style={{ width:sz, height:sz, background:'#0f172a', fontSize:sz*0.35 }}>{ini}</div>
  )
  const ScoreBadge = ({ s }) => (
    <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg tabular-nums"
      style={{ background:sColor(s)+'22', color:sColor(s) }}>{s}</span>
  )
  const StatusPill = ({ st }) => (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white whitespace-nowrap"
      style={{ background:S[st]?.bg || '#64748b' }}>{S[st]?.label || st}</span>
  )

  const filteredLeads = search
    ? leads.filter(l => `${l.fn} ${l.ln} ${l.prop} ${l.email}`.toLowerCase().includes(search.toLowerCase()))
    : leads

  const updateStatus = (id, status) => {
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l))
    setSelected(s => s ? { ...s, status } : s)
  }

  const handleNewLead = () => {
    if (!newForm.nom.trim() || !newForm.email.trim()) { setNewFormErr('Le nom et l\'e-mail sont obligatoires.'); return }
    const parts = newForm.nom.trim().split(' ')
    const fn = parts[0] || ''
    const ln = parts.slice(1).join(' ') || ''
    const ini = ((fn[0] || '') + (ln[0] || '')).toUpperCase() || fn[0]?.toUpperCase() || '?'
    const score = Math.floor(Math.random() * 25) + 65
    const today = new Date().toISOString().slice(0, 10)
    const lead = {
      id: Date.now(), fn, ln, ini,
      email: newForm.email.trim(), phone: newForm.phone.trim(),
      src: newForm.src || 'Autre', prop: newForm.prop.trim() || 'Non précisé',
      budget: parseInt(newForm.budget.replace(/\s/g, '')) || 0,
      score, status: 'nouveau',
      profile: newForm.profile || 'Faible intention',
      tags: [], date: today, notes: newForm.notes.trim(),
    }
    setLeads(ls => [lead, ...ls])
    setNewLeadOpen(false)
    setNewForm({ nom:'', email:'', phone:'', src:'', prop:'', budget:'', profile:'', notes:'' })
    setNewFormErr('')
  }

  // Donut chart
  const r = 42, circ = 2 * Math.PI * r
  let cum = 0
  const donutSegs = CRM_SOURCES.map(src => {
    const dash = src.pct / 100 * circ
    const off  = -cum
    cum += dash
    return { ...src, dash, off }
  })

  // Bar chart
  const maxL = Math.max(...CRM_CONV_DATA.map(d => d.leads))
  const BH = 100, BW = 28, BGAP = 20, GW = BW * 2 + 6
  const CW = CRM_CONV_DATA.length * (GW + BGAP)

  const SIDEBAR_NAV = [
    { Icon:Icons.Home,       label:"Vue d'ensemble",         id:'home-crm'   },
    { Icon:Icons.Search,     label:'Recherches sauvegardées', id:'saved'      },
    { Icon:Icons.Bell,       label:'Notifications',           id:'notifs',    badge:4 },
    { Icon:Icons.Sparkles,   label:'Insights IA',             id:'insights'   },
    { Icon:Icons.CreditCard, label:'Abonnement',              id:'abonnement' },
    { Icon:Icons.Heart,      label:'Favoris',                 id:'favoris'    },
    { Icon:Icons.User,       label:'Mon profil',              id:'profil'     },
  ]

  return (
    <div className="fixed inset-0 z-[120] flex">

      {/* Sidebar */}
      <aside className="w-64 flex flex-col flex-shrink-0 overflow-y-auto" style={{ background:'#0D1B2E' }}>
        <div className="px-6 py-5 border-b border-white/10">
          <BrandLogo dark />
        </div>
        <nav className="flex-1 px-4 py-5 space-y-0.5">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mb-3">Navigation</p>
          {SIDEBAR_NAV.map(n => (
            <button key={n.id}
              onClick={() => n.id === 'profil' && setCurrentView('profil')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all text-left">
              <n.Icon size={16} />
              <span className="flex-1 truncate">{n.label}</span>
              {n.badge && <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="px-4 pb-3">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-500">
            <Icons.Users size={16} /> CRM
          </button>
        </div>
        <div className="mx-4 mb-5 p-4 rounded-2xl" style={{ background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.25)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Icons.Zap size={14} className="text-orange-400" />
            <span className="text-sm font-bold text-white">Passer à Pro</span>
          </div>
          <p className="text-xs text-white/60 mb-3">Alertes illimitées + IA avancée</p>
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-xl transition-all"
            onClick={() => setCurrentView('tarifs')}>Voir les offres →</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background:bg }}>

        {/* Top bar */}
        <header className="flex items-center gap-4 px-8 py-3.5 flex-shrink-0" style={{ background:card, borderBottom:`1px solid ${bdr}` }}>
          <div className="flex items-center gap-2.5 flex-1 max-w-sm px-4 h-10 rounded-full border" style={{ background:bg, borderColor:bdr }}>
            <Icons.Search size={14} style={{ color:sub }} />
            <input className="flex-1 text-sm bg-transparent outline-none" placeholder="Rechercher..."
              style={{ color:txt }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2.5 ml-auto">
            <button onClick={() => setDark(v => !v)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all" style={{ color:sub }}>
              {dark
                ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                : <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              }
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center relative" style={{ color:sub }}>
              <Icons.Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background:'#0f172a' }}>ME</div>
              <span className="text-sm font-semibold" style={{ color:txt }}>Mon</span>
              <Icons.ChevronDown size={13} style={{ color:sub }} />
            </div>
            <button onClick={() => setCurrentView('home')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-300">
              <Icons.ChevronLeft size={12} /> Accueil
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* Title */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color:txt }}>CRM Immobilier</h1>
              <p className="text-sm mt-0.5" style={{ color:sub }}>{total} leads · {gagne} gagnés · Taux de conv. {conv}%</p>
            </div>
            <button onClick={() => setNewLeadOpen(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-2xl transition-all shadow-sm">
              <Icons.PlusSquare size={15} /> Nouveau lead
            </button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { Icon:Icons.Users,       color:'#3B82F6', val:total,    label:'Total leads'    },
              { Icon:Icons.TrendingUp,  color:'#10B981', val:conv+'%', label:'Taux de conv.'  },
              { Icon:Icons.Tag,         color:'#F59E0B', val:negoc,    label:'En négociation' },
              { Icon:Icons.AlertCircle, color:'#EF4444', val:perdus,   label:'Perdus'         },
            ].map(({ Icon, color, val, label }) => (
              <div key={label} className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:color+'22', color }}>
                  <Icon size={18} />
                </div>
                <div className="text-3xl font-extrabold" style={{ color:txt }}>{val}</div>
                <div className="text-sm mt-0.5" style={{ color:sub }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-0.5 p-1 rounded-2xl mb-6 w-fit" style={{ background:dark?'#1e293b':'#f1f5f9' }}>
            {[
              { id:'kanban',    label:'Kanban'    },
              { id:'leads',     label:'Leads'     },
              { id:'analytics', label:'Analytics' },
              { id:'automation',label:'Automation'},
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab===id?'bg-white shadow-sm':''}`}
                style={{ color:tab===id?txt:sub }}>
                {id==='kanban'    && <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect width="7" height="12" x="3" y="6" rx="1"/><rect width="7" height="9" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>}
                {id==='leads'     && <Icons.Users size={13} />}
                {id==='analytics' && <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
                {id==='automation'&& <Icons.Zap size={13} />}
                {label}
              </button>
            ))}
          </div>

          {/* KANBAN */}
          {tab === 'kanban' && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {CRM_PIPELINE.map(col => {
                const colL = leads.filter(l => l.status === col.id)
                const isOver = dragOver === col.id
                return (
                  <div key={col.id} className="flex-shrink-0 w-72"
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dragOver !== col.id) setDragOver(col.id) }}
                    onDragLeave={e => { if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) setDragOver(null) }}
                    onDrop={e => {
                      e.preventDefault()
                      const id = parseInt(e.dataTransfer.getData('leadId'))
                      if (id) updateStatus(id, col.id)
                      setDraggingId(null)
                      setDragOver(null)
                    }}>
                    {/* Column header */}
                    <div className="flex items-center gap-2 mb-3 px-1 py-1.5 rounded-xl transition-colors"
                      style={{ background: isOver ? col.color + '18' : 'transparent' }}>
                      <div className="w-2.5 h-2.5 rounded-full transition-transform" style={{ background:col.color, transform: isOver ? 'scale(1.3)' : 'scale(1)' }} />
                      <span className="text-sm font-bold" style={{ color:txt }}>{col.label}</span>
                      <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:dark?'#334155':'#f1f5f9', color:sub }}>{colL.length}</span>
                    </div>
                    {/* Drop zone */}
                    <div className="space-y-3 rounded-2xl transition-all"
                      style={{
                        minHeight: 80,
                        padding: isOver ? '8px' : '0',
                        background: isOver ? col.color + '0d' : 'transparent',
                        border: isOver ? `2px dashed ${col.color}66` : '2px solid transparent',
                      }}>
                      {colL.map(lead => (
                        <motion.div key={lead.id}
                          layout
                          layoutId={`lead-${lead.id}`}
                          transition={{ type:'spring', stiffness:400, damping:30 }}
                          draggable={true}
                          onDragStart={e => {
                            setDraggingId(lead.id)
                            e.dataTransfer.setData('leadId', String(lead.id))
                            e.dataTransfer.effectAllowed = 'move'
                          }}
                          onDragEnd={() => { setDraggingId(null); setDragOver(null) }}
                          onClick={() => { if (!draggingId) { setSelected(lead); setNotesVal(lead.notes); setEditNotes(false) } }}
                          className="rounded-2xl p-4 transition-opacity"
                          style={{
                            background:card,
                            border:`1px solid ${bdr}`,
                            boxShadow: draggingId === lead.id ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                            opacity: draggingId === lead.id ? 0.35 : 1,
                            cursor: draggingId ? 'grabbing' : 'grab',
                          }}>
                          <div className="flex items-center gap-2.5 mb-2.5">
                            <Av ini={lead.ini} sz={32} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold truncate" style={{ color:txt }}>{lead.fn} {lead.ln}</div>
                              <div className="text-[11px] truncate" style={{ color:sub }}>{lead.prop}</div>
                            </div>
                            <ScoreBadge s={lead.score} />
                          </div>
                          <div className="text-sm font-extrabold text-orange-500 mb-2">{fmtBudget(lead.budget)}</div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background:P[lead.profile]?.bg, color:P[lead.profile]?.text }}>
                              {P[lead.profile]?.emoji} {lead.profile}
                            </span>
                            <span className="text-[10px] ml-auto" style={{ color:sub }}>{lead.date.slice(5)}</span>
                          </div>
                          {lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {lead.tags.map(t => (
                                <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                                  style={{ background:dark?'#334155':'#f1f5f9', color:sub }}>{t}</span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {colL.length === 0 && (
                        <div className="rounded-xl border-2 border-dashed p-6 text-center transition-all"
                          style={{ borderColor: isOver ? col.color : bdr, background: isOver ? col.color + '0d' : 'transparent' }}>
                          <p className="text-xs font-medium" style={{ color: isOver ? col.color : sub }}>
                            {isOver ? 'Déposer ici' : 'Aucun lead'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* LEADS */}
          {tab === 'leads' && (
            <div>
              <div className="flex items-center gap-2.5 px-4 h-10 rounded-full border mb-5 max-w-xs"
                style={{ background:card, borderColor:bdr }}>
                <Icons.Search size={13} style={{ color:sub }} />
                <input className="flex-1 text-sm bg-transparent outline-none" placeholder="Chercher un lead..."
                  style={{ color:txt }} value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background:card, border:`1px solid ${bdr}` }}>
                <div className="grid px-5 py-3 border-b text-[10px] font-bold uppercase tracking-wider"
                  style={{ gridTemplateColumns:'minmax(0,3fr) minmax(0,2fr) 80px 150px 40px', borderColor:bdr, color:sub }}>
                  <span>Lead</span><span>Bien / Budget</span><span>Score</span><span>Statut</span><span/>
                </div>
                {filteredLeads.map(lead => (
                  <div key={lead.id}
                    onClick={() => { setSelected(lead); setNotesVal(lead.notes); setEditNotes(false) }}
                    className="grid px-5 py-3.5 border-b items-center cursor-pointer transition-colors"
                    style={{ gridTemplateColumns:'minmax(0,3fr) minmax(0,2fr) 80px 150px 40px', borderColor:bdr }}
                    onMouseEnter={e => e.currentTarget.style.background = dark?'#263044':'#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Av ini={lead.ini} sz={36} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color:txt }}>{lead.fn} {lead.ln}</div>
                        <div className="text-xs truncate" style={{ color:sub }}>{lead.email}</div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm truncate" style={{ color:txt }}>{lead.prop}</div>
                      <div className="text-xs font-bold text-orange-500">{fmtBudget(lead.budget)}</div>
                    </div>
                    <ScoreBadge s={lead.score} />
                    <StatusPill st={lead.status} />
                    <button className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all"
                      style={{ color:sub }} onClick={e => e.stopPropagation()}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {tab === 'analytics' && (
            <div className="space-y-5">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { Icon:Icons.Users,       color:'#3B82F6', val:total,     label:'Total leads'    },
                  { Icon:Icons.TrendingUp,  color:'#10B981', val:conv+'%',  label:'Taux de conv.'  },
                  { Icon:Icons.Sparkles,    color:'#8B5CF6', val:scoreAvg,  label:'Score IA moyen' },
                  { Icon:Icons.AlertCircle, color:'#EF4444', val:perdus,    label:'Perdus'         },
                ].map(({ Icon, color, val, label }) => (
                  <div key={label} className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:color+'22', color }}>
                      <Icon size={18} />
                    </div>
                    <div className="text-3xl font-extrabold" style={{ color:txt }}>{val}</div>
                    <div className="text-sm mt-0.5" style={{ color:sub }}>{label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color:txt }}>Entonnoir de conversion</h3>
                  <svg width="100%" viewBox={`0 0 ${CW + 50} ${BH + 30}`}>
                    {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
                      const v = Math.round(frac * maxL)
                      const y = BH - frac * BH
                      return (
                        <g key={i}>
                          <line x1="35" y1={y} x2={CW + 35} y2={y} stroke={dark?'#334155':'#e2e8f0'} strokeWidth={0.8}/>
                          <text x="30" y={y + 3.5} fontSize={8} fill={sub} textAnchor="end">{v}</text>
                        </g>
                      )
                    })}
                    {CRM_CONV_DATA.map((d, i) => {
                      const gx = 35 + i * (GW + BGAP)
                      const h1 = (d.leads / maxL) * BH
                      const h2 = (d.conv  / maxL) * BH
                      return (
                        <g key={d.m}>
                          <rect x={gx}      y={BH-h1} width={BW} height={h1} rx={3} fill="#3B82F6" opacity={0.85}/>
                          <rect x={gx+BW+6} y={BH-h2} width={BW} height={h2} rx={3} fill="#8B5CF6" opacity={0.85}/>
                          <text x={gx+GW/2} y={BH+14} fontSize={9} fill={sub} textAnchor="middle">{d.m}</text>
                        </g>
                      )
                    })}
                  </svg>
                  <div className="flex items-center gap-4 mt-1">
                    {[{c:'#3B82F6',l:'Leads'},{c:'#8B5CF6',l:'Convertis'}].map(({ c, l }) => (
                      <div key={l} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background:c }}/>
                        <span className="text-[11px]" style={{ color:sub }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color:txt }}>Sources de leads</h3>
                  <div className="flex items-center gap-6">
                    <svg width={120} height={120} viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r={r} fill="none" stroke={dark?'#334155':'#f1f5f9'} strokeWidth={18}/>
                      {donutSegs.map((seg, i) => (
                        <circle key={i} cx="60" cy="60" r={r} fill="none"
                          stroke={seg.color} strokeWidth={18}
                          strokeDasharray={`${seg.dash} ${circ}`}
                          strokeDashoffset={seg.off}
                          transform="rotate(-90, 60, 60)"/>
                      ))}
                      <text x="60" y="57" textAnchor="middle" fontSize={11} fontWeight="700" fill={txt}>{total}</text>
                      <text x="60" y="70" textAnchor="middle" fontSize={8} fill={sub}>leads</text>
                    </svg>
                    <div className="flex-1 space-y-2.5">
                      {CRM_SOURCES.map(s => (
                        <div key={s.label} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:s.color }}/>
                          <span className="text-xs flex-1" style={{ color:txt }}>{s.label}</span>
                          <span className="text-xs font-bold" style={{ color:sub }}>{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color:txt }}>Taux de réponse par jour</h3>
                  <div className="flex items-end gap-2" style={{ height:56 }}>
                    {[72,88,65,91,78,84,70].map((v,i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full rounded-sm" style={{ height:`${Math.round(v*0.52)}px`, background:'#F97316', opacity:0.75 }}/>
                        <span className="text-[9px]" style={{ color:sub }}>{['L','M','M','J','V','S','D'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color:txt }}>Meilleures villes</h3>
                  <div className="space-y-2.5">
                    {[['Paris',4,'#3B82F6'],['Lyon',3,'#8B5CF6'],['Bordeaux',2,'#F97316'],['Nantes',2,'#10B981'],['Cannes',1,'#F59E0B']].map(([city,n,color]) => (
                      <div key={city} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-20" style={{ color:txt }}>{city}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ background:dark?'#334155':'#f1f5f9' }}>
                          <div className="h-full rounded-full" style={{ width:`${(n/4)*100}%`, background:color }}/>
                        </div>
                        <span className="text-xs font-bold w-4 text-right" style={{ color:sub }}>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AUTOMATION */}
          {tab === 'automation' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                <h3 className="text-sm font-bold mb-0.5" style={{ color:txt }}>Templates d'emails automatiques</h3>
                <p className="text-xs mb-4" style={{ color:sub }}>Séquences de suivi prédéfinies</p>
                <div className="space-y-2">
                  {CRM_TEMPLATES.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all hover:shadow-sm"
                      style={{ borderColor:bdr, background:dark?'#263044':'#f8fafc' }}>
                      <span className="text-lg">{t.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color:txt }}>{t.label}</div>
                        <div className="text-xs" style={{ color:sub }}>{t.delay}</div>
                      </div>
                      <Icons.ChevronDown size={14} style={{ color:sub }}/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                  <h3 className="text-sm font-bold mb-0.5" style={{ color:txt }}>Relances prioritaires</h3>
                  <p className="text-xs mb-4" style={{ color:sub }}>Leads à recontacter en urgence</p>
                  <div className="space-y-2.5">
                    {leads.filter(l => ['negociation','visite','contacte'].includes(l.status))
                      .sort((a,b) => a.date.localeCompare(b.date))
                      .slice(0, 5)
                      .map(lead => {
                        const days = Math.ceil((new Date('2026-05-28') - new Date(lead.date)) / 86400000)
                        return (
                          <div key={lead.id} className="flex items-center gap-3 p-3 rounded-2xl"
                            style={{ background:days>6?'#FEF2F2':dark?'#263044':'#f8fafc', border:`1px solid ${days>6?'#FCA5A5':bdr}` }}>
                            <Av ini={lead.ini} sz={36}/>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate" style={{ color:txt }}>{lead.fn} {lead.ln}</div>
                              <div className="text-xs" style={{ color:days>6?'#EF4444':sub }}>Il y a {days} jours</div>
                            </div>
                            <StatusPill st={lead.status}/>
                            <button className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-all flex-shrink-0">
                              <Icons.Mail size={13}/>
                            </button>
                          </div>
                        )
                      })}
                  </div>
                </div>
                <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icons.Sparkles size={14} style={{ color:'#8B5CF6' }}/>
                    <h3 className="text-sm font-bold" style={{ color:txt }}>Score IA — Légende</h3>
                  </div>
                  <div className="space-y-2">
                    {[['80–100','Acheteur sérieux, décision rapide','#10B981'],['60–79','Intérêt modéré, à relancer','#F97316'],['0–59','Faible intention, surveiller','#EF4444']].map(([range,label,color]) => (
                      <div key={range} className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap" style={{ background:color+'22', color }}>{range}</span>
                        <span className="text-xs" style={{ color:sub }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* New Lead Modal */}
      <AnimatePresence>
        {newLeadOpen && (
          <>
            <motion.div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => { setNewLeadOpen(false); setNewFormErr('') }} />
            <div className="fixed inset-0 z-[131] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity:0, scale:0.94, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.94, y:20 }}
                transition={{ type:'spring', damping:28, stiffness:320 }}
                className="pointer-events-auto w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden"
                style={{ background:card }}>
                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-6 pb-4" style={{ borderBottom:`1px solid ${bdr}` }}>
                  <div>
                    <h2 className="text-lg font-extrabold" style={{ color:txt }}>Nouveau lead</h2>
                    <p className="text-xs mt-0.5" style={{ color:sub }}>Ajoutez un lead à votre pipeline</p>
                  </div>
                  <button onClick={() => { setNewLeadOpen(false); setNewFormErr('') }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100"
                    style={{ color:sub }}>
                    <Icons.X size={16} />
                  </button>
                </div>

                {/* Body */}
                <div className="px-7 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Nom */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Nom complet *</label>
                      <input value={newForm.nom} onChange={e => setNewForm(f => ({ ...f, nom:e.target.value }))} placeholder="Jean Dupont"
                        className="w-full h-11 px-4 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400"
                        style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>E-mail *</label>
                      <input value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email:e.target.value }))} placeholder="jean@exemple.fr" type="email"
                        className="w-full h-11 px-4 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400"
                        style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                    </div>
                    {/* Téléphone */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Téléphone</label>
                      <input value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone:e.target.value }))} placeholder="06 00 00 00 00" type="tel"
                        className="w-full h-11 px-4 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400"
                        style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                    </div>
                    {/* Source */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Source</label>
                      <select value={newForm.src} onChange={e => setNewForm(f => ({ ...f, src:e.target.value }))}
                        className="w-full h-11 px-4 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400 cursor-pointer"
                        style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:newForm.src ? txt : sub }}>
                        <option value="" style={{ color:sub }}>Choisir…</option>
                        {['SeLoger', 'Leboncoin', 'PAP', "Bien'ici", 'Instagram', 'Recommandation', 'Autre'].map(s => (
                          <option key={s} value={s} style={{ color:txt }}>{s}</option>
                        ))}
                      </select>
                    </div>
                    {/* Bien recherché */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Bien recherché</label>
                      <input value={newForm.prop} onChange={e => setNewForm(f => ({ ...f, prop:e.target.value }))} placeholder="Appt 3P Paris 11"
                        className="w-full h-11 px-4 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400"
                        style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                    </div>
                    {/* Budget */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Budget (€)</label>
                      <input value={newForm.budget} onChange={e => setNewForm(f => ({ ...f, budget:e.target.value }))} placeholder="420 000"
                        className="w-full h-11 px-4 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400"
                        style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                    </div>
                  </div>

                  {/* Profil IA */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color:sub }}>Profil IA</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(P).map(([key, val]) => (
                        <button key={key} type="button" onClick={() => setNewForm(f => ({ ...f, profile:key }))}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border-2 text-left transition-all text-sm font-semibold"
                          style={{
                            background: newForm.profile === key ? val.bg : dark ? '#0f172a' : bg,
                            borderColor: newForm.profile === key ? val.text + '80' : bdr,
                            color: newForm.profile === key ? val.text : sub,
                          }}>
                          <span>{val.emoji}</span> {key}
                          {newForm.profile === key && <Icons.Check size={13} className="ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Notes</label>
                    <textarea value={newForm.notes} onChange={e => setNewForm(f => ({ ...f, notes:e.target.value }))}
                      placeholder="Contexte, motivation, urgence…" rows={3}
                      className="w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400 resize-none"
                      style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                  </div>

                  {newFormErr && (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl px-4 py-2.5">
                      <Icons.AlertCircle size={14} className="shrink-0" /> {newFormErr}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-7 py-5" style={{ borderTop:`1px solid ${bdr}` }}>
                  <button onClick={() => { setNewLeadOpen(false); setNewFormErr('') }}
                    className="flex-1 h-11 rounded-2xl border-2 text-sm font-semibold transition-all hover:border-slate-400"
                    style={{ borderColor:bdr, color:sub, background:'transparent' }}>
                    Annuler
                  </button>
                  <button onClick={handleNewLead}
                    className="flex-1 h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
                    <Icons.PlusSquare size={15} /> Créer le lead
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => { setSelected(null); setEditNotes(false) }}/>
            <div className="fixed inset-0 z-[131] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity:0, scale:0.93, y:16 }}
                animate={{ opacity:1, scale:1,    y:0  }}
                exit={{ opacity:0, scale:0.93, y:16 }}
                transition={{ type:'spring', damping:26, stiffness:300 }}
                className="bg-white rounded-[28px] shadow-2xl w-full max-w-md pointer-events-auto">
                <div className="flex items-start gap-4 px-6 pt-6 pb-4">
                  <Av ini={selected.ini} sz={52}/>
                  <div className="flex-1">
                    <h2 className="text-lg font-extrabold text-navy-900">{selected.fn} {selected.ln}</h2>
                    <p className="text-sm text-slate-500">{selected.prop}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <ScoreBadge s={selected.score}/>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background:P[selected.profile]?.bg, color:P[selected.profile]?.text }}>
                        {P[selected.profile]?.emoji} {selected.profile}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => { setSelected(null); setEditNotes(false) }}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all">
                    <Icons.X size={14} className="text-slate-600"/>
                  </button>
                </div>
                <div className="px-6 pb-4 grid grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0"><Icons.Mail size={13} className="text-slate-400 shrink-0"/><span className="truncate">{selected.email}</span></div>
                  <div className="flex items-center gap-2 text-sm text-slate-600"><Icons.Phone size={13} className="text-slate-400 shrink-0"/>{selected.phone}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-600"><Icons.MapPin size={13} className="text-slate-400 shrink-0"/>{selected.src}</div>
                  <div className="text-sm font-bold text-orange-500">{fmtBudget(selected.budget)}</div>
                </div>
                <div className="px-6 pb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Statut Pipeline</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(S).map(([key, val]) => (
                      <button key={key} onClick={() => updateStatus(selected.id, key)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                        style={{ background:selected.status===key?val.bg:'#f1f5f9', color:selected.status===key?'white':'#64748b' }}>
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</p>
                    <button onClick={() => setEditNotes(v => !v)} className="text-xs text-orange-500 font-medium hover:text-orange-600">
                      {editNotes ? 'Sauvegarder' : 'Modifier'}
                    </button>
                  </div>
                  {editNotes
                    ? <textarea rows={2} value={notesVal} onChange={e => setNotesVal(e.target.value)}
                        className="w-full text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2 resize-none outline-none border border-slate-200 focus:border-orange-400 transition-colors"/>
                    : <p className="text-sm text-slate-600">{notesVal || selected.notes}</p>}
                </div>
                {selected.tags.length > 0 && (
                  <div className="px-6 pb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tags.map(t => <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{t.toLowerCase()}</span>)}
                    </div>
                  </div>
                )}
                <div className="px-6 pb-6 pt-2 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 rounded-2xl transition-all">
                    <Icons.Mail size={14}/> Envoyer email
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-3 border-2 border-slate-200 hover:border-slate-300 rounded-2xl text-sm font-semibold text-navy-800 transition-all">
                    <Icons.Eye size={13}/> Visite
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-3 border-2 border-slate-200 hover:border-slate-300 rounded-2xl text-sm font-semibold text-navy-800 transition-all">
                    <Icons.Phone size={13}/> Appeler
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function NeufView({ setCurrentView }) {
  const [city,   setCity]   = useState('Toutes les villes')
  const [type,   setType]   = useState('Tous types')
  const [budget, setBudget] = useState('Tous budgets')
  const [open,   setOpen]   = useState(null)

  const filtered = NEUF_PROGRAMS.filter(p => {
    if (city   !== 'Toutes les villes' && p.city !== city)     return false
    if (type   !== 'Tous types'        && p.type !== type)     return false
    if (budget !== 'Tous budgets') {
      if (budget === '< 300 000 €'          && p.priceFrom >= 300000)  return false
      if (budget === '300 – 500 000 €'      && (p.priceFrom >= 500000 || p.priceTo < 300000)) return false
      if (budget === '500 000 – 1 M€'       && (p.priceFrom >= 1000000 || p.priceTo < 500000)) return false
      if (budget === '> 1 M€'               && p.priceTo < 1000000) return false
    }
    return true
  })

  const featured = filtered.find(p => p.featured) || filtered[0]
  const rest     = filtered.filter(p => p !== featured)

  const FilterSelect = ({ value, onChange, options }) => (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white border-2 border-slate-200 hover:border-orange-300 focus:border-orange-400 focus:outline-none text-sm font-medium text-navy-800 pl-4 pr-8 py-2.5 rounded-2xl cursor-pointer transition-all">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <Icons.ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white pt-24 pb-14 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Icons.Building2 size={14} /> Immobilier neuf
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              Programmes neufs<br className="hidden md:block" /> sélectionnés par PASMAL
            </h1>
            <p className="text-white/70 text-lg max-w-xl mb-8">
              TVA réduite · Frais de notaire à 2 % · Garanties constructeur · DPE A garanti
            </p>
          </motion.div>
          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 items-center">
            <FilterSelect value={city}   onChange={setCity}   options={NEUF_CITIES}  />
            <FilterSelect value={type}   onChange={setType}   options={NEUF_TYPES}   />
            <FilterSelect value={budget} onChange={setBudget} options={NEUF_BUDGETS} />
            <span className="text-white/50 text-sm ml-1">{filtered.length} programme{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">Aucun programme ne correspond à vos critères.</div>
        ) : (
          <>
            {/* Featured program */}
            {featured && (
              <section>
                <NeufProgramCard prog={featured} onOpen={setOpen} featured />
              </section>
            )}
            {/* Grid */}
            {rest.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-navy-900 mb-5">Tous les programmes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.06*i }}>
                      <NeufProgramCard prog={p} onOpen={setOpen} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Avantages neuf */}
        <section>
          <h2 className="text-2xl font-bold text-navy-900 mb-1">Pourquoi acheter dans le neuf ?</h2>
          <p className="text-slate-500 text-sm mb-6">Des avantages fiscaux, financiers et techniques exclusifs</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {NEUF_AVANTAGES.map((av, i) => (
              <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.07*i }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                  <av.Icon size={18} className="text-orange-500" />
                </div>
                <h3 className="text-sm font-bold text-navy-900 mb-1">{av.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{av.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA simulateur */}
        <section>
          <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">Calculez votre financement neuf</h2>
              <p className="text-white/65 text-sm">PTZ inclus, frais de notaire réduits — simulez votre mensualité en 2 minutes.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0 flex-wrap">
              <button onClick={() => setCurrentView('simulateur')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors">
                <Icons.CreditCard size={14} className="inline mr-1.5 -mt-0.5" /> Simuler mon prêt
              </button>
              <button onClick={() => setCurrentView('guides')}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full text-sm border border-white/20 transition-colors">
                Guides & conseils
              </button>
            </div>
          </div>
        </section>
      </div>

      <NeufDetailModal prog={open} onClose={() => setOpen(null)} setCurrentView={setCurrentView} />
    </div>
  )
}

function SimulateurView({ setCurrentView }) {
  const [tab, setTab] = useState('mensualite')
  const [prix, setPrix] = useState(350000)
  const [apport, setApport] = useState(60000)
  const [taux, setTaux] = useState(3.52)
  const [duree, setDuree] = useState(20)
  const [typeLogement, setTypeLogement] = useState('ancien')
  const [revenus, setRevenus] = useState(5000)
  const [tauxEndt, setTauxEndt] = useState(35)

  const fmt = (n) => Math.round(n).toLocaleString('fr-FR')

  const emprunt = Math.max(0, prix - apport)
  const tauxMensuel = taux / 100 / 12
  const nbMois = duree * 12
  const mensualite = tauxMensuel > 0
    ? Math.round(emprunt * tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -nbMois)))
    : Math.round(emprunt / nbMois)
  const coutTotal = mensualite * nbMois
  const interetsTotal = coutTotal - emprunt
  const fraisNotaire = Math.round(prix * (typeLogement === 'neuf' ? 0.025 : 0.075))
  const assuranceMensuelle = Math.round(emprunt * 0.0035 / 12)

  const amoByYear = []
  let capitalRestant = emprunt
  for (let yr = 1; yr <= Math.min(duree, 30); yr++) {
    let capAnnuel = 0, intAnnuel = 0
    for (let m = 0; m < 12 && capitalRestant > 0; m++) {
      const intMois = capitalRestant * tauxMensuel
      const capMois = Math.min(mensualite - intMois, capitalRestant)
      intAnnuel += intMois
      capAnnuel += capMois
      capitalRestant = Math.max(0, capitalRestant - capMois)
    }
    amoByYear.push({ yr, cap: Math.round(capAnnuel), int: Math.round(intAnnuel) })
  }
  const maxAnnuel = Math.max(1, ...amoByYear.map(a => a.cap + a.int))

  const mensualiteMax = Math.round(revenus * tauxEndt / 100)
  const capaciteEmprunt = tauxMensuel > 0
    ? Math.round(mensualiteMax * (1 - Math.pow(1 + tauxMensuel, -nbMois)) / tauxMensuel)
    : mensualiteMax * nbMois
  const prixMaxBien = capaciteEmprunt + apport

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Icons.CreditCard size={14} /> Simulateur de financement
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Simulez votre prêt immobilier</h1>
            <p className="text-white/70 max-w-xl">Mensualité, capacité d'emprunt, frais de notaire — tous vos calculs en temps réel.</p>
          </motion.div>
          <div className="flex flex-wrap gap-2 mt-6">
            {SIMUL_PRESETS.map((p, i) => (
              <button key={i} onClick={() => { setPrix(p.prix); setApport(p.apport) }}
                className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-orange-500 border border-white/15 hover:border-orange-500 text-white/80 hover:text-white transition-all">
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 mb-8 w-fit">
          {[
            { id:'mensualite', label:'Calculer ma mensualité' },
            { id:'capacite',   label:"Capacité d'emprunt" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-navy-800'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Inputs */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 space-y-7">
            {tab === 'mensualite' ? (
              <>
                <SliderField label="Prix du bien" value={prix} onChange={setPrix} min={50000} max={2000000} step={5000} fmt={v => `${fmt(v)} €`} />
                <SliderField label="Apport personnel" value={apport} onChange={setApport} min={0} max={Math.min(prix, 600000)} step={5000} fmt={v => `${fmt(v)} €`} />
                <div className="bg-orange-50 rounded-2xl px-4 py-3 text-sm flex items-center justify-between">
                  <span className="text-slate-600">Montant emprunté</span>
                  <span className="font-bold text-orange-600">{fmt(emprunt)} €</span>
                </div>
              </>
            ) : (
              <>
                <SliderField label="Revenus mensuels nets" value={revenus} onChange={setRevenus} min={1500} max={20000} step={100} fmt={v => `${fmt(v)} €/mois`} />
                <SliderField label="Taux d'endettement max" value={tauxEndt} onChange={setTauxEndt} min={20} max={40} step={1} fmt={v => `${v} %`} />
                <SliderField label="Apport personnel" value={apport} onChange={setApport} min={0} max={500000} step={5000} fmt={v => `${fmt(v)} €`} />
              </>
            )}
            <SliderField label="Taux d'intérêt annuel" value={taux} onChange={setTaux} min={0.5} max={7} step={0.01} fmt={v => `${v.toFixed(2)} %`} />
            <SliderField label="Durée du prêt" value={duree} onChange={setDuree} min={5} max={30} step={1} fmt={v => `${v} ans`} />
            {tab === 'mensualite' && (
              <div>
                <div className="text-sm font-medium text-navy-700 mb-2">Type de logement</div>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id:'ancien', label:'Ancien' }, { id:'neuf', label:'Neuf / VEFA' }].map(t => (
                    <button key={t.id} onClick={() => setTypeLogement(t.id)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${typeLogement === t.id ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-500 border-slate-200 hover:border-navy-300'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-5">
            {tab === 'mensualite' ? (
              <>
                <motion.div key={`${mensualite}-${emprunt}`} initial={{ scale:0.97, opacity:0.8 }} animate={{ scale:1, opacity:1 }} transition={{ type:'spring', stiffness:280 }}
                  className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-7 text-white">
                  <div className="text-white/60 text-sm mb-1">Mensualité hors assurance</div>
                  <div className="text-5xl font-extrabold">{fmt(mensualite)} <span className="text-2xl font-normal text-white/60">€/mois</span></div>
                  <div className="text-white/50 text-xs mt-2">
                    Avec assurance (0,35 %) : <span className="text-orange-300 font-semibold">{fmt(mensualite + assuranceMensuelle)} €/mois</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/15">
                    {[
                      { label:'Capital', value:`${fmt(emprunt)} €` },
                      { label:'Intérêts', value:`${fmt(interetsTotal)} €` },
                      { label:'Coût total', value:`${fmt(coutTotal)} €` },
                    ].map((k, i) => (
                      <div key={i}>
                        <div className="text-[11px] text-white/50 mb-0.5">{k.label}</div>
                        <div className="text-sm font-bold">{k.value}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Frais de notaire */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-navy-800">Frais de notaire estimés</div>
                    <div className="text-xs text-slate-400 mt-0.5">{typeLogement === 'neuf' ? '≈ 2,5 % · VEFA / neuf' : '≈ 7,5 % · bien ancien'}</div>
                  </div>
                  <div className="text-xl font-bold text-navy-900">{fmt(fraisNotaire)} €</div>
                </div>

                {/* Amortization chart */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold text-navy-800">Amortissement annuel</div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block bg-orange-500" /> Capital</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block bg-slate-200" /> Intérêts</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 overflow-y-auto max-h-56 pr-1">
                    {amoByYear.map(({ yr, cap, int }) => (
                      <div key={yr} className="grid items-center gap-2" style={{ gridTemplateColumns:'38px 1fr 72px' }}>
                        <div className="text-[10px] text-slate-400 font-medium">An {yr}</div>
                        <div className="flex h-3.5 rounded-full overflow-hidden bg-slate-50">
                          <motion.div className="h-full bg-orange-500 rounded-l-full"
                            initial={{ width:0 }} animate={{ width:`${(cap / maxAnnuel) * 100}%` }} transition={{ delay:0.02*yr, duration:0.5, ease:'easeOut' }} />
                          <div className="h-full bg-slate-200" style={{ width:`${(int / maxAnnuel) * 100}%` }} />
                        </div>
                        <div className="text-[10px] text-slate-500 text-right">{fmt(cap + int)} €</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <motion.div key={`cap-${capaciteEmprunt}`} initial={{ scale:0.97, opacity:0.8 }} animate={{ scale:1, opacity:1 }} transition={{ type:'spring', stiffness:280 }}
                  className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-7 text-white">
                  <div className="text-white/60 text-sm mb-1">Capacité d'emprunt estimée</div>
                  <div className="text-5xl font-extrabold">{fmt(capaciteEmprunt)} <span className="text-2xl font-normal text-white/60">€</span></div>
                  <div className="text-white/50 text-xs mt-2">
                    Prix maxi du bien (avec apport) : <span className="text-orange-300 font-semibold">{fmt(prixMaxBien)} €</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/15">
                    {[
                      { label:'Mensualité max', value:`${fmt(mensualiteMax)} €` },
                      { label:'Durée', value:`${duree} ans` },
                      { label:'Taux', value:`${taux.toFixed(2)} %` },
                    ].map((k, i) => (
                      <div key={i}>
                        <div className="text-[11px] text-white/50 mb-0.5">{k.label}</div>
                        <div className="text-sm font-bold">{k.value}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Endettement gauge */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <div className="text-sm font-semibold text-navy-800 mb-4">Taux d'endettement</div>
                  <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <motion.div className="absolute inset-y-0 left-0 rounded-full"
                      initial={{ width:0 }} animate={{ width:`${tauxEndt}%` }} transition={{ duration:0.4 }}
                      style={{ background: tauxEndt <= 33 ? '#10B981' : tauxEndt <= 35 ? '#F59E0B' : '#EF4444' }} />
                    <div className="absolute inset-y-0 w-0.5 bg-white/80" style={{ left:'33%' }} />
                    <div className="absolute inset-y-0 w-0.5 bg-white/80" style={{ left:'35%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-3">
                    <span>Confortable (≤33 %)</span><span>Limite 35 %</span><span>Risqué</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {tauxEndt <= 33
                      ? "Taux d'endettement confortable — bonne marge de sécurité pour votre dossier."
                      : tauxEndt <= 35
                      ? "Vous approchez de la limite réglementaire de 35 %. Soignez votre dossier bancaire."
                      : "Au-delà de 35 %, l'octroi du prêt nécessitera une dérogation bancaire."}
                  </p>
                </div>

                {/* Profil */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                  <div className="text-sm font-semibold text-navy-800 mb-2">Profil financier</div>
                  {[
                    { label:'Revenus nets',         value:`${fmt(revenus)} €/mois` },
                    { label:'Mensualité maximale',  value:`${fmt(mensualiteMax)} €/mois` },
                    { label:'Reste à vivre',        value:`${fmt(revenus - mensualiteMax)} €/mois` },
                    { label:'Apport personnel',     value:`${fmt(apport)} €` },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                      <span className="text-slate-500">{r.label}</span>
                      <span className="font-semibold text-navy-800">{r.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button onClick={() => setCurrentView('estimation')}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                <Icons.Sparkles size={13} className="inline mr-1.5 -mt-0.5" /> Estimer mon bien
              </button>
              <button onClick={() => setCurrentView('marche')}
                className="flex-1 bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                Tendances marché
              </button>
            </div>
            <p className="text-center text-[11px] text-slate-400">Simulation indicative non contractuelle. Consultez un courtier pour un plan de financement personnalisé.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MarcheView({ setCurrentView }) {
  const [chartCities, setChartCities] = useState(Object.keys(MARCHE_HISTORY))

  const Y_MIN = 88, Y_MAX = 132, Y_RANGE = Y_MAX - Y_MIN
  const X_BASE = 55, Y_BASE = 18, CHART_W = 505, CHART_H = 140

  const getX = (i) => X_BASE + i * (CHART_W / 6)
  const getY = (pct) => Y_BASE + (Y_MAX - pct) / Y_RANGE * CHART_H
  const getPoints = (city) => {
    const base = MARCHE_HISTORY[city][0]
    return MARCHE_HISTORY[city].map((v, i) => {
      const pct = (v / base) * 100
      return `${getX(i).toFixed(1)},${getY(pct).toFixed(1)}`
    }).join(' ')
  }

  const maxPpm = Math.max(...MARCHE_CITIES_DATA.map(c => c.ppm))
  const sortedByYield = [...MARCHE_CITIES_DATA].sort((a, b) => b.yield - a.yield)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Icons.TrendingUp size={14} /> Données du marché
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              Tendances du marché<br className="hidden md:block" /> immobilier français
            </h1>
            <p className="text-white/70 text-lg max-w-xl">
              Prix, volumes, rendements et prévisions — toutes les données clés pour décider avec confiance.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { label:'Prix moyen France',   value:'3 420 €/m²', sub:'+1,2 % sur 12 mois',     up:true  },
              { label:'Transactions 2025',   value:'856 000',    sub:'+4,3 % vs 2024',          up:true  },
              { label:'Délai de vente moy.', value:'51 jours',   sub:'−3 jours vs 2024',        up:false },
              { label:'Taux immo moy.',      value:'3,52 %',     sub:'Nov. 2025 · 20 ans',      up:false },
            ].map((k, i) => (
              <motion.div key={i} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1*i }}
                className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
                <div className="text-xs text-white/55 mb-1">{k.label}</div>
                <div className="text-2xl font-bold text-white">{k.value}</div>
                <div className={`text-xs mt-1 ${k.up ? 'text-emerald-400' : 'text-orange-400'}`}>{k.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-14">

        {/* Prix par ville — horizontal bars */}
        <section>
          <h2 className="text-2xl font-bold text-navy-900 mb-1">Prix au m² par ville</h2>
          <p className="text-slate-500 text-sm mb-6">Marché secondaire — appartements toutes surfaces · évolution 2020–2026</p>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-4">
            {MARCHE_CITIES_DATA.map((c, i) => {
              const barPct = (c.ppm / maxPpm) * 100
              const chg = (c.ppm - c.prev) / c.prev * 100
              return (
                <motion.div key={c.city} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.05*i }}
                  className="grid items-center gap-4" style={{ gridTemplateColumns:'130px 1fr 76px' }}>
                  <div className="text-sm font-semibold text-navy-800">{c.city}</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                      <motion.div initial={{ width:0 }} animate={{ width:`${barPct}%` }} transition={{ delay:0.1+0.05*i, duration:0.7, ease:'easeOut' }}
                        className="h-3 rounded-full" style={{ background: c.color }} />
                    </div>
                    <span className="text-navy-900 font-bold text-sm w-24 shrink-0 text-right">{c.ppm.toLocaleString('fr-FR')} €/m²</span>
                  </div>
                  <div className={`text-xs font-semibold px-2.5 py-1 rounded-lg text-center ${chg >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {chg >= 0 ? '+' : ''}{chg.toFixed(1)} %
                  </div>
                </motion.div>
              )
            })}
            <div className="text-xs text-slate-400 pt-3 border-t border-slate-100">Sources : DVF, bases notariales — données estimatives.</div>
          </div>
        </section>

        {/* Multi-line SVG chart */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Évolution des prix (2020–2026)</h2>
              <p className="text-slate-500 text-sm mt-1">Indice base 100 en 2020 — comparaison normalisée par ville</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {Object.keys(MARCHE_HISTORY).map(city => {
                const active = chartCities.includes(city)
                const col = MARCHE_CHART_COLORS[city]
                return (
                  <button key={city}
                    onClick={() => setChartCities(prev =>
                      active && prev.length > 1 ? prev.filter(c => c !== city) : active ? prev : [...prev, city]
                    )}
                    className="text-xs font-medium px-3 py-1 rounded-full border transition-all"
                    style={active
                      ? { background: col, borderColor: col, color: '#fff' }
                      : { background: '#fff', borderColor: '#E2E8F0', color: '#94A3B8' }}>
                    {city}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6 overflow-x-auto">
            <svg viewBox="0 0 600 190" className="w-full min-w-[340px]" aria-label="Évolution des prix immobiliers 2020-2026">
              {[90, 100, 110, 120, 130].map(pct => (
                <g key={pct}>
                  <line x1={X_BASE} x2={X_BASE + CHART_W} y1={getY(pct)} y2={getY(pct)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 3" />
                  <text x={X_BASE - 6} y={getY(pct) + 4} textAnchor="end" fontSize="9" fill="#94A3B8">{pct}%</text>
                </g>
              ))}
              {MARCHE_YEARS.map((yr, i) => (
                <g key={yr}>
                  <line x1={getX(i)} x2={getX(i)} y1={Y_BASE} y2={Y_BASE + CHART_H} stroke="#F1F5F9" strokeWidth="1" />
                  <text x={getX(i)} y={175} textAnchor="middle" fontSize="9" fill="#64748B">{yr}</text>
                </g>
              ))}
              <line x1={X_BASE} x2={X_BASE + CHART_W} y1={getY(100)} y2={getY(100)} stroke="#CBD5E1" strokeWidth="1.5" />
              {Object.keys(MARCHE_HISTORY).filter(c => chartCities.includes(c)).map(city => (
                <g key={city}>
                  <polyline points={getPoints(city)} fill="none" stroke={MARCHE_CHART_COLORS[city]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {MARCHE_HISTORY[city].map((v, i) => (
                    <circle key={i} cx={getX(i)} cy={getY((v / MARCHE_HISTORY[city][0]) * 100)} r="3.5" fill={MARCHE_CHART_COLORS[city]} />
                  ))}
                </g>
              ))}
            </svg>
          </div>
        </section>

        {/* Segments */}
        <section>
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Segments de marché</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MARCHE_SEGMENTS.map((seg, i) => (
              <motion.div key={i} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08*i }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: seg.color + '20' }}>
                  <div style={{ color: seg.color }}><seg.Icon size={20} /></div>
                </div>
                <div className="text-sm font-semibold text-navy-800 mb-1">{seg.label}</div>
                <div className={`text-2xl font-extrabold mb-0.5 ${seg.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{seg.trend}</div>
                <div className="text-xs text-slate-400">{seg.volume} transactions / an</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top investissement */}
        <section>
          <h2 className="text-2xl font-bold text-navy-900 mb-1">Top villes pour l'investissement</h2>
          <p className="text-slate-500 text-sm mb-6">Classement par rendement brut estimé · 2025</p>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="grid text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3 border-b border-slate-100"
              style={{ gridTemplateColumns:'1fr 120px 160px 120px' }}>
              <div>Ville</div>
              <div>Prix/m²</div>
              <div>Rendement brut</div>
              <div>Délai de vente</div>
            </div>
            {sortedByYield.map((c, i) => (
              <motion.div key={c.city} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.04*i }}
                className={`grid items-center px-6 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${i === 0 ? 'bg-orange-50/50' : ''}`}
                style={{ gridTemplateColumns:'1fr 120px 160px 120px' }}>
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${i === 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{i+1}</span>
                  <span className="font-semibold text-navy-800 text-sm">{c.city}</span>
                </div>
                <div className="text-sm font-medium text-navy-700">{c.ppm.toLocaleString('fr-FR')} €</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-slate-100 w-20 overflow-hidden">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width:`${Math.min(c.yield / 7 * 100, 100)}%` }} />
                  </div>
                  <span className="text-emerald-700 font-bold text-sm">{c.yield} %</span>
                </div>
                <div className="text-sm text-navy-700">{c.days} j</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Prévisions */}
        <section>
          <h2 className="text-2xl font-bold text-navy-900 mb-1">Prévisions 2026</h2>
          <p className="text-slate-500 text-sm mb-6">Anticipations des experts et modèles économétriques</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MARCHE_PREDICTIONS.map((pred, i) => (
              <motion.div key={i} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1*i }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: pred.color + '18' }}>
                  <div style={{ color: pred.color }}><pred.Icon size={22} /></div>
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-2">{pred.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{pred.desc}</p>
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Indice de confiance</span>
                    <span className="font-semibold text-navy-700">{pred.confidence} %</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width:0 }} animate={{ width:`${pred.confidence}%` }} transition={{ delay:0.2+0.1*i, duration:0.6, ease:'easeOut' }}
                      className="h-full rounded-full" style={{ background: pred.color }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-4">
          <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-10 text-white text-center">
            <h2 className="text-2xl font-bold mb-3">Estimez votre bien gratuitement</h2>
            <p className="text-white/70 mb-6 max-w-md mx-auto">Comparez votre prix par rapport aux tendances du marché dans votre ville.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button onClick={() => setCurrentView('estimation')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3 rounded-full transition-colors">
                <Icons.Sparkles size={14} className="inline mr-1.5 -mt-0.5" /> Lancer l'estimation
              </button>
              <button onClick={() => setCurrentView('results')}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3 rounded-full border border-white/20 transition-colors">
                Voir les annonces
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

function ComparerView({ compareList, setCompareList, onBack, onOpenListing }) {
  const listings = compareList.map((raw, i) => ({ ...enrichWithMeta(raw, i), _raw: raw, _idx: i }))
  const [favd, setFavd] = useState({})

  if (listings.length === 0) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-slate-400 mb-4 text-sm">Aucun bien à comparer</div>
        <button onClick={onBack} className="px-5 py-2.5 bg-orange-600 text-white rounded-xl font-semibold text-sm">
          Retour
        </button>
      </div>
    </div>
  )

  const prices   = listings.map(l => typeof l.price === 'number' ? l.price : Infinity)
  const surfaces = listings.map(l => l.surface || 0)
  const pSqms    = listings.map(l => l.surface && typeof l.price === 'number' ? Math.round(l.price / l.surface) : Infinity)
  const rooms_   = listings.map(l => l.rooms || 0)
  const dpeVals  = listings.map(l => DPE_ORDER_CMP[l.dpe] ?? 4)
  const scores   = listings.map(l => l.trust_score || 0)

  const best = {
    price:   prices.indexOf(Math.min(...prices.filter(v=>v<Infinity))),
    surface: surfaces.indexOf(Math.max(...surfaces)),
    pSqm:    pSqms.indexOf(Math.min(...pSqms.filter(v=>v<Infinity))),
    rooms:   rooms_.indexOf(Math.max(...rooms_)),
    dpe:     dpeVals.indexOf(Math.min(...dpeVals)),
    score:   scores.indexOf(Math.max(...scores)),
  }

  const ROWS = [
    { id:'surface', label:'Surface',     vals: listings.map(l => l.surface ? `${l.surface} m²` : '—') },
    { id:'pSqm',    label:'Prix/m²',     vals: listings.map(l => l.surface && typeof l.price==='number' ? `${Math.round(l.price/l.surface).toLocaleString('fr-FR')} €` : '—') },
    { id:'rooms',   label:'Pièces',      vals: listings.map(l => l.rooms ? `${l.rooms} pièces` : '—') },
    { id:'dpe',     label:'DPE',         vals: listings.map(l => l.dpe || '—') },
    { id:'score',   label:'Score',       vals: listings.map(l => `${l.trust_score}/100`) },
    { id:'price',   label:'Prix',        vals: listings.map(l => formatPrice(l)) },
  ]

  const colW = Math.floor(820 / listings.length)

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center gap-4">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-900 transition-colors">
            <Icons.ChevronLeft size={16} /> Retour
          </button>
          <span className="text-slate-200">/</span>
          <span className="font-extrabold text-navy-900 text-sm">Comparaison de biens</span>
          <span className="ml-auto text-xs text-slate-400">{listings.length} bien{listings.length>1?'s':''} comparé{listings.length>1?'s':''}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 560 }}>
            <colgroup>
              <col style={{ width:130 }} />
              {listings.map(l => <col key={l.id} style={{ width:colW }} />)}
            </colgroup>

            {/* Header: listing cards */}
            <thead>
              <tr>
                <th />
                {listings.map((l, i) => (
                  <th key={l.id} className="px-2 pb-4 align-top">
                    <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay:i*0.1 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-soft">
                      <div className="relative overflow-hidden" style={{ aspectRatio:'4/3' }}>
                        <img src={l.image_url || unsplash('photo-1560448204-e02f11c3d0e2', 600)} alt={l.title}
                          className="w-full h-full object-cover"
                          onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 600) }} />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                        {l.is_premium && (
                          <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Premium</div>
                        )}
                        <button onClick={() => setFavd(f => ({ ...f, [l.id]:!f[l.id] }))}
                          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center transition-colors hover:bg-white">
                          <svg viewBox="0 0 24 24" style={{ width:12, height:12, color: favd[l.id] ? '#EF4444' : '#94A3B8' }}
                            fill={favd[l.id] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </button>
                        <button onClick={() => setCompareList(p => p.filter(x => x.id !== l._raw.id))}
                          className="absolute bottom-2 right-2 w-6 h-6 bg-red-500/90 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">
                          <Icons.X size={11} />
                        </button>
                      </div>
                      <div className="p-3">
                        <div className="font-bold text-navy-900 text-sm truncate mb-0.5">{l.title}</div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Icons.MapPin size={10} className="text-orange-500 shrink-0" />
                          <span className="truncate">{l.location}</span>
                        </div>
                        <div className="text-base font-extrabold text-orange-600 mt-1.5">{formatPrice(l)}</div>
                      </div>
                    </motion.div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Data rows */}
            <tbody>
              {ROWS.map((row, ri) => (
                <motion.tr key={row.id}
                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: 0.2 + ri*0.06 }}>
                  <td className="py-3 pr-4 text-sm font-semibold text-slate-500 whitespace-nowrap align-middle">{row.label}</td>
                  {listings.map((l, ci) => {
                    const isWinner = best[row.id] === ci && row.id !== 'price' || (row.id === 'price' && best.price === ci)
                    const isDpe = row.id === 'dpe'
                    return (
                      <td key={l.id} className="py-3 px-2 align-middle">
                        <div className={`rounded-xl px-3 py-2.5 text-center text-sm font-bold transition-all ${isWinner ? 'bg-emerald-50 border border-emerald-200 shadow-sm' : 'bg-slate-50'}`}>
                          {isDpe ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg font-extrabold text-white text-sm"
                              style={{ background: EST_DPE_COLORS[row.vals[ci]] || '#94A3B8' }}>
                              {row.vals[ci]}
                            </span>
                          ) : (
                            <span style={{ color: isWinner ? '#059669' : '#334155' }}>{row.vals[ci]}</span>
                          )}
                          {isWinner && row.id !== 'price' && row.vals[ci] !== '—' && (
                            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Meilleur</div>
                          )}
                          {row.id === 'price' && isWinner && (
                            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Moins cher</div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
            </tbody>

            {/* CTA row */}
            <tfoot>
              <tr>
                <td className="pt-5" />
                {listings.map((l, i) => (
                  <td key={l.id} className="pt-5 px-2">
                    <button onClick={() => onOpenListing?.(l._raw, l._idx)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2">
                      Voir <Icons.ArrowRight size={14} />
                    </button>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
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
