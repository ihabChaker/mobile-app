import apiService, { extractData, PaginatedResponse } from './api.service';
import { LeaderboardEntry } from '@/types/backend.types';

/**
 * Service for leaderboard and rankings
 */
class LeaderboardService {
  /**
   * Get global leaderboard
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 20)
   */
  async getGlobalLeaderboard(
    page: number = 1,
    limit: number = 20
  ): Promise<LeaderboardEntry[]> {
    const response = await apiService.get<
      LeaderboardEntry[] | PaginatedResponse<LeaderboardEntry>
    >(`/leaderboard/global?page=${page}&limit=${limit}`);
    return extractData(response);
  }

  /**
   * Get leaderboard for a specific parcours
   * @param parcoursId ID of the parcours
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 20)
   */
  async getParcoursLeaderboard(
    parcoursId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<LeaderboardEntry[]> {
    const response = await apiService.get<
      LeaderboardEntry[] | PaginatedResponse<LeaderboardEntry>
    >(`/leaderboard/parcours/${parcoursId}?page=${page}&limit=${limit}`);
    return extractData(response);
  }

  /**
   * Get user's rank
   */
  async getMyRank(): Promise<{ rank: number; totalUsers: number }> {
    return await apiService.get<{ rank: number; totalUsers: number }>(
      '/leaderboard/my-rank'
    );
  }
}

export const leaderboardService = new LeaderboardService();
export default leaderboardService;
