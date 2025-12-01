export interface Quiz {
  id: number;
  poiId: number;
  title: string;
  description: string;
  passingScore: number;
  pointsReward: number;
  timeLimit?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  quizId: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'text';
  points: number;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: number;
  questionId: number;
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  type: 'distance' | 'duration' | 'visit_count' | 'quiz_score' | 'custom';
  targetValue: number;
  pointsReward: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TreasureHunt {
  id: number;
  parcoursId: number;
  title: string;
  description: string;
  qrCode: string;
  coordinates: Coordinates;
  pointsReward: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: number;
  title: string;
  description: string;
  type: 'badge' | 'discount' | 'gift' | 'other';
  pointsCost: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}
