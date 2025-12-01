import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

/**
 * HistoRando Theme System
 * Point d'entrée central pour tous les tokens de design
 */

export { colors } from './colors';
export type { ColorName } from './colors';

export { typography } from './typography';
export type { TypographyVariant } from './typography';

export { spacing, getSpacing } from './spacing';
export type { SpacingSize } from './spacing';

/**
 * Thème complet de l'application
 */
export const theme = {
  colors,
  typography,
  spacing,
} as const;

export type Theme = typeof theme;
