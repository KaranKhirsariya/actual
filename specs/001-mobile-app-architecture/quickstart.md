# Phase 1 Quickstart: Mobile App Setup Guide

**Feature**: Mobile App Architecture with Maximum Code Reuse  
**Branch**: `001-mobile-app-architecture`  
**Date**: 2025-11-01

## Overview

This guide walks you through setting up the mobile app package in the Actual Budget monorepo, from zero to first screen using reused Redux slices.

**Time to Complete**: ~2-3 hours  
**Prerequisites**: Node.js 18+, Yarn 3.2.0+, Xcode (iOS), Android Studio (Android)

---

## Step 1: Prerequisites

### Install Required Tools

```bash
# Verify Node.js version (need 18+)
node --version

# Verify Yarn version (need 3.2.0+)
yarn --version

# Install Expo CLI globally
npm install -g eas-cli

# Install iOS dependencies (macOS only)
# Install Xcode from App Store, then:
xcode-select --install

# Install Android dependencies
# Install Android Studio from https://developer.android.com/studio
# Set up Android SDK (API 24+)
```

### Clone Repository

```bash
# If not already cloned
git clone https://github.com/actualbudget/actual.git
cd actual

# Install dependencies for entire monorepo
yarn install
```

---

## Step 2: Create Mobile App Package

### Initialize Expo App

```bash
# Navigate to packages directory
cd packages

# Create new Expo app with TypeScript template
npx create-expo-app mobile-app --template blank-typescript

# Navigate into new package
cd mobile-app
```

### Update package.json

```json
{
  "name": "@actual-app/mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "expo": "~54.0.0",
    "react": "19.0.0",
    "react-native": "0.77.8",
    "expo-router": "~4.0.0",
    
    "@reduxjs/toolkit": "^2.9.1",
    "react-redux": "^9.2.0",
    "loot-core": "workspace:*",
    "@actual-app/crdt": "workspace:*",
    "desktop-client": "workspace:*",
    
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/native-stack": "^7.0.0",
    "@react-navigation/bottom-tabs": "^7.0.0",
    "react-native-screens": "~4.0.0",
    "react-native-safe-area-context": "4.11.1",
    
    "tamagui": "^1.0.0",
    "@tamagui/config": "^1.0.0",
    
    "react-native-quick-sqlite": "^8.0.0",
    "expo-file-system": "~18.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-local-authentication": "~15.0.0",
    "expo-haptics": "~14.0.0",
    
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "@shopify/flash-list": "^1.7.0",
    
    "date-fns": "^4.1.0",
    "uuid": "^13.0.0",
    "react-hook-form": "^7.53.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~19.2.2",
    "@types/uuid": "^10.0.0",
    "typescript": "^5.9.3",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.7.0"
  }
}
```

### Install Dependencies

```bash
# Install all packages
yarn install

# Install Expo modules
npx expo install expo-sqlite expo-file-system expo-secure-store
npx expo install expo-local-authentication expo-haptics
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install react-native-screens react-native-safe-area-context
```

---

## Step 3: Configure Metro for Workspace Resolution

### Create metro.config.js

```javascript
// packages/mobile-app/metro.config.js

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch entire monorepo
config.watchFolders = [workspaceRoot];

// Resolve from both local and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Alias workspace packages
config.resolver.extraNodeModules = {
  'loot-core': path.resolve(workspaceRoot, 'packages/loot-core'),
  '@actual-app/crdt': path.resolve(workspaceRoot, 'packages/crdt'),
  'desktop-client': path.resolve(workspaceRoot, 'packages/desktop-client'),
  '@actual-app/components': path.resolve(workspaceRoot, 'packages/component-library'),
};

// Handle additional extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
```

### Update tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "lib": ["ES2020"],
    "jsx": "react-native",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "paths": {
      "loot-core/*": ["../loot-core/src/*"],
      "@actual-app/crdt": ["../crdt/src"],
      "desktop-client/*": ["../desktop-client/src/*"],
      "@actual-app/components/*": ["../component-library/src/*"],
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"],
  "exclude": ["node_modules"]
}
```

---

## Step 4: Setup Redux Store with Desktop-Client Slices

### Create Store Configuration

```typescript
// packages/mobile-app/src/store/index.ts

import { configureStore } from '@reduxjs/toolkit';

// Import all Redux slices from desktop-client (REUSED)
import accountsSlice from 'desktop-client/src/accounts/accountsSlice';
import appSlice from 'desktop-client/src/app/appSlice';
import budgetSlice from 'desktop-client/src/budget/budgetSlice';
import budgetfilesSlice from 'desktop-client/src/budgetfiles/budgetfilesSlice';
import modalsSlice from 'desktop-client/src/modals/modalsSlice';
import notificationsSlice from 'desktop-client/src/notifications/notificationsSlice';
import payeesSlice from 'desktop-client/src/payees/payeesSlice';
import prefsSlice from 'desktop-client/src/prefs/prefsSlice';
import transactionsSlice from 'desktop-client/src/transactions/transactionsSlice';
import tagsSlice from 'desktop-client/src/tags/tagsSlice';
import usersSlice from 'desktop-client/src/users/usersSlice';

