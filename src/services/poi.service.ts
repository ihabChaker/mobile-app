import apiService, { extractData, PaginatedResponse } from './api.service';
import { POI, transformPOI } from '@/types/parcours.types';

/**
 * Service pour la gestion des Points d'Intérêt
 */
class POIService {
  /**
   * Lister les POI d'un parcours
   */
  async getPOIsByParcours(parcoursId: number): Promise<POI[]> {
    const response = await apiService.get<POI[] | PaginatedResponse<POI>>(
      `/poi/parcours/${parcoursId}`
    );
    const data = extractData(response);
    return data.map(transformPOI);
  }

  /**
   * Obtenir un POI par ID
   */
  async getPOIById(id: number): Promise<POI> {
    const data = await apiService.get<POI>(`/poi/${id}`);
    return transformPOI(data);
  }

  /**
   * Enregistrer une visite de POI
   */
  async recordVisit(
    poiId: number,
    data: { latitude: number; longitude: number }
  ): Promise<any> {
    return apiService.post(`/activities/poi-visits`, {
      poiId,
      latitude: data.latitude,
      longitude: data.longitude,
      scannedQr: false,
      listenedAudio: false,
    });
  }
}

export const poiService = new POIService();
export default poiService;
