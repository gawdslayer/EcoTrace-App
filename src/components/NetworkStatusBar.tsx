import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { colors, spacing, fontSize, fontWeight } from '../utils/theme';

export default function NetworkStatusBar() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [slideAnim] = useState(new Animated.Value(-50));
  const [wasOffline, setWasOffline] = useState(false);

  const isOnline = isConnected && isInternetReachable;

  useEffect(() => {
    if (!isOnline) {
      // Show offline indicator
      setWasOffline(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else if (wasOffline) {
      // Show "back online" message briefly
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Hide after 2 seconds
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setWasOffline(false);
        });
      }, 2000);
    } else {
      // Hide immediately if we were never offline
      slideAnim.setValue(-50);
    }
  }, [isOnline, wasOffline]);

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        backgroundColor: colors.error,
        icon: 'cloud-offline' as const,
        message: 'No internet connection',
        textColor: colors.white,
      };
    } else if (wasOffline) {
      return {
        backgroundColor: colors.success,
        icon: 'cloud-done' as const,
        message: 'Back online',
        textColor: colors.white,
      };
    }
    return null;
  };

  const statusConfig = getStatusConfig();

  if (!statusConfig) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: statusConfig.backgroundColor,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons 
          name={statusConfig.icon} 
          size={16} 
          color={statusConfig.textColor}
          style={styles.icon}
        />
        <Text style={[styles.message, { color: statusConfig.textColor }]}>
          {statusConfig.message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingTop: 45, // Account for status bar
    paddingBottom: spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  icon: {
    marginRight: spacing.xs,
  },
  message: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});