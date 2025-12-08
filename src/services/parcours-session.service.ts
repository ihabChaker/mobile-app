import apiService from './api.service';
import {
  ParcoursSession,
  StartSessionDto,
  UpdateSessionDto,
  CompleteSessionDto,
} from '@/types/backend.types';

/**
 * Service for managing active parcours sessions
 * Tracks real-time progress during a parcours
 */
class ParcoursSessionService {
  /**
   * Start a new parcours session or resume existing one
   */
  async startSession(dto: StartSessionDto): Promise<ParcoursSession> {
    return await apiService.post<ParcoursSession>(
      '/parcours-sessions/start',
      dto
    );
  }

  /**
   * Get all active sessions for current user
   */
  async getActiveSessions(): Promise<ParcoursSession[]> {
    return await apiService.get<ParcoursSession[]>('/parcours-sessions/active');
  }

  /**
   * Get active session for a specific parcours
   */
  async getActiveSessionForParcours(
    parcoursId: number
  ): Promise<ParcoursSession | null> {
    try {
      return await apiService.get<ParcoursSession>(
        `/parcours-sessions/active/${parcoursId}`
      );
    } catch (error: any) {
      // Return null if no active session found
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update session with current GPS position and progress
   */
  async updateSession(
    sessionId: number,
    dto: UpdateSessionDto
  ): Promise<ParcoursSession> {
    return await apiService.put<ParcoursSession>(
      `/parcours-sessions/${sessionId}/update`,
      dto
    );
  }

  /**
   * Complete a parcours session
   */
  async completeSession(
    sessionId: number,
    dto: CompleteSessionDto
  ): Promise<{
    session: ParcoursSession;
    pointsEarned: number;
    message: string;
  }> {
    return await apiService.post<{
      session: ParcoursSession;
      pointsEarned: number;
      message: string;
    }>(`/parcours-sessions/${sessionId}/complete`, dto);
  }

  /**
   * Delete/abandon a session
   */
  async deleteSession(sessionId: number): Promise<void> {
    await apiService.delete(`/parcours-sessions/${sessionId}`);
  }
}

export const parcoursSessionService = new ParcoursSessionService();
export default parcoursSessionService;
