import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, typography, spacing } from '@/theme';
import rewardService from '@/services/reward.service';
import type { LeaderboardEntry } from '@/services/reward.service';

type Period = 'week' | 'month' | 'year' | 'all';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  loading: boolean;
  refreshing: boolean;
  selectedPeriod: Period;
  myRank: number | null;
}

/**
 * Écran Leaderboard - Classement des utilisateurs
 * Phase 4 - Gamification
 */
export const LeaderboardScreen: React.FC = () => {
  const [state, setState] = useState<LeaderboardState>({
    entries: [],
    loading: true,
    refreshing: false,
    selectedPeriod: 'all',
    myRank: null,
  });

  useEffect(() => {
    loadLeaderboard();
  }, [state.selectedPeriod]);

  const loadLeaderboard = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const data = await rewardService.getLeaderboard(state.selectedPeriod);
      
      // Find current user's rank if available
      const myRank = data.findIndex((entry) => entry.isCurrentUser);
      
      setState((prev) => ({
        ...prev,
        entries: data,
        loading: false,
        myRank: myRank >= 0 ? myRank + 1 : null,
      }));
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleRefresh = async () => {
    setState((prev) => ({ ...prev, refreshing: true }));
    await loadLeaderboard();
    setState((prev) => ({ ...prev, refreshing: false }));
  };

  const handlePeriodChange = (period: Period) => {
    setState((prev) => ({ ...prev, selectedPeriod: period }));
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return colors.gray400;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  const getPeriodLabel = (period: Period) => {
    switch (period) {
      case 'week':
        return 'Semaine';
      case 'month':
        return 'Mois';
      case 'year':
        return 'Année';
      case 'all':
        return 'Tout temps';
      default:
        return period;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>🏆 Classement</Text>
      
      {/* Period Filters */}
      <View style={styles.periodFilters}>
        {(['week', 'month', 'year', 'all'] as Period[]).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              state.selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => handlePeriodChange(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                state.selectedPeriod === period && styles.periodButtonTextActive,
              ]}
            >
              {getPeriodLabel(period)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* My Rank Card */}
      {state.myRank !== null && (
        <View style={styles.myRankCard}>
          <View style={styles.myRankContent}>
            <Text style={styles.myRankLabel}>Votre position</Text>
            <View style={styles.myRankBadge}>
              <Text style={styles.myRankNumber}>#{state.myRank}</Text>
            </View>
          </View>
          <Text style={styles.myRankIcon}>👤</Text>
        </View>
      )}

      {/* Column Headers */}
      <View style={styles.columnHeaders}>
        <Text style={[styles.columnHeader, styles.rankColumn]}>Rang</Text>
        <Text style={[styles.columnHeader, styles.userColumn]}>Utilisateur</Text>
        <Text style={[styles.columnHeader, styles.pointsColumn]}>Points</Text>
      </View>
    </View>
  );

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const rank = index + 1;
    const isCurrentUser = item.isCurrentUser;
    const isTopThree = rank <= 3;

    return (
      <View
        style={[
          styles.entryRow,
          isCurrentUser && styles.entryRowHighlight,
          isTopThree && styles.entryRowTopThree,
        ]}
      >
        {/* Rank */}
        <View style={[styles.rankCell, styles.rankColumn]}>
          {getRankIcon(rank) ? (
            <Text style={styles.rankMedal}>{getRankIcon(rank)}</Text>
          ) : (
            <Text style={[styles.rankText, { color: getRankColor(rank) }]}>
              #{rank}
            </Text>
          )}
        </View>

        {/* User Info */}
        <View style={[styles.userCell, styles.userColumn]}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username} numberOfLines={1}>
              {item.username}
              {isCurrentUser && ' (Vous)'}
            </Text>
            <View style={styles.userStats}>
              <Text style={styles.userLevel}>Niveau {item.level}</Text>
              <Text style={styles.userBadges}>• {item.badgesCount} 🎖️</Text>
            </View>
          </View>
        </View>

        {/* Points */}
        <View style={[styles.pointsCell, styles.pointsColumn]}>
          <Text style={styles.pointsText}>{item.points.toLocaleString()}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🏆</Text>
      <Text style={styles.emptyTitle}>Aucun classement disponible</Text>
      <Text style={styles.emptyText}>
        Soyez le premier à explorer et gagner des points !
      </Text>
    </View>
  );

  if (state.loading && !state.refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement du classement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={state.entries}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.userId}-${index}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={state.entries.length === 0 && styles.emptyList}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    color: colors.text,
    marginTop: spacing.md,
  },
  header: {
    backgroundColor: colors.white,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  periodFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    ...typography.labelSmall,
    color: colors.text,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: colors.white,
  },
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  myRankContent: {
    flex: 1,
  },
  myRankLabel: {
    ...typography.labelMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  myRankBadge: {
    alignSelf: 'flex-start',
  },
  myRankNumber: {
    ...typography.h5,
    color: colors.primary,
    fontWeight: '700',
  },
  myRankIcon: {
    fontSize: 32,
  },
  columnHeaders: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  columnHeader: {
    ...typography.labelSmall,
    color: colors.gray400,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  rankColumn: {
    width: 60,
    textAlign: 'center',
  },
  userColumn: {
    flex: 1,
  },
  pointsColumn: {
    width: 80,
    textAlign: 'right',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  entryRowTopThree: {
    backgroundColor: colors.gray100,
  },
  entryRowHighlight: {
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  rankCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankMedal: {
    fontSize: 24,
  },
  rankText: {
    ...typography.labelLarge,
    fontWeight: '700',
  },
  userCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    ...typography.h6,
    color: colors.white,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  userLevel: {
    ...typography.caption,
    color: colors.gray400,
  },
  userBadges: {
    ...typography.caption,
    color: colors.gray400,
  },
  pointsCell: {
    alignItems: 'flex-end',
  },
  pointsText: {
    ...typography.h6,
    color: colors.primary,
    fontWeight: '700',
  },
  pointsLabel: {
    ...typography.caption,
    color: colors.gray400,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 400,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.gray400,
    textAlign: 'center',
  },
});
