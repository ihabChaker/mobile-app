import { TextStyle } from 'react-native';
import { colors } from './colors';

/**
 * Typographie HistoRando
 * Système de typographie cohérent pour toute l'application
 */

export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: colors.text,
    fontFamily: 'System', // Sera remplacé par une fonte custom si besoin
  } as TextStyle,

  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    color: colors.text,
    fontFamily: 'System',
  } as TextStyle,

  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: colors.text,
    fontFamily: 'System',
  } as TextStyle,

  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.text,
    fontFamily: 'System',
  } as TextStyle,

  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.text,
    fontFamily: 'System',
  } as TextStyle,

  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: colors.text,
    fontFamily: 'System',
  } as TextStyle,

  // Body text
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.text,
    fontFamily: 'System',
  } as TextStyle,

  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.text,
    fontFamily: 'System',
  } as TextStyle,

  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.text,
    fontFamily: 'System',
  } as TextStyle,

  // Labels
  labelLarge: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: colors.text,
    fontFamily: 'System',
  } as TextStyle,

  labelMedium: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: colors.text,
    fontFamily: 'System',
  } as TextStyle,

  labelSmall: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    color: colors.text,
    fontFamily: 'System',
  } as TextStyle,

  // Buttons
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'System',
  } as TextStyle,

  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'System',
  } as TextStyle,

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.gray600,
    fontFamily: 'System',
  } as TextStyle,

  // Overline
  overline: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.gray600,
    fontFamily: 'System',
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;
