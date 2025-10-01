// Component prop type definitions
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import type { MainTabParamList, AuthStackParamList } from './navigation';

// Common style types
export type StyleProp = ViewStyle | TextStyle | ImageStyle;

// Navigation prop types for screens
export interface MainScreenProps {
  navigation: NavigationProp<MainTabParamList>;
  route: RouteProp<MainTabParamList>;
}

export interface AuthScreenProps {
  navigation: NavigationProp<AuthStackParamList>;
  route: RouteProp<AuthStackParamList>;
}

// Common component props
export interface BaseComponentProps {
  style?: ViewStyle;
  testID?: string;
}

// FlatList render item types
export interface RenderItemProps<T> {
  item: T;
  index: number;
}