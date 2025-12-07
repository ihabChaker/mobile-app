export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Parcours entity - aligned with backend
 */
export interface Parcours {
  id: number;
  name: string;
  description: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  distanceKm: number;
  estimatedDuration: number;
  isPmrAccessible: boolean;
  historicalTheme?: string;
  startingPointLat: number;
  startingPointLon: number;
  gpxFileUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  creationDate: string;
  updatedAt: string;
  // Computed properties for convenience
  startPoint?: Coordinates;
  endPoint?: Coordinates; // Same as startPoint if not specified
  // Alias for backwards compatibility
  title?: string;
  distance?: number;
  thumbnailUrl?: string;
  difficulty?: 'facile' | 'moyen' | 'difficile';
  geoJsonPath?: string; // Alias for gpxFileUrl
}

/**
 * Point of Interest entity - aligned with backend
 */
export interface POI {
  id: number;
  parcoursId: number;
  name: string;
  description: string;
  poiType:
    | 'bunker'
    | 'blockhaus'
    | 'memorial'
    | 'museum'
    | 'beach'
    | 'monument';
  latitude: number;
  longitude: number;
  historicalPeriod?: string;
  orderInParcours: number;
  qrCode?: string;
  imageUrl?: string;
  audioUrl?: string;
  // Content relationships
  quizId?: number;
  treasureHuntId?: number;
  podcastId?: number;
  // Computed property for convenience
  coordinates?: Coordinates;
  // Alias for backwards compatibility - required for type safety
  type: 'monument' | 'musee' | 'cimetiere' | 'bunker' | 'plage' | 'autre';
  orderIndex?: number;
  visitDuration?: number;
}

/**
 * Podcast entity - aligned with backend
 */
export interface Podcast {
  id: number;
  title: string;
  description: string;
  durationSeconds: number;
  audioFileUrl: string;
  narrator?: string;
  language: string;
  thumbnailUrl?: string;
  creationDate: string;
}

/**
 * Maps backend difficulty level to French display value
 */
export const mapDifficultyToFrench = (
  level: Parcours['difficultyLevel']
): 'facile' | 'moyen' | 'difficile' => {
  const mapping: Record<
    Parcours['difficultyLevel'],
    'facile' | 'moyen' | 'difficile'
  > = {
    easy: 'facile',
    medium: 'moyen',
    hard: 'difficile',
  };
  return mapping[level] || 'moyen';
};

/**
 * Maps backend POI type to display type
 */
export const mapPoiType = (poiType: POI['poiType']): POI['type'] => {
  const mapping: Record<POI['poiType'], POI['type']> = {
    bunker: 'bunker',
    blockhaus: 'bunker',
    memorial: 'monument',
    museum: 'musee',
    beach: 'plage',
    monument: 'monument',
  };
  return mapping[poiType] || 'autre';
};

/**
 * Transform backend Parcours to include computed/alias fields for UI
 */
export const transformParcours = (p: Parcours): Parcours => {
  const startPoint = {
    latitude: p.startingPointLat,
    longitude: p.startingPointLon,
  };
  return {
    ...p,
    title: p.name,
    distance: p.distanceKm,
    thumbnailUrl: p.imageUrl,
    difficulty: mapDifficultyToFrench(p.difficultyLevel),
    startPoint,
    endPoint: startPoint, // Use start point as end point if not specified
    geoJsonPath: p.geoJsonPath || p.gpxFileUrl, // Use geoJsonPath if available, fallback to gpxFileUrl
  };
};

/**
 * Transform backend POI to include computed/alias fields for UI
 */
export const transformPOI = (poi: POI): POI => ({
  ...poi,
  type: mapPoiType(poi.poiType),
  orderIndex: poi.orderInParcours,
  coordinates: {
    latitude: poi.latitude,
    longitude: poi.longitude,
  },
});
