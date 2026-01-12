import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '@/navigation/types';
import { colors, spacing } from '@/theme';
import rewardService from '@/services/reward.service';
import { UserBadge } from '@/types/backend.types';

type ParcoursCompletionScreenProps = {
  navigation: NativeStackNavigationProp<
    MainStackParamList,
    'ParcoursCompletion'
  >;
  route: RouteProp<MainStackParamList, 'ParcoursCompletion'>;
};

export const ParcoursCompletionScreen: React.FC<
  ParcoursCompletionScreenProps
> = ({ navigation, route }) => {
  const { parcoursName, distance, duration, pointsEarned, poisVisited } =
    route.params;

  const [newBadges, setNewBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNewBadges();
  }, []);

  const loadNewBadges = async () => {
    try {
      setIsLoading(true);
      // Get recent badges (earned in last minute)
      const allBadges = await rewardService.getMyBadges();
      const recent = allBadges.filter(ub => {
        const earnedTime = new Date(ub.earnedAt).getTime();
        const now = new Date().getTime();
        return now - earnedTime < 60000; // Last minute
      });
      setNewBadges(recent);
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleFinish = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Animation */}
        <View style={styles.heroSection}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.title}>Félicitations !</Text>
          <Text style={styles.subtitle}>Vous avez terminé le parcours</Text>
          <Text style={styles.parcoursName}>{parcoursName}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
            <Text style={styles.statLabel}>Durée</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📍</Text>
            <Text style={styles.statValue}>{poisVisited}</Text>
            <Text style={styles.statLabel}>POIs visités</Text>
          </View>
        </View>

        {/* Points Earned */}
        <View style={styles.pointsSection}>
          <View style={styles.pointsCard}>
            <Text style={styles.pointsIcon}>⭐</Text>
            <Text style={styles.pointsValue}>+{pointsEarned}</Text>
            <Text style={styles.pointsLabel}>Points gagnés</Text>
          </View>
        </View>

        {/* New Badges */}
        {isLoading ? (
          <View style={styles.badgesLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.badgesLoadingText}>
              Vérification des badges...
            </Text>
          </View>
        ) : newBadges.length > 0 ? (
          <View style={styles.badgesSection}>
            <Text style={styles.badgesTitle}>🏆 Nouveaux badges obtenus !</Text>
            <View style={styles.badgesList}>
              {newBadges.map(userBadge => (
                <View key={userBadge.id} style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>🎖️</Text>
                  <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName}>
                      {userBadge.badge?.name || 'Badge'}
                    </Text>
                    <Text style={styles.badgePoints}>
                      +{userBadge.badge?.points || 0} pts
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.noBadges}>
            <Text style={styles.noBadgesText}>
              Continuez à explorer pour débloquer des badges !
            </Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinish}
          activeOpacity={0.8}
        >
          <Text style={styles.finishButtonText}>Terminer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  parcoursName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray600,
  },
  pointsSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  pointsCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  pointsIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  pointsLabel: {
    fontSize: 16,
    color: colors.surface,
    opacity: 0.9,
  },
  badgesLoading: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  badgesLoadingText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.gray600,
  },
  badgesSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  badgesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  badgesList: {
    gap: spacing.md,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  badgePoints: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  noBadges: {
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  noBadgesText: {
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
  },
  finishButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface,
  },
});
