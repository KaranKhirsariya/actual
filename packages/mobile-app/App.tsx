// Polyfill for crypto.getRandomValues - MUST be first import
import 'react-native-get-random-values';

import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { BudgetListScreen } from './src/screens/BudgetListScreen';
import * as platform from './src/platform';
import * as backend from './src/backend';

type InitState = 'loading' | 'no-budget' | 'ready' | 'error';

export default function App() {
  const [initState, setInitState] = useState<InitState>('loading');
  const [error, setError] = useState<string | null>(null);

  const checkBudgetLoaded = useCallback(async () => {
    try {
      // Try to get budgets to check if we have any
      const budgets = await backend.getBudgets() as { id: string }[];

      if (budgets.length === 0) {
        // No budgets exist, show create screen
        setInitState('no-budget');
        return;
      }

      // Try to load the first budget automatically
      // In the future, we could remember the last loaded budget
      const result = await backend.loadBudget(budgets[0].id);
      if (result && typeof result === 'object' && 'error' in result) {
        // Failed to load, show budget list
        setInitState('no-budget');
      } else {
        setInitState('ready');
      }
    } catch (err) {
      console.log('[App] No budget loaded, showing budget list');
      setInitState('no-budget');
    }
  }, []);

  useEffect(() => {
    async function initialize() {
      try {
        console.log('[App] Starting initialization...');

        // Initialize platform modules
        console.log('[App] Initializing platform modules...');
        platform.asyncStorage.init();
        platform.fs.init();
        await platform.sqlite.init();

        // Copy bundled assets (default-db.sqlite) to document directory
        // This must happen BEFORE loot-core init so it can find the template
        console.log('[App] Setting up bundled assets...');
        await platform.setupBundledAssets();

        // Initialize backend with loot-core
        console.log('[App] Initializing backend...');
        await backend.init();

        console.log('[App] Checking for loaded budget...');
        await checkBudgetLoaded();

        console.log('[App] Initialization complete');
      } catch (err) {
        console.error('[App] Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setInitState('error');
      }
    }

    initialize();
  }, [checkBudgetLoaded]);

  const handleBudgetLoaded = useCallback(() => {
    setInitState('ready');
  }, []);

  if (initState === 'error') {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Initialization Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.errorHint}>
            Try restarting the app. If the problem persists, please check your connection.
          </Text>
        </View>
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  if (initState === 'loading') {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.logo}>💰</Text>
          <Text style={styles.appName}>Actual Budget</Text>
          <ActivityIndicator size="large" color="#4A90A4" style={styles.spinner} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  if (initState === 'no-budget') {
    return (
      <SafeAreaProvider>
        <BudgetListScreen onBudgetLoaded={handleBudgetLoaded} />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 32,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  errorHint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
