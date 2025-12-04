import apiService, { extractData, PaginatedResponse } from './api.service';

/**
 * Interface pour une question de quiz
 */
export interface QuizQuestion {
  id: number;
  poiId: number;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour une réponse de quiz
 */
export interface QuizAnswer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  pointsEarned: number;
  answeredAt: string;
}

/**
 * Interface pour les statistiques de quiz
 */
export interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  accuracy: number;
  bestStreak: number;
}

/**
 * Service de gestion des quiz
 * Phase 4 - Gamification
 */
class QuizService {
  /**
   * Obtenir les questions pour un POI
   */
  async getQuestionsByPOI(poiId: number): Promise<QuizQuestion[]> {
    const response = await apiService.get<QuizQuestion[] | PaginatedResponse<QuizQuestion>>(`/quiz/poi/${poiId}`);
    return extractData(response);
  }

  /**
   * Obtenir une question spécifique
   */
  async getQuestionById(id: number): Promise<QuizQuestion> {
    return apiService.get<QuizQuestion>(`/quiz/${id}`);
  }

  /**
   * Soumettre une réponse
   */
  async submitAnswer(questionId: number, answer: number): Promise<QuizAnswer> {
    return apiService.post<QuizAnswer>('/quiz/answer', {
      questionId,
      answer,
    });
  }

  /**
   * Obtenir l'historique des réponses
   */
  async getMyAnswers(): Promise<QuizAnswer[]> {
    const response = await apiService.get<QuizAnswer[] | PaginatedResponse<QuizAnswer>>('/quiz/my-answers');
    return extractData(response);
  }

  /**
   * Obtenir les statistiques de quiz
   */
  async getStats(): Promise<QuizStats> {
    return apiService.get<QuizStats>('/quiz/stats');
  }
}

export const quizService = new QuizService();
export default quizService;
