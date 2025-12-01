# 🎮 Phase 4 - Gamification Feature Documentation

**Date de création** : 1 Décembre 2025  
**Statut** : 🎉 95% complété  
**Version** : 1.5.0

---

## 📊 Vue d'Ensemble

La Phase 4 ajoute des fonctionnalités de gamification à l'application HistoRando Mobile pour augmenter l'engagement utilisateur et rendre l'expérience d'exploration historique plus interactive et ludique.

---

## ✅ Fonctionnalités Implémentées

### 1. Services Backend

#### QuizService (`src/services/quiz.service.ts`)
Service pour la gestion des quiz historiques liés aux POIs.

**Interfaces:**
```typescript
interface QuizQuestion {
  id: number;
  poiId: number;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizAnswer {
  id: number;
  questionId: number;
  userId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  pointsEarned: number;
  answeredAt: Date;
}

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  accuracy: number;
  level: number;
}
```

**Méthodes:**
- `getQuestionsByPOI(poiId: number)` - Récupère toutes les questions pour un POI
- `getQuestionById(id: number)` - Récupère une question spécifique
- `submitAnswer(questionId, selectedAnswer)` - Soumet une réponse
- `getMyAnswers()` - Récupère l'historique des réponses
- `getStats()` - Récupère les statistiques globales

**Endpoints API:**
- `GET /quiz/questions/poi/:poiId` - Questions par POI
- `GET /quiz/questions/:id` - Question spécifique
- `POST /quiz/answers` - Soumettre réponse
- `GET /quiz/answers/me` - Mes réponses
- `GET /quiz/stats` - Mes statistiques

---

#### RewardService (`src/services/reward.service.ts`)
Service pour la gestion des badges, défis, et leaderboard.

**Interfaces:**
```typescript
interface Badge {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  requirement: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserBadge {
  id: number;
  badge: Badge;
  earnedAt: Date;
  progress: number;
}

interface Challenge {
  id: number;
  name: string;
  description: string;
  type: 'parcours' | 'poi' | 'quiz' | 'distance' | 'time';
  target: number;
  reward: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

interface UserChallenge {
  id: number;
  challenge: Challenge;
  progress: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date;
}

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  points: number;
  level: number;
  badgesCount: number;
}
```

**Méthodes:**
- `getAllBadges()` - Liste tous les badges disponibles
- `getMyBadges()` - Mes badges gagnés
- `getActiveChallenges()` - Défis actifs disponibles
- `getMyChallenges()` - Mes défis en cours
- `startChallenge(challengeId)` - Démarrer un défi
- `getLeaderboard(period?)` - Classement global

**Endpoints API:**
- `GET /rewards/badges` - Tous les badges
- `GET /rewards/badges/me` - Mes badges
- `GET /rewards/challenges` - Défis actifs
- `GET /rewards/challenges/me` - Mes défis
- `POST /rewards/challenges/:id/start` - Démarrer un défi
- `GET /rewards/leaderboard` - Classement

---

### 2. Écrans

#### QuizScreen (`src/screens/main/QuizScreen.tsx`) ✅ COMPLÉTÉ
Écran de quiz interactif pour les POIs.

**Fonctionnalités:**
- ✅ Navigation avec paramètres (poiId, poiName)
- ✅ Chargement des questions depuis QuizService
- ✅ Header avec nom POI et barre de progression
- ✅ Question card avec badge difficulté et points
- ✅ Options radio pour sélection réponse
- ✅ Bouton validation avec état désactivé
- ✅ Modal résultat animé (fade + scale)
- ✅ Feedback instantané correct/incorrect
- ✅ Affichage réponse correcte si erreur
- ✅ Navigation entre questions
- ✅ Écran final avec statistiques complètes
- ✅ Accuracy percentage et message motivant
- ✅ States: loading, empty, quiz en cours, complété

**Workflow:**
```
1. User clique "Tester mes connaissances" sur POI card
2. → Navigation vers QuizScreen avec poiId
3. Chargement questions via QuizService
4. Affichage question 1/N avec options
5. User sélectionne réponse
6. Click "Valider ma réponse"
7. → Submit à backend
8. → Modal résultat (✅ ou ❌)
9. Affichage points gagnés
10. "Question suivante" → Repeat
11. Dernière question → Écran résultats final
12. Stats: points totaux, questions, accuracy %
13. Message motivant basé sur performance
14. "Terminer" → Navigation.goBack()
```

**Animations:**
- Fade in modal (300ms)
- Scale spring effect pour modal
- Progress bar animée

**Empty States:**
- Pas de questions: "Aucun quiz disponible"
- Loading: Spinner + "Chargement des questions..."

---

### 3. Composants

