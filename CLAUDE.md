# Directives de Développement - SHOPCA SaaS

## 🚫 RÈGLES IMPÉRATIVES CODE
- **AUCUN IMPORT LUCIDE-REACT :** Utiliser uniquement les SVG de l'objet global `Icons` présent en haut du fichier principal pour éliminer tout risque d'Erreur 500.
- **GESTION NAVIGATION :** Architecture Single Page Application (SPA). Changement de vue dicté par l'état `currentView` ('home', 'acheter', 'louer', 'publier', 'admin').
- **PERFORMANCES UI :** Transitions fluides, design premium sombre/navy avec touches orange pour les boutons d'action.

## 💻 ACCÈS COMMANDES
- Lancement : `npm run dev`
- Build de production : `npm run build`
