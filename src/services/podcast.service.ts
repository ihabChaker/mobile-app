import apiService from './api.service';
import { Podcast } from '@/types/parcours.types';

/**
 * Service pour la gestion des podcasts
 */
class PodcastService {
  /**
   * Lister tous les podcasts
   */
  async getAllPodcasts(): Promise<Podcast[]> {
    return apiService.get<Podcast[]>('/podcasts');
  }

  /**
   * Obtenir un podcast par ID
   */
  async getPodcastById(id: number): Promise<Podcast> {
    return apiService.get<Podcast>(`/podcasts/${id}`);
  }

  /**
   * Obtenir les podcasts d'un parcours
   */
  async getPodcastsByParcours(parcoursId: number): Promise<Podcast[]> {
    return apiService.get<Podcast[]>(`/podcasts/parcours/${parcoursId}`);
  }
}

export const podcastService = new PodcastService();
export default podcastService;
