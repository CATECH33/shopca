/**
 * SHOPCA — Fonction Supabase Edge pour l'envoi d'emails transactionnels via Resend.
 *
 * Appel depuis le client ou d'autres Edge Functions :
 *   supabase.functions.invoke('send-email', { body: { type, to, data } })
 *
 * Types supportés :
 *   'welcome'            — Email de bienvenue après inscription
 *   'subscription'       — Confirmation d'abonnement/achat
 *   'alert_notification' — Nouvelle annonce correspondant à une alerte
 *   'password_reset'     — Réinitialisation de mot de passe
 */

const RESEND_API = 'https://api.resend.com/emails'

const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@shopca.fr'
const FROM_NAME  = Deno.env.get('RESEND_FROM_NAME')  || 'SHOPCA'
const FROM       = `${FROM_NAME} <${FROM_EMAIL}>`
const APP_URL    = Deno.env.get('VITE_APP_URL') || 'https://shopca.fr'

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Shared HTML shell ──────────────────────────────────────────────────
function shell(content: string, previewText = ''): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>SHOPCA</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#F1F5F9;">${previewText}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr><td style="background:#0B1F3A;padding:28px 40px;text-align:center;">
          <a href="${APP_URL}" style="text-decoration:none;">
            <span style="font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">SHOP<span style="color:#F97316;">CA</span></span>
          </a>
          <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:0.5px;text-transform:uppercase;">Le Marché Immobilier Premium</p>
        </td></tr>

        <!-- BODY -->
        <tr><td style="padding:40px 40px 32px;">
          ${content}
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#F8FAFC;padding:24px 40px;border-top:1px solid #E2E8F0;">
          <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;line-height:1.6;">
            SHOPCA — Le Marché Immobilier Premium<br>
            <a href="${APP_URL}" style="color:#F97316;text-decoration:none;">${APP_URL.replace('https://', '')}</a>
            &nbsp;·&nbsp;
            <a href="mailto:support@shopca.fr" style="color:#94A3B8;text-decoration:none;">support@shopca.fr</a>
            &nbsp;·&nbsp;
            <a href="${APP_URL}/confidentialite" style="color:#94A3B8;text-decoration:none;">Confidentialité</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Templates ──────────────────────────────────────────────────────────
function tplWelcome(data: { firstName?: string }): { subject: string; html: string } {
  const name = data.firstName ? `, ${data.firstName}` : ''
  return {
    subject: `Bienvenue sur SHOPCA ${name.trim() || '!'} 🏠`,
    html: shell(`
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#0F172A;">Bienvenue${name}&nbsp;!</h1>
      <p style="margin:0 0 24px;font-size:16px;color:#64748B;line-height:1.6;">Votre compte SHOPCA est prêt. Commencez à explorer des milliers d'annonces vérifiées en France.</p>

      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
        <tr>
          <td style="padding:10px 0;">
            <span style="color:#F97316;font-size:18px;">✓</span>
            <span style="margin-left:12px;font-size:15px;color:#334155;">Accès à +10 000 annonces vérifiées</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;">
            <span style="color:#F97316;font-size:18px;">✓</span>
            <span style="margin-left:12px;font-size:15px;color:#334155;">Alertes immobilières personnalisées</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;">
            <span style="color:#F97316;font-size:18px;">✓</span>
            <span style="margin-left:12px;font-size:15px;color:#334155;">Estimation gratuite de votre bien</span>
          </td>
        </tr>
      </table>

      <a href="${APP_URL}" style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;">Explorer les annonces →</a>

      <p style="margin:32px 0 0;font-size:14px;color:#94A3B8;line-height:1.6;">Des questions&nbsp;? Contactez-nous à <a href="mailto:support@shopca.fr" style="color:#F97316;text-decoration:none;">support@shopca.fr</a> — nous répondons en moins de 24h.</p>
    `, `Votre compte SHOPCA est activé — explorez des milliers d'annonces vérifiées.`),
  }
}

