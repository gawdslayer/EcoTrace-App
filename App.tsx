import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppDataProvider } from './src/contexts/AppDataContext';
import { ErrorProvider } from './src/contexts/ErrorContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';
import { platformSelect } from './src/utils/platform';

export default function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AuthProvider>
          <AppDataProvider>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar 
                style={platformSelect({
                  ios: 'dark',
                  android: 'dark',
                  default: 'auto',
                })}
                backgroundColor={platformSelect({
                  ios: 'transparent',
                  android: '#f0fdf4', // Match our background color
                  default: 'transparent',
                })}
              />
            </NavigationContainer>
          </AppDataProvider>
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}
