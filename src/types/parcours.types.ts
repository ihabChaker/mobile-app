export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Parcours {
  id: number;
  title: string;
  description: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  distance: number;
  estimatedDuration: number;
  startPoint: Coordinates;
  endPoint: Coordinates;
  gpxData?: string;
  thumbnailUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface POI {
  id: number;
  parcoursId: number;
  name: string;
  description: string;
  type: 'monument' | 'musee' | 'cimetiere' | 'bunker' | 'plage' | 'autre';
  coordinates: Coordinates;
  address?: string;
  qrCode?: string;
  imageUrl?: string;
  audioGuideUrl?: string;
  visitDuration?: number;
  isActive: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Podcast {
  id: number;
  poiId: number;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  author?: string;
  thumbnailUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
