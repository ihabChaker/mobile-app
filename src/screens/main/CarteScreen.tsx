import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';
import parcoursService from '@/services/parcours.service';
import poiService from '@/services/poi.service';
import { Parcours, POI } from '@/types/parcours.types';

// Import conditionnel pour éviter les erreurs web
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;
let Location: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  Location = require('expo-location');
}

/**
 * Écran Carte Interactive
 */
export const CarteScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<any>(null);
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [pois, setPois] = useState<POI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [showPOIs, setShowPOIs] = useState(true);
  const [showGPXPaths, setShowGPXPaths] = useState(true);

  /**
   * Parse GeoJSON string to extract coordinates for Polyline
   */
  const parseGeoJSON = (geoJsonPath?: string): Array<{latitude: number, longitude: number}> => {
    if (!geoJsonPath) return [];
    
    try {
      const geoJson = JSON.parse(geoJsonPath);
      
      // GeoJSON LineString format: { type: "LineString", coordinates: [[lon, lat], [lon, lat], ...] }
      if (geoJson.type === 'LineString' && Array.isArray(geoJson.coordinates)) {
        return geoJson.coordinates.map((coord: [number, number]) => ({
          longitude: coord[0],
          latitude: coord[1],
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing GeoJSON:', error);
      return [];
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        // Demander la permission de localisation
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            'Permission refusée',
            'L\'accès à votre position est nécessaire pour afficher votre position sur la carte.',
            [{ text: 'OK' }]
          );
          setHasLocationPermission(false);
        } else {
          setHasLocationPermission(true);
          // Obtenir la position actuelle
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(currentLocation);
        }

        // Charger les parcours
        const parcoursData = await parcoursService.getParcours();
        setParcours(parcoursData || []);

        // Charger les POIs pour tous les parcours
        const allPois: POI[] = [];
        for (const p of (parcoursData || [])) {
          try {
            const parcoursPois = await poiService.getPOIsByParcours(p.id);
            allPois.push(...parcoursPois);
          } catch (error) {
            // Continuer si un parcours n'a pas de POIs
          }
        }
        setPois(allPois);
      } catch (error: any) {
        Alert.alert('Erreur', error.message || 'Erreur lors du chargement de la carte');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Message pour la version web
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, { paddingTop: insets.top }]}>
        <Text style={styles.webIcon}>🗺️</Text>
        <Text style={styles.webTitle}>Carte Interactive</Text>
        <Text style={styles.webText}>
          La carte interactive est disponible uniquement sur mobile.
        </Text>
        <Text style={styles.webSubtext}>
          Scannez le QR code avec Expo Go sur votre téléphone pour voir la carte.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  // Position par défaut (Normandie - zone du débarquement)
  const defaultRegion = {
    latitude: 49.3425,
    longitude: -0.8874,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  const initialRegion = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : defaultRegion;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={hasLocationPermission}
        showsCompass
        showsScale
      >
        {/* GPX Path Polylines */}
        {showGPXPaths && parcours.map(item => {
          const pathCoordinates = parseGeoJSON(item.geoJsonPath);
          
          if (pathCoordinates.length < 2) return null;

          // Color based on difficulty
          const difficulty = item.difficulty || 'moyen';
          const pathColor = {
            facile: colors.success,
            moyen: colors.warning,
            difficile: colors.error,
          }[difficulty] || colors.primary;

          return (
            <Polyline
              key={`path-${item.id}`}
              coordinates={pathCoordinates}
              strokeColor={pathColor}
              strokeWidth={3}
              lineCap="round"
              lineJoin="round"
            />
          );
        })}

        {/* Marqueurs de parcours */}
        {parcours.map(item => {
          // Utiliser les coordonnées du point de départ
          if (!item.startPoint?.latitude || !item.startPoint?.longitude) return null;

          return (
            <Marker
              key={`parcours-${item.id}`}
              coordinate={{
                latitude: item.startPoint.latitude,
                longitude: item.startPoint.longitude,
              }}
              title={`🚩 ${item.title}`}
              description={`${item.distance} km • ${item.estimatedDuration} min`}
              pinColor={colors.primary}
            />
          );
        })}

        {/* Marqueurs de POIs */}
        {showPOIs && pois.map(poi => {
          if (!poi.coordinates?.latitude || !poi.coordinates?.longitude) return null;

          const poiIcon = {
            monument: '🏛️',
            musee: '🏛️',
            cimetiere: '⚰️',
            bunker: '🛡️',
            plage: '🏖️',
            autre: '📍',
          }[poi.type] || '📍';

          return (
            <Marker
              key={`poi-${poi.id}`}
              coordinate={{
                latitude: poi.coordinates.latitude,
                longitude: poi.coordinates.longitude,
              }}
              title={`${poiIcon} ${poi.name}`}
              description={poi.type}
              pinColor={colors.secondary}
            />
          );
        })}
      </MapView>

      {parcours.length === 0 && pois.length === 0 ? (
        <View style={styles.emptyMapOverlay}>
          <View style={styles.emptyMapCard}>
            <Text style={styles.emptyMapIcon}>🗺️</Text>
            <Text style={styles.emptyMapTitle}>Aucun parcours sur la carte</Text>
            <Text style={styles.emptyMapText}>
              Les parcours et points d'intérêt apparaîtront ici une fois disponibles.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.overlay}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🗺️ Carte Interactive</Text>
            <Text style={styles.infoText}>
              {parcours.length} parcours • {pois.length} points d'intérêt
            </Text>
            {pois.length > 0 && (
              <View style={styles.legend}>
                <Text style={styles.legendItem}>🚩 Départ de parcours</Text>
                <Text style={styles.legendItem}>📍 Points d'intérêt</Text>
              </View>
            )}
            
            {/* Toggle buttons */}
            <View style={styles.toggleContainer}>
              {parcours.some(p => p.geoJsonPath) && (
                <TouchableOpacity
                  style={[styles.toggleButton, showGPXPaths && styles.toggleButtonActive]}
                  onPress={() => setShowGPXPaths(!showGPXPaths)}
                >
                  <Text style={[styles.toggleButtonText, showGPXPaths && styles.toggleButtonTextActive]}>
                    {showGPXPaths ? '✓' : ''} Chemins
                  </Text>
                </TouchableOpacity>
              )}
              
              {pois.length > 0 && (
                <TouchableOpacity
                  style={[styles.toggleButton, showPOIs && styles.toggleButtonActive]}
                  onPress={() => setShowPOIs(!showPOIs)}
                >
                  <Text style={[styles.toggleButtonText, showPOIs && styles.toggleButtonTextActive]}>
                    {showPOIs ? '✓' : ''} POIs
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.gray600,
    marginTop: spacing.md,
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  webIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  webTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  webText: {
    ...typography.bodyLarge,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  webSubtext: {
    ...typography.bodyMedium,
    color: colors.gray600,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    ...typography.h6,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.gray600,
  },
  legend: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray300,
  },
  legendItem: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.xxs,
  },
  emptyMapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: spacing.xl,
  },
  emptyMapCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 4.0,
  },
  emptyMapIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyMapTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyMapText: {
    ...typography.bodyMedium,
    color: colors.gray600,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.gray200,
    borderWidth: 1,
    borderColor: colors.gray300,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    ...typography.bodySmall,
    color: colors.gray600,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: colors.surface,
  },
});
