// Navigation type definitions for the app
import { NavigationProp, RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Habits: undefined;
  Challenges: undefined;
  Profile: undefined;
};

// Navigation prop types for screens
export type AuthScreenNavigationProp = NavigationProp<AuthStackParamList>;
export type MainScreenNavigationProp = NavigationProp<MainTabParamList>;
export type RootNavigationProp = NavigationProp<RootStackParamList>;

// Screen prop interfaces
export interface AuthScreenProps {
  navigation: AuthScreenNavigationProp;
  route: RouteProp<AuthStackParamList>;
}

export interface MainScreenProps {
  navigation: MainScreenNavigationProp;
  route: RouteProp<MainTabParamList>;
}

// Specific screen prop types
export interface DashboardScreenProps {
  navigation: MainScreenNavigationProp;
  route: RouteProp<MainTabParamList, 'Dashboard'>;
}

export interface HabitsScreenProps {
  navigation: MainScreenNavigationProp;
  route: RouteProp<MainTabParamList, 'Habits'>;
}

export interface ChallengesScreenProps {
  navigation: MainScreenNavigationProp;
  route: RouteProp<MainTabParamList, 'Challenges'>;
}

export interface ProfileScreenProps {
  navigation: MainScreenNavigationProp;
  route: RouteProp<MainTabParamList, 'Profile'>;
}