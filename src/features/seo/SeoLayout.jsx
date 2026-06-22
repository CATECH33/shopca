import React from 'react'
import { Link } from 'react-router-dom'

function Breadcrumb({ items }) {
  return (
    <nav aria-label="Fil d'ariane" className="text-sm text-slate-500 mb-6">
      <ol className="flex flex-wrap gap-1 items-center">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-slate-300">/</span>}
            {item.url
              ? <Link to={item.url} className="hover:text-orange-500 transition">{item.name}</Link>
              : <span className="text-slate-700 font-semibold">{item.name}</span>
            }
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function SeoSection({ title, children, className = '' }) {
  return (
    <section className={`max-w-5xl mx-auto px-4 py-8 ${className}`}>
      {title && <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">{title}</h2>}
      {children}
    </section>
  )
}

export function FaqItem({ q, a }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-[#0B1F3A] hover:bg-slate-50 transition"
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className={`text-orange-500 text-lg transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-slate-600 text-sm leading-relaxed">{a}</div>
      )}
    </div>
  )
}

export default function SeoLayout({ breadcrumb, hero, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0B1F3A 0%,#1a3a6b 100%)' }} className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          {breadcrumb && (
            <nav className="mb-4">
              <ol className="flex flex-wrap gap-1 items-center text-sm text-white/50">
                {breadcrumb.map((item, i) => (
                  <li key={i} className="flex items-center gap-1">
                    {i > 0 && <span>/</span>}
                    {item.url
                      ? <Link to={item.url} className="hover:text-white transition">{item.name}</Link>
                      : <span className="text-white font-semibold">{item.name}</span>
                    }
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {hero}
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {children}
      </div>

      {/* Footer mini */}
      <footer className="border-t border-slate-200 mt-16 py-8 text-center text-sm text-slate-400">
        <Link to="/" className="text-orange-500 font-semibold">PASMAL</Link>
        {' '}— Plateforme immobilière premium ·{' '}
        <Link to="/annonces" className="hover:text-slate-600">Annonces</Link>{' · '}
        <Link to="/agences"  className="hover:text-slate-600">Agences</Link>{' · '}
        <Link to="/guides"   className="hover:text-slate-600">Guides</Link>
      </footer>
    </div>
  )
}
