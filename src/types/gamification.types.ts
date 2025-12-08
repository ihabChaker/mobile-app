export interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  creationDate: string;
  questions?: Question[];
}

export interface Question {
  id: number;
  quizId: number;
  questionText: string;
  points: number;
  orderIndex: number;
  creationDate: string;
  answers?: Answer[];
}

export interface Answer {
  id: number;
  questionId: number;
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
  creationDate: string;
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
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  scanRadiusMeters: number;
  qrCode?: string;
  isActive: boolean;
  createdAt: string;
  items?: TreasureItem[];
}

export interface TreasureItem {
  id: number;
  treasureHuntId: number;
  itemName: string;
  description?: string;
  imageUrl?: string;
  pointsValue: number;
  qrCode: string;
  createdAt: string;
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
