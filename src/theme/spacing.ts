/**
 * Système d'espacement HistoRando
 * Unité de base: 4px
 */

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export type SpacingSize = keyof typeof spacing;

/**
 * Helper pour obtenir l'espacement
 */
export const getSpacing = (size: SpacingSize): number => spacing[size];
