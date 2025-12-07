import apiService, { extractData, PaginatedResponse } from './api.service';
import { Podcast } from '@/types/parcours.types';

/**
 * Service pour la gestion des podcasts
 */
class PodcastService {
  /**
   * Lister tous les podcasts
   */
  async getAllPodcasts(): Promise<Podcast[]> {
    const response = await apiService.get<
      Podcast[] | PaginatedResponse<Podcast>
    >('/media');
    return extractData(response);
  }

  /**
   * Obtenir un podcast par ID
   */
  async getPodcastById(id: number): Promise<Podcast> {
    return apiService.get<Podcast>(`/media/${id}`);
  }

  /**
   * Obtenir les podcasts d'un parcours
   */
  async getPodcastsByParcours(parcoursId: number): Promise<Podcast[]> {
    const response = await apiService.get<
      Podcast[] | PaginatedResponse<Podcast>
    >(`/media/parcours/${parcoursId}`);
    return extractData(response);
  }
}

export const podcastService = new PodcastService();
export default podcastService;
