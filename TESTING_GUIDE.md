# 📱 Guide de Test - HistoRando Mobile App

**Date** : 1 Décembre 2025  
**Version** : 1.2.0  
**Phase** : 2 - API Integration Complete

## 🎯 Objectif
Tester toutes les fonctionnalités de l'application mobile HistoRando avec intégration backend complète.

## 📋 Prérequis

### 1. Installer Expo Go
- **iOS** : [App Store](https://apps.apple.com/app/apple-store/id982107779)
- **Android** : [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 2. Vérifier le serveur Expo
- Le serveur Expo doit tourner sur le port **3001** (pour CORS)
- Un QR code devrait être visible dans le terminal
- URL Metro: `exp://10.39.148.1:3001`

### 3. Backend API
- URL: `https://histo-rando-backend-egvh3.ondigitalocean.app`
- API Docs: https://histo-rando-backend-egvh3.ondigitalocean.app/api/docs
- Status: ✅ Opérationnel

---

## 🚀 Démarrage Rapide

### Scanner le QR Code
1. **Android**: Ouvrez Expo Go → Scanner QR
2. **iOS**: Ouvrez Camera app → Scanner QR → Ouvrir avec Expo

### Premiers pas
1. App se charge → Écran Welcome
2. Créez un nouveau compte ou connectez-vous
3. Explorez les 3 tabs: Parcours | Carte | Profil

---

## ✅ Plan de Test Complet

### 🔐 Phase 1: Authentification

#### Test 1.1 : Écran Welcome
**Actions:**
- ✅ Vérifier logo HistoRando visible
- ✅ Bouton "Commencer" → Navigation vers Login
- ✅ Bouton "Créer un compte" → Navigation vers Register

**Critères de succès:**
- Navigation fluide sans crash
- Design conforme (couleurs marron/beige)

---

#### Test 1.2 : Inscription (Register)
**Actions:**
1. Remplir le formulaire:
   - Prénom: `Test`
   - Nom: `User`
   - Username: `testuser_[timestamp]` (ex: testuser_001)
   - Email: `test_[timestamp]@test.com`
   - Mot de passe: `Test1234!`
   - Confirmation: `Test1234!`
2. Appuyer sur "S'inscrire"

**Critères de succès:**
- ✅ Validation côté client (email valide, password match)
- ✅ Loader pendant l'appel API
- ✅ Message de bienvenue après succès
- ✅ Redirection automatique vers MainTabs
- ✅ Token JWT stocké (Redux Persist)

**Erreurs à tester:**
- Email déjà existant → Message d'erreur clair
- Passwords différents → Validation immédiate
- Champs vides → Désactivation du bouton

---

#### Test 1.3 : Connexion (Login)
**Actions:**
1. Retour à l'écran Login (si déconnecté)
2. Email: `test_001@test.com` (votre compte créé)
3. Password: `Test1234!`
4. Appuyer sur "Se connecter"

**Critères de succès:**
- ✅ Loader pendant l'appel API
- ✅ Redirection vers MainTabs
- ✅ Persistance de session (fermer/rouvrir app)

**Erreurs à tester:**
- Mauvais credentials → Message "Email ou mot de passe incorrect"
- Champs vides → Bouton désactivé

---

### 🗺️ Phase 2: Parcours & Navigation

#### Test 2.1 : Liste des Parcours
**Actions:**
1. Onglet "Parcours" actif par défaut
2. Observer le chargement
3. Pull-to-refresh (glisser vers le bas)

**Critères de succès:**
- ✅ Loader au chargement initial
- ✅ Liste de parcours affichée (cards avec images)
- ✅ Chaque card montre:
  - Image ou placeholder
  - Titre du parcours
  - Badge difficulté (couleur adaptée)
  - Distance en km
  - Durée en minutes
- ✅ Pull-to-refresh fonctionne
- ✅ Scroll fluide sans lag

**État vide à tester:**
- Si backend retourne 0 parcours → Message informatif

---

#### Test 2.2 : Détail d'un Parcours
**Actions:**
1. Depuis la liste, appuyer sur un parcours
2. Observer l'écran de détail
3. Scroller pour voir toutes les sections
4. Appuyer sur le bouton "Démarrer le parcours"

**Critères de succès:**
- ✅ Navigation fluide vers ParcoursDetailScreen
- ✅ Header avec bouton retour
- ✅ Image parcours ou placeholder
- ✅ Badge difficulté positionné sur l'image
- ✅ Titre et description complets
- ✅ **Grid de stats** (3 cards):
  - Distance
  - Durée estimée
  - Difficulté
- ✅ **Section Points d'Intérêt**:
  - Nombre de POIs affiché
  - Liste des POIs avec:
    - Numéro séquentiel
    - Icône selon type (monument 🏛️, bunker 🛡️, etc.)
    - Nom et type
    - Description (2 lignes max)
    - Durée de visite si disponible
  - Message si aucun POI
- ✅ **Section Itinéraire**:
  - Point de départ (coordonnées GPS)
  - Point d'arrivée (coordonnées GPS)
- ✅ **Section Recommandations**:
  - 4 conseils affichés
- ✅ **Bouton FAB "Démarrer le parcours"**:
  - Fixé en bas
  - Dialog de confirmation
  - Appel API au backend (POST /activities)
  - Message de succès

**POIs à vérifier:**
- Icônes correctes par type
- Ordre des POIs cohérent
- Styles et espacement propres

---

#### Test 2.3 : Carte Interactive
**Actions:**
1. Onglet "Carte"
2. Autoriser la géolocalisation (popup)
3. Observer la carte
4. Zoomer/Dézoomer
5. Appuyer sur les marqueurs

**Critères de succès:**
- ✅ Demande permission localisation
- ✅ Carte chargée (react-native-maps)
- ✅ Position utilisateur visible (point bleu)
- ✅ **Marqueurs de parcours** (départs):
  - Couleur primaire (marron)
  - Titre: 🚩 [Nom parcours]
  - Description: distance et durée
- ✅ **Marqueurs de POIs**:
  - Couleur secondaire (vert)
  - Icône selon type dans le titre
  - Nom du POI
- ✅ Info card en haut:
  - Titre "Carte Interactive"
  - Nombre de parcours
  - Nombre de POIs
  - **Légende**: 🚩 Départ / 📍 POIs
- ✅ Contrôles carte (zoom, boussole)
- ✅ Région par défaut: Normandie

**Sur Web (si testé):**
- Message informatif "Carte disponible sur mobile uniquement"

---

#### Test 2.4 : Profil Utilisateur
**Actions:**
1. Onglet "Profil"
2. Observer les données
3. Appuyer sur "Paramètres" (placeholder)
4. Appuyer sur "Se déconnecter"

**Critères de succès:**
- ✅ Avatar avec initiales (prénom + nom)
- ✅ Nom complet affiché
- ✅ **3 Stats Cards**:
  - Points: valeur + icône
  - Niveau: valeur + icône
  - Badges: valeur + icône
- ✅ Barre de progression niveau:
  - % vers niveau suivant
  - Texte "75 pts vers niveau 3" (exemple)
- ✅ **Section Informations**:
  - Membre depuis: [date formatée]
  - Parcours effectués: nombre
  - POI visités: nombre
- ✅ **Boutons d'action**:
  - Paramètres
  - Mes statistiques
  - Mes récompenses
- ✅ Bouton "Se déconnecter":
  - Dialog de confirmation
  - Retour à WelcomeScreen
  - Suppression du token

---

### 🔄 Phase 3: Intégration Backend

#### Test 3.1 : Vérification API - Parcours
**Actions:**
1. Observer la console Expo (logs)
2. Charger la liste des parcours
3. Vérifier les appels réseau

**Critères de succès:**
- ✅ GET `/parcours` → Status 200
- ✅ Données parcours correctes
- ✅ Images chargées (ou placeholder)
- ✅ Pas d'erreurs CORS

**Logs attendus:**
```
[API] GET /parcours
[API] Response: 200 - 5 parcours
```

---

#### Test 3.2 : Vérification API - POIs
**Actions:**
1. Ouvrir un parcours detail
2. Observer le chargement des POIs
3. Vérifier la carte (marqueurs POIs)

**Critères de succès:**
- ✅ GET `/poi/parcours/{id}` → Status 200
- ✅ POIs affichés dans le détail
- ✅ POIs affichés sur la carte
- ✅ Icônes correctes selon type

---

#### Test 3.3 : Vérification API - Activities
**Actions:**
1. Dans ParcoursDetail, appuyer "Démarrer le parcours"
2. Confirmer dans le dialog
3. Observer les logs

**Critères de succès:**
- ✅ POST `/activities` avec `{parcoursId: X}`
- ✅ Status 201 Created
- ✅ Message de succès affiché
- ✅ Aucune erreur

**Logs attendus:**
```
[API] POST /activities {"parcoursId": 1}
[API] Response: 201 - Activity created
```

---

#### Test 3.4 : Vérification API - User Stats
**Actions:**
1. Aller sur l'onglet Profil
2. Observer les statistiques
3. Vérifier les données utilisateur

**Critères de succès:**
- ✅ GET `/users/me` → Status 200
- ✅ GET `/users/me/stats` → Status 200
- ✅ Points, niveau, badges affichés
- ✅ Parcours et POI comptabilisés

---

### 🐛 Phase 4: Gestion d'Erreurs

#### Test 4.1 : Pas de connexion Internet
**Actions:**
1. Activer le mode avion
2. Essayer de charger les parcours
3. Pull-to-refresh

**Critères de succès:**
- ✅ Message d'erreur approprié
- ✅ Pas de crash
- ✅ Possibilité de réessayer

---

#### Test 4.2 : Token Expiré
**Actions:**
1. Se connecter
2. Attendre 7 jours (ou modifier le token manuellement)
3. Faire une requête

**Critères de succès:**
- ✅ Interceptor détecte 401
- ✅ Déconnexion automatique
- ✅ Redirection vers Login
- ✅ Message informatif

---

#### Test 4.3 : Backend Indisponible
**Actions:**
1. Si backend down (simuler)
2. Tenter actions API

**Critères de succès:**
- ✅ Timeout géré (30s max)
- ✅ Message d'erreur clair
- ✅ Pas de crash app

---

### 📱 Phase 5: UX & Performance

#### Test 5.1 : Navigation
**Actions:**
1. Naviguer entre tous les écrans
2. Utiliser boutons retour
3. Tester tabs multiples fois

**Critères de succès:**
- ✅ Transitions fluides (60fps)
- ✅ Aucun lag perceptible
- ✅ Bouton retour fonctionne partout
- ✅ Tabs restent accessibles

---

#### Test 5.2 : Persistance
**Actions:**
1. Se connecter
2. Fermer complètement l'app
3. Rouvrir l'app

**Critères de succès:**
- ✅ Reste connecté (Redux Persist)
- ✅ Profil chargé
- ✅ Aucune re-connexion nécessaire

---

#### Test 5.3 : Design Responsive
**Actions:**
1. Tester sur petit écran (iPhone SE)
2. Tester sur grand écran (iPad, Android tablet)
3. Rotation portrait/paysage

**Critères de succès:**
- ✅ Layouts adaptés
- ✅ Textes lisibles
- ✅ Boutons accessibles
- ✅ Images bien dimensionnées

---

## 📊 Checklist Finale

### Fonctionnalités Core
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Déconnexion fonctionne
- [ ] Liste parcours chargée depuis API
- [ ] Détail parcours avec POIs
- [ ] Démarrage parcours (POST activity)
- [ ] Carte avec marqueurs parcours
- [ ] Carte avec marqueurs POIs
- [ ] Profil avec stats réelles
- [ ] Navigation fluide

### Intégration API
- [ ] Tous les endpoints répondent
- [ ] JWT interceptor fonctionne
- [ ] Gestion erreurs 401/403/500
- [ ] Timeout géré
- [ ] CORS OK (port 3001)

### UX/UI
- [ ] Design conforme palette couleurs
- [ ] Typography cohérente
- [ ] Shadows et espacements corrects
- [ ] Animations fluides
- [ ] Loading states partout
- [ ] Messages d'erreur clairs

### Edge Cases
- [ ] Aucun parcours disponible
- [ ] Aucun POI pour un parcours
- [ ] Pas de connexion internet
- [ ] Backend down
- [ ] Token expiré
- [ ] Champs formulaire vides

---

## 🚨 Problèmes Connus

### CORS (Résolu)
- ✅ App doit tourner sur port 3001
- ✅ Commande: `npx expo start --port 3001`

### Web Platform
- ⚠️ Carte non disponible sur web (react-native-maps)
- ✅ Message informatif affiché

---

## 📝 Rapporter un Bug

### Informations à fournir
1. **Plateforme**: iOS / Android / Web
2. **Version OS**: (ex: iOS 17.1)
3. **Étape reproduire le bug**:
   - Action 1
   - Action 2
   - Résultat attendu vs obtenu
4. **Screenshot** si possible
5. **Logs Expo** (dans terminal)

---

## ✅ Validation Test Complète

**Testeur**: _________________  
**Date**: _________________  
**Plateforme**: _________________  
**Verdict**: ✅ Approuvé / ❌ Bugs trouvés

**Notes**:
_____________________________________
_____________________________________
_____________________________________

---

**Dernière mise à jour**: 1 Décembre 2025  
**Prochaine version**: Phase 3 - Podcasts & Audio
- ✅ Écran placeholder avec texte "Parcours" et "Liste des parcours historiques"

#### Tab "Carte"
- Appuyez sur "Carte"
- ✅ Écran placeholder avec texte "Carte" et "Carte interactive des parcours"

#### Tab "Profil"
- Appuyez sur "Profil"
- ✅ Voir votre profil avec :
  - Votre nom complet
  - Votre email
  - Vos statistiques (Points : 0, Niveau : 1)
  - Bouton rouge "Se déconnecter"

---

### Test 5 : Déconnexion
**Dans l'onglet Profil :**
1. Appuyez sur le bouton rouge "Se déconnecter"
2. ✅ Retour automatique à l'écran Welcome

**Reconnexion :**
1. Appuyez sur "Commencer"
2. Utilisez les mêmes identifiants que lors de l'inscription
3. ✅ Connexion réussie, retour au profil avec vos données

---

### Test 6 : Persistence (Redux Persist)
**Test de fermeture/réouverture :**
1. Connectez-vous à l'application
2. Fermez complètement l'app Expo Go (swipe up / tâche en arrière-plan)
3. Rouvrez Expo Go
4. Rescannez le QR code
5. ✅ Vous devriez être **toujours connecté** (pas besoin de se reconnecter)

---

## 🎨 Vérifications Design

### Palette de couleurs à observer :
- **Marron terre** (#6E5849) : Boutons principaux, tabs actifs
- **Beige sable** (#DCC9A6) : Arrière-plan général
- **Vert kaki** (#7B8A5D) : Éléments secondaires
- **Blanc cassé** (#F5F3EE) : Surfaces (inputs)
- **Noir doux** (#3E3E3E) : Textes

### Points de design à vérifier :
- ✅ Tous les boutons ont des coins arrondis (12px)
- ✅ Les ombres sont visibles sous les boutons
- ✅ Les inputs ont des bordures beige
- ✅ La typographie est cohérente
- ✅ Les espacements sont réguliers

---

## 🐛 Bugs potentiels à signaler

### Si vous voyez ces erreurs, veuillez noter :

1. **Erreur "Network Error"**
   - Vérifiez votre connexion internet
   - Le backend est-il accessible ? Testez : https://histo-rando-backend-egvh3.ondigitalocean.app/api/docs

2. **L'app crash au lancement**
   - Notez le message d'erreur exact
   - Prenez une capture d'écran

3. **Problèmes d'affichage**
   - Logo ne s'affiche pas
   - Couleurs incorrectes
   - Éléments mal alignés

4. **Navigation ne fonctionne pas**
   - Les boutons ne répondent pas
   - Les tabs ne changent pas

5. **Formulaires**
   - Validation incorrecte
   - Messages d'erreur non affichés
   - Champs ne se remplissent pas

---

## 📊 Checklist complète

Cochez au fur et à mesure de vos tests :

### Écrans
- [ ] Welcome screen s'affiche correctement
- [ ] Login screen fonctionne
- [ ] Register screen fonctionne
- [ ] Parcours tab s'affiche
- [ ] Carte tab s'affiche
- [ ] Profil tab s'affiche

### Fonctionnalités
- [ ] Inscription d'un nouveau compte
- [ ] Connexion avec email/password
- [ ] Navigation entre les tabs
- [ ] Affichage du profil utilisateur
- [ ] Déconnexion
- [ ] Persistence (reste connecté après fermeture)

### Design
- [ ] Logo visible
- [ ] Couleurs correctes
- [ ] Boutons arrondis
- [ ] Ombres visibles
- [ ] Textes lisibles
- [ ] Responsive (s'adapte à votre écran)

### API Backend
- [ ] Inscription envoie les données au serveur
- [ ] Login récupère le token JWT
- [ ] Profil affiche les données du serveur
- [ ] Messages d'erreur s'affichent en cas de problème

---

## 📝 Rapport de test

### Informations de votre appareil :
- **Téléphone** : (ex: iPhone 14, Samsung Galaxy S23)
- **OS** : (ex: iOS 17, Android 14)
- **Taille d'écran** : (ex: 6.1 pouces)
- **Date du test** : 30/11/2025

### Résultats :
| Test | Statut | Commentaire |
|------|--------|-------------|
| Welcome screen | ✅ / ❌ | |
| Login | ✅ / ❌ | |
| Register | ✅ / ❌ | |
| Navigation tabs | ✅ / ❌ | |
| Profil | ✅ / ❌ | |
| Déconnexion | ✅ / ❌ | |
| Persistence | ✅ / ❌ | |

---

## 🔄 Rechargement de l'app

Si vous voulez recharger l'application après une modification :
1. Secouez votre téléphone
2. Menu Expo apparaît
3. Appuyez sur "Reload"

Ou directement dans le terminal sur l'ordinateur : appuyez sur `r`

---

## 🎉 Tests réussis ?

Si tous les tests passent, l'application est prête pour la phase suivante :
- Implémentation de la liste des parcours
- Intégration de la carte interactive
- Système de podcasts
- Quiz et challenges

Bravo ! 🚀
