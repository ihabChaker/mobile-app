import apiService, { extractData, PaginatedResponse } from './api.service';
import { User } from '@/types/auth.types';
import { UserBadge, Badge } from '@/types/backend.types';

interface UserStats {
  totalActivities: number;
  totalDistance: number;
  totalDuration: number;
  totalPoints: number;
  level: number;
  completedParcours: number;
  visitedPOIs: number;
  quizzesCompleted: number;
  challengesCompleted: number;
  treasuresFound: number;
}

/**
 * Service pour la gestion des utilisateurs
 */
class UserService {
  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(): Promise<User> {
    return apiService.get<User>('/users/me');
  }

  /**
   * Mettre à jour le profil de l'utilisateur (PUT)
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    return apiService.put<User>('/users/me', data);
  }

  /**
   * Mettre à jour le profil partiellement (PATCH)
   */
  async patchProfile(data: Partial<User>): Promise<User> {
    return apiService.patch<User>('/users/me', data);
  }

  /**
   * Récupérer les statistiques de l'utilisateur connecté
   */
  async getStats(): Promise<UserStats> {
    return apiService.get<UserStats>('/users/me/stats');
  }

  /**
   * Récupérer un profil utilisateur par ID
   */
  async getUserById(id: number): Promise<User> {
    return apiService.get<User>(`/users/${id}`);
  }

  /**
   * Récupérer mes badges
   */
  async getMyBadges(
    page: number = 1,
    limit: number = 20
  ): Promise<UserBadge[]> {
    const response = await apiService.get<
      UserBadge[] | PaginatedResponse<UserBadge>
    >(`/badges/my-badges?page=${page}&limit=${limit}`);
    return extractData(response);
  }

  /**
   * Récupérer la progression d'un badge
   */
  async getBadgeProgress(badgeId: number): Promise<{
    badge: Badge;
    currentProgress: number;
    targetValue: number;
    progressPercentage: number;
    isUnlocked: boolean;
  }> {
    return apiService.get(`/user-badges/progress/${badgeId}`);
  }
}

export const userService = new UserService();
export default userService;