#### QRScanner (`src/components/QRScanner.tsx`) ✅ COMPLÉTÉ
**Fonctionnalités:**
- ✅ Système de tabs (Badges / Challenges)
- ✅ Grid layout pour badges (2 colonnes, 47% width)
- ✅ Liste avec cartes pour défis
- ✅ Badge rarity colors:
  - Common: #94A3B8 (gray)
  - Rare: #3B82F6 (blue)
  - Epic: #A855F7 (purple)
  - Legendary: #F59E0B (orange)
- ✅ Progress bars pour les défis
- ✅ Empty states avec messages encourageants
- ✅ Pull-to-refresh
- ✅ Challenge type icons (🗺️, 📍, ❓, 🏃, ⏱️)
- ✅ Challenge type labels traduits

**Interface:**
```typescript
interface RewardsScreenState {
  activeTab: 'badges' | 'challenges';
  badges: UserBadge[];
  challenges: UserChallenge[];
  loading: boolean;
  refreshing: boolean;
}
```

**Sections:**
1. **Badges Tab:**
   - Grid de badges avec icône, nom, rareté
   - Date d'obtention
   - Progress indicator si incomplet
   - Empty state: "Commencez à explorer..."

2. **Challenges Tab:**
   - Liste de cartes de défis
   - Nom, description, type
   - Progress bar (progress/target)
   - Récompense en points
   - Dates de début/fin
   - Badge "Complété" si terminé
   - Empty state: "Aucun défi en cours..."

---

### 3. Composants

#### QRScanner (`src/components/QRScanner.tsx`)
Composant de scan de QR Code pour la fonctionnalité "Treasure Hunt".

**Fonctionnalités:**
- ✅ Intégration expo-camera
- ✅ Demande de permission caméra automatique
- ✅ Scan area visuel avec corners animés
- ✅ Support multi-plateforme:
  - Mobile: Caméra native avec expo-camera
  - Web: Message informatif (caméra non disponible)
- ✅ États de permission (granted/denied/pending)
- ✅ Capability de re-scan
- ✅ Bouton annuler
- ✅ Feedback visuel après scan
- ✅ Error handling et fallbacks

**Props:**
```typescript
interface QRScannerProps {
  onScan: (data: string) => void;  // Callback avec données QR
  onClose: () => void;              // Callback fermeture
}
```

**États:**
- Permission non demandée (loading)
- Permission refusée (error message)
- Scan en cours (camera active)
- QR scanné (success message + option rescan)
- Web/device non supporté (info message)

**Usage:**
```tsx
<QRScanner
  onScan={(qrData) => {
    // Traiter le code QR scanné
    console.log('QR Code:', qrData);
  }}
  onClose={() => {
    // Fermer le scanner
    setShowScanner(false);
  }}
/>
```

---

## 📋 Fonctionnalités Restantes (15%)

### 1. QR Code Validation (Priorité Haute)
Écran pour afficher et répondre aux quiz.

---

## 📋 Fonctionnalités Restantes (15%)

### 1. QR Code Validation (Priorité Haute)
Backend integration pour valider les QR codes scannés.

**À implémenter:**
- [ ] Endpoint POST /rewards/validate-qr avec code scanné
- [ ] Vérification validité du code
- [ ] Attribution récompense si valide
- [ ] Feedback utilisateur (badge débloqué, points)
- [ ] Intégration dans handleQRScan de ProfilScreen

---

### 2. LeaderboardScreen (Priorité Moyenne)
Écran de classement global et par période.

**À implémenter:**
- [ ] Liste du top 100
- [ ] Indicateur de position personnelle
- [ ] Filtres par période (semaine/mois/année/all-time)
- [ ] Avatar + pseudo + stats
- [ ] Pull-to-refresh

---

### 4. Notifications (Priorité Basse)
Système de notifications pour événements gamification.

**À implémenter:**
- [ ] Notification nouveau badge
- [ ] Notification défi complété
- [ ] Notification montée de niveau
- [ ] Notification nouveau défi disponible
- [ ] Intégration expo-notifications

---

## 🔄 Flux Utilisateur

### 1. Parcours avec Quiz
```
1. Utilisateur démarre parcours
2. Visite POI
3. Enregistre visite (activity.service)
4. → Popup "Quiz disponible!"
5. Clique sur "Répondre au quiz"
6. → Navigation vers QuizScreen
7. Répond aux questions
8. → Gagne points + badge éventuel
9. Retour à ParcoursDetailScreen
```

---

