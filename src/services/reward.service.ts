import apiService, { extractData, PaginatedResponse } from './api.service';
import {
  Badge,
  UserBadge,
  Challenge,
  UserChallenge,
  LeaderboardEntry,
  Reward,
  UserReward,
} from '@/types/backend.types';

/**
 * Service de gestion des récompenses et badges
 * Phase 4 - Gamification
 */
class RewardService {
  /**
   * Obtenir tous les badges disponibles
   */
  async getAllBadges(): Promise<Badge[]> {
    const response = await apiService.get<Badge[] | PaginatedResponse<Badge>>(
      '/badges'
    );
    return extractData(response);
  }

  /**
   * Obtenir les badges de l'utilisateur
   */
  async getMyBadges(): Promise<UserBadge[]> {
    const response = await apiService.get<
      UserBadge[] | PaginatedResponse<UserBadge>
    >('/badges/my-badges');
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
    const response = await apiService.get<
      Challenge[] | PaginatedResponse<Challenge>
    >('/challenges/active');
    return extractData(response);
  }

  /**
   * Obtenir les challenges de l'utilisateur
   */
  async getMyChallenges(): Promise<UserChallenge[]> {
    const response = await apiService.get<
      UserChallenge[] | PaginatedResponse<UserChallenge>
    >('/challenges/my-challenges');
    return extractData(response);
  }

  /**
   * Accepter un challenge
   */
  async acceptChallenge(challengeId: number): Promise<UserChallenge> {
    return apiService.post<UserChallenge>(`/challenges/start`, { challengeId });
  }

  /**
   * Obtenir le leaderboard global
   */
  async getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await apiService.get<
      LeaderboardEntry[] | PaginatedResponse<LeaderboardEntry>
    >('/leaderboard/global');
    return extractData(response);
  }

  /**
   * Obtenir le leaderboard hebdomadaire
   */
  async getWeeklyLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await apiService.get<
      LeaderboardEntry[] | PaginatedResponse<LeaderboardEntry>
    >('/leaderboard/weekly');
    return extractData(response);
  }

  /**
   * Obtenir toutes les récompenses disponibles
   */
  async getAvailableRewards(): Promise<Reward[]> {
    const response = await apiService.get<Reward[] | PaginatedResponse<Reward>>(
      '/rewards'
    );
    return extractData(response);
  }

  /**
   * Obtenir une récompense spécifique
   */
  async getRewardById(id: number): Promise<Reward> {
    return apiService.get<Reward>(`/rewards/${id}`);
  }

  /**
   * Échanger des points contre une récompense
   */
  async redeemReward(rewardId: number): Promise<UserReward> {
    return apiService.post<UserReward>('/rewards/redeem', { rewardId });
  }

  /**
   * Obtenir mes récompenses échangées
   */
  async getMyRedemptions(): Promise<UserReward[]> {
    const response = await apiService.get<
      UserReward[] | PaginatedResponse<UserReward>
    >('/rewards/redemptions/me');
    return extractData(response);
  }
}

export const rewardService = new RewardService();
export default rewardService;
