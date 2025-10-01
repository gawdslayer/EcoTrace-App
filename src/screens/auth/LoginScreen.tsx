import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { AuthScreenProps } from '../../types/navigation';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenContainer from '../../components/ScreenContainer';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, fontSize, fontWeight } from '../../utils/theme';
import { logError } from '../../utils/errorHandling';

export default function LoginScreen({ navigation }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { login, loading, error, clearError } = useAuth();

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    clearError();
    
    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }
    
    // Password validation
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login(email.trim(), password);
      // Navigation will happen automatically via AuthContext
    } catch (error) {
      // Error is handled by AuthContext and displayed via error state
      logError(error, 'LoginScreen.handleLogin');
    }
  };

  const handleTestLogin = async () => {
    try {
      // Use test credentials that exist in your backend
      await login('eco@example.com', 'password123');
    } catch {
      Alert.alert('Test Login Failed', 'Make sure your backend server is running on localhost:3001');
    }
  };

  return (
    <ScreenContainer keyboardAvoiding={true}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
        <Text style={styles.title}>🌱 EcoTrace Login</Text>
        <Text style={styles.subtitle}>Sign in to track your environmental impact</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={emailError}
          editable={!loading}
        />
        
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          error={passwordError}
          editable={!loading}
        />
        
        <Button
          title={loading ? "Signing In..." : "Sign In"}
          onPress={handleLogin}
          style={styles.button}
          disabled={loading}
        />
        
        <Button
          title="Create Account"
          onPress={() => navigation.navigate('Signup')}
          variant="outline"
          style={styles.button}
          disabled={loading}
        />
        
        <Button
          title="Forgot Password?"
          onPress={() => navigation.navigate('ForgotPassword')}
          variant="secondary"
          style={styles.button}
          disabled={loading}
        />
        
        <View style={styles.divider} />
        
        <Button
          title="Test Login (Demo)"
          onPress={handleTestLogin}
          variant="secondary"
          style={styles.button}
          disabled={loading}
        />
        
        {loading && <LoadingSpinner text="Signing you in..." />}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  button: {
    marginVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.lg,
  },
});