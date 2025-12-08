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
import { useAudioPlayer } from 'expo-audio';
import { Podcast } from '@/types/parcours.types';
import { convertLocalhostUrl } from '@/utils/url.utils';

interface AudioPlayerProps {
  podcast: Podcast;
  onClose: () => void;
}

/**
 * Lecteur audio pour les podcasts
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  podcast,
  onClose,
}) => {
  // Convert localhost URLs to actual API URL
  const audioUrl =
    convertLocalhostUrl(podcast.audioFileUrl) || podcast.audioFileUrl;
  const thumbnailUrl = convertLocalhostUrl(podcast.thumbnailUrl);

  // Initialize player with source - must be stable
  const player = useAudioPlayer(audioUrl);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(podcast.durationSeconds);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    console.log('AudioPlayer mounted with URL:', podcast.audioFileUrl);
    console.log('Actual audio URL:', audioUrl);

    // Cleanup on unmount
    return () => {
      console.log('AudioPlayer unmounting');
      try {
        if (player && player.playing) {
          player.pause();
        }
      } catch (error) {
        console.log('Error during cleanup:', error);
      }
    };
  }, []);

  useEffect(() => {
    // Update playback status every second
    const interval = setInterval(() => {
      try {
        if (player) {
          // Check if player has valid duration
          if (player.duration && player.duration > 0) {
            setPlayerReady(true);
            setDuration(Math.floor(player.duration));
          }

          if (player.playing) {
            const time = Math.floor(player.currentTime);
            // Ensure time doesn't exceed duration
            setCurrentTime(Math.min(time, Math.floor(player.duration || 0)));
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }
        }
      } catch (error) {
        console.log('Error updating playback status:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player]);

  const handlePlayPause = async () => {
    try {
      setIsLoading(true);
      console.log('Play/Pause pressed. Current state:', {
        playing: player?.playing,
        currentTime: player?.currentTime,
        duration: player?.duration,
        originalUrl: podcast.audioFileUrl,
        actualUrl: audioUrl,
      });

      if (player) {
        if (player.playing) {
          console.log('Pausing audio');
          player.pause();
        } else {
          console.log('Playing audio');
          player.play();
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeekForward = () => {
    if (!playerReady || !player || !player.duration) {
      console.log('Player not ready for seeking');
      return;
    }

    try {
      const currentPos = player.currentTime || 0;
      const maxDuration = player.duration;

      // Calculate new position, ensuring it's within valid bounds
      let newTime = currentPos + 10;

      // Leave a small buffer at the end to prevent crash
      const safeMaxTime = maxDuration - 0.5;

      if (newTime >= safeMaxTime) {
        newTime = safeMaxTime;
      }

      // Only seek if the new position is different and valid
      if (newTime > currentPos && newTime < maxDuration) {
        player.seekTo(newTime);
        console.log('Seek forward:', {
          from: currentPos,
          to: newTime,
          duration: maxDuration,
        });
      } else {
        console.log('Seek forward skipped - too close to end');
      }
    } catch (error) {
      console.error('Error seeking forward:', error);
    }
  };

  const handleSeekBackward = () => {
    if (!playerReady || !player) {
      console.log('Player not ready for seeking');
      return;
    }

    try {
      const currentPos = player.currentTime || 0;
      const newTime = Math.max(currentPos - 10, 0);

      // Only seek if position is different
      if (newTime < currentPos) {
        player.seekTo(newTime);
        console.log('Seek backward:', { from: currentPos, to: newTime });
      }
    } catch (error) {
      console.error('Error seeking backward:', error);
    }
  };

  const handleChangeSpeed = () => {
    try {
      const speeds = [1.0, 1.25, 1.5, 1.75, 2.0];
      const currentIndex = speeds.indexOf(playbackRate);
      const nextIndex = (currentIndex + 1) % speeds.length;
      const newSpeed = speeds[nextIndex];

      if (player) {
        player.setPlaybackRate(newSpeed);
        setPlaybackRate(newSpeed);
      }
    } catch (error) {
      console.error('Error changing speed:', error);
    }
  };

  const handleStop = () => {
    try {
      if (player) {
        player.pause();
        player.seekTo(0);
      }
    } catch (error) {
      console.error('Error stopping:', error);
    }
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
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
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
            <View
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
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
            disabled={!playerReady}
          >
            <Text
              style={[
                styles.controlIcon,
                !playerReady && styles.disabledControl,
              ]}
            >
              ⏪
            </Text>
            <Text
              style={[styles.seekLabel, !playerReady && styles.disabledControl]}
            >
              10s
            </Text>
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
            disabled={!playerReady}
          >
            <Text
              style={[
                styles.controlIcon,
                !playerReady && styles.disabledControl,
              ]}
            >
              ⏩
            </Text>
            <Text
              style={[styles.seekLabel, !playerReady && styles.disabledControl]}
            >
              10s
            </Text>
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
  disabledControl: {
    opacity: 0.3,
  },
});
