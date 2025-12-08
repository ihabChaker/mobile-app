import apiService, { extractData, PaginatedResponse } from './api.service';
import { TreasureHunt, TreasureItem } from '@/types/backend.types';

export interface ScanTreasureItemDto {
  qrCode: string;
}

export interface ScanTreasureItemResponseDto {
  item: any;
  treasureHunt: any;
  pointsEarned: number;
  isNewFind: boolean;
  totalItemsFound: number;
  totalItemsInHunt: number;
  huntComplete: boolean;
  completionBonus?: number;
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
    >(`/treasure-hunts/${treasureHuntId}/items`);
    return extractData(response);
  }

  /**
   * Obtenir les IDs des items trouvés par l'utilisateur pour une chasse
   */
  async getFoundItemsForHunt(treasureHuntId: number): Promise<number[]> {
    return apiService.get<number[]>(
      `/treasure-hunts/${treasureHuntId}/found-items`
    );
  }

  /**
   * Scanner un item de trésor par QR code
   */
  async scanTreasureItem(qrCode: string): Promise<ScanTreasureItemResponseDto> {
    return apiService.post<ScanTreasureItemResponseDto>(
      '/treasure-hunts/items/scan',
      { qrCode }
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
