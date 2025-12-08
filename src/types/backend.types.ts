/**
 * ===========================
 * New Backend Types for Mobile App
 * Aligned with backend v2 structure
 * ===========================
 */

/**
 * Parcours Session - Track active/in-progress parcours
 * Aligned with ActiveParcoursSession backend entity
 */
export interface ParcoursSession {
  id: number;
  userId: number;
  parcoursId: number;
  startTime: string; // Backend uses startTime, not startDatetime
  lastUpdateTime?: string; // Backend uses lastUpdateTime, not lastUpdateDatetime
  currentLatitude?: number; // Backend uses currentLatitude, not currentLat
  currentLongitude?: number; // Backend uses currentLongitude, not currentLon
  distanceCovered: number; // In meters (DECIMAL 10,2), not km
  poisVisitedIds?: string; // JSON string array "[1,2,3]", not number
  isCompleted: boolean; // Backend field for completion status
  completedAt?: string; // Backend uses completedAt, not endDatetime
  completionBonus: number; // Backend field for bonus points
  // Relations
  parcours?: any; // Reference to Parcours
  user?: any; // Reference to User
}

/**
 * Start Session DTO
 */
export interface StartSessionDto {
  parcoursId: number;
  startLat: number; // Required - starting latitude
  startLon: number; // Required - starting longitude
}

/**
 * Update Session DTO
 */
export interface UpdateSessionDto {
  currentLat: number;
  currentLon: number;
  distanceCovered?: number; // In meters, not km
}

/**
 * Complete Session DTO
 */
export interface CompleteSessionDto {
  finalLat: number; // Backend uses finalLat, not endLat
  finalLon: number; // Backend uses finalLon, not endLon
  distanceCovered: number; // In meters, backend computes km conversion
}

/**
 * User Activity - Completed parcours record
 */
export interface UserActivity {
  id: number;
  userId: number;
  parcoursId: number;
  activityType: 'walking' | 'running' | 'cycling';
  startDatetime: string;
  endDatetime?: string;
  status: 'in_progress' | 'completed' | 'paused';
  distanceCoveredKm: number;
  durationMinutes?: number;
  averageSpeed?: number;
  pointsEarned: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  parcours?: {
    id: number;
    name: string;
    imageUrl?: string;
  };
}

/**
 * Activity Statistics
 */
export interface ActivityStats {
  totalActivities: number;
  totalDistance: number;
  totalDuration: number;
  totalPoints: number;
  averageSpeed: number;
  parcoursCompleted: number;
  poisVisited: number;
}

/**
 * POI Visit Record
 */
export interface POIVisit {
  id: number;
  userId: number;
  poiId: number;
  parcoursId: number;
  activityId?: number;
  visitDatetime: string;
  pointsEarned: number;
  scannedQr?: boolean; // Backend field
  listenedAudio?: boolean; // Backend field
  createdAt: string;
  // Relations
  poi?: {
    id: number;
    name: string;
    poiType: string;
    imageUrl?: string;
  };
}

/**
 * Quiz Entity
 */
export interface Quiz {
  id: number;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
}

/**
 * Quiz Question
 */
export interface QuizQuestion {
  id: number;
  quizId: number;
  questionText: string; // Backend uses questionText, not question
  questionOrder: number; // Backend uses questionOrder, not orderIndex
  points: number; // Backend has points per question
  correctAnswer: string; // Backend stores correct answer
  createdAt: string;
  answers?: QuizAnswer[];
}

/**
 * Quiz Answer
 */
export interface QuizAnswer {
  id: number;
  questionId: number;
  answerText: string;
  isCorrect: boolean;
  createdAt: string;
}

/**
 * Quiz Attempt - User's quiz submission
 */
export interface QuizAttempt {
  id: number;
  userId: number;
  quizId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  pointsEarned: number;
  attemptDatetime: string;
  createdAt: string;
  // Relations
  quiz?: Quiz;
}

/**
 * Submit Quiz Attempt DTO
 */