function tplSubscription(data: { firstName?: string; planName: string; amount: string; billingDate?: string }): { subject: string; html: string } {
  const name = data.firstName || 'là'
  return {
    subject: `Confirmation — ${data.planName} activé`,
    html: shell(`
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#0F172A;">Paiement confirmé !</h1>
      <p style="margin:0 0 28px;font-size:16px;color:#64748B;line-height:1.6;">Merci ${name}, votre accès <strong>${data.planName}</strong> est maintenant actif.</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;padding:24px;margin:0 0 28px;">
        <tr>
          <td style="font-size:13px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:6px;">Plan souscrit</td>
          <td style="text-align:right;font-size:15px;font-weight:700;color:#0F172A;padding-bottom:6px;">${data.planName}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:6px;">Montant</td>
          <td style="text-align:right;font-size:15px;font-weight:700;color:#0F172A;padding-bottom:6px;">${data.amount}</td>
        </tr>
        ${data.billingDate ? `<tr>
          <td style="font-size:13px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px;">Prochain renouvellement</td>
          <td style="text-align:right;font-size:15px;font-weight:700;color:#0F172A;">${data.billingDate}</td>
        </tr>` : ''}
      </table>

      <a href="${APP_URL}/dashboard" style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;">Accéder à mon espace →</a>

      <p style="margin:28px 0 0;font-size:13px;color:#94A3B8;line-height:1.6;">Pour toute question relative à votre abonnement, contactez <a href="mailto:support@shopca.fr" style="color:#F97316;text-decoration:none;">support@shopca.fr</a>. La facture sera disponible dans votre tableau de bord.</p>
    `, `Votre abonnement ${data.planName} est confirmé.`),
  }
}

function tplAlertNotification(data: { firstName?: string; listingTitle: string; listingCity: string; listingPrice?: number; listingUrl?: string }): { subject: string; html: string } {
  const price = data.listingPrice ? data.listingPrice.toLocaleString('fr-FR') + ' €' : ''
  const url   = data.listingUrl || APP_URL
  return {
    subject: `Nouvelle annonce : ${data.listingTitle}`,
    html: shell(`
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0F172A;">Nouvelle annonce correspondante</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.6;">Une annonce correspondant à votre alerte est disponible.</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;margin:0 0 28px;">
        <tr><td style="padding:20px 24px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;">
          <p style="margin:0;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px;">Annonce</p>
          <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#0F172A;">${data.listingTitle}</p>
        </td></tr>
        <tr><td style="padding:16px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:14px;color:#64748B;">📍 ${data.listingCity}</td>
              ${price ? `<td style="text-align:right;font-size:20px;font-weight:800;color:#F97316;">${price}</td>` : ''}
            </tr>
          </table>
        </td></tr>
      </table>

      <a href="${url}" style="display:inline-block;background:#0B1F3A;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;">Voir l'annonce →</a>

      <p style="margin:24px 0 0;font-size:13px;color:#94A3B8;line-height:1.6;">Vous recevez cet email car vous avez activé une alerte immobilière. <a href="${APP_URL}/dashboard/alertes" style="color:#94A3B8;">Gérer mes alertes</a></p>
    `, `${data.listingTitle} — ${data.listingCity}${price ? ' · ' + price : ''}`),
  }
}

function tplPasswordReset(data: { resetUrl: string }): { subject: string; html: string } {
  return {
    subject: 'Réinitialisation de votre mot de passe SHOPCA',
    html: shell(`
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0F172A;">Réinitialisez votre mot de passe</h1>
      <p style="margin:0 0 28px;font-size:16px;color:#64748B;line-height:1.6;">Vous avez demandé la réinitialisation de votre mot de passe SHOPCA. Cliquez sur le bouton ci-dessous pour en définir un nouveau.</p>

      <a href="${data.resetUrl}" style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;">Réinitialiser le mot de passe →</a>

      <p style="margin:28px 0 0;font-size:13px;color:#94A3B8;line-height:1.6;">Ce lien expire dans 1 heure. Si vous n'avez pas effectué cette demande, ignorez cet email — votre compte est en sécurité.</p>
    `, `Réinitialisez votre mot de passe SHOPCA — lien valide 1 heure.`),
  }
}

// ── Router ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY')
    if (!apiKey) return new Response(JSON.stringify({ error: 'RESEND_API_KEY manquante' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })

    const { type, to, data = {} } = await req.json()

    let tpl: { subject: string; html: string }
    switch (type) {
      case 'welcome':
        tpl = tplWelcome(data)
        break
      case 'subscription':
        tpl = tplSubscription(data)
        break
      case 'alert_notification':
        tpl = tplAlertNotification(data)
        break
      case 'password_reset':
        tpl = tplPasswordReset(data)
        break
      default:
        return new Response(JSON.stringify({ error: `Type inconnu: ${type}` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        })
    }

    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    FROM,
        to:      Array.isArray(to) ? to : [to],
        subject: tpl.subject,
        html:    tpl.html,
      }),
    })

    const result = await res.json()
    if (!res.ok) {
      console.error('[send-email] Resend error:', result)
      return new Response(JSON.stringify({ error: result.message || 'Erreur Resend' }), {
        status: res.status, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ id: result.id }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[send-email]', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
