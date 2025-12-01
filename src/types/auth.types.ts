export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture?: string;
  level: number;
  totalPoints: number;
  totalDistance: number;
  totalDuration: number;
  badges?: any[]; // User badges/achievements
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
