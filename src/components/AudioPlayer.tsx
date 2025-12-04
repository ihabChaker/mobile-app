import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { colors, typography, spacing } from '@/theme';
import audioService from '@/services/audio.service';
import { Podcast } from '@/types/parcours.types';

interface AudioPlayerProps {
  podcast: Podcast;
  onClose: () => void;
}

/**
 * Lecteur audio pour les podcasts
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({ podcast, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(podcast.durationSeconds);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  useEffect(() => {
    // Initialize audio on mount
    audioService.initialize();

    // Cleanup on unmount
    return () => {
      audioService.stop();
    };
  }, []);

  useEffect(() => {
    // Update playback status every second
    const interval = setInterval(async () => {
      if (audioService.getIsPlaying()) {
        const status = await audioService.getStatus();
        if (status && status.isLoaded) {
          setCurrentTime(Math.floor(status.positionMillis / 1000));
          if (status.durationMillis) {
            setDuration(Math.floor(status.durationMillis / 1000));
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = async () => {
    try {
      setIsLoading(true);
      
      if (isPlaying) {
        await audioService.pause();
        setIsPlaying(false);
      } else {
        // If this is a different podcast or first play
        if (audioService.getCurrentPodcastId() !== podcast.id) {
          await audioService.loadAndPlay(podcast.audioFileUrl, podcast.id);
        } else {
          await audioService.play();
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeekForward = async () => {
    await audioService.seekForward(10);
  };

  const handleSeekBackward = async () => {
    await audioService.seekBackward(10);
  };

  const handleChangeSpeed = async () => {
    const speeds = [1.0, 1.25, 1.5, 1.75, 2.0];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    
    await audioService.setPlaybackRate(newSpeed);
    setPlaybackRate(newSpeed);
  };

  const handleStop = async () => {
    await audioService.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    onClose();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleStop} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Artwork */}
        <View style={styles.artworkContainer}>
          {podcast.thumbnailUrl ? (
            <Image
              source={{ uri: podcast.thumbnailUrl }}
              style={styles.artwork}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.artworkPlaceholder}>
              <Text style={styles.artworkIcon}>🎧</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {podcast.title}
          </Text>
          {podcast.narrator && (
            <Text style={styles.author}>Par {podcast.narrator}</Text>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{formatTime(currentTime)}</Text>
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Speed Control */}
          <TouchableOpacity
            style={styles.speedButton}
            onPress={handleChangeSpeed}
          >
            <Text style={styles.speedText}>{playbackRate}x</Text>
          </TouchableOpacity>

          {/* Seek Backward */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleSeekBackward}
            disabled={!isPlaying}
          >
            <Text style={styles.controlIcon}>⏪</Text>
            <Text style={styles.seekLabel}>10s</Text>
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="large" />
            ) : (
              <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
            )}
          </TouchableOpacity>

          {/* Seek Forward */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleSeekForward}
            disabled={!isPlaying}
          >
            <Text style={styles.controlIcon}>⏩</Text>
            <Text style={styles.seekLabel}>10s</Text>
          </TouchableOpacity>

          {/* Placeholder for symmetry */}
          <View style={styles.speedButton} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 6.0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: colors.gray600,
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  artworkContainer: {
    width: 200,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  artworkPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkIcon: {
    fontSize: 80,
  },
  info: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  author: {
    ...typography.bodyMedium,
    color: colors.gray600,
  },
  progressContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray300,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    ...typography.caption,
    color: colors.gray600,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  speedButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  controlButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  controlIcon: {
    fontSize: 32,
  },
  seekLabel: {
    ...typography.caption,
    color: colors.gray600,
    marginTop: spacing.xxs,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 4.0,
  },
  playIcon: {
    fontSize: 36,
  },
});
