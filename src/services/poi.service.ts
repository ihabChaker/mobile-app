import apiService, { extractData, PaginatedResponse } from './api.service';
import { POI } from '@/types/parcours.types';

/**
 * Service pour la gestion des Points d'Intérêt
 */
class POIService {
  /**
   * Lister les POI d'un parcours
   */
  async getPOIsByParcours(parcoursId: number): Promise<POI[]> {
    const response = await apiService.get<POI[] | PaginatedResponse<POI>>(`/poi/parcours/${parcoursId}`);
    return extractData(response);
  }

  /**
   * Obtenir un POI par ID
   */
  async getPOIById(id: number): Promise<POI> {
    return apiService.get<POI>(`/poi/${id}`);
  }
}

export const poiService = new POIService();
export default poiService;
