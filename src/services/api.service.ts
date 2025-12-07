import axios, { AxiosInstance, AxiosError } from 'axios';
import { store } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import Constants from 'expo-constants';

// URL de base de l'API backend - chargée depuis les variables d'environnement
const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:3000/api/v1';

console.log('========================================');
console.log('🔗 API Configuration');
console.log('========================================');
console.log('Base URL:', API_BASE_URL);
console.log(
  'Source:',
  Constants.expoConfig?.extra?.apiUrl ? 'app.config' : 'env'
);
console.log('========================================');
console.log('💡 For physical device:');
console.log('   Update EXPO_PUBLIC_API_URL in .env');
console.log('   Use your computer IP (e.g., 192.168.1.100)');
console.log('   See NETWORK_SETUP.md for help');
console.log('========================================');

/**
 * Interface pour les réponses paginées
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Utilitaire pour extraire les données d'une réponse paginée ou non
 * Assure la rétrocompatibilité avec les anciennes réponses (tableaux directs)
 */
export function extractData<T>(response: T[] | PaginatedResponse<T>): T[] {
  // Si c'est déjà un tableau, le retourner tel quel
  if (Array.isArray(response)) {
    return response;
  }
  // Si c'est une réponse paginée, extraire le tableau data
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  // Par défaut, retourner un tableau vide
  return [];
}

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
      paramsSerializer: {
        serialize: params => {
          // Ensure numbers are sent as strings in query params
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value));
            }
          });
          return searchParams.toString();
        },
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

        // Log all requests for debugging
        console.log(
          `📤 API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        if (config.params) {
          console.log('  Params:', JSON.stringify(config.params));
        }

        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Interceptor pour les réponses
    this.api.interceptors.response.use(
      response => {
        console.log(
          `📥 API Response: ${response.status} ${response.config.url}`
        );
        return response;
      },
      (error: AxiosError) => {
        console.error(`❌ API Error: ${error.config?.url}`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

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
          details: error.response?.data,
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
