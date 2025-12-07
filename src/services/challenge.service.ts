import apiService, { extractData, PaginatedResponse } from './api.service';
import { Challenge, UserChallenge } from '@/types/backend.types';

/**
 * Service for challenges
 */
class ChallengeService {
  /**
   * Get all challenges
   */
  async getAllChallenges(): Promise<Challenge[]> {
    const response = await apiService.get<
      Challenge[] | PaginatedResponse<Challenge>
    >('/challenges');
    return extractData(response);
  }

  /**
   * Get active challenges
   */
  async getActiveChallenges(): Promise<Challenge[]> {
    const response = await apiService.get<
      Challenge[] | PaginatedResponse<Challenge>
    >('/challenges/active');
    return extractData(response);
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(id: number): Promise<Challenge> {
    return await apiService.get<Challenge>(`/challenges/${id}`);
  }

  /**
   * Get my challenges
   */
  async getMyChallenges(): Promise<UserChallenge[]> {
    const response = await apiService.get<
      UserChallenge[] | PaginatedResponse<UserChallenge>
    >('/challenges/my-challenges');
    return extractData(response);
  }

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId: number): Promise<UserChallenge> {
    return await apiService.post<UserChallenge>(
      `/challenges/${challengeId}/join`
    );
  }

  /**
   * Get challenge progress
   */
  async getChallengeProgress(userChallengeId: number): Promise<UserChallenge> {
    return await apiService.get<UserChallenge>(
      `/challenges/progress/${userChallengeId}`
    );
  }
}

export const challengeService = new ChallengeService();
export default challengeService;
