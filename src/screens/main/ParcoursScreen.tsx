import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors, typography, spacing } from '@/theme';
import { ParcoursCard } from '@/components';
import { Parcours } from '@/types/parcours.types';
import parcoursService from '@/services/parcours.service';
import parcoursSessionService from '@/services/parcours-session.service';
import { ParcoursSession } from '@/types/backend.types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Écran Liste des Parcours
 */
export const ParcoursScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [activeSessions, setActiveSessions] = useState<ParcoursSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParcours = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const [parcoursData, sessionsData] = await Promise.all([
        parcoursService.getParcours(),
        parcoursSessionService.getActiveSessions().catch(() => []),
      ]);

      // If user has an active session, only show that parcours
      if (sessionsData && sessionsData.length > 0) {
        const activeParcoursIds = sessionsData.map(s => s.parcoursId);
        const filteredParcours = parcoursData.filter(p =>
          activeParcoursIds.includes(p.id)
        );
        setParcours(filteredParcours);
      } else {
        // No active session, show all parcours
        setParcours(parcoursData);
      }

      setActiveSessions(sessionsData);
    } catch (err: any) {
      const errorMessage =
        err.message || 'Erreur lors du chargement des parcours';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchParcours();
  }, []);

  const onRefresh = useCallback(() => {
    fetchParcours(true);
  }, []);

  const handleParcoursPress = (parcours: Parcours) => {
    const activeSession = activeSessions.find(
      s => s.parcoursId === parcours.id
    );

    if (activeSession) {
      // Navigate to tracking screen for active parcours
      navigation.navigate('ParcoursTracking', {
        parcoursId: parcours.id,
        sessionId: activeSession.id,
      });
    } else {
      // Navigate to details for inactive parcours
      navigation.navigate('ParcoursDetail', { parcoursId: parcours.id });
    }
  };

  const handleAbandonSession = async (parcoursId: number) => {
    const activeSession = activeSessions.find(s => s.parcoursId === parcoursId);
    if (!activeSession) return;

    Alert.alert(
      'Abandonner le parcours',
      'Êtes-vous sûr de vouloir abandonner ce parcours en cours ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Abandonner',
          style: 'destructive',
          onPress: async () => {
            try {
              await parcoursSessionService.deleteSession(activeSession.id);
              Alert.alert('Succès', 'Parcours abandonné');
              fetchParcours(true);
            } catch (error: any) {
              Alert.alert(
                'Erreur',
                error.message || "Impossible d'abandonner le parcours"
              );
            }
          },
        },
      ]
    );
  };

  const renderEmptyList = () => {
    if (isLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🗺️</Text>
        <Text style={styles.emptyTitle}>Aucun parcours disponible</Text>
        <Text style={styles.emptyText}>
          Les parcours seront disponibles prochainement.
        </Text>
      </View>
    );
  };

  const renderError = () => {
    if (!error || isLoading) {
      return null;
    }

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des parcours...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Parcours Disponibles</Text>
        <Text style={styles.subtitle}>
          Découvrez les sites historiques de la Normandie
        </Text>
      </View>

      {renderError()}

      <FlatList
        data={parcours}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const isActive = activeSessions.some(s => s.parcoursId === item.id);
          return (
            <ParcoursCard
              parcours={item}
              onPress={() => handleParcoursPress(item)}
              isActive={isActive}
              onAbandon={
                isActive ? () => handleAbandonSession(item.id) : undefined
              }
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.gray600,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100, // Space for floating tab bar
    flexGrow: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
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
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorIcon: {
    fontSize: 24,
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.error,
    flex: 1,
  },
});
