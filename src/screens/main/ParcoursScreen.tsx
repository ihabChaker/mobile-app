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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '@/navigation/types';
import { colors, typography, spacing } from '@/theme';
import { ParcoursCard } from '@/components';
import { Parcours } from '@/types/parcours.types';
import parcoursService from '@/services/parcours.service';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Écran Liste des Parcours
 */
export const ParcoursScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [parcours, setParcours] = useState<Parcours[]>([]);
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

      const data = await parcoursService.getParcours();
      setParcours(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du chargement des parcours';
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
    navigation.navigate('ParcoursDetail', { parcoursId: parcours.id });
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
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des parcours...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Parcours Disponibles</Text>
        <Text style={styles.subtitle}>
          Découvrez les sites historiques de la Normandie
        </Text>
      </View>

      {renderError()}

      <FlatList
        data={parcours || []}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <ParcoursCard
            parcours={item}
            onPress={() => handleParcoursPress(item)}
          />
        )}
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
    </View>
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
