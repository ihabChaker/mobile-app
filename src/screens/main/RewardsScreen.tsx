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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';
import rewardService from '@/services/reward.service';
import { UserBadge, Reward, UserReward } from '@/types/backend.types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setUser } from '@/store/slices/authSlice';
import userService from '@/services/user.service';
import { convertLocalhostUrl } from '@/utils/url.utils';

type TabType = 'badges' | 'rewards' | 'redemptions';

/**
 * Écran Récompenses
 * Affiche les badges, récompenses disponibles et récompenses échangées
 */
export const RewardsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('badges');
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<UserReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const userPoints = user?.totalPoints || 0;

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      if (activeTab === 'badges') {
        console.log('🏆 Loading badges...');
        const badgesData = await rewardService.getMyBadges();
        console.log('✅ Badges loaded:', badgesData.length);
        setBadges(badgesData);
      } else if (activeTab === 'rewards') {
        console.log('🎁 Loading available rewards...');
        const rewardsData = await rewardService.getAvailableRewards();
        console.log('✅ Rewards loaded:', rewardsData.length);
        setRewards(rewardsData);
      } else if (activeTab === 'redemptions') {
        console.log('📋 Loading my redemptions...');
        const redemptionsData = await rewardService.getMyRedemptions();
        console.log('✅ Redemptions loaded:', redemptionsData.length);
        setRedemptions(redemptionsData);
      }
    } catch (error: any) {
      console.error('❌ Loading error:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de charger les données'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (userPoints < reward.pointsCost) {
      Alert.alert(
        'Points insuffisants',
        `Vous avez ${userPoints} points mais cette récompense coûte ${reward.pointsCost} points.`
      );
      return;
    }

    if (reward.stockQuantity <= 0) {
      Alert.alert(
        'Rupture de stock',
        "Cette récompense n'est plus disponible."
      );
      return;
    }

    Alert.alert(
      "Confirmer l'échange",
      `Voulez-vous échanger ${reward.pointsCost} points contre "${reward.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              setIsRedeeming(true);
              const redemption = await rewardService.redeemReward(reward.id);

              // Refresh user data to update points
              const updatedUser = await userService.getProfile();
              dispatch(setUser(updatedUser));

              Alert.alert(
                '✅ Récompense obtenue !',
                `Code de rédemption: ${redemption.redemptionCode}\n\nVous pouvez consulter vos récompenses dans l'onglet "Mes échanges".`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setSelectedReward(null);
                      setActiveTab('redemptions');
                      loadData();
                    },
                  },
                ]
              );
            } catch (error: any) {
              // Handle insufficient points gracefully
              const errorMessage = error.message || '';
              if (
                errorMessage.includes('Insufficient points') ||
                errorMessage.includes('points')
              ) {
                Alert.alert(
                  '💰 Points insuffisants',
                  `Vous n'avez pas assez de points pour cette récompense. Il vous faut ${reward.pointsCost} points.`,
                  [{ text: "D'accord" }]
                );
              } else if (errorMessage.includes('out of stock')) {
                Alert.alert(
                  '📦 Rupture de stock',
                  "Cette récompense n'est plus disponible pour le moment.",
                  [{ text: "D'accord" }]
                );
              } else {
                Alert.alert(
                  'Oups...',
                  "Une erreur s'est produite. Veuillez réessayer plus tard.",
                  [{ text: "D'accord" }]
                );
              }
            } finally {
              setIsRedeeming(false);
            }
          },
        },
      ]
    );
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity.toLowerCase()) {
      case 'commune':
        return colors.gray500;
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

  const getRewardTypeIcon = (type: string): string => {
    switch (type) {
      case 'discount':
        return '🎫';
      case 'gift':
        return '🎁';
      case 'badge':
        return '🏅';
      case 'premium_content':
        return '⭐';
      default:
        return '🎁';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'redeemed':
        return colors.success;
      case 'used':
        return colors.gray500;
      default:
        return colors.gray500;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'redeemed':
        return 'Confirmé';
      case 'used':
        return 'Utilisé';
      default:
        return status;
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
        {badges
          .filter(userBadge => userBadge.badge)
          .map(userBadge => {
            const badgeIconUrl = convertLocalhostUrl(userBadge.badge!.iconUrl);
            return (
              <View key={userBadge.id} style={styles.badgeCard}>
                <View
                  style={[
                    styles.badgeIconContainer,
                    { borderColor: getRarityColor(userBadge.badge!.rarity) },
                  ]}
                >
                  {badgeIconUrl ? (
                    <Image
                      source={{ uri: badgeIconUrl }}
                      style={styles.badgeIcon}
                      resizeMode="contain"
                      onError={e =>
                        console.log(
                          'Badge image load error:',
                          e.nativeEvent.error
                        )
                      }
                    />
                  ) : (
                    <Text style={styles.badgeIconPlaceholder}>🏅</Text>
                  )}
                </View>
                <Text style={styles.badgeName} numberOfLines={2}>
                  {userBadge.badge!.name}
                </Text>
                <Text style={styles.badgePoints}>
                  +{userBadge.badge!.points} pts
                </Text>
                <Text
                  style={[
                    styles.badgeRarity,
                    { color: getRarityColor(userBadge.badge!.rarity) },
                  ]}
                >
                  {userBadge.badge!.rarity}
                </Text>
              </View>
            );
          })}
      </View>
    );
  };

  const renderRewards = () => {
    if (rewards.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎁</Text>
          <Text style={styles.emptyTitle}>Aucune récompense disponible</Text>
          <Text style={styles.emptyText}>
            Les récompenses seront bientôt disponibles !
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.rewardsList}>
        {rewards.map(reward => {
          const canAfford = userPoints >= reward.pointsCost;
          const inStock = reward.stockQuantity > 0;
          const canRedeem = canAfford && inStock && reward.isAvailable;

          return (
            <TouchableOpacity
              key={reward.id}
              style={[
                styles.rewardCard,
                !canRedeem && styles.rewardCardDisabled,
              ]}
              onPress={() => setSelectedReward(reward)}
              disabled={!canRedeem}
            >
              <View style={styles.rewardHeader}>
                <Text style={styles.rewardTypeIcon}>
                  {getRewardTypeIcon(reward.rewardType)}
                </Text>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  {reward.partnerName && (
                    <Text style={styles.rewardPartner}>
                      Par {reward.partnerName}
                    </Text>
                  )}
                </View>
                <View style={styles.rewardCost}>
                  <Text
                    style={[
                      styles.rewardPoints,
                      !canAfford && styles.rewardPointsInsufficient,
                    ]}
                  >
                    {reward.pointsCost}
                  </Text>
                  <Text style={styles.rewardPointsLabel}>points</Text>
                </View>
              </View>

              {reward.description && (
                <Text style={styles.rewardDescription} numberOfLines={2}>
                  {reward.description}
                </Text>
              )}

              <View style={styles.rewardFooter}>
                <Text style={styles.rewardStock}>
                  {inStock
                    ? `${reward.stockQuantity} disponible(s)`
                    : 'Rupture de stock'}
                </Text>
                {!canAfford && (
                  <Text style={styles.insufficientLabel}>
                    Points insuffisants
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderRedemptions = () => {
    if (redemptions.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Aucun échange</Text>
          <Text style={styles.emptyText}>
            Échangez vos points contre des récompenses dans l'onglet
            "Récompenses" !
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.redemptionsList}>
        {redemptions.map(redemption => (
          <View key={redemption.id} style={styles.redemptionCard}>
            <View style={styles.redemptionHeader}>
              <Text style={styles.redemptionName}>
                {redemption.reward?.name || 'Récompense'}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(redemption.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusLabel(redemption.status)}
                </Text>
              </View>
            </View>

            <View style={styles.redemptionCode}>
              <Text style={styles.codeLabel}>Code de rédemption:</Text>
              <Text style={styles.codeValue}>{redemption.redemptionCode}</Text>
            </View>

            <View style={styles.redemptionDetails}>
              <View style={styles.redemptionDetail}>
                <Text style={styles.detailLabel}>Points dépensés:</Text>
                <Text style={styles.detailValue}>
                  {redemption.pointsSpent} pts
                </Text>
              </View>
              <View style={styles.redemptionDetail}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(redemption.redemptionDatetime).toLocaleDateString(
                    'fr-FR'
                  )}
                </Text>
              </View>
            </View>

            {redemption.status === 'pending' && (
              <Text style={styles.redemptionNote}>
                💡 Présentez ce code au partenaire pour obtenir votre récompense
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderRewardModal = () => {
    if (!selectedReward) return null;

    const canAfford = userPoints >= selectedReward.pointsCost;
    const inStock = selectedReward.stockQuantity > 0;
    const canRedeem = canAfford && inStock;

    return (
      <Modal
        visible={!!selectedReward}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedReward(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>
              {getRewardTypeIcon(selectedReward.rewardType)}
            </Text>
            <Text style={styles.modalTitle}>{selectedReward.name}</Text>

            {selectedReward.partnerName && (
              <Text style={styles.modalPartner}>
                Par {selectedReward.partnerName}
              </Text>
            )}

            {selectedReward.description && (
              <Text style={styles.modalDescription}>
                {selectedReward.description}
              </Text>
            )}

            <View style={styles.modalStats}>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatLabel}>Coût</Text>
                <Text
                  style={[
                    styles.modalStatValue,
                    !canAfford && styles.modalStatValueInsufficient,
                  ]}
                >
                  {selectedReward.pointsCost} points
                </Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatLabel}>Stock</Text>
                <Text style={styles.modalStatValue}>
                  {selectedReward.stockQuantity}
                </Text>
              </View>
            </View>

            <View style={styles.modalBalance}>
              <Text style={styles.modalBalanceLabel}>Votre solde:</Text>
              <Text style={styles.modalBalanceValue}>{userPoints} points</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setSelectedReward(null)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalRedeemButton,
                  !canRedeem && styles.modalRedeemButtonDisabled,
                ]}
                onPress={() => handleRedeemReward(selectedReward)}
                disabled={!canRedeem || isRedeeming}
              >
                {isRedeeming ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalRedeemText}>
                    {!canAfford
                      ? 'Points insuffisants'
                      : !inStock
                        ? 'Rupture de stock'
                        : 'Échanger'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Récompenses</Text>
        <Text style={styles.headerSubtitle}>Vous avez {userPoints} points</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'badges' && styles.tabActive]}
          onPress={() => setActiveTab('badges')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'badges' && styles.tabTextActive,
            ]}
          >
            Mes Badges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rewards' && styles.tabActive]}
          onPress={() => setActiveTab('rewards')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'rewards' && styles.tabTextActive,
            ]}
          >
            Récompenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'redemptions' && styles.tabActive]}
          onPress={() => setActiveTab('redemptions')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'redemptions' && styles.tabTextActive,
            ]}
          >
            Mes échanges
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'badges' && renderBadges()}
        {activeTab === 'rewards' && renderRewards()}
        {activeTab === 'redemptions' && renderRedemptions()}
      </ScrollView>

      {renderRewardModal()}
    </SafeAreaView>
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
  newBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  newBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  challengeDetails: {
    marginBottom: spacing.sm,
  },
  challengeTarget: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
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
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  startButtonText: {
    ...typography.labelLarge,
    color: colors.white,
    fontWeight: '700',
  },
  // Rewards list styles
  rewardsList: {
    gap: spacing.md,
  },
  rewardCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rewardCardDisabled: {
    opacity: 0.6,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rewardTypeIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    ...typography.h6,
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  rewardPartner: {
    ...typography.caption,
    color: colors.gray600,
  },
  rewardCost: {
    alignItems: 'flex-end',
  },
  rewardPoints: {
    ...typography.h5,
    color: colors.success,
    fontWeight: '700',
  },
  rewardPointsInsufficient: {
    color: colors.error,
  },
  rewardPointsLabel: {
    ...typography.caption,
    color: colors.gray600,
  },
  rewardDescription: {
    ...typography.bodySmall,
    color: colors.gray700,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardStock: {
    ...typography.caption,
    color: colors.gray600,
  },
  insufficientLabel: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  // Redemptions list styles
  redemptionsList: {
    gap: spacing.md,
  },
  redemptionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  redemptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  redemptionName: {
    ...typography.h6,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 6,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  redemptionCode: {
    backgroundColor: colors.gray100,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  codeLabel: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.xxs,
  },
  codeValue: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    letterSpacing: 2,
  },
  redemptionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  redemptionDetail: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.xxs,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  redemptionNote: {
    ...typography.caption,
    color: colors.gray600,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalPartner: {
    ...typography.bodyMedium,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modalDescription: {
    ...typography.bodyMedium,
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray300,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatLabel: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.xxs,
  },
  modalStatValue: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
  },
  modalStatValueInsufficient: {
    color: colors.error,
  },
  modalBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.gray100,
    borderRadius: 8,
  },
  modalBalanceLabel: {
    ...typography.bodyMedium,
    color: colors.gray700,
  },
  modalBalanceValue: {
    ...typography.h6,
    color: colors.primary,
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray400,
    alignItems: 'center',
  },
  modalCancelText: {
    ...typography.labelLarge,
    color: colors.gray700,
  },
  modalRedeemButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalRedeemButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  modalRedeemText: {
    ...typography.labelLarge,
    color: colors.white,
    fontWeight: '700',
  },
});
