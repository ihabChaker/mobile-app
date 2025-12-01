import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing } from '@/theme';
import { Parcours } from '@/types/parcours.types';

interface ParcoursCardProps {
  parcours: Parcours;
  onPress: () => void;
}

/**
 * Carte d'un parcours pour l'affichage en liste
 */
export const ParcoursCard: React.FC<ParcoursCardProps> = ({
  parcours,
  onPress,
}) => {
  const difficulty = parcours.difficulty || 'moyen';
  const difficultyColor = {
    facile: colors.success,
    moyen: colors.warning,
    difficile: colors.error,
  }[difficulty] || colors.gray500;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {parcours.thumbnailUrl ? (
          <Image
            source={{ uri: parcours.thumbnailUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>📍</Text>
          </View>
        )}
        <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
          <Text style={styles.difficultyText}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {parcours.title || 'Parcours sans titre'}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {parcours.description || 'Aucune description disponible'}
        </Text>

        <View style={styles.footer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📏</Text>
            <Text style={styles.infoText}>{parcours.distance || 0} km</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>⏱️</Text>
            <Text style={styles.infoText}>{parcours.estimatedDuration || 0} min</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🎯</Text>
            <Text style={styles.infoText}>{difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
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
  placeholderText: {
    fontSize: 48,
  },
  difficultyBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  difficultyText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.gray600,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    ...typography.caption,
    color: colors.gray600,
  },
});
