# 🧪 Guide de Tests Complet - HistoRando Mobile

## 📱 Prérequis
- ✅ Serveur Expo lancé sur port 3001: `npx expo start --port 3001`
- ✅ Téléphone avec Expo Go installé
- ✅ Backend API accessible: `https://histo-rando-backend-egvh3.ondigitalocean.app`
- ✅ Même réseau WiFi pour PC et téléphone

---

## 1️⃣ Tests d'Authentification

### Test 1.1: Écran de Bienvenue
**Étapes:**
1. Scanner le QR code avec Expo Go
2. L'app charge et affiche WelcomeScreen

**Vérifications:**
- [ ] Logo HistoRando visible
- [ ] 2 boutons présents: "Commencer" et "Créer un compte"
- [ ] Design selon palette de couleurs
- [ ] Pas d'erreurs dans la console

**Résultat attendu:** Écran de bienvenue s'affiche correctement

---

### Test 1.2: Inscription d'un Nouvel Utilisateur
**Étapes:**
1. Cliquer sur "Créer un compte"
2. Remplir le formulaire:
   - Prénom: `Jean`
   - Nom: `Martin`
   - Username: `jeanmartin`
   - Email: `jean.martin.test@example.com`
   - Mot de passe: `test1234`
   - Confirmation: `test1234`
3. Cliquer sur "S'inscrire"

**Vérifications:**
- [ ] Tous les champs sont remplis correctement
- [ ] Validation email fonctionne (essayer email invalide: `test@`)
- [ ] Validation username (essayer moins de 3 caractères: `ab`)
- [ ] Validation passwords match (essayer différents passwords)
- [ ] Loading spinner s'affiche pendant la requête
- [ ] Message de bienvenue personnalisé après succès
- [ ] Navigation automatique vers MainTabs

**Tests Négatifs:**
- [ ] Champs vides → Message d'erreur
- [ ] Email invalide → Message d'erreur
- [ ] Username < 3 caractères → Message d'erreur
- [ ] Passwords différents → Message d'erreur
- [ ] Email déjà utilisé → Message du backend

**Résultat attendu:** Compte créé avec succès, redirection vers app principale

---

### Test 1.3: Connexion avec Compte Existant
**Étapes:**
1. Se déconnecter (Profil → Se déconnecter)
2. Sur WelcomeScreen, cliquer "Commencer"
3. Remplir:
   - Email: `jean.martin.test@example.com`
   - Mot de passe: `test1234`
4. Cliquer "Se connecter"

**Vérifications:**
- [ ] Loading spinner pendant requête
- [ ] Connexion réussie
- [ ] Navigation vers MainTabs
- [ ] Données utilisateur chargées (visible dans Profil)

**Tests Négatifs:**
- [ ] Email incorrect → Message d'erreur
- [ ] Mot de passe incorrect → Message d'erreur
- [ ] Champs vides → Message d'erreur

**Résultat attendu:** Connexion réussie avec compte existant

---

### Test 1.4: Persistance de Session
**Étapes:**
1. Se connecter
2. Fermer complètement l'app
3. Rouvrir l'app

**Vérifications:**
- [ ] Utilisateur toujours connecté
- [ ] Pas besoin de se reconnecter
- [ ] Données utilisateur présentes

**Résultat attendu:** Session persistée avec Redux Persist

---

## 2️⃣ Tests de l'Écran Parcours

### Test 2.1: Chargement de la Liste des Parcours
**Étapes:**
1. Naviguer vers l'onglet "Parcours"
2. Observer le chargement

**Vérifications:**
- [ ] Loading spinner affiché au début
- [ ] Liste des parcours chargée depuis l'API
- [ ] Chaque parcours affiche:
  - Image (ou placeholder)
  - Titre
  - Description (max 3 lignes)
  - Badge difficulté (couleur appropriée)
  - Distance en km
  - Durée en minutes
  - Difficulté

