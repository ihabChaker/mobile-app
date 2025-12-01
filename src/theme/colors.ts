/**
 * HistoRando Color Palette
 * Couleurs inspirées des paysages de Normandie et de l'histoire de la WWII
 */

export const colors = {
  // Couleurs principales
  primary: '#6E5849', // Marron terre - Évoque les bunkers et la terre normande
  secondary: '#7B8A5D', // Vert kaki - Couleur militaire historique
  background: '#DCC9A6', // Beige sable - Plages de Normandie
  surface: '#F5F3EE', // Blanc cassé - Clarté et lisibilité
  text: '#3E3E3E', // Noir doux - Texte principal
  
  // Variantes du marron terre (primary)
  primaryLight: '#8B6F5E',
  primaryDark: '#554437',
  
  // Variantes du vert kaki (secondary)
  secondaryLight: '#95A577',
  secondaryDark: '#5F6B45',
  
  // États et feedback
  success: '#7B8A5D', // Utilise le vert kaki
  successLight: '#E8F0E3', // Fond clair pour success
  error: '#C44536', // Rouge terre cuite
  errorLight: '#FCE8E6', // Fond clair pour erreur
  warning: '#D4A574', // Ocre/beige foncé
  warningLight: '#FDF5ED', // Fond clair pour warning
  info: '#6E8B9F', // Bleu gris
  infoLight: '#E8F1F5', // Fond clair pour info
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F5F3EE', // Surface
  gray200: '#E8E4DD',
  gray300: '#DCC9A6', // Background
  gray400: '#B8A890',
  gray500: '#8F7F6F',
  gray600: '#6E5849', // Primary
  gray700: '#554437',
  gray800: '#3E3E3E', // Text
  gray900: '#2A2A2A',
  
  // Overlays et ombres
  overlay: 'rgba(62, 62, 62, 0.5)', // Text color avec transparence
  shadow: 'rgba(110, 88, 73, 0.15)', // Primary color avec transparence
  
  // Couleurs spéciales pour l'application
  mapMarker: '#C44536', // Rouge pour les POI sur la carte
  badge: '#7B8A5D', // Vert kaki pour les badges
  achievement: '#D4A574', // Ocre pour les achievements
  podcast: '#6E5849', // Marron pour les podcasts
  quiz: '#6E8B9F', // Bleu gris pour les quiz
  challenge: '#C44536', // Rouge pour les challenges
  treasureHunt: '#D4A574', // Ocre pour les chasses au trésor
} as const;

export type ColorName = keyof typeof colors;
