import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { colors, typography, spacing } from '@/theme';
import podcastService from '@/services/podcast.service';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Podcast } from '@/types/parcours.types';

/**
 * Écran Podcasts - Phase 3
 * Liste tous les podcasts disponibles
 */
export const PodcastScreen: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    loadPodcasts();
  }, []);

  const loadPodcasts = async () => {
    try {
      setIsLoading(true);
      const data = await podcastService.getAllPodcasts();
      setPodcasts(data);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de charger les podcasts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPodcasts();
    setRefreshing(false);
  };

  const handlePodcastPress = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setSelectedPodcast(null);
  };

  const renderPodcastItem = ({ item }: { item: Podcast }) => (
    <TouchableOpacity
      style={styles.podcastCard}
      onPress={() => handlePodcastPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.podcastImageContainer}>
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.podcastImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.podcastImagePlaceholder}>
            <Text style={styles.podcastImageIcon}>🎧</Text>
          </View>
        )}
      </View>

      <View style={styles.podcastContent}>
        <Text style={styles.podcastTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.podcastDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.podcastFooter}>
          <Text style={styles.podcastDuration}>
            ⏱️ {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
          </Text>
          {item.author && (
            <Text style={styles.podcastAuthor}>🎙️ {item.author}</Text>
          )}
        </View>
      </View>

      <View style={styles.playButton}>
        <Text style={styles.playIcon}>▶️</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des podcasts...</Text>
      </View>
    );
  }

  if (podcasts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎧</Text>
        <Text style={styles.emptyTitle}>Aucun podcast disponible</Text>
        <Text style={styles.emptyText}>
          Les podcasts seront ajoutés prochainement.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎧 Podcasts Historiques</Text>
        <Text style={styles.headerSubtitle}>
          {podcasts.length} podcast{podcasts.length > 1 ? 's' : ''} disponible{podcasts.length > 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={podcasts}
        renderItem={renderPodcastItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Audio Player Modal */}
      <Modal
        visible={showPlayer && selectedPodcast !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClosePlayer}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPodcast && (
              <AudioPlayer
                podcast={selectedPodcast}
                onClose={handleClosePlayer}
              />
            )}
          </View>
        </View>
      </Modal>
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
  listContent: {
    padding: spacing.md,
  },
  podcastCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  podcastImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  podcastImage: {
    width: '100%',
    height: '100%',
  },
  podcastImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podcastImageIcon: {
    fontSize: 36,
  },
  podcastContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  podcastTitle: {
    ...typography.h6,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  podcastDescription: {
    ...typography.bodySmall,
    color: colors.gray600,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  podcastFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  podcastDuration: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  podcastAuthor: {
    ...typography.caption,
    color: colors.gray600,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 20,
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
    backgroundColor: colors.background,
    padding: spacing.xl,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
  },
});