export const store = configureStore({
  reducer: {
    accounts: accountsSlice.reducer,
    app: appSlice.reducer,
    budget: budgetSlice.reducer,
    budgetfiles: budgetfilesSlice.reducer,
    modals: modalsSlice.reducer,
    notifications: notificationsSlice.reducer,
    payees: payeesSlice.reducer,
    prefs: prefsSlice.reducer,
    transactions: transactionsSlice.reducer,
    tags: tagsSlice.reducer,
    users: usersSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Create Typed Hooks

```typescript
// packages/mobile-app/src/store/hooks.ts

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## Step 5: Implement Platform Adapters

### SQLite Adapter

```typescript
// packages/mobile-app/src/platform/sqlite-adapter.ts

import { open, QuickSQLiteConnection } from 'react-native-quick-sqlite';

export type Database = QuickSQLiteConnection;

export async function init(): Promise<void> {
  // No initialization needed for react-native-quick-sqlite
}

export function openDatabase(name: string = 'actual.db'): Database {
  return open({ name });
}

export function closeDatabase(db: Database): void {
  db.close();
}

export function runQuery(
  db: Database,
  sql: string,
  params: (string | number)[] = [],
  fetchAll: boolean = false
): any {
  const result = db.execute(sql, params);
  return fetchAll ? (result.rows?._array || []) : { changes: result.rowsAffected };
}

export function execQuery(db: Database, sql: string): void {
  db.execute(sql);
}

export function transaction(db: Database, fn: () => void): void {
  db.transaction(() => {
    fn();
    return true;
  });
}

export async function asyncTransaction(db: Database, fn: () => Promise<void>): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(async () => {
      try {
        await fn();
        resolve();
        return true;
      } catch (error) {
        reject(error);
        return false;
      }
    });
  });
}
```

### FileSystem Adapter

```typescript
// packages/mobile-app/src/platform/filesystem-adapter.ts

import * as FileSystem from 'expo-file-system';

let dataDir: string;
let documentDir: string;

export function init(): void {
  documentDir = FileSystem.documentDirectory || '';
  dataDir = `${documentDir}actual-data/`;
  FileSystem.makeDirectoryAsync(dataDir, { intermediates: true }).catch(() => {});
}

export function getDataDir(): string {
  return dataDir;
}

export function getDocumentDir(): string {
  return documentDir;
}

export async function readFile(filepath: string, encoding: 'utf8' | 'binary' = 'utf8'): Promise<string | Buffer> {
  if (encoding === 'binary') {
    const base64 = await FileSystem.readAsStringAsync(filepath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return Buffer.from(base64, 'base64');
  }
  return await FileSystem.readAsStringAsync(filepath);
}

export async function writeFile(filepath: string, contents: string | ArrayBuffer): Promise<void> {
  if (typeof contents === 'string') {
    await FileSystem.writeAsStringAsync(filepath, contents);
  } else {
    const buffer = Buffer.from(contents);
    await FileSystem.writeAsStringAsync(filepath, buffer.toString('base64'), {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
}

export async function exists(filepath: string): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(filepath);
  return info.exists;
}
```

---

## Step 6: Create First Screen with Reused Redux

### Accounts Screen

```typescript
// packages/mobile-app/src/screens/AccountsScreen.tsx

import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useAppSelector } from '../store/hooks';
import type { AccountEntity } from 'loot-core/types/models';

export function AccountsScreen() {
  const accounts = useAppSelector((state) => state.accounts.accounts as AccountEntity[]);

  const renderAccount = ({ item }: { item: AccountEntity }) => (
    <View style={styles.accountRow}>
      <Text style={styles.accountName}>{item.name}</Text>
      <Text style={styles.accountType}>{item.type}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accounts</Text>
      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  accountRow: { padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
  accountName: { fontSize: 18 },
  accountType: { fontSize: 14, color: '#666' },
});
```

### App Entry Point

```typescript
// packages/mobile-app/App.tsx

import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { store } from './src/store';
import { AccountsScreen } from './src/screens/AccountsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Accounts" component={AccountsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
```

---

## Step 7: Run the App

### Start Development Server

```bash
cd packages/mobile-app

# Start Expo dev server
yarn start

# In another terminal, run on iOS
yarn ios

# Or run on Android
yarn android
```

### Verify Redux Integration

```bash
# Add test to verify Redux works
# packages/mobile-app/__tests__/redux-integration.test.ts

import { store } from '../src/store';
import { setAccounts } from 'desktop-client/src/accounts/accountsSlice';

test('Redux slice from desktop-client works', () => {
  store.dispatch(setAccounts([
    { id: '1', name: 'Test Account', type: 'checking', offbudget: false, closed: false },
  ]));
  
  const state = store.getState();
  expect(state.accounts.accounts).toHaveLength(1);
});
```

---

## Troubleshooting

### Metro Can't Resolve Workspace Packages

**Problem**: `Unable to resolve module loot-core`

**Solution**:
```bash
# Clear Metro cache
yarn start --clear

# Verify metro.config.js has correct paths
# Ensure workspaceRoot points to monorepo root
```

### TypeScript Errors on Imports

**Problem**: `Cannot find module 'desktop-client/src/accounts/accountsSlice'`

**Solution**:
```bash
# Verify tsconfig.json has correct paths
# Restart TypeScript server in IDE
```

### SQLite Not Working

**Problem**: `react-native-quick-sqlite not found`

**Solution**:
```bash
# Rebuild native modules
cd ios && pod install && cd ..
npx expo run:ios

# For Android
npx expo run:android
```

---

## Next Steps

1. ✅ App runs with Redux from desktop-client
2. ✅ Platform adapters skeleton created
3. **Next**: Implement remaining platform adapters (see contracts/)
4. **Next**: Add more screens (Transactions, Budget, Reports)
5. **Next**: Integrate SQLite database
6. **Next**: Add CRDT sync

---

**Quickstart Version**: 1.0  
**Created**: 2025-11-01  
**Status**: ✅ Ready to Use
