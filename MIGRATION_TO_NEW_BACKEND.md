# Mobile App Migration to New Backend Structure

## Overview

This document outlines the migration from the old backend structure to the new comprehensive API with proper pagination, sessions, and enhanced features.

## Key Changes

### 1. API Base URL

- **Old**: Mixed/inconsistent endpoints
- **New**: Standardized `/api/v1` prefix for all endpoints

### 2. Pagination

- **Old**: Direct array responses `response.data`
- **New**: Paginated responses `{ data: T[], meta: { page, limit, total, ... } }`

### 3. Parcours Sessions (NEW)

- **Endpoint**: `/api/v1/parcours-sessions`
- **Purpose**: Track real-time parcours progress
- **Features**:
  - Start/resume sessions
  - Track GPS position updates
  - Record POI visits during session
  - Complete sessions with statistics

### 4. Activity Tracking

- **Old**: Single activity model
- **New**: Separate models for:
  - UserActivity (completed parcours)
  - ParcoursSession (active/in-progress parcours)
  - UserPOIVisit (POI check-ins)

### 5. Enhanced Entities

#### Parcours

- Added: `geoJsonPath` (GeoJSON route data)
- Added: `endPointLat`, `endPointLon` (separate end point)
- Added: Relations to quizzes and podcasts

#### POI

- Added: `quizId`, `podcastId` (associations)
- Added: `orderInParcours` (sequence)
- Changed: `audioUrl` (was `audioGuideUrl`)

#### Quiz

- New: Complete quiz/question/answer structure
- Submit attempts and track scores

#### Treasure Hunt

- Added: `items` (treasure items)
- Items can have associated quizzes/podcasts

### 6. New Modules

- **Leaderboard**: Global and parcours-specific rankings
- **Parcours Sessions**: Real-time tracking
- **Historical Routes**: Battalion historical routes
- **Challenges**: User challenges system

## Migration Steps

### Step 1: Update API Service

✅ Already handles pagination with `extractData()` helper

### Step 2: Update Type Definitions

- Add new fields to existing types
- Create new types for sessions, leaderboard, etc.

### Step 3: Create New Services

- ParcoursSessionService (track active parcours)
- LeaderboardService (rankings)
- ChallengeService (user challenges)

### Step 4: Update Existing Services

- Update all services to use correct endpoints
- Handle paginated responses
- Add missing CRUD operations

### Step 5: Update Screens

- ParcoursScreen: Add session tracking
- CarteScreen: Show real-time position updates
- ProfileScreen: Add leaderboard, challenges
- Add new screens as needed

## API Endpoint Reference

### Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Users

- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`
- `GET /api/v1/users/me/stats`

### Parcours

- `GET /api/v1/parcours` (paginated)
- `GET /api/v1/parcours/:id`
- `GET /api/v1/parcours/nearby?lat=&lon=&radius=`

### Parcours Sessions (NEW)

- `POST /api/v1/parcours-sessions/start`
- `GET /api/v1/parcours-sessions/active`
- `GET /api/v1/parcours-sessions/active/:parcoursId`
- `PUT /api/v1/parcours-sessions/:id/update`
- `POST /api/v1/parcours-sessions/:id/complete`
- `DELETE /api/v1/parcours-sessions/:id`

### Activities

- `POST /api/v1/activities` (start activity)
- `GET /api/v1/activities` (paginated)
- `GET /api/v1/activities/stats`
- `GET /api/v1/activities/:id`
- `PUT /api/v1/activities/:id`
- `DELETE /api/v1/activities/:id`
- `POST /api/v1/activities/poi-visits`
- `GET /api/v1/activities/poi-visits/me`

### POI

- `GET /api/v1/poi` (paginated)
- `GET /api/v1/poi/:id`
- `GET /api/v1/poi/parcours/:parcoursId`

### Quizzes

- `GET /api/v1/quizzes` (paginated)
- `GET /api/v1/quizzes/:id`
- `POST /api/v1/quizzes/:id/attempts` (submit attempt)
- `GET /api/v1/quizzes/attempts/me`

### Podcasts

- `GET /api/v1/podcasts` (paginated)
- `GET /api/v1/podcasts/:id`
- `GET /api/v1/podcasts/parcours/:parcoursId`

### Treasure Hunts

- `GET /api/v1/treasure-hunts` (paginated)
- `GET /api/v1/treasure-hunts/:id`
- `POST /api/v1/treasure-hunts/:id/found` (mark as found)

### Badges

- `GET /api/v1/badges` (paginated)
- `GET /api/v1/badges/my-badges`

### Leaderboard (NEW)

- `GET /api/v1/leaderboard/global`
- `GET /api/v1/leaderboard/parcours/:parcoursId`

### Rewards

- `GET /api/v1/rewards` (paginated)
- `POST /api/v1/rewards/:id/redeem`

### Challenges (NEW)

- `GET /api/v1/challenges` (paginated)
- `GET /api/v1/challenges/active`
- `POST /api/v1/challenges/:id/join`

## Testing Checklist

- [ ] Login/Register flow
- [ ] Browse parcours (paginated)
- [ ] View parcours details
- [ ] Start parcours session
- [ ] Update session with GPS
- [ ] Visit POI during session
- [ ] Complete session
- [ ] View activity history
- [ ] Take quiz
- [ ] Play podcast
- [ ] Scan treasure hunt QR
- [ ] View leaderboard
- [ ] Redeem rewards
- [ ] Join challenges

## Notes

- The backend uses JWT authentication for all protected endpoints
- All list endpoints now return paginated responses
- Sessions track real-time progress, activities are completed records
- POI visits are now tracked separately with GPS verification
