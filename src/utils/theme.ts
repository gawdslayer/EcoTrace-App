import { platformSelect, platformShadow } from './platform';

// Theme constants for consistent styling across the app

export const colors = {
  // Primary green palette (eco theme)
  primary: '#166534',
  primaryLight: '#15803d',
  primaryDark: '#14532d',
  
  // Background colors
  background: '#f0fdf4',
  backgroundLight: '#f7fee7',
  backgroundDark: '#ecfdf5',
  
  // Text colors
  textPrimary: '#166534',
  textSecondary: '#15803d',
  textLight: '#6b7280',
  textDark: '#111827',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutral colors
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Platform-specific shadows
export const shadows = {
  sm: platformShadow(1),
  md: platformShadow(4),
  lg: platformShadow(8),
  xl: platformShadow(12),
};

// Platform-specific typography
export const typography = {
  // iOS uses San Francisco, Android uses Roboto
  fontFamily: platformSelect({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Platform-specific line heights
  lineHeight: {
    tight: platformSelect({
      ios: 1.2,
      android: 1.3,
      default: 1.25,
    }),
    normal: platformSelect({
      ios: 1.4,
      android: 1.5,
      default: 1.45,
    }),
    relaxed: platformSelect({
      ios: 1.6,
      android: 1.7,
      default: 1.65,
    }),
  },
};

// Platform-specific component styles
export const componentStyles = {
  // Button styles
  button: {
    height: platformSelect({
      ios: 44, // iOS HIG recommendation
      android: 48, // Material Design recommendation
      default: 44,
    }),
    borderRadius: platformSelect({
      ios: borderRadius.lg,
      android: borderRadius.sm,
      default: borderRadius.md,
    }),
  },
  
  // Input styles
  input: {
    height: platformSelect({
      ios: 44,
      android: 56, // Material Design text field height
      default: 48,
    }),
    borderRadius: platformSelect({
      ios: borderRadius.lg,
      android: borderRadius.sm,
      default: borderRadius.md,
    }),
  },
  
  // Card styles
  card: {
    borderRadius: platformSelect({
      ios: borderRadius.xl,
      android: borderRadius.lg,
      default: borderRadius.lg,
    }),
    padding: platformSelect({
      ios: spacing.lg,
      android: spacing.md,
      default: spacing.md,
    }),
  },
};