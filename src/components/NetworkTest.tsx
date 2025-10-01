import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Button from './Button';
import { colors, spacing, fontSize } from '../utils/theme';

export default function NetworkTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const testConnections = async () => {
    setTesting(true);
    setResults([]);
    
    const testUrls = [
      'http://192.168.0.88:3001/api/habits',
      'http://localhost:3001/api/habits',
      'http://10.0.2.2:3001/api/habits', // Android emulator
    ];

    const newResults: string[] = [];

    for (const url of testUrls) {
      try {
        console.log('Testing:', url);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, { 
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          newResults.push(`✅ ${url} - SUCCESS`);
        } else {
          newResults.push(`❌ ${url} - HTTP ${response.status}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        newResults.push(`❌ ${url} - ${errorMessage}`);
      }
    }

    setResults(newResults);
    setTesting(false);
  };

  const testLogin = async () => {
    try {
      const response = await fetch('http://192.168.0.88:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'eco@example.com',
          password: 'password123'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Login Test Success', `Logged in as: ${data.user.username}`);
      } else {
        Alert.alert('Login Test Failed', `HTTP ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Login Test Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Connection Test</Text>
      
      <Button
        title={testing ? "Testing..." : "Test Server Connection"}
        onPress={testConnections}
        disabled={testing}
        style={styles.button}
      />

      <Button
        title="Test Login Endpoint"
        onPress={testLogin}
        style={styles.button}
      />

      {results.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {results.map((result, index) => (
            <Text key={index} style={styles.result}>
              {result}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    marginBottom: spacing.md,
  },
  results: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: 8,
  },
  resultsTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  result: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
});