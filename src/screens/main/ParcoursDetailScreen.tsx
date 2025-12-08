import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { MainStackParamList } from '@/navigation/types';
import { colors, typography, spacing } from '@/theme';
import parcoursService from '@/services/parcours.service';
import parcoursSessionService from '@/services/parcours-session.service';
import poiService from '@/services/poi.service';
import quizService, { Quiz } from '@/services/quiz.service';
import { Parcours, POI } from '@/types/parcours.types';

let Location: any = null;
if (Platform.OS !== 'web') {
  try {
    Location = require('expo-location');
  } catch {
    // expo-location not available
  }
}

type ParcoursDetailScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ParcoursDetail'>;
  route: RouteProp<MainStackParamList, 'ParcoursDetail'>;
};

/**
 * Écran de détail d'un parcours
 */
export const ParcoursDetailScreen: React.FC<ParcoursDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { parcoursId } = route.params;
  const [parcours, setParcours] = useState<Parcours | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      checkActiveSession();
    }, [])
  );

  useEffect(() => {
    loadParcours();
  }, [parcoursId]);

  const checkActiveSession = async () => {
    try {
      const activeSessions = await parcoursSessionService.getActiveSessions();
      const session = activeSessions.find(s => s.parcoursId === parcoursId);

      // If there's an active session, navigate to tracking
      if (session) {
        navigation.replace('ParcoursTracking', {
          parcoursId: parcoursId,
          sessionId: session.id,
        });
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };
  const loadParcours = async () => {
    try {
      setIsLoading(true);
      const [parcoursData, poisData, quizzesData] = await Promise.all([
        parcoursService.getParcoursById(parcoursId),
        poiService.getPOIsByParcours(parcoursId),
        quizService.getQuizzesByParcours(parcoursId),
      ]);
      setParcours(parcoursData);
      setQuizzes(quizzesData);
      setPois(poisData);
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

  const getPoiTypeIcon = (type: POI['type']): string => {
    const icons: Record<POI['type'], string> = {
      monument: '🏛️',
      musee: '🏛️',
      cimetiere: '⚰️',
      bunker: '🛡️',
      plage: '🏖️',
      autre: '📍',
    };
    return icons[type] || '📍';
  };

  const handleStartParcours = async () => {
    if (!parcours) return;

    try {
      setIsStarting(true);

      // Check for active sessions first
      const activeSessions = await parcoursSessionService.getActiveSessions();
      if (activeSessions && activeSessions.length > 0) {
        Alert.alert(
          'Parcours déjà actif',
          "Vous avez déjà un parcours en cours. Veuillez le terminer ou l'abandonner avant d'en commencer un nouveau.",
          [{ text: 'OK' }]
        );
        setIsStarting(false);
        return;
      }

      // Get current location
      if (!Location) {
        Alert.alert('Erreur', "La géolocalisation n'est pas disponible");
        setIsStarting(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Vous devez autoriser la localisation pour démarrer un parcours'
        );
        setIsStarting(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      const startPoint = {
        latitude:
          parcours.startingPointLat || parcours.startPoint?.latitude || 0,
        longitude:
          parcours.startingPointLon || parcours.startPoint?.longitude || 0,
      };

      // Calculate distance to start point
      const distanceToStart = calculateDistance(currentLocation, startPoint);
      const maxDistance = 100; // 100 meters

      if (distanceToStart > maxDistance) {
        Alert.alert(
          'Trop loin du départ',
          `Vous êtes à ${(distanceToStart / 1000).toFixed(2)} km du point de départ. Vous devez être à moins de ${maxDistance}m pour démarrer le parcours.`,
          [{ text: 'OK' }]
        );
        setIsStarting(false);
        return;
      }

      // All checks passed, show confirmation
      Alert.alert(
        'Démarrer le parcours',
        `Êtes-vous prêt à commencer "${parcours.title}" ?`,
        [
          {
            text: 'Annuler',
            style: 'cancel',
            onPress: () => setIsStarting(false),
          },
          {
            text: 'Démarrer',
            style: 'default',
            onPress: async () => {
              try {
                // Start a new parcours session
                const session = await parcoursSessionService.startSession({
                  parcoursId: parcours.id,
                  startLat: Number(startPoint.latitude),
                  startLon: Number(startPoint.longitude),
                });

                // Navigate to tracking screen with session ID
                navigation.navigate('ParcoursTracking', {
                  parcoursId: parcours.id,
                  sessionId: session.id,
                });
              } catch (error: any) {
                Alert.alert(
                  'Erreur',
                  error.message || 'Impossible de démarrer le parcours'
                );
              } finally {
                setIsStarting(false);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de vérifier la localisation'
      );
      setIsStarting(false);
    }
  };

  // Helper function to calculate distance between two points in meters
  const calculateDistance = (
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number => {
    const R = 6371e3; // Earth's radius in meters
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement du parcours...</Text>
      </SafeAreaView>
    );
  }

  if (!parcours) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['top', 'bottom']}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Parcours non trouvé</Text>
      </SafeAreaView>
    );
  }

  const difficulty = parcours.difficulty || 'moyen';
  const difficultyColor =
    {
      facile: colors.success,
      moyen: colors.warning,
      difficile: colors.error,
    }[difficulty] || colors.gray500;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Header */}
        <View style={styles.imageContainer}>
          {parcours.thumbnailUrl ? (
            <Image
              source={{ uri: parcours.thumbnailUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>🗺️</Text>
            </View>
          )}
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColor },
            ]}
          >
            <Text style={styles.difficultyText}>
              {(parcours.difficulty || 'moyen').charAt(0).toUpperCase() +
                (parcours.difficulty || 'moyen').slice(1)}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>
            {parcours.title || 'Parcours sans titre'}
          </Text>
          <Text style={styles.description}>
            {parcours.description || 'Aucune description disponible'}
          </Text>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>📏</Text>
              <Text style={styles.statValue}>{parcours.distance || 0} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statValue}>
                {parcours.estimatedDuration || 0} min
              </Text>
              <Text style={styles.statLabel}>Durée</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={styles.statValue}>
                {parcours.difficulty || 'moyen'}
              </Text>
              <Text style={styles.statLabel}>Difficulté</Text>
            </View>
          </View>

          {/* Points d'intérêt Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Points d'Intérêt</Text>
            {pois.length > 0 ? (
              <>
                <Text style={styles.sectionText}>
                  Ce parcours comprend {pois.length} point
                  {pois.length > 1 ? 's' : ''} d'intérêt historique
                  {pois.length > 1 ? 's' : ''}.
                </Text>
                <View style={styles.poisList}>
                  {pois.map((poi, index) => (
                    <View key={poi.id} style={styles.poiCard}>
                      <View style={styles.poiHeader}>
                        <Text style={styles.poiIndex}>{index + 1}</Text>
                        <View style={styles.poiInfo}>
                          <Text style={styles.poiName}>{poi.name}</Text>
                          <Text style={styles.poiType}>
                            {getPoiTypeIcon(poi.type)}{' '}
                            {poi.type.charAt(0).toUpperCase() +
                              poi.type.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.poiDescription} numberOfLines={2}>
                        {poi.description}
                      </Text>
                      {poi.visitDuration && (
                        <Text style={styles.poiDuration}>
                          ⏱️ ~{poi.visitDuration} min
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.emptyPOIs}>
                <Text style={styles.emptyPOIsIcon}>📍</Text>
                <Text style={styles.emptyPOIsText}>
                  Aucun point d'intérêt disponible pour ce parcours.
                </Text>
              </View>
            )}
          </View>

          {/* Quiz Section */}
          {quizzes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>❓ Quiz Disponibles</Text>
              <Text style={styles.sectionText}>
                Testez vos connaissances sur ce parcours !
              </Text>
              {quizzes.map(quiz => (
                <TouchableOpacity
                  key={quiz.id}
                  style={styles.quizCard}
                  onPress={() => {
                    navigation.navigate('Quiz', {
                      quizId: quiz.id,
                      quizTitle: quiz.title,
                    });
                  }}
                >
                  <View style={styles.quizCardContent}>
                    <Text style={styles.quizTitle}>{quiz.title}</Text>
                    <Text style={styles.quizDescription} numberOfLines={2}>
                      {quiz.description || 'Aucune description'}
                    </Text>
                    <View style={styles.quizMeta}>
                      <Text
                        style={[
                          styles.quizDifficulty,
                          {
                            color:
                              quiz.difficulty === 'easy'
                                ? colors.success
                                : quiz.difficulty === 'hard'
                                  ? colors.error
                                  : colors.warning,
                          },
                        ]}
                      >
                        {quiz.difficulty}
                      </Text>
                      <Text style={styles.quizQuestions}>
                        {quiz.questions?.length || 0} questions
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.quizArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Astuce : Activez votre GPS pour être guidé vers chaque point
                d'intérêt
              </Text>
            </View>
          </View>

          {/* Itinéraire Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗺️ Itinéraire</Text>
            <View style={styles.routeInfo}>
              <View style={styles.routePoint}>
                <Text style={styles.routeIcon}>🚩</Text>
                <View style={styles.routeContent}>
                  <Text style={styles.routeLabel}>Départ</Text>
                  <Text style={styles.routeText}>
                    Lat: {parcours.startPoint?.latitude?.toFixed(4) ?? 'N/A'},
                    Long: {parcours.startPoint?.longitude?.toFixed(4) ?? 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.routeLine} />

              <View style={styles.routePoint}>
                <Text style={styles.routeIcon}>🏁</Text>
                <View style={styles.routeContent}>
                  <Text style={styles.routeLabel}>Arrivée</Text>
                  <Text style={styles.routeText}>
                    Lat: {parcours.endPoint?.latitude?.toFixed(4) ?? 'N/A'},
                    Long: {parcours.endPoint?.longitude?.toFixed(4) ?? 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recommandations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Recommandations</Text>
            <View style={styles.recommendationsList}>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationIcon}>✅</Text>
                <Text style={styles.recommendationText}>
                  Prévoyez de l'eau et des en-cas
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationIcon}>✅</Text>
                <Text style={styles.recommendationText}>
                  Portez des chaussures confortables
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationIcon}>✅</Text>
                <Text style={styles.recommendationText}>
                  Rechargez votre téléphone
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationIcon}>✅</Text>
                <Text style={styles.recommendationText}>
                  Vérifiez la météo avant de partir
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, isStarting && styles.fabDisabled]}
          onPress={handleStartParcours}
          disabled={isStarting}
          activeOpacity={0.8}
        >
          {isStarting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.fabIcon}>🚀</Text>
              <Text style={styles.fabText}>Démarrer le parcours</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    ...typography.bodyMedium,
    color: colors.gray600,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.h4,
    color: colors.error,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
  },
  difficultyBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  difficultyText: {
    ...typography.labelLarge,
    color: colors.white,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h5,
    color: colors.primary,
    marginBottom: spacing.xxs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray600,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionText: {
    ...typography.bodyMedium,
    color: colors.gray600,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  emptyPOIs: {
    backgroundColor: colors.gray100,
    padding: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyPOIsIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyPOIsText: {
    ...typography.bodyMedium,
    color: colors.gray600,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: colors.infoLight,
    padding: spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  routeInfo: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    ...typography.labelMedium,
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  routeText: {
    ...typography.bodySmall,
    color: colors.gray600,
  },
  routeLine: {
    width: 2,
    height: spacing.lg,
    backgroundColor: colors.gray300,
    marginLeft: 12,
    marginVertical: spacing.xs,
  },
  recommendationsList: {
    gap: spacing.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
  },
  recommendationIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  recommendationText: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  poisList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  poiCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  poiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  poiIndex: {
    ...typography.h5,
    color: colors.primary,
    fontWeight: '700',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    textAlign: 'center',
    lineHeight: 32,
    marginRight: spacing.sm,
  },
  poiInfo: {
    flex: 1,
  },
  poiName: {
    ...typography.labelLarge,
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  poiType: {
    ...typography.caption,
    color: colors.gray600,
  },
  poiDescription: {
    ...typography.bodySmall,
    color: colors.gray600,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  poiDuration: {
    ...typography.caption,
    color: colors.info,
    fontWeight: '600',
  },
  quizButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quizButtonText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  quizCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quizCardContent: {
    flex: 1,
  },
  quizTitle: {
    ...typography.labelLarge,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  quizDescription: {
    ...typography.bodySmall,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  quizMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quizDifficulty: {
    ...typography.labelSmall,
    textTransform: 'capitalize',
  },
  quizQuestions: {
    ...typography.caption,
    color: colors.gray500,
  },
  quizArrow: {
    ...typography.h4,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  bottomSpacer: {
    height: 80,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'transparent',
  },
  fab: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    gap: spacing.sm,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 4.0,
  },
  fabDisabled: {
    opacity: 0.6,
  },
  fabIcon: {
    fontSize: 24,
  },
  fabText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
  },
});
