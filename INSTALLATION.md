# 📱 Guide d'Installation - HistoRando Mobile App

Guide complet pour installer et lancer l'application mobile HistoRando.

## 📋 Prérequis

### Requis pour tous les systèmes

- **Node.js** : version 18.x ou supérieure
- **npm** ou **yarn** : gestionnaire de paquets
- **Git** : pour cloner le dépôt

Vérifier les versions installées :

```bash
node --version    # doit être >= 18.x
npm --version     # doit être >= 9.x
```

### Pour le développement iOS (macOS uniquement)

- **macOS** : version 12 (Monterey) ou supérieure
- **Xcode** : version 14 ou supérieure (depuis l'App Store)
- **CocoaPods** : gestionnaire de dépendances iOS
  ```bash
  sudo gem install cocoapods
  ```

### Pour le développement Android

- **Android Studio** : dernière version stable
- **JDK** : version 17 ou supérieure
- **Android SDK** : API level 33 ou supérieure
- **Variables d'environnement** :
  ```bash
  # Ajouter à ~/.bashrc ou ~/.zshrc
  export ANDROID_HOME=$HOME/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  export PATH=$PATH:$ANDROID_HOME/tools
  export PATH=$PATH:$ANDROID_HOME/tools/bin
  ```

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <URL_DU_DEPOT>
cd histo_rando/mobile-app
```

### 2. Installer les dépendances

```bash
npm install
```

ou avec yarn :

```bash
yarn install
```

### 3. Configuration

#### Configuration de l'API

Créer un fichier `.env` à la racine du dossier `mobile-app` :

```bash
# Exemple de configuration
API_BASE_URL=http://localhost:3000/api
```

> **Note** : Ajustez l'URL selon votre environnement (local, staging, production)

#### Configuration Google Maps (Android)

1. Obtenir une clé API Google Maps depuis la [Google Cloud Console](https://console.cloud.google.com/)
2. Éditer le fichier [`app.json`](app.json) :
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "VOTRE_CLE_API_ICI"
       }
     }
   }
   ```

### 4. Installation spécifique iOS (macOS uniquement)

```bash
cd ios
pod install
cd ..
```

## 🎯 Lancement de l'application

### Méthode 1 : Script de démarrage rapide (Recommandé)

```bash
chmod +x start.sh
./start.sh
```

Ce script :

- Vérifie les dépendances
- Nettoie le cache
- Lance le serveur de développement Expo

### Méthode 2 : Commandes manuelles

#### Démarrer le serveur de développement

```bash
npm start
# ou
npx expo start
```

#### Lancer sur Android

**Option A : Émulateur Android**

```bash
npm run android
# ou
npx expo run:android
```

**Option B : Appareil physique**

1. Activer le mode développeur sur votre appareil Android
2. Activer le débogage USB
3. Connecter l'appareil via USB
4. Exécuter `npm run android`

#### Lancer sur iOS (macOS uniquement)

**Option A : Simulateur iOS**

```bash
npm run ios
# ou
npx expo run:ios
```

**Option B : Appareil physique**

1. Ouvrir le projet dans Xcode : `ios/mobileapp.xcworkspace`
2. Sélectionner votre appareil
3. Cliquer sur "Run"

#### Lancer sur le web

```bash
npm run web
# ou
npx expo start --web
```

### Méthode 3 : Expo Go (Développement rapide)

1. **Installer Expo Go** sur votre appareil mobile :
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Démarrer le serveur** :

   ```bash
   npx expo start
   ```

3. **Scanner le QR code** :
   - iOS : Utiliser l'appareil photo natif
   - Android : Utiliser l'app Expo Go

## 🛠️ Scripts disponibles

| Script             | Description                                       |
| ------------------ | ------------------------------------------------- |
| `npm start`        | Lance le serveur de développement Expo            |
| `npm run android`  | Compile et lance sur Android (émulateur/appareil) |
| `npm run ios`      | Compile et lance sur iOS (simulateur/appareil)    |
| `npm run web`      | Lance l'application dans le navigateur            |
| `npm run lint`     | Vérifie le code avec ESLint                       |
| `npm run lint:fix` | Corrige automatiquement les erreurs de linting    |

## 📦 Structure du projet

```
mobile-app/
├── src/                    # Code source de l'application
│   ├── components/         # Composants réutilisables
│   ├── screens/            # Écrans de l'application
│   ├── navigation/         # Configuration de la navigation
│   ├── services/           # Services API et logique métier
│   ├── store/              # State management (Redux)
│   └── utils/              # Fonctions utilitaires
├── assets/                 # Images, icônes, fichiers statiques
├── android/                # Code natif Android
├── ios/                    # Code natif iOS
├── app.json               # Configuration Expo
├── package.json           # Dépendances et scripts
└── tsconfig.json          # Configuration TypeScript
```

## 🔧 Dépendances principales

### Navigation

- `@react-navigation/native` : Navigation entre écrans
- `@react-navigation/native-stack` : Stack navigation
- `@react-navigation/bottom-tabs` : Navigation par onglets
- `@react-navigation/material-top-tabs` : Onglets matériels

### State Management

- `@reduxjs/toolkit` : Gestion d'état moderne
- `react-redux` : Intégration Redux avec React
- `redux-persist` : Persistance de l'état

### Fonctionnalités natives

- `expo-camera` : Accès à la caméra (scan QR codes)
- `expo-location` : Géolocalisation
- `expo-audio` : Lecture audio
- `react-native-maps` : Cartes interactives

### UI/UX

- `react-native-paper` : Composants Material Design
- `react-native-gesture-handler` : Gestion des gestes
- `react-native-reanimated` : Animations performantes

### API & Données

- `axios` : Requêtes HTTP
- `@react-native-async-storage/async-storage` : Stockage local

## ❗ Dépannage

### Erreur : "Metro bundler ne démarre pas"

```bash
# Nettoyer le cache
npx expo start --clear

# ou
rm -rf node_modules
npm install
```

### Erreur : "Unable to resolve module"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur Android : "SDK location not found"

Créer le fichier `android/local.properties` :

```properties
sdk.dir=/Users/VOTRE_NOM/Library/Android/sdk  # macOS
# ou
sdk.dir=C:\\Users\\VOTRE_NOM\\AppData\\Local\\Android\\Sdk  # Windows
```

### Erreur iOS : "CocoaPods not installed"

```bash
sudo gem install cocoapods
cd ios
pod install
cd ..
```

### Erreur : "Port 8081 already in use"

```bash
# Trouver et tuer le processus
lsof -ti:8081 | xargs kill -9

# ou spécifier un autre port
npx expo start --port 8082
```

### Problèmes de performances sur l'émulateur

- **Android** : Augmenter la RAM de l'AVD à 2048 MB minimum
- **iOS** : Utiliser un simulateur récent (iPhone 14 ou supérieur)

### Erreur de build native

```bash
# Android
cd android
./gradlew clean
cd ..

# iOS
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

## 🔐 Permissions

L'application nécessite les permissions suivantes :

### Android

- `CAMERA` : Scanner les QR codes
- `ACCESS_FINE_LOCATION` : Suivi GPS du parcours
- `ACCESS_COARSE_LOCATION` : Position approximative

### iOS

- `NSCameraUsageDescription` : Accès à la caméra
- `NSLocationWhenInUseUsageDescription` : Accès à la localisation

Les permissions sont configurées dans [`app.json`](app.json).

## 📱 Build de production

### Android (APK/AAB)

```bash
# Build local
npx eas build --platform android --local

# Build sur les serveurs Expo
npx eas build --platform android --profile production
```

### iOS (IPA)

```bash
# Build local (macOS uniquement)
npx eas build --platform ios --local

# Build sur les serveurs Expo
npx eas build --platform ios --profile production
```

> **Note** : Les builds de production nécessitent un compte Expo. Créez-en un sur [expo.dev](https://expo.dev)

## 📚 Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation React Native](https://reactnative.dev/docs/getting-started)
- [Documentation React Navigation](https://reactnavigation.org/docs/getting-started)
- [Documentation Redux Toolkit](https://redux-toolkit.js.org/)

## 🆘 Support

En cas de problème :

1. Vérifier la section [Dépannage](#-dépannage)
2. Consulter les logs : `npx expo start --verbose`
3. Vérifier les issues existantes sur le dépôt Git
4. Créer une nouvelle issue avec les détails du problème

## 📝 Notes importantes

- **Node.js** : Utiliser une version LTS (Long Term Support)
- **React Native** : Version 0.81.5 (basée sur Expo 54)
- **Expo SDK** : Version 54.x
- **TypeScript** : Activé sur tout le projet
- **New Architecture** : Activée (`newArchEnabled: true`)

## ✅ Checklist de vérification

Avant de commencer le développement :

- [ ] Node.js >= 18.x installé
- [ ] npm ou yarn installé
- [ ] Dépendances installées (`npm install`)
- [ ] Variables d'environnement configurées (`.env`)
- [ ] Émulateur/Simulateur configuré OU appareil physique connecté
- [ ] Serveur backend accessible (si applicable)
- [ ] Permissions configurées correctement

---

**Version** : 1.2.0  
**Dernière mise à jour** : Janvier 2026  
**Expo SDK** : 54.x  
**React Native** : 0.81.5
