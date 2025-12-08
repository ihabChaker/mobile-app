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
import { MainStackParamList } from '@/navigation/types';
import { colors, spacing } from '@/theme';
import parcoursSessionService from '@/services/parcours-session.service';
import parcoursService from '@/services/parcours.service';
import poiService from '@/services/poi.service';
import quizService from '@/services/quiz.service';
import treasureHuntService from '@/services/treasure-hunt.service';
import podcastService from '@/services/podcast.service';
import { QRScanner } from '@/components/QRScanner';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Parcours, POI, Podcast } from '@/types/parcours.types';
import { ParcoursSession } from '@/types/backend.types';

// Conditionally import MapView only on native platforms
let MapView: any = null;
let Polyline: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const MapModule = require('react-native-maps');
    MapView = MapModule.default;
    Polyline = MapModule.Polyline;
    Marker = MapModule.Marker;
    PROVIDER_GOOGLE = MapModule.PROVIDER_GOOGLE;
  } catch {
    // Map module not available
  }
}

type LocationSubscription = { remove: () => void } | null;

let Location: typeof import('expo-location') | null = null;
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
  const DESTINATION_PROXIMITY_THRESHOLD = 10; // 10m for completion
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
  const [showPodcastPlayer, setShowPodcastPlayer] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [visitedPOIs, setVisitedPOIs] = useState<Set<number>>(new Set());
  const [reachedStart, setReachedStart] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const mapRef = useRef<any>(null);
  const locationSubscription = useRef<LocationSubscription>(null);
  const startTime = useRef<Date>(new Date());
  const hasStartedRef = useRef<boolean>(false); // Use ref to avoid closure issues
  const originalPathRef = useRef<LocationCoords[]>([]); // Store original path in ref
  const parcoursRef = useRef<Parcours | null>(null); // Store parcours in ref for callbacks
  const sessionRef = useRef<ParcoursSession | null>(null); // Store session in ref
  const currentLocationRef = useRef<LocationCoords | null>(null); // Store current location in ref

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

      console.log('🗺️ Parcours loaded:', parcoursData.name);

      setParcours(parcoursData);
      parcoursRef.current = parcoursData; // Store in ref for callbacks
      setPois(poisData);

      // Get session if sessionId is provided
      if (sessionId) {
        const sessions = await parcoursSessionService.getActiveSessions();
        const currentSession = sessions.find(s => s.id === sessionId);
        if (currentSession) {
          setSession(currentSession);
          sessionRef.current = currentSession; // Store in ref
        }
      }

      // Parse GeoJSON path if available
      if (parcoursData.geoJsonPath) {
        try {
          const geoData = JSON.parse(parcoursData.geoJsonPath);
          // GeoJSON parsed
          if (geoData.type === 'LineString' && geoData.coordinates) {
            const coords = geoData.coordinates.map((coord: number[]) => ({
              longitude: coord[0],
              latitude: coord[1],
            }));

            console.log('📍 GeoJSON path loaded:', coords.length, 'points');
            console.log('🎯 Start point:', coords[0]);
            console.log('🏁 End point:', coords[coords.length - 1]);

            // Path coordinates extracted
            setPathCoordinates(coords);
            setOriginalPath(coords); // Store original path in state
            originalPathRef.current = coords; // Also store in ref for callbacks
          }
        } catch (e) {
          console.error('❌ Error parsing GeoJSON:', e);
        }
      } else {
        // No GeoJSON path available
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
          timeInterval: 1000, // Update every 1 second for better tracking
          distanceInterval: 3, // Or every 3 meters for better accuracy
        },
        (location: { coords: { latitude: number; longitude: number } }) => {
          const newCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setCurrentLocation(newCoords);
          currentLocationRef.current = newCoords; // Update ref

          console.log(
            '📍 Location update:',
            newCoords.latitude.toFixed(6),
            newCoords.longitude.toFixed(6),
            '| Started:',
            hasStartedRef.current
          );

          // Only track if started (use ref to avoid closure issue)
          if (hasStartedRef.current) {
            // Update traveled path and calculate distance in same update
            setTraveledPath(prev => {
              // Calculate distance from last point
              if (prev.length > 0) {
                const lastPoint = prev[prev.length - 1];
                const dist = calculateDistance(lastPoint, newCoords);
                setDistance(prevDist => prevDist + dist);
              }
              return [...prev, newCoords];
            });

            // Update remaining path to show visual progress
            updateRemainingPath(newCoords);

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

  const handleManualStart = () => {
    const parcours = parcoursRef.current;
    if (!currentLocation || !parcours) return;

    const distToStart = calculateDistance(currentLocation, {
      latitude: parcours.startingPointLat,
      longitude: parcours.startingPointLon,
    });

    if (distToStart > START_PROXIMITY_THRESHOLD) {
      Alert.alert(
        'Trop loin du départ',
        `Vous devez être à moins de ${START_PROXIMITY_THRESHOLD}m du point de départ pour commencer. Vous êtes actuellement à ${distToStart.toFixed(0)}m.`
      );
      return;
    }

    setHasStarted(true);
    hasStartedRef.current = true; // Also update ref for closure
    setReachedStart(true);
    setTraveledPath([currentLocation]);
    startTime.current = new Date();

    console.log('🎯 PARCOURS STARTED!');
    console.log('📍 Start location:', currentLocation);
    console.log('📏 Path has', originalPathRef.current.length, 'points');

    Alert.alert(
      '🎯 Parcours démarré !',
      "Bon parcours ! Suivez le tracé jusqu'à l'arrivée."
    );
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
    const originalPath = originalPathRef.current;
    if (originalPath.length === 0) {
      console.log('⚠️ Cannot update path: originalPath is empty');
      return;
    }

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

    // Calculate percentage progress
    const progressPercent = (
      (closestIndex / originalPath.length) *
      100
    ).toFixed(1);

    console.log(
      '🗺️ PATH UPDATE:',
      'Point',
      closestIndex + 1,
      '/',
      originalPath.length,
      `(${progressPercent}% complete)`,
      '| Dist to path:',
      minDistance.toFixed(1) + 'm'
    );

    // Update remaining path (from closest point to end)
    // Keep at least one point before the closest for smooth rendering
    const startIndex = Math.max(0, closestIndex - 1);
    const remainingPath = originalPath.slice(startIndex);

    console.log(
      '📍 Remaining:',
      remainingPath.length,
      'points | Completed:',
      closestIndex,
      'points'
    );

    // Force update by creating new array
    setPathCoordinates([...remainingPath]);
  };

  const checkDestinationReached = (coords: LocationCoords) => {
    const originalPath = originalPathRef.current;
    const parcours = parcoursRef.current;

    // Use ref to avoid closure issues
    if (reachedEnd || !hasStartedRef.current) return;

    if (originalPath.length === 0 || !parcours) {
      console.log('⚠️ Cannot check destination: missing path or parcours data');
      return;
    }

    // Use original path's last point (not the remaining path)
    const destination = originalPath[originalPath.length - 1];
    const distToDestination = calculateDistance(coords, destination);

    // Log every check for debugging
    console.log(
      '🏁 DESTINATION:',
      distToDestination.toFixed(1) + 'm',
      '| Threshold:',
      DESTINATION_PROXIMITY_THRESHOLD + 'm',
      '|',
      distToDestination <= DESTINATION_PROXIMITY_THRESHOLD
        ? '✅ IN RANGE!'
        : '❌ Too far'
    );

    // If within threshold of destination
    if (distToDestination <= DESTINATION_PROXIMITY_THRESHOLD) {
      console.log('🎉🎉🎉 DESTINATION REACHED! Completing parcours...');
      console.log(
        '📍 Final position:',
        coords.latitude.toFixed(6),
        coords.longitude.toFixed(6)
      );
      console.log(
        '🎯 Destination was:',
        destination.latitude.toFixed(6),
        destination.longitude.toFixed(6)
      );
      handleParcoursComplete();
    }
  };

  const checkPOIProximity = (coords: LocationCoords) => {
    if (!pois.length || !hasStartedRef.current) return;

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
      if (distToPOI <= POI_PROXIMITY_THRESHOLD) {
        // POI reached
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
    const session = sessionRef.current;
    const currentLocation = currentLocationRef.current;
    const parcours = parcoursRef.current;

    console.log(
      '🔍 handleParcoursComplete called - session:',
      !!session,
      'location:',
      !!currentLocation,
      'parcours:',
      !!parcours,
      'reachedEnd:',
      reachedEnd
    );

    if (!session || !currentLocation || !parcours) {
      console.log(
        '❌ Cannot complete: missing data - session:',
        !!session,
        'location:',
        !!currentLocation,
        'parcours:',
        !!parcours
      );
      return;
    }

    // Prevent multiple completions
    if (reachedEnd) {
      console.log('❌ Already processing completion, returning');
      return;
    }

    // Set flag immediately to prevent re-entry
    setReachedEnd(true);
    console.log('✅ Starting parcours completion...');

    try {
      // Completing parcours session

      // Stop location tracking to prevent further updates
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }

      const result = await parcoursSessionService.completeSession(session.id, {
        finalLat: currentLocation.latitude,
        finalLon: currentLocation.longitude,
        distanceCovered: distance,
      });

      console.log('🎊 Parcours completed!');
      console.log('📊 Distance:', (distance / 1000).toFixed(2), 'km');
      console.log('⏱️ Duration:', duration, 'seconds');
      console.log('💰 Points earned:', result.pointsEarned);

      // Navigate to completion screen
      navigation.replace('ParcoursCompletion', {
        parcoursName: parcours.name,
        distance: distance / 1000,
        duration: duration,
        pointsEarned: result.pointsEarned,
        poisVisited: visitedPOIs.size,
      });
    } catch (error: any) {
      console.error('❌ Error completing parcours:', error);
      setReachedEnd(false); // Reset flag to allow retry
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
        // Check if already visited locally first
        if (visitedPOIs.has(poi.id)) {
          Alert.alert(
            'POI déjà visité',
            "Vous avez déjà scanné ce point d'intérêt. Veuillez continuer votre parcours.",
            [{ text: 'OK' }]
          );
          return; // Stop here, don't show the content again
        }

        // Register POI visit (non-blocking)
        try {
          await poiService.recordVisit(poi.id, {
            latitude: currentLocation?.latitude || 0,
            longitude: currentLocation?.longitude || 0,
          });

          // Mark POI as visited
          setVisitedPOIs(prev => new Set([...prev, poi.id]));
        } catch (error: any) {
          console.error('Failed to record POI visit:', error);

          // Check if it's already visited error from backend
          if (error.response?.data?.message?.includes('already visited')) {
            // Add to local set even if backend says already visited
            setVisitedPOIs(prev => new Set([...prev, poi.id]));
            Alert.alert(
              'POI déjà visité',
              "Vous avez déjà scanné ce point d'intérêt. Veuillez continuer votre parcours.",
              [{ text: 'OK' }]
            );
            return; // Stop here, don't show the content again
          }
          // For other errors, continue anyway - visit recording is not critical
        }

        // Check what content the POI has
        if (poi.quizId) {
          // Navigate to quiz
          try {
            const quiz = await quizService.getQuizById(poi.quizId);
            navigation.navigate('Quiz', {
              quizId: poi.quizId,
              quizTitle: quiz.title || 'Quiz',
            });
          } catch (error: any) {
            Alert.alert(
              'Erreur',
              error.message || 'Impossible de charger le quiz',
              [{ text: 'OK' }]
            );
          }
        } else if (poi.treasureHuntId) {
          // Navigate to treasure hunt screen
          try {
            const treasureHunt = await treasureHuntService.getTreasureHuntById(
              poi.treasureHuntId
            );
            navigation.navigate('TreasureHunt', {
              treasureHuntId: poi.treasureHuntId,
              treasureHuntName: treasureHunt.name,
            });
          } catch (error: any) {
            Alert.alert(
              'Erreur',
              error.message || 'Impossible de charger la chasse au trésor',
              [{ text: 'OK' }]
            );
          }
        } else if (poi.podcastId) {
          // Load and play podcast
          try {
            const podcast = await podcastService.getPodcastById(poi.podcastId);
            setSelectedPodcast(podcast);
            setShowPodcastPlayer(true);
          } catch (error: any) {
            Alert.alert(
              'Erreur',
              error.message || 'Impossible de charger le podcast',
              [{ text: 'OK' }]
            );
          }
        } else {
          Alert.alert('POI découvert !', poi.name || "Point d'intérêt");
        }
      } else {
        // Try to scan as treasure item QR code
        try {
          const result = await treasureHuntService.scanTreasureItem(data);

          if (result.isNewFind) {
            Alert.alert(
              'Trésor trouvé ! 🏆',
              `Vous avez découvert "${result.item.itemName}" !\n\n` +
                `Points gagnés: +${result.pointsEarned}\n` +
                `Progrès: ${result.totalItemsFound}/${result.totalItemsInHunt}` +
                (result.huntComplete
                  ? '\n\n🎉 Chasse au trésor complétée !'
                  : '')
            );
          } else {
            Alert.alert(
              'Déjà trouvé',
              `Vous avez déjà trouvé cet objet.\n\nProgrès: ${result.totalItemsFound}/${result.totalItemsInHunt}`
            );
          }
        } catch (error: any) {
          // Not a treasure item, might be invalid QR
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
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
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
          // Map ready
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

        {/* POI Markers - Hide when visited */}
        {pois.map(poi => {
          // Don't show if already visited
          if (visitedPOIs.has(poi.id)) {
            return null;
          }

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
            // FIXME
            // console.log('🟢 Start Marker:', {
            //   lat: startCoord.latitude,
            //   lon: startCoord.longitude,
            // });
            // console.log(
            //   '🏁 Destination Marker:',
            //   destCoord,
            //   '- Using',
            //   pathCoordinates.length > 0 ? 'path end' : 'start point'
            // );
            // console.log('🔄 Is loop route:', isLoop);

            if (isLoop) {
              // Single marker for loop routes - hide when both start and end reached
              if (!reachedStart && !reachedEnd) {
                return (
                  <Marker
                    key="start-finish"
                    coordinate={startCoord}
                    title="Départ / Arrivée"
                    description={`Point de départ et d'arrivée du parcours: ${parcours.title || parcours.name}`}
                    pinColor={colors.info}
                  />
                );
              }
              return null;
            } else {
              // Separate start and finish markers - hide when reached
              return (
                <>
                  {!reachedStart && (
                    <Marker
                      key="start"
                      coordinate={startCoord}
                      title="Départ"
                      description={`Point de départ du parcours: ${parcours.title || parcours.name}`}
                      pinColor={colors.info}
                    />
                  )}
                  {!reachedEnd && (
                    <Marker
                      key="finish"
                      coordinate={destCoord}
                      title="Arrivée"
                      description="Point d'arrivée du parcours"
                      pinColor={colors.success}
                    />
                  )}
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
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleManualStart}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonIcon}>🚀</Text>
                <Text style={styles.startButtonText}>DÉMARRER LE PARCOURS</Text>
              </TouchableOpacity>
            );
          })()}

        {/* Approaching Destination Warning */}
        {hasStarted &&
          !reachedEnd &&
          currentLocation &&
          originalPath.length > 0 &&
          (() => {
            const destination = originalPath[originalPath.length - 1];
            const distToEnd = calculateDistance(currentLocation, destination);

            // Show warning when within 100m but not yet at destination
            if (
              distToEnd <= 100 &&
              distToEnd > DESTINATION_PROXIMITY_THRESHOLD
            ) {
              return (
                <View style={styles.approachingCard}>
                  <Text style={styles.approachingIcon}>🎯</Text>
                  <View style={styles.approachingContent}>
                    <Text style={styles.approachingTitle}>
                      Presque arrivé !
                    </Text>
                    <Text style={styles.approachingText}>
                      Plus que {distToEnd.toFixed(0)}m jusqu'à l'arrivée
                    </Text>
                  </View>
                </View>
              );
            }
            return null;
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
          {pois.length > 0 && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>📍 POIs visités</Text>
              <Text style={styles.statValue}>
                {visitedPOIs.size} / {pois.length}
              </Text>
            </View>
          )}
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

      {/* Podcast Player Modal */}
      <Modal
        visible={showPodcastPlayer && selectedPodcast !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPodcastPlayer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPodcast && (
              <AudioPlayer
                podcast={selectedPodcast}
                onClose={() => {
                  setShowPodcastPlayer(false);
                  setSelectedPodcast(null);
                }}
              />
            )}
          </View>
        </View>
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
  startButton: {
    backgroundColor: colors.success,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  startButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  approachingCard: {
    backgroundColor: '#4CAF50',
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
  approachingIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  approachingContent: {
    flex: 1,
  },
  approachingTitle: {
    fontSize: 14,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  approachingText: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
});