**Tests de Couleurs Difficulté:**
- [ ] Facile → Vert (#7B8A5D)
- [ ] Moyen → Orange (#D4A574)
- [ ] Difficile → Rouge (#C44536)

**Résultat attendu:** Liste des parcours affichée correctement

---

### Test 2.2: Pull-to-Refresh
**Étapes:**
1. Sur l'onglet Parcours
2. Tirer la liste vers le bas
3. Relâcher

**Vérifications:**
- [ ] Indicateur de refresh visible
- [ ] Requête API relancée
- [ ] Liste mise à jour
- [ ] Indicateur disparaît après chargement

**Résultat attendu:** Refresh fonctionne sans erreur

---

### Test 2.3: État Vide (Si aucun parcours)
**Vérifications:**
- [ ] Icône 🗺️ affichée
- [ ] Message: "Aucun parcours disponible"
- [ ] Texte explicatif présent
- [ ] Design centré et clair

**Résultat attendu:** État vide géré correctement

---

### Test 2.4: Gestion d'Erreur Réseau
**Étapes:**
1. Désactiver WiFi/données
2. Pull-to-refresh ou rouvrir l'app
3. Observer l'erreur

**Vérifications:**
- [ ] Bandeau d'erreur rouge affiché
- [ ] Icône ⚠️ présente
- [ ] Message d'erreur clair
- [ ] Liste reste affichée si données en cache

**Résultat attendu:** Erreur affichée proprement

---

### Test 2.5: Navigation vers Détail Parcours
**Étapes:**
1. Cliquer sur n'importe quel parcours
2. Observer la navigation

**Vérifications:**
- [ ] Transition fluide vers ParcoursDetailScreen
- [ ] Header avec bouton retour
- [ ] Titre "Détail du parcours"

**Résultat attendu:** Navigation vers détail fonctionne

---

## 3️⃣ Tests de l'Écran Détail Parcours

### Test 3.1: Affichage des Informations
**Vérifications:**
- [ ] Image du parcours (ou placeholder)
- [ ] Badge difficulté en haut à droite
- [ ] Titre du parcours
- [ ] Description complète
- [ ] 3 cartes statistiques:
  - Distance (km)
  - Durée (min)
  - Difficulté
- [ ] Section Points d'Intérêt
- [ ] Section Itinéraire avec:
  - Point de départ (lat/long)
  - Point d'arrivée (lat/long)
- [ ] Section Recommandations (4 items)
- [ ] Bouton FAB "Démarrer le parcours" en bas

**Résultat attendu:** Toutes les informations affichées correctement

---

### Test 3.2: Démarrage d'un Parcours
**Étapes:**
1. Sur ParcoursDetailScreen
2. Cliquer sur "Démarrer le parcours"
3. Confirmer dans l'alerte

**Vérifications:**
- [ ] Confirmation demandée
- [ ] Loading pendant requête API
- [ ] Message de succès affiché
- [ ] API `POST /parcours/{id}/start` appelée

**Résultat attendu:** Parcours démarré avec succès

---

### Test 3.3: Retour à la Liste
**Étapes:**
1. Depuis ParcoursDetailScreen
2. Cliquer sur bouton retour
3. Observer navigation

**Vérifications:**
- [ ] Retour à la liste des parcours
- [ ] Liste toujours visible (pas de rechargement)
- [ ] Scroll position préservée

**Résultat attendu:** Navigation retour fluide

---

## 4️⃣ Tests de l'Écran Carte

### Test 4.1: Chargement de la Carte (Mobile)
**Étapes:**
1. Naviguer vers l'onglet "Carte"
2. Observer le chargement

**Vérifications:**
- [ ] Demande de permission de localisation
- [ ] Loading pendant chargement
- [ ] Carte affichée (Google Maps sur Android, Apple Maps sur iOS)
- [ ] Région par défaut: Normandie si permission refusée
- [ ] Position utilisateur affichée si permission accordée
- [ ] Marqueurs rouges pour les parcours
- [ ] Info card en haut avec nombre de parcours

**Résultat attendu:** Carte fonctionnelle avec marqueurs

---

### Test 4.2: Permission de Localisation
**Test Accordée:**
1. Accorder la permission
2. Observer

**Vérifications:**
- [ ] Point bleu pour position utilisateur
- [ ] Bouton "Ma position"
- [ ] Carte centrée sur utilisateur

**Test Refusée:**
1. Refuser la permission
2. Observer

**Vérifications:**
- [ ] Alerte affichée
- [ ] Carte centrée sur Normandie par défaut
- [ ] Pas de point bleu utilisateur

**Résultat attendu:** Deux modes fonctionnent

---

### Test 4.3: Marqueurs Parcours
**Vérifications:**
- [ ] Un marqueur par parcours
- [ ] Couleur rouge (mapMarker)
- [ ] Click sur marqueur → Info window
- [ ] Info window affiche:
  - Titre du parcours
  - Distance + Durée

**Résultat attendu:** Marqueurs interactifs

---

### Test 4.4: Carte sur Web
**Étapes:**
1. Ouvrir app sur web: http://localhost:3001
2. Naviguer vers Carte

**Vérifications:**
- [ ] Message affiché: "Disponible uniquement sur mobile"
- [ ] Icône 🗺️ présente
- [ ] Pas d'erreur console (imports conditionnels)
- [ ] Texte explicatif clair

**Résultat attendu:** Message informatif sur web

---

## 5️⃣ Tests de l'Écran Profil

### Test 5.1: Affichage des Informations Utilisateur
**Vérifications:**
- [ ] Avatar circulaire avec initiales (JM pour Jean Martin)
- [ ] Nom complet: Jean Martin
- [ ] Username: @jeanmartin
- [ ] Email: jean.martin.test@example.com
- [ ] 3 cartes statistiques:
  - ⭐ Points (valeur du backend)
  - 🏆 Niveau (valeur du backend)
  - 🎖️ Badges (0 par défaut)

**Résultat attendu:** Toutes les données affichées

---

### Test 5.2: Barre de Progression
**Vérifications:**
- [ ] Titre: "Progression vers niveau X"
- [ ] Pourcentage affiché
- [ ] Barre de progression visuelle
- [ ] Texte: "X / Y points"
- [ ] Calcul correct: (points / (niveau * 100)) * 100

**Résultat attendu:** Progression calculée correctement

---

### Test 5.3: Section Informations
**Vérifications:**
- [ ] 📅 Membre depuis: Mois Année (ex: décembre 2025)
- [ ] 🗺️ Parcours complétés: 0
- [ ] 📍 POI découverts: 0
- [ ] Dividers entre chaque ligne

**Résultat attendu:** Infos formatées correctement

---

### Test 5.4: Boutons d'Action
**Vérifications:**
- [ ] ⚙️ Paramètres (clickable mais pas encore implémenté)
- [ ] 📊 Statistiques (clickable mais pas encore implémenté)
- [ ] 🏆 Mes récompenses (clickable mais pas encore implémenté)
- [ ] Feedback visuel au touch

**Résultat attendu:** Boutons présents et cliquables

---

### Test 5.5: Déconnexion
**Étapes:**
1. Scroller en bas
2. Cliquer "Se déconnecter"
3. Confirmer

**Vérifications:**
- [ ] Confirmation demandée
- [ ] Deux options: Annuler / Déconnecter
- [ ] Annuler → Reste connecté
- [ ] Déconnecter → Redirection vers WelcomeScreen
- [ ] Token supprimé
- [ ] Redux state cleared

**Résultat attendu:** Déconnexion propre avec confirmation

---

## 6️⃣ Tests de Persistance et État

### Test 6.1: Redux Persist
**Étapes:**
1. Se connecter
2. Naviguer dans l'app
3. Forcer fermeture de l'app
4. Rouvrir

**Vérifications:**
- [ ] Utilisateur toujours connecté
- [ ] Pas de flash de WelcomeScreen
- [ ] Données utilisateur présentes
- [ ] Token JWT sauvegardé

**Résultat attendu:** État persisté

---

### Test 6.2: Token JWT dans les Requêtes
**Vérifications:**
- [ ] Header `Authorization: Bearer {token}` dans toutes les requêtes API
- [ ] Token ajouté automatiquement par interceptor
- [ ] Requêtes non authentifiées (register, login) sans token

**Résultat attendu:** Token envoyé correctement

---

### Test 6.3: Auto-déconnexion sur 401
**Simulation:**
1. Utiliser token expiré ou invalide
2. Faire une requête API

**Vérifications:**
- [ ] Réponse 401 détectée
- [ ] Déconnexion automatique
- [ ] Redirection vers WelcomeScreen
- [ ] Message d'erreur approprié

**Résultat attendu:** Auto-déconnexion fonctionne

---

## 7️⃣ Tests de Performance et UX

### Test 7.1: Fluidité de Navigation
**Vérifications:**
- [ ] Transitions entre écrans fluides (60fps)
- [ ] Pas de lag lors du scroll
- [ ] Animations douces
- [ ] Pas de freeze

**Résultat attendu:** App fluide

---

### Test 7.2: Temps de Chargement
**Mesures:**
- [ ] Chargement initial app: < 3 secondes
- [ ] Chargement liste parcours: < 2 secondes
- [ ] Navigation entre écrans: instantané
- [ ] Chargement carte: < 3 secondes

**Résultat attendu:** Temps acceptables

---

### Test 7.3: Gestion Mémoire
**Vérifications:**
- [ ] Pas de memory leak visible
- [ ] Images optimisées
- [ ] FlatList avec keyExtractor
- [ ] Pas de re-renders inutiles

**Résultat attendu:** Pas de problèmes mémoire

---

## 8️⃣ Tests d'Erreurs et Edge Cases

### Test 8.1: Erreurs Réseau
**Scénarios:**
- [ ] Pas de connexion → Message clair
- [ ] Connexion lente → Loading states
- [ ] Timeout → Message approprié
- [ ] Erreur serveur 500 → Message générique

**Résultat attendu:** Toutes les erreurs gérées

---

### Test 8.2: Données Invalides
**Scénarios:**
- [ ] Parcours sans image → Placeholder affiché
- [ ] User sans badges → Array vide géré
- [ ] Coordonnées invalides → Carte fonctionne quand même

**Résultat attendu:** Pas de crash

---

### Test 8.3: Actions Simultanées
**Scénarios:**
- [ ] Click rapide multiple sur bouton → Seule 1 requête
- [ ] Navigation rapide → Pas de conflits
- [ ] Pull-to-refresh pendant loading → Géré

**Résultat attendu:** Concurrence gérée

---

## 9️⃣ Tests de Validation des Données

### Test 9.1: Validation RegisterScreen
**Tests:**
- [ ] Email format valide
- [ ] Username >= 3 caractères
- [ ] Password >= 6 caractères
- [ ] Passwords matching
- [ ] Trimming des espaces
- [ ] Conversion minuscules

**Résultat attendu:** Toutes validations fonctionnent

---

### Test 9.2: Validation LoginScreen
**Tests:**
- [ ] Champs non vides
- [ ] Messages d'erreur clairs
- [ ] Gestion erreur backend

**Résultat attendu:** Validation complète

---

## 🎯 Tests Backend API

### Endpoints à Tester avec l'App

#### Auth
- [x] `POST /api/v1/auth/register` - Inscription
- [x] `POST /api/v1/auth/login` - Connexion

#### Parcours
- [x] `GET /api/v1/parcours` - Liste parcours
- [x] `GET /api/v1/parcours/{id}` - Détail parcours
- [x] `POST /api/v1/parcours/{id}/start` - Démarrer parcours

#### User
- [ ] `GET /api/v1/users/profile` - Profil utilisateur (si endpoint existe)

---

## 📊 Checklist Finale

### Code Quality
- [x] Aucune erreur TypeScript
- [x] Aucun console.log en production
- [x] Code commenté et documenté
- [x] Gestion erreurs partout
- [x] Loading states partout
- [x] Empty states gérés

### Fonctionnalités
- [x] Authentification complète
- [x] Liste parcours
- [x] Détail parcours
- [x] Carte interactive
- [x] Profil utilisateur
- [x] Déconnexion
- [x] Navigation fluide

### UX
- [x] Design cohérent
- [x] Messages clairs
- [x] Feedback visuel
- [x] Confirmations actions importantes
- [x] États de chargement

---

## 📝 Rapport de Tests

### Template de Rapport

```
Test Date: [DATE]
Tester: [NOM]
Device: [MODÈLE + OS]
App Version: 1.1.0

Tests Passed: X/Y
Tests Failed: X/Y
Bugs Found: X

Critical Issues:
- [Liste]

Minor Issues:
- [Liste]

Suggestions:
- [Liste]
```

---

## 🚀 Tests Prêts

**L'application est prête pour les tests complets!**

Scannez le QR code et suivez ce guide pour tester toutes les fonctionnalités.

**Note**: Le serveur Expo doit tourner sur le port 3001 pour correspondre à la configuration CORS du backend.

**Commande**: `npx expo start --port 3001`