export interface SubmitQuizAttemptDto {
  quizId: number; // Backend requires quizId in DTO
  answers: Array<{
    questionId: number;
    answerId: number;
  }>;
  timeTakenSeconds?: number; // Optional time tracking
}

/**
 * Treasure Hunt
 */
export interface TreasureHunt {
  id: number;
  parcoursId: number;
  name: string;
  description?: string;
  targetObject: string;
  latitude: number;
  longitude: number;
  scanRadiusMeters: number;
  qrCode?: string;
  isActive: boolean;
  createdAt: string;
  items?: TreasureItem[];
}

/**
 * Treasure Item
 */
export interface TreasureItem {
  id: number;
  treasureHuntId: number;
  itemName: string; // Backend uses itemName, not name
  description?: string;
  imageUrl?: string;
  pointsValue: number; // Backend uses pointsValue
  qrCode: string;
  createdAt: string;
}

/**
 * User Treasure Found Record
 */
export interface UserTreasureFound {
  id: number;
  userId: number;
  treasureHuntId: number;
  foundAt: string;
  latitude: number;
  longitude: number;
  pointsEarned: number;
  createdAt: string;
}

/**
 * Badge
 */
export interface Badge {
  id: number;
  name: string;
  description: string;
  iconUrl?: string;
  requirement: string;
  points: number;
  rarity: 'commun' | 'rare' | 'épique' | 'légendaire';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Badge - User's earned badge
 */
export interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: string;
  progress: number;
  badge?: Badge;
}

/**
 * Leaderboard Entry
 */
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  totalPoints: number;
  parcoursCompleted: number;
  badgesEarned: number;
  // Optional avatar/profile info
  profileImageUrl?: string;
}

/**
 * Reward
 */
export interface Reward {
  id: number;
  name: string;
  description?: string;
  pointsCost: number;
  rewardType: 'discount' | 'gift' | 'badge' | 'premium_content';
  partnerName?: string;
  stockQuantity: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Reward - Redeemed reward
 */
export interface UserReward {
  id: number;
  userId: number;
  rewardId: number;
  redemptionDatetime: string; // Backend uses redemptionDatetime, not redeemedAt
  pointsSpent: number; // Backend field
  status: 'pending' | 'redeemed' | 'used'; // Backend uses 'redeemed', not 'delivered'
  redemptionCode?: string; // Backend field
  createdAt: string;
  reward?: Reward;
}

/**
 * Challenge
 */
export interface Challenge {
  id: number;
  name: string;
  description?: string;
  challengeType: 'weighted_backpack' | 'period_clothing' | 'distance' | 'time';
  pointsReward: number;
  difficultyMultiplier: number;
  isActive: boolean;
  createdAt: string;
}

/**
 * User Challenge - User's challenge participation
 */
export interface UserChallenge {
  id: number;
  userId: number;
  challengeId: number;
  activityId?: number;
  startDatetime: string;
  completionDatetime?: string;
  status: 'started' | 'completed' | 'failed';
  pointsEarned: number;
  createdAt: string;
  updatedAt: string;
  challenge?: Challenge;
  // Virtual/computed field for progress percentage (0-100)
  progress?: number;
  isCompleted?: boolean;
  joinedAt?: string;
}

/**
 * Historical Battalion
 */
export interface Battalion {
  id: number;
  name: string;
  country: string;
  militaryUnit: string;
  period: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Historical Route
 */
export interface BattalionRoute {
  id: number;
  battalionId: number;
  parcoursId: number;
  routeDate: string;
  historicalContext?: string;
  createdAt: string;
  updatedAt: string;
  battalion?: Battalion;
  parcours?: any;
}

/**
 * User Statistics - Complete user stats
 */
export interface UserStats {
  totalPoints: number;
  totalDistance: number;
  totalDuration: number;
  parcoursCompleted: number;
  poisVisited: number;
  quizzesPassed: number;
  treasuresFound: number;
  badgesEarned: number;
  challengesCompleted: number;
  currentRank?: number;
  level?: number;
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated Response Wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
