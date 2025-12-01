import apiService from './api.service';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth.types';

/**
 * Service pour l'authentification
 */
class AuthService {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/login', credentials);
  }

  /**
   * Inscription utilisateur
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/register', userData);
  }

  /**
   * Déconnexion (côté client uniquement)
   */
  logout(): void {
    // La déconnexion côté serveur n'est pas nécessaire avec JWT
    // On nettoie juste le state Redux
  }
}

export const authService = new AuthService();
export default authService;
