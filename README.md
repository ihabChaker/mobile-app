# HistoRando Mobile App

Application mobile React Native pour l'exploration historique de la Normandie durant la Seconde Guerre mondiale.

## 🚀 Configuration

### Prérequis
- Node.js >= 18
- npm ou yarn
- Expo Go installé sur votre appareil mobile ([iOS](https://apps.apple.com/app/apple-store/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

```bash
cd mobile-app
npm install
```

## 🎯 Lancement de l'application

### Mode développement

```bash
npm start
```

Puis scannez le QR code avec :
- **iOS** : Appareil photo natif
- **Android** : Application Expo Go

### Autres commandes

```bash
# Ouvrir sur Android
npm run android

# Ouvrir sur iOS
npm run ios

# Ouvrir dans le navigateur
npm run web

# Redémarrer avec cache nettoyé
npx expo start --clear
```

## 🎨 Palette de couleurs

```typescript
{
  primary: '#6E5849',      // Marron terre
  secondary: '#7B8A5D',    // Vert kaki
  background: '#DCC9A6',   // Beige sable
  surface: '#F5F3EE',      // Blanc cassé
  text: '#3E3E3E',         // Noir doux
}
```

## 📱 Fonctionnalités implémentées

### ✅ Phase 1 - Authentification
- [x] Écran Welcome avec logo
- [x] Écran Login
- [x] Écran Register
- [x] Intégration Redux pour l'authentification
- [x] Persistence des données avec AsyncStorage
- [x] Navigation conditionnelle (Auth vs Main)

### ✅ Configuration
- [x] TypeScript strict mode
- [x] ESLint + Prettier
- [x] Système de thème complet
- [x] Services API avec Axios
- [x] Redux Toolkit + RTK Query
- [x] Navigation (Stack + Top Tabs)

### 🔄 En cours
- [ ] Écrans principaux (Parcours, Carte, Profil)
- [ ] Intégration Maps avec parcours
- [ ] Lecteur de podcasts
- [ ] Système de quiz
- [ ] Challenges et récompenses
- [ ] Chasse au trésor (QR codes)

## 🔗 Backend API

**URL de production** : `https://histo-rando-backend-egvh3.ondigitalocean.app`

**Documentation Swagger** : `https://histo-rando-backend-egvh3.ondigitalocean.app/api/docs`

## 📂 Structure du projet

```
mobile-app/
├── src/
│   ├── components/       # Composants réutilisables
│   ├── navigation/       # Configuration navigation
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── RootNavigator.tsx
│   ├── screens/          # Écrans de l'app
│   │   ├── auth/         # Welcome, Login, Register
│   │   └── main/         # Parcours, Carte, Profil
│   ├── services/         # Services API
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   ├── store/            # Redux store
│   │   ├── slices/       # Redux slices
│   │   ├── hooks.ts
│   │   └── store.ts
│   ├── theme/            # Système de design
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── shadows.ts
│   ├── types/            # TypeScript types
│   └── utils/            # Utilitaires
├── assets/               # Images, fonts, etc.
├── App.tsx              # Point d'entrée
└── package.json
```

## 🧪 Testing

### Tester l'authentification

1. Lancez l'application avec `npm start`
2. Scannez le QR code avec Expo Go
3. Sur l'écran Welcome, cliquez sur "Créer un compte"
4. Remplissez le formulaire d'inscription :
   - Prénom : Jean
   - Nom : Dupont
   - Username : jean_dupont
   - Email : jean@test.com
   - Mot de passe : test1234
5. Cliquez sur "S'inscrire"
6. Vous devriez être redirigé vers l'écran principal avec les tabs

### Tester la déconnexion

1. Allez dans l'onglet "Profil"
2. Cliquez sur "Se déconnecter"
3. Vous revenez à l'écran Welcome

## 🐛 Dépannage

### Erreur "Metro bundler has encountered an internal error"
```bash
npx expo start --clear
```

### Erreur de dépendances
```bash
rm -rf node_modules
npm install
```

### L'app ne se connecte pas au backend
- Vérifiez que l'URL backend est correcte dans `src/services/api.service.ts`
- Vérifiez votre connexion internet
- Testez l'API directement : `https://histo-rando-backend-egvh3.ondigitalocean.app/api/docs`

## 📝 Notes de développement

- **Backend URL** : Production sur DigitalOcean
- **React Native** : Expo managed workflow (SDK 54)
- **Navigation** : Top Tabs (Material Design)
- **State Management** : Redux Toolkit
- **API Calls** : RTK Query + Axios
- **Persistence** : Redux Persist + AsyncStorage

## 👥 Équipe

Développé pour HistoRando - Découvrez l'histoire de la Normandie