### 3. Notifications (Priorité Basse)R codes"
2. Clique sur défi → Instructions
3. Trouve QR code sur terrain
4. Ouvre scanner depuis ProfilScreen
5. → QRScanner component
6. Scanne code
7. → Validation backend
8. → Progress défi +1
9. Si complété → Badge + points
```

### 3. Système de Badges
## 🔄 Flux Utilisateur

### 1. Parcours avec Quiz ✅ IMPLÉMENTÉ
```
1. Utilisateur démarre parcours
2. Visite POI (ParcoursDetailScreen)
3. Voit bouton "❓ Tester mes connaissances"
4. Clique → Navigation vers QuizScreen
5. Répond aux questions une par une
6. Voit résultats instantanés (modal animé)
7. Termine le quiz → Statistiques finales
8. → Gagne points + éventuel badge
9. Retour à ParcoursDetailScreen
```

### 2. Chasse au Trésor ✅ UI COMPLÈTE (Backend validation pending)
```
1. Utilisateur ouvre ProfilScreen
2. Clique "📱 Scanner QR Code"
3. → Modal QRScanner plein écran
4. Permission caméra demandée
5. Positionne QR code dans scan area
6. Scanne code → onScan callback
7. Modal se ferme
8. Alert affiche code détecté
9. TODO: Validation backend
10. TODO: Si valide → Badge + points
```

### 3. Système de Badges et Récompenses ✅ IMPLÉMENTÉon = (type: string) => {
  switch (type) {
    case 'parcours': return '🗺️';
    case 'poi':      return '📍';
    case 'quiz':     return '❓';
    case 'distance': return '🏃';
    case 'time':     return '⏱️';
    default:         return '🎯';
  }
};
```

---

## 📦 Dépendances Ajoutées

### Phase 4 Dependencies
```json
{
  "expo-camera": "~17.0.9",  // Pour QR scanner
}
```

### DevDependencies (déjà présentes)
- TypeScript avec strict mode
- ESLint + Prettier
- Types pour React Native

---
## 🧪 Tests Requis

### 1. Services ✅
- ✅ QuizService.getQuestionsByPOI() retourne questions valides
- ✅ QuizService.submitAnswer() envoie bonne requête
- ✅ RewardService.getMyBadges() formate badges correctement
- ✅ RewardService.startChallenge() démarre défi
- ✅ Error handling pour tous les services

### 2. RewardsScreen ✅
- ✅ Affichage correct badges avec rarités
- ✅ Switch tabs fonctionne
- ✅ Pull-to-refresh recharge données
- ✅ Empty states s'affichent si pas de données
- ✅ Progress bars challenges affichent bon %

### 3. QuizScreen ✅
- ✅ Navigation avec paramètres fonctionne
- ✅ Questions chargent correctement
- ✅ Sélection réponse met à jour UI
- ✅ Modal résultat s'anime correctement
- ✅ Points calculés et affichés
- ✅ Navigation entre questions fluide
- ✅ Écran final affiche bonnes stats
- ✅ Empty state pour 0 questions
- ✅ Loading state pendant chargement
## 🚀 Prochaines Étapes

### Immédiat (Sprint actuel)
1. ✅ Services quiz et reward créés
2. ✅ RewardsScreen implémenté
3. ✅ QRScanner créé
4. ✅ QuizScreen créé et intégré
5. ✅ Navigation Quiz depuis POI cards
6. ✅ QR Scanner dans ProfilScreen
7. ✅ LeaderboardScreen créé et intégré
8. **TODO:** Backend validation pour QR codes
9. **TODO:** Notifications push (expo-notifications)

### Sprint suivant
1. Backend QR code validation
2. Notifications push (expo-notifications)
3. Tests end-to-end complets
4. Polish animations et transitions
5. Phase 5 - Social features
### 6. ParcoursDetailScreen ✅
- ✅ Boutons quiz apparaissent sur POI cards
- ✅ Navigation vers QuizScreen avec bons params
- ✅ poiId et poiName passés correctement
- [ ] Rescan fonctionne après premier scan

---

## 🚀 Prochaines Étapes

### Immédiat (Sprint actuel)
1. ✅ Services quiz et reward créés
2. ✅ RewardsScreen implémenté
3. ✅ QRScanner créé
4. **TODO:** Créer QuizScreen
5. **TODO:** Intégrer quiz dans POI visits
6. **TODO:** Intégrer QR scanner dans Profil

### Sprint suivant
1. LeaderboardScreen
2. Notifications push
3. Tests end-to-end
4. Polish animations
---

**Contributeurs**: GitHub Copilot + Développeur  
**Dernière mise à jour**: 1 Décembre 2025, 22:15  
**Statut**: 🎉 95% complété - Quiz + Rewards + QR Scanner + Leaderboard tous implémentés!
- Challenges entre amis

---

## 📝 Notes Techniques

### Performance
- Services utilisent caching pour badges/challenges
- Images badges lazy-loaded
- Pull-to-refresh ne recharge que si >30s depuis dernière charge

### Sécurité
- Validation QR codes côté backend
- Points/badges attribués uniquement par backend
- Protection anti-cheat pour quiz (time limits)

### UX
- Animations pour déblocage badges
- Haptic feedback sur scan QR réussi
- Confetti animation pour legendary badges
- Sound effects (optionnel, avec toggle)

---

**Contributeurs**: GitHub Copilot + Développeur  
**Dernière mise à jour**: 1 Décembre 2025, 20:30
