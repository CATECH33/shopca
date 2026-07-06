import React from 'react'

/* Stub commun à toutes les pages ManagerIT — sera remplacé par les vraies vues */
export default function PageShell({ title, description, color = '#FF6B00' }) {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        {description && (
          <p style={{ fontSize: 14, color: '#64748B', marginTop: 6, maxWidth: 560, lineHeight: 1.6 }}>
            {description}
          </p>
        )}
      </div>

      {/* Placeholder */}
      <div style={{
        borderRadius: 16, border: `2px dashed ${color}40`,
        background: `${color}08`,
        padding: '60px 32px', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 52, height: 52, borderRadius: 14,
          background: `${color}18`, marginBottom: 16,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
          Section en construction
        </div>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>
          L'architecture est en place · Les fonctionnalités seront ajoutées lors des prochaines étapes.
        </div>
      </div>
    </div>
  )
}
