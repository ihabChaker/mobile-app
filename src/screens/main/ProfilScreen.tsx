import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, setUser } from '@/store/slices/authSlice';
import { QRScanner } from '@/components/QRScanner';
import treasureHuntService from '@/services/treasure-hunt.service';
import userService from '@/services/user.service';

/**
 * Écran Profil
 */
export const ProfilScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  const handleQRScan = async (data: string) => {
    setShowQRScanner(false);

    try {
      // Parse QR code data - expecting format: "TREASURE_ITEM_ID:123" or just "123"
      let treasureItemId: number;
      if (data.includes('TREASURE_ITEM_ID:')) {
        treasureItemId = parseInt(data.split(':')[1], 10);
      } else {
        treasureItemId = parseInt(data, 10);
      }

      if (isNaN(treasureItemId)) {
        Alert.alert('Erreur', 'QR code invalide');
        return;
      }

      // Call API
      const result = await treasureHuntService.scanTreasureItem(data);

      // Show Success
      const successMessage = result.isNewFind
        ? `Nouveau trésor trouvé ! (${result.totalItemsFound}/${result.totalItemsInHunt})`
        : 'Vous avez déjà trouvé ce trésor';

      Alert.alert(
        'Trésor trouvé ! 🎉',
        `${successMessage}\n\n+${result.pointsEarned} points`,
        [{ text: 'Génial !' }]
      );

      // 4. Refresh user profile to update points
      const updatedUser = await userService.getProfile();
      dispatch(setUser(updatedUser));
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de valider le QR code.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.errorText}>Utilisateur non connecté</Text>
      </SafeAreaView>
    );
  }

  const getProgressPercentage = () => {
    const points = user.totalPoints || 0;
    const nextLevelPoints = (user.level || 1) * 100;
    return Math.min((points / nextLevelPoints) * 100, 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.firstName?.[0]?.toUpperCase() || '?'}
              {user.lastName?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>

          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{user.totalPoints || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{user.level || 1}</Text>
            <Text style={styles.statLabel}>Niveau</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎖️</Text>
            <Text style={styles.statValue}>{user.badges?.length || 0}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              Progression vers niveau {(user.level || 1) + 1}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.floor(getProgressPercentage())}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${getProgressPercentage()}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {user.totalPoints || 0} / {(user.level || 1) * 100} points
          </Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🗺️</Text>
            <Text style={styles.infoLabel}>Parcours complétés</Text>
            <Text style={styles.infoValue}>0</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoLabel}>POI découverts</Text>
            <Text style={styles.infoValue}>0</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />

        {/* QR Scanner Modal */}
        <Modal
          visible={showQRScanner}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowQRScanner(false)}
          />
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarText: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '700',
  },
  userName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  username: {
    ...typography.bodyMedium,
    color: colors.gray600,
    marginBottom: spacing.xxs,
  },
  email: {
    ...typography.bodySmall,
    color: colors.gray500,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xxs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray600,
  },
  progressSection: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    ...typography.labelMedium,
    color: colors.text,
  },
  progressPercentage: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.gray600,
    textAlign: 'center',
  },
  infoSection: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.gray600,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.xs,
  },
  actionsContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
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
  qrButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '500',
  },
  logoutButton: {
    margin: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.white,
  },
  bottomSpacer: {
    height: spacing.lg,
  },
  errorText: {
    ...typography.bodyLarge,
    color: colors.error,
    textAlign: 'center',
  },
});
