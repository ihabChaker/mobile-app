import apiService from './api.service';
import { POI } from '@/types/parcours.types';

/**
 * Service pour la gestion des Points d'Intérêt
 */
class POIService {
  /**
   * Lister les POI d'un parcours
   */
  async getPOIsByParcours(parcoursId: number): Promise<POI[]> {
    return apiService.get<POI[]>(`/poi/parcours/${parcoursId}`);
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
