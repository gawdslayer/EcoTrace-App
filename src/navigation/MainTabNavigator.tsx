import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import { colors, shadows } from '../utils/theme';
import { platformSelect } from '../utils/platform';

import DashboardScreen from '../screens/main/DashboardScreen';
import HabitsScreen from '../screens/main/HabitsScreen';
import ChallengesScreen from '../screens/main/ChallengesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Habits') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Challenges') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: platformSelect({
            ios: 'transparent',
            android: colors.gray200,
            default: colors.gray200,
          }),
          borderTopWidth: platformSelect({
            ios: 0,
            android: 0.5,
            default: 0.5,
          }),
          paddingBottom: Math.max(insets.bottom, platformSelect({
            ios: 8,
            android: 12,
            default: 8,
          })),
          paddingTop: platformSelect({
            ios: 8,
            android: 12,
            default: 8,
          }),
          height: platformSelect({
            ios: 65 + Math.max(insets.bottom, 0),
            android: 70 + Math.max(insets.bottom, 0),
            default: 65 + Math.max(insets.bottom, 0),
          }),
          ...shadows.lg, // Use platform-specific shadow
          borderTopLeftRadius: platformSelect({
            ios: 20,
            android: 0,
            default: 20,
          }),
          borderTopRightRadius: platformSelect({
            ios: 20,
            android: 0,
            default: 20,
          }),
        },
        tabBarLabelStyle: {
          fontSize: platformSelect({
            ios: 11,
            android: 12,
            default: 12,
          }),
          fontWeight: platformSelect({
            ios: '500',
            android: '600',
            default: '600',
          }),
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: colors.primary,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      >
        {({ navigation }) => (
          <ProtectedRoute>
            <DashboardScreen navigation={navigation} />
          </ProtectedRoute>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Habits"
        options={{
          title: 'Eco Habits',
          tabBarLabel: 'Habits',
        }}
      >
        {() => (
          <ProtectedRoute>
            <HabitsScreen />
          </ProtectedRoute>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Challenges"
        options={{
          title: 'Community Challenges',
          tabBarLabel: 'Challenges',
        }}
      >
        {({ navigation, route }) => (
          <ProtectedRoute>
            <ChallengesScreen navigation={navigation} route={route} />
          </ProtectedRoute>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          title: 'Your Profile',
          tabBarLabel: 'Profile',
        }}
      >
        {({ navigation, route }) => (
          <ProtectedRoute>
            <ProfileScreen navigation={navigation} route={route} />
          </ProtectedRoute>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}