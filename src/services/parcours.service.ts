import apiService, { extractData, PaginatedResponse } from './api.service';
import { Parcours } from '@/types/parcours.types';

/**
 * Service pour la gestion des parcours
 */
class ParcoursService {
  /**
   * Récupérer tous les parcours
   */
  async getParcours(): Promise<Parcours[]> {
    const response = await apiService.get<Parcours[] | PaginatedResponse<Parcours>>('/parcours');
    return extractData(response);
  }

  /**
   * Récupérer un parcours par ID
   */
  async getParcoursById(id: number): Promise<Parcours> {
    return apiService.get<Parcours>(`/parcours/${id}`);
  }

  /**
   * Trouver les parcours à proximité
   * @param latitude Latitude de la position
   * @param longitude Longitude de la position
   * @param radius Rayon de recherche en km (optionnel)
   */
  async getNearbyParcours(latitude: number, longitude: number, radius?: number): Promise<Parcours[]> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      ...(radius && { radius: radius.toString() }),
    });
    const response = await apiService.get<Parcours[] | PaginatedResponse<Parcours>>(`/parcours/nearby?${params.toString()}`);
    return extractData(response);
  }
}

export const parcoursService = new ParcoursService();
export default parcoursService;
