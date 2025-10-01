import { Platform, Dimensions } from 'react-native';

// Platform detection utilities
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

// Screen dimensions
const { width, height } = Dimensions.get('window');
export const screenWidth = width;
export const screenHeight = height;

// Device size categories
export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 414;
export const isLargeDevice = width >= 414;

// Platform-specific values
export const platformSelect = <T>(values: {
  ios?: T;
  android?: T;
  default: T;
}): T => {
  if (isIOS && values.ios !== undefined) return values.ios;
  if (isAndroid && values.android !== undefined) return values.android;
  return values.default;
};

// Safe area adjustments
export const getStatusBarHeight = (): number => {
  return platformSelect({
    ios: 44, // iOS status bar height
    android: 24, // Android status bar height
    default: 0,
  });
};

// Navigation bar height (bottom safe area)
export const getNavigationBarHeight = (): number => {
  return platformSelect({
    ios: 34, // iOS home indicator height
    android: 0, // Android navigation handled by system
    default: 0,
  });
};

// Platform-specific styling helpers
export const platformShadow = (elevation: number = 4) => {
  return platformSelect({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: elevation / 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: elevation,
    },
    android: {
      elevation,
    },
    default: {},
  });
};

// Haptic feedback patterns
export const hapticPatterns = {
  light: platformSelect({
    ios: 'impactLight' as const,
    android: 'impactLight' as const,
    default: 'impactLight' as const,
  }),
  medium: platformSelect({
    ios: 'impactMedium' as const,
    android: 'impactMedium' as const,
    default: 'impactMedium' as const,
  }),
  heavy: platformSelect({
    ios: 'impactHeavy' as const,
    android: 'impactHeavy' as const,
    default: 'impactHeavy' as const,
  }),
  success: platformSelect({
    ios: 'notificationSuccess' as const,
    android: 'notificationSuccess' as const,
    default: 'notificationSuccess' as const,
  }),
  error: platformSelect({
    ios: 'notificationError' as const,
    android: 'notificationError' as const,
    default: 'notificationError' as const,
  }),
};