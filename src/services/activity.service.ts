import apiService, { extractData, PaginatedResponse } from './api.service';

export type ActivityType = 'walking' | 'running' | 'cycling';
export type ActivityStatus = 'in_progress' | 'completed' | 'abandoned';

export interface UserActivity {
  id: number;
  userId: number;
  parcoursId: number;
  startDatetime: string;
  endDatetime?: string;
  distanceCoveredKm?: number;
  activityType: ActivityType;
  pointsEarned: number;
  status: ActivityStatus;
  averageSpeed?: number;
  gpxTraceUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Computed properties for backwards compatibility
  startedAt?: string;
  completedAt?: string;
  distance?: number;
  isCompleted?: boolean;
}

export interface CreateActivityDto {
  parcoursId: number;
  activityType?: ActivityType;
}

export interface UpdateActivityDto {
  endDatetime?: string;
  distanceCoveredKm?: number;
  status?: ActivityStatus;
  averageSpeed?: number;
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
 * Transform backend activity to include computed fields for UI
 */
const transformActivity = (activity: UserActivity): UserActivity => ({
  ...activity,
  startedAt: activity.startDatetime,
  completedAt: activity.endDatetime,
  distance: activity.distanceCoveredKm,
  isCompleted: activity.status === 'completed',
});

/**
 * Service pour le suivi des activités utilisateur
 */
class ActivityService {
  /**
   * Démarrer une nouvelle activité (parcours)
   */
  async startActivity(data: CreateActivityDto): Promise<UserActivity> {
    const result = await apiService.post<UserActivity>('/activities', {
      ...data,
      activityType: data.activityType || 'walking',
    });
    return transformActivity(result);
  }

  /**
   * Obtenir toutes mes activités
   */
  async getMyActivities(): Promise<UserActivity[]> {
    const response = await apiService.get<UserActivity[] | PaginatedResponse<UserActivity>>('/activities');
    const data = extractData(response);
    return data.map(transformActivity);
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
    const result = await apiService.get<UserActivity>(`/activities/${id}`);
    return transformActivity(result);
  }

  /**
   * Mettre à jour une activité
   */
  async updateActivity(id: number, data: UpdateActivityDto): Promise<UserActivity> {
    const result = await apiService.put<UserActivity>(`/activities/${id}`, data);
    return transformActivity(result);
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
    const response = await apiService.get<POIVisit[] | PaginatedResponse<POIVisit>>('/activities/poi-visits/me');
    return extractData(response);
  }
}

export const activityService = new ActivityService();
export default activityService;
