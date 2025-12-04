import { AudioPlayer, AudioSource } from 'expo-audio';

/**
 * Service de gestion de la lecture audio pour les podcasts
 * Phase 3 - Migré vers expo-audio (SDK 54+)
 */
class AudioService {
  private player: AudioPlayer | null = null;
  private currentPodcastId: number | null = null;
  private isPlaying: boolean = false;

  /**
   * Initialiser le mode audio
   */
  async initialize(): Promise<void> {
    try {
      // expo-audio gère automatiquement la configuration audio
      if (!this.player) {
        this.player = new AudioPlayer();
      }
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
      // Créer ou réinitialiser le lecteur
      if (!this.player) {
        this.player = new AudioPlayer();
      }

      // Remplacer la source audio
      const source: AudioSource = { uri: audioUrl };
      await this.player.replace(source);

      this.currentPodcastId = podcastId;
      this.isPlaying = true;

      await this.player.play();
    } catch (error) {
      console.error('Failed to load and play audio:', error);
      throw error;
    }
  }

  /**
   * Jouer/Reprendre la lecture
   */
  async play(): Promise<void> {
    if (this.player) {
      await this.player.play();
      this.isPlaying = true;
    }
  }

  /**
   * Mettre en pause
   */
  async pause(): Promise<void> {
    if (this.player) {
      await this.player.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Arrêter et décharger
   */
  async stop(): Promise<void> {
    if (this.player) {
      await this.player.pause();
      await this.player.remove();
      this.player = null;
      this.currentPodcastId = null;
      this.isPlaying = false;
    }
  }

  /**
   * Avancer de X secondes
   */
  async seekForward(seconds: number = 10): Promise<void> {
    if (this.player) {
      const currentTime = this.player.currentTime;
      const duration = this.player.duration || 0;
      const newPosition = Math.min(currentTime + seconds, duration);
      this.player.currentTime = newPosition;
    }
  }

  /**
   * Reculer de X secondes
   */
  async seekBackward(seconds: number = 10): Promise<void> {
    if (this.player) {
      const currentTime = this.player.currentTime;
      const newPosition = Math.max(currentTime - seconds, 0);
      this.player.currentTime = newPosition;
    }
  }

  /**
   * Aller à une position spécifique (en secondes)
   */
  async seekTo(positionSeconds: number): Promise<void> {
    if (this.player) {
      this.player.currentTime = positionSeconds;
    }
  }

  /**
   * Changer la vitesse de lecture
   */
  async setPlaybackRate(rate: number): Promise<void> {
    if (this.player) {
      this.player.playbackRate = rate;
    }
  }

  /**
   * Obtenir le statut de lecture
   */
  async getStatus(): Promise<{ isLoaded: boolean; positionMillis: number; durationMillis?: number } | null> {
    if (this.player) {
      return {
        isLoaded: this.player.isLoaded,
        positionMillis: this.player.currentTime * 1000,
        durationMillis: this.player.duration ? this.player.duration * 1000 : undefined,
      };
    }
    return null;
  }

  /**
   * Vérifier si un son est en cours de lecture
   */
  getIsPlaying(): boolean {
    return this.player?.playing || false;
  }

  /**
   * Obtenir l'ID du podcast en cours
   */
  getCurrentPodcastId(): number | null {
    return this.currentPodcastId;
  }

  /**
   * Nettoyer les ressources
   */
  async cleanup(): Promise<void> {
    await this.stop();
  }
}

export const audioService = new AudioService();
export default audioService;
