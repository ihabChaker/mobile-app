import apiService from './api.service';

export interface TreasureHunt {
  id: number;
  parcoursId: number;
  name: string;
  description?: string;
  targetObject: string;
  latitude: number;
  longitude: number;
  scanRadiusMeters: number;
  pointsReward: number;
  qrCode?: string;
  isActive: boolean;
}

export interface RecordTreasureFoundDto {
  treasureId?: number;
  latitude: number;
  longitude: number;
  qrCode?: string;
}

export interface TreasureFoundResponse {
  found: {
    id: number;
    userId: number;
    treasureId: number;
    foundDatetime: string;
    pointsEarned: number;
  };
  message: string;
  pointsEarned: number;
}

class TreasureHuntService {
  /**
   * Enregistrer une découverte de trésor
   */
  async recordFound(data: RecordTreasureFoundDto): Promise<TreasureFoundResponse> {
    return apiService.post<TreasureFoundResponse>('/treasure-hunts/found', data);
  }

  /**
   * Obtenir mes trésors trouvés
   */
  async getMyTreasures(): Promise<any[]> {
    return apiService.get<any[]>('/treasure-hunts/found/me');
  }
}

export const treasureHuntService = new TreasureHuntService();
export default treasureHuntService;
