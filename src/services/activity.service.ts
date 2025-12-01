import apiService from './api.service';

export interface UserActivity {
  id: number;
  userId: number;
  parcoursId: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  distance?: number;
  pointsEarned: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityDto {
  parcoursId: number;
}

export interface UpdateActivityDto {
  completedAt?: string;
  duration?: number;
  distance?: number;
  isCompleted?: boolean;
}

export interface ActivityStats {
  totalActivities: number;
  completedActivities: number;
  totalDistance: number;
  totalDuration: number;
  totalPoints: number;
}

export interface POIVisit {
  id: number;
  userId: number;
  poiId: number;
  activityId?: number;
  visitedAt: string;
  pointsEarned: number;
  createdAt: string;
}

export interface RecordPOIVisitDto {
  poiId: number;
  activityId?: number;
}

/**
 * Service pour le suivi des activités utilisateur
 */
class ActivityService {
  /**
   * Démarrer une nouvelle activité (parcours)
   */
  async startActivity(data: CreateActivityDto): Promise<UserActivity> {
    return apiService.post<UserActivity>('/activities', data);
  }

  /**
   * Obtenir toutes mes activités
   */
  async getMyActivities(): Promise<UserActivity[]> {
    return apiService.get<UserActivity[]>('/activities');
  }

  /**
   * Obtenir les statistiques d'activités
   */
  async getActivityStats(): Promise<ActivityStats> {
    return apiService.get<ActivityStats>('/activities/stats');
  }

  /**
   * Obtenir une activité par ID
   */
  async getActivityById(id: number): Promise<UserActivity> {
    return apiService.get<UserActivity>(`/activities/${id}`);
  }

  /**
   * Mettre à jour une activité
   */
  async updateActivity(id: number, data: UpdateActivityDto): Promise<UserActivity> {
    return apiService.put<UserActivity>(`/activities/${id}`, data);
  }

  /**
   * Supprimer une activité
   */
  async deleteActivity(id: number): Promise<void> {
    return apiService.delete(`/activities/${id}`);
  }

  /**
   * Enregistrer une visite de POI
   */
  async recordPOIVisit(data: RecordPOIVisitDto): Promise<POIVisit> {
    return apiService.post<POIVisit>('/activities/poi-visits', data);
  }

  /**
   * Obtenir mes visites de POI
   */
  async getMyPOIVisits(): Promise<POIVisit[]> {
    return apiService.get<POIVisit[]>('/activities/poi-visits/me');
  }
}

export const activityService = new ActivityService();
export default activityService;
