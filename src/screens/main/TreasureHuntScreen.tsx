import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors, typography, spacing } from '@/theme';
import { QRScanner } from '@/components/QRScanner';
import treasureHuntService from '@/services/treasure-hunt.service';
import { TreasureHunt, TreasureItem } from '@/types/backend.types';

type Props = NativeStackScreenProps<MainStackParamList, 'TreasureHunt'>;

export const TreasureHuntScreen: React.FC<Props> = ({ route, navigation }) => {
  const { treasureHuntId, treasureHuntName } = route.params;

  const [treasureHunt, setTreasureHunt] = useState<TreasureHunt | null>(null);
  const [items, setItems] = useState<TreasureItem[]>([]);
  const [foundItems, setFoundItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadTreasureHunt();
  }, [treasureHuntId]);

  const loadTreasureHunt = async () => {
    try {
      setLoading(true);
      const hunt =
        await treasureHuntService.getTreasureHuntById(treasureHuntId);
      setTreasureHunt(hunt);

      const huntItems =
        await treasureHuntService.getTreasureItems(treasureHuntId);
      setItems(huntItems);

      // Get already found items for this hunt
      const foundItemIds =
        await treasureHuntService.getFoundItemsForHunt(treasureHuntId);
      setFoundItems(new Set(foundItemIds));
    } catch (error: any) {
      console.error('Failed to load treasure hunt:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de charger la chasse au trésor',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = async (data: string) => {
    if (scanning) return;

    try {
      setScanning(true);
      const result = await treasureHuntService.scanTreasureItem(data);

      setShowScanner(false);

      if (result.isNewFind) {
        // Add to found items
        setFoundItems(prev => new Set([...prev, result.item.id]));

        if (result.huntComplete) {
          Alert.alert(
            'Chasse au trésor complétée ! 🎉',
            `Félicitations ! Vous avez trouvé tous les trésors !\n\n` +
              `Points gagnés: +${result.pointsEarned}\n` +
              `Bonus de complétion: +${result.completionBonus || 0}`,
            [{ text: 'Super !', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert(
            'Trésor trouvé ! 🏆',
            `Vous avez découvert "${result.item.itemName}" !\n\n` +
              `Points gagnés: +${result.pointsEarned}\n` +
              `Progression: ${result.totalItemsFound}/${result.totalItemsInHunt}`,
            [{ text: 'Continuer' }]
          );
        }
      } else {
        Alert.alert(
          'Déjà trouvé',
          `Vous avez déjà trouvé "${result.item.itemName}".`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Failed to scan treasure item:', error);

      // Check if item doesn't belong to this hunt
      if (error.response?.status === 400) {
        Alert.alert(
          'Code invalide',
          "Ce trésor n'appartient pas à cette chasse.",
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Erreur',
          error.message || 'Impossible de scanner le trésor',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setScanning(false);
    }
  };

  const renderItem = ({ item }: { item: TreasureItem }) => {
    const isFound = foundItems.has(item.id);

    return (
      <View style={[styles.itemCard, isFound && styles.itemCardFound]}>
        <View style={styles.itemIcon}>
          <Text style={styles.itemIconText}>{isFound ? '✅' : '❓'}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, isFound && styles.itemNameFound]}>
            {isFound ? item.itemName : '???'}
          </Text>
          {isFound && item.description && (
            <Text style={styles.itemDescription}>{item.description}</Text>
          )}
          {isFound && (
            <Text style={styles.itemPoints}>+{item.pointsValue} points</Text>
          )}
          {!isFound && <Text style={styles.itemHint}>À découvrir...</Text>}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showScanner) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scannerHeader}>
          <TouchableOpacity
            onPress={() => setShowScanner(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✕ Fermer</Text>
          </TouchableOpacity>
          <Text style={styles.scannerTitle}>Scanner un trésor</Text>
        </View>
        <QRScanner
          onScan={handleScanQR}
          onClose={() => setShowScanner(false)}
        />
      </SafeAreaView>
    );
  }

  const foundCount = foundItems.size;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (foundCount / totalCount) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {treasureHuntName || treasureHunt?.name}
        </Text>
        {treasureHunt?.description && (
          <Text style={styles.description}>{treasureHunt.description}</Text>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Progression: {foundCount}/{totalCount}
          </Text>
          <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Items List */}
      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun trésor dans cette chasse</Text>
          </View>
        }
      />

      {/* Scan Button */}
      <View style={styles.scanButtonContainer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setShowScanner(true)}
          disabled={scanning}
        >
          <Text style={styles.scanButtonIcon}>📷</Text>
          <Text style={styles.scanButtonText}>
            {scanning ? 'Scan en cours...' : 'Scanner un trésor'}
          </Text>
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
  },
  loadingText: {
    ...typography.bodyLarge,
    color: colors.gray600,
    marginTop: spacing.md,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.gray600,
  },
  progressContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.labelLarge,
    color: colors.text,
  },
  progressPercentage: {
    ...typography.labelLarge,
    color: colors.primary,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  listContent: {
    padding: spacing.lg,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray300,
  },
  itemCardFound: {
    borderColor: colors.success,
    backgroundColor: '#f0fdf4',
  },
  itemIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemIconText: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    ...typography.labelLarge,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemNameFound: {
    color: colors.success,
  },
  itemDescription: {
    ...typography.bodySmall,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  itemPoints: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '600',
  },
  itemHint: {
    ...typography.bodySmall,
    color: colors.gray500,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyLarge,
    color: colors.gray500,
  },
  scanButtonContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  scanButtonText: {
    ...typography.labelLarge,
    color: colors.white,
    fontWeight: '600',
  },
  scannerHeader: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
  },
  closeButtonText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  scannerTitle: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
