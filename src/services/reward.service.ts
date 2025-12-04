import apiService, { extractData, PaginatedResponse } from './api.service';

/**
 * Interface pour un badge
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
 * Interface pour un badge utilisateur
 */
export interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  badge: Badge;
  earnedAt: string;
  progress: number;
}

/**
 * Interface pour un challenge
 */
export interface Challenge {
  id: number;
  name: string;
  description: string;
  type: 'distance' | 'duration' | 'poi_visits' | 'quiz_score' | 'streak';
  target: number;
  reward: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour un challenge utilisateur
 */
export interface UserChallenge {
  id: number;
  userId: number;
  challengeId: number;
  challenge: Challenge;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  startedAt: string;
}

/**
 * Interface pour une entrée du leaderboard
 */
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  points: number;
  level: number;
  badgesCount: number;
  isCurrentUser?: boolean;
}

/**
 * Service de gestion des récompenses et badges
 * Phase 4 - Gamification
 */
class RewardService {
  /**
   * Obtenir tous les badges disponibles
   */
  async getAllBadges(): Promise<Badge[]> {
    const response = await apiService.get<Badge[] | PaginatedResponse<Badge>>('/badges');
    return extractData(response);
  }

  /**
   * Obtenir les badges de l'utilisateur
   */
  async getMyBadges(): Promise<UserBadge[]> {
    const response = await apiService.get<UserBadge[] | PaginatedResponse<UserBadge>>('/badges/my-badges');
    return extractData(response);
  }

  /**
   * Obtenir un badge spécifique
   */
  async getBadgeById(id: number): Promise<Badge> {
    return apiService.get<Badge>(`/badges/${id}`);
  }

  /**
   * Obtenir tous les challenges actifs
   */
  async getActiveChallenges(): Promise<Challenge[]> {
    const response = await apiService.get<Challenge[] | PaginatedResponse<Challenge>>('/challenges/active');
    return extractData(response);
  }

  /**
   * Obtenir les challenges de l'utilisateur
   */
  async getMyChallenges(): Promise<UserChallenge[]> {
    const response = await apiService.get<UserChallenge[] | PaginatedResponse<UserChallenge>>('/challenges/my-challenges');
    return extractData(response);
  }

  /**
   * Démarrer un challenge
   */
  async startChallenge(challengeId: number): Promise<UserChallenge> {
    return apiService.post<UserChallenge>('/challenges/start', {
      challengeId,
    });
  }

  /**
   * Obtenir le leaderboard
   */
  async getLeaderboard(period: 'week' | 'month' | 'year' | 'all' = 'all'): Promise<LeaderboardEntry[]> {
    return apiService.get<LeaderboardEntry[]>(`/leaderboard?period=${period}`);
  }
}

export const rewardService = new RewardService();
export default rewardService;
