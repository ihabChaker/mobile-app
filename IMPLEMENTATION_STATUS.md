# Mobile App Update Summary - Backend v2 Integration

## Completed Updates

### ✅ New Type Definitions

- Created `/src/types/backend.types.ts` with all new entity types:
  - ParcoursSession, UserActivity, POIVisit
  - Quiz, QuizQuestion, QuizAnswer, QuizAttempt
  - TreasureHunt, TreasureItem, UserTreasureFound
  - Badge, UserBadge
  - Leaderboard, Reward, Challenge
  - Battalion, BattalionRoute
  - UserStats, PaginationMeta

### ✅ New Services Created

- `/src/services/parcours-session.service.ts` - Real-time parcours tracking
- `/src/services/leaderboard.service.ts` - Rankings and leaderboards
- `/src/services/challenge.service.ts` - User challenges

### ✅ Existing Services Already Updated

- `/src/services/api.service.ts` - Already handles pagination with `extractData()`
- `/src/services/parcours.service.ts` - Already compatible (uses `extractData()`)

## Services Requiring Updates

### 1. Activity Service

**Current**: Old activity model
**Required**: Update to use new endpoints and types

```typescript
// Update these methods:
- startActivity() -> Should use /activities endpoint
- updateActivity() -> Add PUT /activities/:id
- completeActivity() -> Update with proper DTO
- recordPOIVisit() -> POST /activities/poi-visits
- getMyPOIVisits() -> GET /activities/poi-visits/me
```

### 2. Quiz Service

**Required**: Complete rewrite for new quiz structure

```typescript
// New methods needed:
-getAllQuizzes(page, limit) -
  getQuizById(id) -
  submitQuizAttempt(quizId, answers) -
  getMyAttempts() -
  getAttemptById(attemptId);
```

### 3. Reward Service

**Current**: Basic structure
**Required**: Add redeem functionality

```typescript
// Add methods:
-getAvailableRewards(page, limit) -
  getRewardById(id) -
  redeemReward(rewardId) -
  getMyRewards();
```

### 4. Treasure Hunt Service

**Current**: Basic QR scanning
**Required**: Update for new structure with items

```typescript
// Update methods:
-getAllTreasureHunts(page, limit) -
  getTreasureHuntById(id) - // Include items
  markTreasureFound(treasureId, lat, lon) -
  getMyTreasures();
```

### 5. POI Service

**Current**: Basic POI fetching
**Required**: Update for new structure

```typescript
// Update methods:
-getPOIsByParcours(parcoursId) - // Now includes quiz/podcast
  getPOIById(id); // Include full relations
```

### 6. User Service

**Current**: Basic profile
**Required**: Add stats and badges

```typescript
// Add methods:
-getMyStats() - // GET /users/me/stats
  getMyBadges(page, limit) - // GET /badges/my-badges
  updateProfile(data); // PUT /users/me
```

## Screens Requiring Updates

### 1. ParcoursScreen

**Add**:

- Session management (start/resume/abandon)
- Real-time progress tracking
- "Resume Session" button if active session exists

### 2. ParcoursDetailScreen

**Add**:

- "Start Parcours" button (creates session)
- Display associated quizzes
- Display associated podcasts
- Show historical routes if available

### 3. CarteScreen

**Update**:

- Show active session position updates
- Real-time tracking during parcours
- POI visit tracking with GPS verification

### 4. ProfilScreen

**Add**:

- Leaderboard rankings
- Challenges progress
- Badges collection
- Detailed statistics

### 5. New Screens Needed

- **LeaderboardScreen**: Global and parcours rankings
- **ChallengesScreen**: Browse and join challenges
- **BadgesScreen**: View earned badges
- **QuizScreen**: Take quizzes (UPDATE existing)
- **RewardsScreen**: Browse and redeem rewards (UPDATE existing)

## Implementation Priority

### Phase 1: Core Session Management (HIGH)

1. Update activity.service.ts
2. Integrate parcours-session.service.ts
3. Update ParcoursDetailScreen with "Start" button
4. Update CarteScreen for session tracking

### Phase 2: Enhanced Features (MEDIUM)

1. Update quiz.service.ts and QuizScreen
2. Add leaderboard.service.ts to ProfilScreen
3. Update treasure-hunt.service.ts
4. Add challenge features

### Phase 3: Polish (LOW)

1. New LeaderboardScreen
2. New BadgesScreen
3. Enhanced statistics
4. Historical routes display

## API Endpoint Reference

### Parcours Sessions

- POST /api/v1/parcours-sessions/start
- GET /api/v1/parcours-sessions/active
- GET /api/v1/parcours-sessions/active/:parcoursId
- PUT /api/v1/parcours-sessions/:id/update
- POST /api/v1/parcours-sessions/:id/complete
- DELETE /api/v1/parcours-sessions/:id

### Activities

- POST /api/v1/activities
- GET /api/v1/activities
- GET /api/v1/activities/stats
- GET /api/v1/activities/:id
- PUT /api/v1/activities/:id
- DELETE /api/v1/activities/:id
- POST /api/v1/activities/poi-visits
- GET /api/v1/activities/poi-visits/me

### Quizzes

- GET /api/v1/quizzes
- GET /api/v1/quizzes/:id
- POST /api/v1/quizzes/:id/attempts
- GET /api/v1/quizzes/attempts/me
- GET /api/v1/quizzes/attempts/:id

### Leaderboard

- GET /api/v1/leaderboard/global
- GET /api/v1/leaderboard/parcours/:parcoursId

### Challenges

- GET /api/v1/challenges
- GET /api/v1/challenges/active
- GET /api/v1/challenges/:id
- POST /api/v1/challenges/:id/join
- GET /api/v1/challenges/my-challenges

### Badges

- GET /api/v1/badges
- GET /api/v1/badges/my-badges
- GET /api/v1/badges/:id

### Rewards

- GET /api/v1/rewards
- GET /api/v1/rewards/:id
- POST /api/v1/rewards/:id/redeem
- GET /api/v1/rewards/my-rewards

### Treasure Hunts

- GET /api/v1/treasure-hunts
- GET /api/v1/treasure-hunts/:id
- POST /api/v1/treasure-hunts/:id/found

### POI

- GET /api/v1/poi
- GET /api/v1/poi/:id
- GET /api/v1/poi/parcours/:parcoursId

### Podcasts

- GET /api/v1/podcasts
- GET /api/v1/podcasts/:id
- GET /api/v1/podcasts/parcours/:parcoursId

## Testing Checklist

- [ ] Login and register work
- [ ] Browse parcours (paginated)
- [ ] View parcours details with quizzes/podcasts
- [ ] Start parcours session
- [ ] Update session with GPS (real-time tracking)
- [ ] Visit POI during session (GPS verification)
- [ ] Complete session
- [ ] View activity history
- [ ] View statistics
- [ ] Take quiz
- [ ] Play podcast
- [ ] Scan treasure hunt QR
- [ ] View leaderboard
- [ ] Join challenge
- [ ] Redeem reward
- [ ] View earned badges

## Next Steps

1. **Update existing services** with new endpoints
2. **Test all API calls** with real backend
3. **Update screens** for new features
4. **Add new screens** for leaderboard, badges, challenges
5. **Test end-to-end** user flows
6. **Handle offline mode** and caching

## Notes

- All endpoints now use `/api/v1` prefix
- All list endpoints return paginated responses
- Sessions are for real-time tracking, activities are completed records
- POI visits now require GPS verification
- Quiz system is completely new with attempts tracking
- Leaderboard supports both global and per-parcours rankings
