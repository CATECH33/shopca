# Architecture Technique : SHOPCA Ecosystem

## 🏗️ Structure des Fichiers
```text
shopca-saas/
├── src/
│   ├── components/      # Boutons, Modals (ex: UpsellModal.jsx)
│   ├── views/           # Pages (Home.jsx, AdminDashboard.jsx)
│   ├── context/         # AuthContext, PaymentContext
│   ├── App.jsx          # Point d'entrée applicatif principal
│   └── main.jsx
├── .env                 # Variables d'environnement secrètes
├── .htaccess            # Règles de redirection Apache pour Hostinger
├── CLAUDE.md            # Règles de comportement IA
└── README.md            # Manuel d'installation globale