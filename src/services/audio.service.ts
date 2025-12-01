import { Audio, AVPlaybackStatus } from 'expo-av';

/**
 * Service de gestion de la lecture audio pour les podcasts
 * Phase 3 - À implémenter
 */
class AudioService {
  private sound: Audio.Sound | null = null;
  private currentPodcastId: number | null = null;
  private isPlaying: boolean = false;

  /**
   * Initialiser le mode audio
   */
  async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw error;
    }
  }

  /**
   * Charger et jouer un podcast
   */
  async loadAndPlay(audioUrl: string, podcastId: number): Promise<void> {
    try {
      // Arrêter le son précédent si existe
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // Charger le nouveau son
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      this.currentPodcastId = podcastId;
      this.isPlaying = true;

      await sound.playAsync();
    } catch (error) {
      console.error('Failed to load and play audio:', error);
      throw error;
    }
  }

  /**
   * Jouer/Reprendre la lecture
   */
  async play(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
      this.isPlaying = true;
    }
  }

  /**
   * Mettre en pause
   */
  async pause(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
      this.isPlaying = false;
    }
  }

  /**
   * Arrêter et décharger
   */
  async stop(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
      this.currentPodcastId = null;
      this.isPlaying = false;
    }
  }

  /**
   * Avancer de X secondes
   */
  async seekForward(seconds: number = 10): Promise<void> {
    if (this.sound) {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.min(
          status.positionMillis + seconds * 1000,
          status.durationMillis || 0
        );
        await this.sound.setPositionAsync(newPosition);
      }
    }
  }

  /**
   * Reculer de X secondes
   */
  async seekBackward(seconds: number = 10): Promise<void> {
    if (this.sound) {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.max(status.positionMillis - seconds * 1000, 0);
        await this.sound.setPositionAsync(newPosition);
      }
    }
  }

  /**
   * Aller à une position spécifique (en millisecondes)
   */
  async seekTo(positionMillis: number): Promise<void> {
    if (this.sound) {
      await this.sound.setPositionAsync(positionMillis);
    }
  }

  /**
   * Changer la vitesse de lecture
   */
  async setPlaybackRate(rate: number): Promise<void> {
    if (this.sound) {
      await this.sound.setRateAsync(rate, true);
    }
  }

  /**
   * Obtenir le statut de lecture
   */
  async getStatus(): Promise<AVPlaybackStatus | null> {
    if (this.sound) {
      return await this.sound.getStatusAsync();
    }
    return null;
  }

  /**
   * Vérifier si un son est en cours de lecture
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Obtenir l'ID du podcast en cours
   */
  getCurrentPodcastId(): number | null {
    return this.currentPodcastId;
  }

  /**
   * Callback de mise à jour du statut
   */
  private onPlaybackStatusUpdate = (status: AVPlaybackStatus): void => {
    if (status.isLoaded) {
      this.isPlaying = status.isPlaying;

      // Fin de lecture
      if (status.didJustFinish && !status.isLooping) {
        this.isPlaying = false;
        // TODO: Déclencher événement de fin
      }
    } else if (status.error) {
      console.error('Playback error:', status.error);
    }
  };

  /**
   * Nettoyer les ressources
   */
  async cleanup(): Promise<void> {
    await this.stop();
  }
}

export const audioService = new AudioService();
export default audioService;
