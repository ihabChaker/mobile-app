import axios, { AxiosInstance, AxiosError } from 'axios';
import { store } from '@/store/store';
import { logout } from '@/store/slices/authSlice';

// URL de base de l'API backend
const API_BASE_URL = 'https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1';

/**
 * Instance Axios configurée pour l'API HistoRando
 */
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configuration des interceptors pour les requêtes et réponses
   */
  private setupInterceptors(): void {
    // Interceptor pour les requêtes
    this.api.interceptors.request.use(
      config => {
        const token = store.getState().auth.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Interceptor pour les réponses
    this.api.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        // Gérer les erreurs 401 (non authentifié)
        if (error.response?.status === 401) {
          store.dispatch(logout());
        }

        // Gérer les autres erreurs
        const errorMessage =
          (error.response?.data as any)?.message ||
          error.message ||
          'Une erreur est survenue';

        return Promise.reject({
          message: errorMessage,
          statusCode: error.response?.status || 500,
          error: error.response?.statusText || 'Internal Server Error',
        });
      }
    );
  }

  /**
   * Getter pour l'instance Axios
   */
  getInstance(): AxiosInstance {
    return this.api;
  }

  /**
   * Méthode GET
   */
  async get<T>(url: string, config = {}): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  /**
   * Méthode POST
   */
  async post<T>(url: string, data?: any, config = {}): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Méthode PUT
   */
  async put<T>(url: string, data?: any, config = {}): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Méthode PATCH
   */
  async patch<T>(url: string, data?: any, config = {}): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Méthode DELETE
   */
  async delete<T>(url: string, config = {}): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }
}

// Export de l'instance singleton
export const apiService = new ApiService();
export default apiService;
