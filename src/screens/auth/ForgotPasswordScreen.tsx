import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthScreenProps } from '../../types/navigation';

export default function ForgotPasswordScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email to reset your password</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#15803d',
    textAlign: 'center',
  },
});