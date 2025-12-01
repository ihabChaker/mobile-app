import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { colors, typography, spacing } from '@/theme';
import rewardService from '@/services/reward.service';
import { UserBadge, UserChallenge } from '@/services/reward.service';

/**
 * Écran Récompenses - Phase 4
 * Affiche les badges et challenges de l'utilisateur
 */
export const RewardsScreen: React.FC = () => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'badges' | 'challenges'>('badges');

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setIsLoading(true);
      const [badgesData, challengesData] = await Promise.all([
        rewardService.getMyBadges(),
        rewardService.getMyChallenges(),
      ]);
      setBadges(badgesData);
      setChallenges(challengesData);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de charger les récompenses');
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'commun':
        return colors.gray500;
      case 'rare':
        return colors.info;
      case 'épique':
        return colors.secondary;
      case 'légendaire':
        return colors.warning;
      default:
        return colors.gray500;
    }
  };

  const renderBadges = () => {
    if (badges.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyTitle}>Aucun badge encore</Text>
          <Text style={styles.emptyText}>
            Complétez des parcours et relevez des défis pour gagner des badges !
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.badgesGrid}>
        {badges.map((userBadge) => (
          <View key={userBadge.id} style={styles.badgeCard}>
            <View
              style={[
                styles.badgeIconContainer,
                { borderColor: getRarityColor(userBadge.badge.rarity) },
              ]}
            >
              {userBadge.badge.iconUrl ? (
                <Image
                  source={{ uri: userBadge.badge.iconUrl }}
                  style={styles.badgeIcon}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.badgeIconPlaceholder}>🏅</Text>
              )}
            </View>
            <Text style={styles.badgeName} numberOfLines={2}>
              {userBadge.badge.name}
            </Text>
            <Text style={styles.badgePoints}>+{userBadge.badge.points} pts</Text>
            <Text
              style={[
                styles.badgeRarity,
                { color: getRarityColor(userBadge.badge.rarity) },
              ]}
            >
              {userBadge.badge.rarity}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderChallenges = () => {
    if (challenges.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>Aucun challenge en cours</Text>
          <Text style={styles.emptyText}>
            Démarrez un nouveau challenge pour gagner des points !
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.challengesList}>
        {challenges.map((userChallenge) => {
          const progress =
            (userChallenge.progress / userChallenge.challenge.target) * 100;

          return (
            <View key={userChallenge.id} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeName}>
                    {userChallenge.challenge.name}
                  </Text>
                  <Text style={styles.challengeDescription}>
                    {userChallenge.challenge.description}
                  </Text>
                </View>
                {userChallenge.isCompleted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedIcon}>✓</Text>
                  </View>
                )}
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: userChallenge.isCompleted
                          ? colors.success
                          : colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {userChallenge.progress} / {userChallenge.challenge.target}
                </Text>
              </View>

              <View style={styles.challengeFooter}>
                <Text style={styles.challengeType}>
                  {getChallengeTypeIcon(userChallenge.challenge.type)}{' '}
                  {getChallengeTypeLabel(userChallenge.challenge.type)}
                </Text>
                <Text style={styles.challengeReward}>
                  🎁 +{userChallenge.challenge.reward} pts
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const getChallengeTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      distance: '🚶',
      duration: '⏱️',
      poi_visits: '📍',
      quiz_score: '🧠',
      streak: '🔥',
    };
    return icons[type] || '🎯';
  };

  const getChallengeTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      distance: 'Distance',
      duration: 'Durée',
      poi_visits: 'POI visités',
      quiz_score: 'Score quiz',
      streak: 'Série',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des récompenses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Mes Récompenses</Text>
        <Text style={styles.headerSubtitle}>
          {badges.length} badge{badges.length > 1 ? 's' : ''} • {challenges.length}{' '}
          challenge{challenges.length > 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'badges' && styles.tabActive]}
          onPress={() => setActiveTab('badges')}
        >
          <Text
            style={[styles.tabText, activeTab === 'badges' && styles.tabTextActive]}
          >
            Badges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.tabActive]}
          onPress={() => setActiveTab('challenges')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'challenges' && styles.tabTextActive,
            ]}
          >
            Challenges
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'badges' ? renderBadges() : renderChallenges()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodyMedium,
    color: colors.gray600,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.labelLarge,
    color: colors.gray600,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.gray600,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  badgeIcon: {
    width: 60,
    height: 60,
  },
  badgeIconPlaceholder: {
    fontSize: 48,
  },
  badgeName: {
    ...typography.labelLarge,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  badgePoints: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
    marginBottom: spacing.xxs,
  },
  badgeRarity: {
    ...typography.caption,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  challengesList: {
    gap: spacing.md,
  },
  challengeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  challengeInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  challengeName: {
    ...typography.h6,
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  challengeDescription: {
    ...typography.bodySmall,
    color: colors.gray600,
    lineHeight: 18,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray300,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    ...typography.caption,
    color: colors.gray600,
    textAlign: 'right',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeType: {
    ...typography.caption,
    color: colors.text,
  },
  challengeReward: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
  },
});
