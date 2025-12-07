import apiService, { extractData, PaginatedResponse } from './api.service';
import { TreasureHunt, TreasureItem } from '@/types/backend.types';

export interface RecordTreasureFoundDto {
  treasureItemId: number;
  latitude: number;
  longitude: number;
  qrCode?: string;
}

export interface TreasureFoundResponse {
  found: {
    id: number;
    userId: number;
    treasureItemId: number;
    foundDatetime: string;
    pointsEarned: number;
  };
  message: string;
  pointsEarned: number;
}

class TreasureHuntService {
  /**
   * Obtenir tous les treasure hunts
   */
  async getAllTreasureHunts(): Promise<TreasureHunt[]> {
    const response = await apiService.get<
      TreasureHunt[] | PaginatedResponse<TreasureHunt>
    >('/treasure-hunts');
    return extractData(response);
  }

  /**
   * Obtenir un treasure hunt par ID
   */
  async getTreasureHuntById(id: number): Promise<TreasureHunt> {
    return apiService.get<TreasureHunt>(`/treasure-hunts/${id}`);
  }

  /**
   * Obtenir les treasure hunts d'un parcours
   */
  async getTreasureHuntsByParcours(
    parcoursId: number
  ): Promise<TreasureHunt[]> {
    const response = await apiService.get<
      TreasureHunt[] | PaginatedResponse<TreasureHunt>
    >(`/treasure-hunts/parcours/${parcoursId}`);
    return extractData(response);
  }

  /**
   * Obtenir les items d'un treasure hunt
   */
  async getTreasureItems(treasureHuntId: number): Promise<TreasureItem[]> {
    const response = await apiService.get<
      TreasureItem[] | PaginatedResponse<TreasureItem>
    >(`/treasure-items/treasure-hunt/${treasureHuntId}`);
    return extractData(response);
  }

  /**
   * Enregistrer une découverte de trésor
   */
  async recordFound(
    data: RecordTreasureFoundDto
  ): Promise<TreasureFoundResponse> {
    return apiService.post<TreasureFoundResponse>(
      '/treasure-items/found',
      data
    );
  }

  /**
   * Obtenir mes trésors trouvés
   */
  async getMyTreasures(): Promise<any[]> {
    const response = await apiService.get<any[] | PaginatedResponse<any>>(
      '/treasure-items/found/me'
    );
    return extractData(response);
  }
}

export const treasureHuntService = new TreasureHuntService();
export default treasureHuntService;
