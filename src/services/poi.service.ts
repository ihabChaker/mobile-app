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
    const response = await apiService.get<POI[] | PaginatedResponse<POI>>(`/poi/parcours/${parcoursId}`);
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
}

export const poiService = new POIService();
export default poiService;
