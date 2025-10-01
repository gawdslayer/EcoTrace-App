import { Animated, Easing } from 'react-native';
import { platformSelect } from './platform';

// Platform-specific animation configurations
export const animationConfig = {
  // Timing configurations
  timing: {
    fast: platformSelect({
      ios: 200,
      android: 250,
      default: 225,
    }),
    normal: platformSelect({
      ios: 300,
      android: 350,
      default: 325,
    }),
    slow: platformSelect({
      ios: 500,
      android: 600,
      default: 550,
    }),
  },
  
  // Easing configurations
  easing: {
    // iOS prefers ease-out, Android prefers ease-in-out
    default: platformSelect({
      ios: Easing.out(Easing.cubic),
      android: Easing.inOut(Easing.cubic),
      default: Easing.inOut(Easing.cubic),
    }),
    bounce: platformSelect({
      ios: Easing.bounce,
      android: Easing.elastic(1.3),
      default: Easing.bounce,
    }),
    spring: platformSelect({
      ios: Easing.out(Easing.back(1.7)),
      android: Easing.out(Easing.back(1.2)),
      default: Easing.out(Easing.back(1.5)),
    }),
  },
};

// Common animation presets
export const fadeIn = (
  animatedValue: Animated.Value,
  duration: number = animationConfig.timing.normal
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: animationConfig.easing.default,
    useNativeDriver: true,
  });
};

export const fadeOut = (
  animatedValue: Animated.Value,
  duration: number = animationConfig.timing.normal
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: animationConfig.easing.default,
    useNativeDriver: true,
  });
};

export const slideInFromBottom = (
  animatedValue: Animated.Value,
  duration: number = animationConfig.timing.normal
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: animationConfig.easing.spring,
    useNativeDriver: true,
  });
};

export const slideOutToBottom = (
  animatedValue: Animated.Value,
  duration: number = animationConfig.timing.normal
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 100,
    duration,
    easing: animationConfig.easing.default,
    useNativeDriver: true,
  });
};

export const scaleIn = (
  animatedValue: Animated.Value,
  duration: number = animationConfig.timing.fast
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: animationConfig.easing.spring,
    useNativeDriver: true,
  });
};

export const scaleOut = (
  animatedValue: Animated.Value,
  duration: number = animationConfig.timing.fast
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: animationConfig.easing.default,
    useNativeDriver: true,
  });
};

// Platform-specific spring animation
export const createSpringAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  config?: Partial<Animated.SpringAnimationConfig>
): Animated.CompositeAnimation => {
  const defaultConfig = platformSelect({
    ios: {
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    },
    android: {
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    },
    default: {
      tension: 90,
      friction: 9,
      useNativeDriver: true,
    },
  });

  return Animated.spring(animatedValue, {
    toValue,
    ...defaultConfig,
    ...config,
  });
};