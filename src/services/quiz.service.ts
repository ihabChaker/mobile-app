import apiService, { extractData, PaginatedResponse } from './api.service';

/**
 * Interface pour un quiz
 */
export interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
}

/**
 * Interface pour une question de quiz
 */
export interface QuizQuestion {
  id: number;
  quizId: number;
  questionText: string;
  points: number;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  answers?: QuizAnswer[];
}

/**
 * Interface pour une réponse de quiz
 */
export interface QuizAnswer {
  id: number;
  questionId: number;
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
}

/**
 * Interface pour une tentative de quiz
 */
export interface QuizAttempt {
  id: number;
  quizId: number;
  userId: number;
  score: number;
  maxScore: number;
  pointsEarned: number;
  completedAt: string;
}

/**
 * Interface pour soumettre une tentative
 */
export interface SubmitQuizAttemptDto {
  quizId: number;
  answers: { questionId: number; answerId: number }[];
}

/**
 * Service de gestion des quiz
 * Phase 4 - Gamification
 */
class QuizService {
  /**
   * Obtenir tous les quizzes
   */
  async getAllQuizzes(): Promise<Quiz[]> {
    const response = await apiService.get<Quiz[] | PaginatedResponse<Quiz>>('/quizzes');
    return extractData(response);
  }

  /**
   * Obtenir un quiz par ID avec ses questions et réponses
   */
  async getQuizById(id: number): Promise<Quiz> {
    return apiService.get<Quiz>(`/quizzes/${id}`);
  }

  /**
   * Obtenir les quizzes d'un parcours
   */
  async getQuizzesByParcours(parcoursId: number): Promise<Quiz[]> {
    const response = await apiService.get<Quiz[]>(`/quizzes/parcours/${parcoursId}`);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Soumettre une tentative de quiz
   */
  async submitQuizAttempt(dto: SubmitQuizAttemptDto): Promise<{
    attempt: QuizAttempt;
    score: number;
    maxScore: number;
    pointsEarned: number;
    results: { questionId: number; correct: boolean; points: number }[];
  }> {
    return apiService.post('/quizzes/attempts', dto);
  }

  /**
   * Obtenir l'historique des tentatives de quiz
   */
  async getMyAttempts(): Promise<QuizAttempt[]> {
    const response = await apiService.get<QuizAttempt[] | PaginatedResponse<QuizAttempt>>('/quizzes/attempts/me');
    return extractData(response);
  }
}

export const quizService = new QuizService();
export default quizService;
