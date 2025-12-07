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
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';
import parcoursService from '@/services/parcours.service';
import poiService from '@/services/poi.service';
import { Parcours, POI } from '@/types/parcours.types';
import OSMMapView, { Marker, Polyline } from '@/components/OSMMapView';
import * as Location from 'expo-location';

/**
 * Écran Carte Interactive
 */
export const CarteScreen: React.FC = () => {
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
  const parseGeoJSON = (
    geoJsonPath?: string
  ): Array<{ latitude: number; longitude: number }> => {
    if (!geoJsonPath) return [];

    // Check if it's a URL (backend might be returning a URL to a GeoJSON file)
    if (geoJsonPath.startsWith('http')) {
      return [];
    }

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
    } catch {
      // Silently ignore parsing errors for invalid JSON
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
            "L'accès à votre position est nécessaire pour afficher votre position sur la carte.",
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
        for (const p of parcoursData || []) {
          try {
            const parcoursPois = await poiService.getPOIsByParcours(p.id);
            allPois.push(...parcoursPois);
          } catch {
            // Continuer si un parcours n'a pas de POIs
          }
        }
        setPois(allPois);
      } catch (error: any) {
        Alert.alert(
          'Erreur',
          error.message || 'Erreur lors du chargement de la carte'
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Message pour la version web
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.webContainer} edges={['top', 'bottom']}>
        <Text style={styles.webIcon}>🗺️</Text>
        <Text style={styles.webTitle}>Carte Interactive</Text>
        <Text style={styles.webText}>
          La carte interactive est disponible uniquement sur mobile.
        </Text>
        <Text style={styles.webSubtext}>
          Scannez le QR code avec Expo Go sur votre téléphone pour voir la
          carte.
        </Text>
      </SafeAreaView>
    );
  }

  // Position par défaut (Normandie - zone du débarquement)
  const defaultRegion = {
    latitude: 49.3425,
    longitude: -0.8874,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  // Show map immediately with loading overlay
  if (isLoading) {
    return (
      <View style={styles.container}>
        <OSMMapView
          style={styles.map}
          initialRegion={defaultRegion}
          markers={[]}
          polylines={[]}
          showUserLocation={false}
        />
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Chargement de la carte...</Text>
          </View>
        </View>
      </View>
    );
  }

  const initialRegion = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : defaultRegion;

  // Prepare markers for parcours
  const parcoursMarkers: Marker[] = parcours
    .filter(item => {
      const lat = item.startPoint?.latitude;
      const lon = item.startPoint?.longitude;
      return (
        lat != null && lon != null && !isNaN(Number(lat)) && !isNaN(Number(lon))
      );
    })
    .map(item => ({
      id: `parcours-${item.id}`,
      latitude: Number(item.startPoint!.latitude),
      longitude: Number(item.startPoint!.longitude),
      title: `🚩 ${item.title}`,
      description: `${item.distance} km • ${item.estimatedDuration} min`,
      color: colors.primary,
    }));

  // Prepare markers for POIs
  const poiMarkers: Marker[] = showPOIs
    ? pois
        .filter(poi => {
          const lat = poi.coordinates?.latitude;
          const lon = poi.coordinates?.longitude;
          return (
            lat != null &&
            lon != null &&
            !isNaN(Number(lat)) &&
            !isNaN(Number(lon))
          );
        })
        .map(poi => {
          const poiIcon =
            {
              monument: '🏛️',
              musee: '🏛️',
              cimetiere: '⚰️',
              bunker: '🛡️',
              plage: '🏖️',
              autre: '📍',
            }[poi.type] || '📍';

          return {
            id: `poi-${poi.id}`,
            latitude: Number(poi.coordinates!.latitude),
            longitude: Number(poi.coordinates!.longitude),
            title: `${poiIcon} ${poi.name}`,
            description: poi.type,
            color: colors.secondary,
          };
        })
    : [];

  // Combine all markers
  const allMarkers = [...parcoursMarkers, ...poiMarkers];

  // Prepare polylines for GPX paths
  const polylines: Polyline[] = showGPXPaths
    ? (parcours
        .map(item => {
          const pathCoordinates = parseGeoJSON(item.geoJsonPath);
          if (pathCoordinates.length < 2) return null;

          const difficulty = item.difficulty || 'moyen';
          const pathColor =
            {
              facile: colors.success,
              moyen: colors.warning,
              difficile: colors.error,
            }[difficulty] || colors.primary;

          return {
            id: `path-${item.id}`,
            coordinates: pathCoordinates,
            color: pathColor,
            width: 3,
          };
        })
        .filter(p => p !== null) as Polyline[])
    : [];

  return (
    <View style={styles.container}>
      <OSMMapView
        style={styles.map}
        initialRegion={initialRegion}
        markers={allMarkers}
        polylines={polylines}
        showUserLocation={hasLocationPermission}
      />

      {parcours.length === 0 && pois.length === 0 ? (
        <View style={styles.emptyMapOverlay}>
          <View style={styles.emptyMapCard}>
            <Text style={styles.emptyMapIcon}>🗺️</Text>
            <Text style={styles.emptyMapTitle}>
              Aucun parcours sur la carte
            </Text>
            <Text style={styles.emptyMapText}>
              Les parcours et points d'intérêt apparaîtront ici une fois
              disponibles.
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
                  style={[
                    styles.toggleButton,
                    showGPXPaths && styles.toggleButtonActive,
                  ]}
                  onPress={() => setShowGPXPaths(!showGPXPaths)}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      showGPXPaths && styles.toggleButtonTextActive,
                    ]}
                  >
                    {showGPXPaths ? '✓' : ''} Chemins
                  </Text>
                </TouchableOpacity>
              )}

              {pois.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    showPOIs && styles.toggleButtonActive,
                  ]}
                  onPress={() => setShowPOIs(!showPOIs)}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      showPOIs && styles.toggleButtonTextActive,
                    ]}
                  >
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 4.0,
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
