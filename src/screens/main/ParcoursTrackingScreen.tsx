import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MainStackParamList } from '@/navigation/types';
import { colors, spacing } from '@/theme';
import parcoursSessionService from '@/services/parcours-session.service';
import parcoursService from '@/services/parcours.service';
import poiService from '@/services/poi.service';
import quizService from '@/services/quiz.service';
import treasureHuntService from '@/services/treasure-hunt.service';
import { QRScanner } from '@/components/QRScanner';
import { Parcours, POI } from '@/types/parcours.types';
import { ParcoursSession } from '@/types/backend.types';

let Location: any = null;
if (Platform.OS !== 'web') {
  try {
    Location = require('expo-location');
  } catch {
    // expo-location not available
  }
}

type ParcoursTrackingScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ParcoursTracking'>;
  route: RouteProp<MainStackParamList, 'ParcoursTracking'>;
};

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const ParcoursTrackingScreen: React.FC<ParcoursTrackingScreenProps> = ({
  navigation,
  route,
}) => {
  const { parcoursId, sessionId } = route.params;

  // Proximity thresholds in meters
  const START_PROXIMITY_THRESHOLD = 50; // 50m to start (generous for GPS accuracy)
  const POI_PROXIMITY_THRESHOLD = 25; // 25m for POI discovery
  const DESTINATION_PROXIMITY_THRESHOLD = 30; // 30m for completion

  const [parcours, setParcours] = useState<Parcours | null>(null);
  const [session, setSession] = useState<ParcoursSession | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(
    null
  );
  const [pathCoordinates, setPathCoordinates] = useState<LocationCoords[]>([]);
  const [originalPath, setOriginalPath] = useState<LocationCoords[]>([]);
  const [traveledPath, setTraveledPath] = useState<LocationCoords[]>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [visitedPOIs, setVisitedPOIs] = useState<Set<number>>(new Set());
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<any>(null);
  const startTime = useRef<Date>(new Date());

  useEffect(() => {
    loadParcoursData();
    startLocationTracking();

    return () => {
      // Cleanup location tracking on unmount
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  const loadParcoursData = async () => {
    try {
      setIsLoading(true);
      const [parcoursData, poisData] = await Promise.all([
        parcoursService.getParcoursById(parcoursId),
        poiService.getPOIsByParcours(parcoursId),
      ]);

      console.log('🗺️ Parcours Data:', JSON.stringify(parcoursData, null, 2));
      console.log('📍 Starting Point:', {
        lat: parcoursData.startingPointLat,
        lon: parcoursData.startingPointLon,
      });
      console.log('📍 GeoJSON Path:', parcoursData.geoJsonPath);

      setParcours(parcoursData);
      setPois(poisData);

      // Get session if sessionId is provided
      if (sessionId) {
        const sessions = await parcoursSessionService.getActiveSessions();
        const currentSession = sessions.find(s => s.id === sessionId);
        if (currentSession) {
          setSession(currentSession);
        }
      }

      // Parse GeoJSON path if available
      if (parcoursData.geoJsonPath) {
        try {
          const geoData = JSON.parse(parcoursData.geoJsonPath);
          console.log('📊 Parsed GeoJSON:', geoData);
          if (geoData.type === 'LineString' && geoData.coordinates) {
            const coords = geoData.coordinates.map((coord: number[]) => ({
              longitude: coord[0],
              latitude: coord[1],
            }));
            console.log('✅ Path Coordinates:', coords.length, 'points');
            console.log('🎯 First:', coords[0]);
            console.log('🏁 Last:', coords[coords.length - 1]);
            setPathCoordinates(coords);
            setOriginalPath(coords); // Store original path
          }
        } catch (e) {
          console.error('❌ Error parsing GeoJSON:', e);
        }
      } else {
        console.log('⚠️ No GeoJSON path available for this parcours');
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de charger le parcours'
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const startLocationTracking = async (): Promise<void | (() => void)> => {
    if (!Location) {
      Alert.alert(
        'Erreur',
        "La géolocalisation n'est pas disponible sur cette plateforme"
      );
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Vous devez autoriser la localisation pour suivre le parcours'
        );
        navigation.goBack();
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(coords);
      setTraveledPath([coords]);

      // Center map on current location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

      // Watch position updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or every 10 meters
        },
        (location: any) => {
          const newCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setCurrentLocation(newCoords);

          // Check if user is near start point (if not started yet)
          if (!hasStarted && parcours) {
            const distToStart = calculateDistance(newCoords, {
              latitude: parcours.startingPointLat,
              longitude: parcours.startingPointLon,
            });

            if (distToStart > START_PROXIMITY_THRESHOLD) {
              // User is too far from start
              return;
            } else {
              // User is close enough, start tracking
              setHasStarted(true);
              setTraveledPath([newCoords]);
              Alert.alert(
                'Parcours démarré !',
                'Vous êtes à proximité du point de départ. Bon parcours !'
              );
            }
          }

          // Only track if started
          if (hasStarted) {
            setTraveledPath(prev => [...prev, newCoords]);

            // Update remaining path to show visual progress
            updateRemainingPath(newCoords);

            // Calculate distance
            if (traveledPath.length > 0) {
              const lastPoint = traveledPath[traveledPath.length - 1];
              const dist = calculateDistance(lastPoint, newCoords);
              setDistance(prev => prev + dist);
            }

            // Check POI proximity
            checkPOIProximity(newCoords);

            // Update session on backend
            updateSessionLocation(newCoords);

            // Check if reached destination
            checkDestinationReached(newCoords);
          }
        }
      );

      // Update duration every second
      const durationInterval = setInterval(() => {
        const elapsed = Math.floor(
          (new Date().getTime() - startTime.current.getTime()) / 1000
        );
        setDuration(elapsed);
      }, 1000);

      return () => clearInterval(durationInterval);
    } catch (error: any) {
      console.error('Location tracking error:', error);
      Alert.alert('Erreur', 'Impossible de démarrer le suivi GPS');
    }
  };

  const updateSessionLocation = async (coords: LocationCoords) => {
    if (!session) return;

    try {
      await parcoursSessionService.updateSession(session.id, {
        currentLat: coords.latitude,
        currentLon: coords.longitude,
        distanceCovered: distance,
      });
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const calculateDistance = (
    point1: LocationCoords,
    point2: LocationCoords
  ): number => {
    // Haversine formula
    const R = 6371e3; // Earth radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const calculateProgress = (): number => {
    if (!parcours || pathCoordinates.length === 0) return 0;
    const totalDistance = (parcours.distance || 0) * 1000; // km to meters
    return Math.min((distance / totalDistance) * 100, 100);
  };

  const updateRemainingPath = (currentPos: LocationCoords) => {
    if (originalPath.length === 0) return;

    // Find the closest point on the original path
    let minDistance = Infinity;
    let closestIndex = 0;

    originalPath.forEach((point, index) => {
      const dist = calculateDistance(currentPos, point);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = index;
      }
    });

    // Update remaining path (from closest point to end)
    const remainingPath = originalPath.slice(closestIndex);
    setPathCoordinates(remainingPath);
  };

  const checkDestinationReached = (coords: LocationCoords) => {
    if (pathCoordinates.length === 0 || !parcours) return;

    const destination = pathCoordinates[pathCoordinates.length - 1];
    const distToDestination = calculateDistance(coords, destination);

    // If within threshold of destination
    if (distToDestination < DESTINATION_PROXIMITY_THRESHOLD) {
      handleParcoursComplete();
    }
  };

  const checkPOIProximity = (coords: LocationCoords) => {
    if (!pois.length) return;

    pois.forEach(poi => {
      // Skip if already visited
      if (visitedPOIs.has(poi.id)) return;

      const lat = poi.coordinates?.latitude ?? poi.latitude;
      const lon = poi.coordinates?.longitude ?? poi.longitude;

      if (!lat || !lon || isNaN(Number(lat)) || isNaN(Number(lon))) {
        return;
      }

      const distToPOI = calculateDistance(coords, {
        latitude: Number(lat),
        longitude: Number(lon),
      });

      // If within POI proximity threshold
      if (distToPOI < POI_PROXIMITY_THRESHOLD) {
        handlePOIVisit(poi);
      }
    });
  };

  const handlePOIVisit = async (poi: POI) => {
    // Mark as visited
    setVisitedPOIs(prev => new Set([...prev, poi.id]));

    try {
      // Record visit on backend
      if (currentLocation && session) {
        await poiService.recordVisit(poi.id, {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          activityId: session.id,
        });
      }

      // Show notification
      Alert.alert(
        `📍 ${poi.name}`,
        `Vous avez découvert un point d'intérêt !\n\n${poi.description}`,
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Failed to record POI visit:', error);
      // Don't show error to user, just log it
    }
  };

  const handleParcoursComplete = async () => {
    if (!session || !currentLocation || !parcours) return;

    try {
      const result = await parcoursSessionService.completeSession(session.id, {
        finalLat: currentLocation.latitude,
        finalLon: currentLocation.longitude,
        distanceCovered: distance,
      });

      // Navigate to completion screen
      navigation.replace('ParcoursCompletion', {
        parcoursName: parcours.name,
        distance: distance / 1000,
        duration: duration,
        pointsEarned: result.completionBonus || 0,
        poisVisited: visitedPOIs.size,
      });
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de terminer le parcours'
      );
    }
  };

  const handleQRScan = async (data: string) => {
    setShowQRScanner(false);

    try {
      // Check if it's a POI QR code
      const poi = pois.find(p => p.qrCode === data);

      if (poi) {
        // Register POI visit
        await poiService.recordVisit(poi.id, {
          latitude: currentLocation?.latitude || 0,
          longitude: currentLocation?.longitude || 0,
        });

        // Check what content the POI has
        if (poi.quizId) {
          // Navigate to quiz
          const quiz = await quizService.getQuizById(poi.quizId);
          navigation.navigate('Quiz', {
            quizId: poi.quizId,
            quizTitle: quiz.title || 'Quiz',
          });
        } else if (poi.treasureHuntId) {
          // Handle treasure hunt
          Alert.alert('Trésor trouvé ! 🏺', 'Vous avez découvert un trésor !');
          // TODO: Show treasure details or navigate to treasure screen
        } else if (poi.podcastId) {
          // Auto-play podcast
          Alert.alert(
            'Podcast disponible 🎧',
            'Le podcast va démarrer automatiquement'
          );
          // TODO: Navigate to podcast player or auto-play
        } else {
          Alert.alert('POI découvert !', poi.name || "Point d'intérêt");
        }
      } else {
        // Check if it's a treasure item QR code
        const treasureItemMatch = data.match(/TREASURE_ITEM_ID:(\d+)/);
        if (treasureItemMatch) {
          const treasureItemId = parseInt(treasureItemMatch[1]);
          await treasureHuntService.recordFound({
            treasureItemId,
            latitude: currentLocation?.latitude || 0,
            longitude: currentLocation?.longitude || 0,
            qrCode: data,
          });
          Alert.alert(
            'Trésor trouvé ! 🏆',
            'Vous avez découvert un objet du trésor !'
          );
        } else {
          Alert.alert(
            'QR Code invalide',
            'Ce code ne correspond à aucun élément du parcours'
          );
        }
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de traiter le QR code'
      );
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement du parcours...</Text>
      </SafeAreaView>
    );
  }

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : parcours
      ? {
          latitude:
            parcours.startingPointLat ||
            parcours.startPoint?.latitude ||
            48.8566,
          longitude:
            parcours.startingPointLon ||
            parcours.startPoint?.longitude ||
            2.3522,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : {
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        followsUserLocation
        showsMyLocationButton
        initialRegion={initialRegion}
        onMapReady={() => {
          console.log('🗺️ Map ready!');
          console.log('📍 PathCoordinates:', pathCoordinates.length);
          console.log('📍 TraveledPath:', traveledPath.length);
          console.log('📍 Parcours:', parcours?.name);
        }}
      >
        {/* Original path (remaining) */}
        {pathCoordinates.length > 0 && (
          <Polyline
            coordinates={pathCoordinates}
            strokeColor={colors.secondary}
            strokeWidth={5}
            lineDashPattern={[10, 5]}
          />
        )}

        {/* Traveled path */}
        {traveledPath.length > 1 && (
          <Polyline
            coordinates={traveledPath}
            strokeColor={colors.primary}
            strokeWidth={6}
          />
        )}

        {/* POI Markers */}
        {pois.map(poi => {
          const lat = poi.coordinates?.latitude ?? poi.latitude;
          const lon = poi.coordinates?.longitude ?? poi.longitude;
          if (!lat || !lon || isNaN(Number(lat)) || isNaN(Number(lon))) {
            return null;
          }
          return (
            <Marker
              key={poi.id}
              coordinate={{
                latitude: Number(lat),
                longitude: Number(lon),
              }}
              title={poi.name}
              description={poi.description}
              pinColor={colors.warning}
            />
          );
        })}

        {/* Start/Finish Markers */}
        {parcours &&
          (() => {
            const startCoord = {
              latitude:
                parcours.startingPointLat || parcours.startPoint?.latitude || 0,
              longitude:
                parcours.startingPointLon ||
                parcours.startPoint?.longitude ||
                0,
            };

            const destCoord =
              pathCoordinates.length > 0
                ? pathCoordinates[pathCoordinates.length - 1]
                : startCoord;

            // Check if it's a loop route (start and destination are the same)
            const isLoop =
              startCoord.latitude === destCoord.latitude &&
              startCoord.longitude === destCoord.longitude;

            console.log('🟢 Start Marker:', {
              lat: startCoord.latitude,
              lon: startCoord.longitude,
            });
            console.log(
              '🏁 Destination Marker:',
              destCoord,
              '- Using',
              pathCoordinates.length > 0 ? 'path end' : 'start point'
            );
            console.log('🔄 Is loop route:', isLoop);

            if (isLoop) {
              // Single marker for loop routes
              return (
                <Marker
                  key="start-finish"
                  coordinate={startCoord}
                  title="Départ / Arrivée"
                  description={`Point de départ et d'arrivée du parcours: ${parcours.title || parcours.name}`}
                  pinColor={colors.info}
                />
              );
            } else {
              // Separate start and finish markers
              return (
                <>
                  <Marker
                    key="start"
                    coordinate={startCoord}
                    title="Départ"
                    description={`Point de départ du parcours: ${parcours.title || parcours.name}`}
                    pinColor={colors.info}
                  />
                  <Marker
                    key="finish"
                    coordinate={destCoord}
                    title="Arrivée"
                    description="Point d'arrivée du parcours"
                    pinColor={colors.success}
                  />
                </>
              );
            }
          })()}
      </MapView>

      {/* Stats Overlay */}
      <View style={styles.statsContainer}>
        {/* Parcours Info */}
        {parcours && (
          <View style={styles.parcoursInfoCard}>
            <Text style={styles.parcoursTitle} numberOfLines={1}>
              {parcours.title || parcours.name}
            </Text>
            <Text style={styles.parcoursSubtitle}>
              {parcours.distance || parcours.distanceKm} km •{' '}
              {parcours.estimatedDuration} min
            </Text>
          </View>
        )}

        {/* Start Distance Warning */}
        {!hasStarted &&
          currentLocation &&
          parcours &&
          (() => {
            const distToStart = calculateDistance(currentLocation, {
              latitude:
                parcours.startingPointLat || parcours.startPoint?.latitude || 0,
              longitude:
                parcours.startingPointLon ||
                parcours.startPoint?.longitude ||
                0,
            });
            if (distToStart > START_PROXIMITY_THRESHOLD) {
              return (
                <View style={styles.warningCard}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <View style={styles.warningContent}>
                    <Text style={styles.warningTitle}>Trop loin du départ</Text>
                    <Text style={styles.warningText}>
                      Vous êtes à {(distToStart / 1000).toFixed(2)} km du point
                      de départ
                    </Text>
                  </View>
                </View>
              );
            }
            return (
              <View style={styles.successCard}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successText}>Prêt à démarrer!</Text>
              </View>
            );
          })()}

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>📏 Distance</Text>
            <Text style={styles.statValue}>
              {(distance / 1000).toFixed(2)} km
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>⏱️ Temps</Text>
            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>📊 Progression</Text>
            <Text style={styles.statValue}>
              {calculateProgress().toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>

      {/* QR Scanner Button */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.qrButton}
          activeOpacity={0.8}
          onPress={() => setShowQRScanner(true)}
        >
          <Text style={styles.qrButtonIcon}>📱</Text>
          <Text style={styles.qrButtonText}>Scanner QR Code</Text>
        </TouchableOpacity>
      </View>

      {/* QR Scanner Modal */}
      <Modal visible={showQRScanner} animationType="slide">
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.gray600,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  statsContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  parcoursInfoCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  parcoursTitle: {
    fontSize: 16,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  parcoursSubtitle: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
  },
  warningCard: {
    backgroundColor: colors.warning,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
  },
  successCard: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successIcon: {
    fontSize: 20,
    color: colors.white,
    marginRight: spacing.sm,
  },
  successText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  actionButtons: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    right: spacing.md,
  },
  qrButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  qrButtonIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  qrButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
