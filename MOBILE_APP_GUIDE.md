# Actual Budget - Mobile App Development Guide

**Tech Stack:** React Native + Expo (Option 1)
**Target Platforms:** iOS & Android
**Estimated Timeline:** 3-4 months for MVP
**Code Reuse:** 70-80% from existing codebase

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Setup](#project-setup)
5. [Implementation Phases](#implementation-phases)
6. [Code Integration Strategy](#code-integration-strategy)
7. [UI/UX Guidelines](#uiux-guidelines)
8. [Key Implementation Details](#key-implementation-details)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## Overview

### Why React Native + Expo?

- **Maximum Code Reuse**: Reuse 70-80% of business logic from `loot-core`
- **Fast Development**: Expo provides excellent developer experience
- **Modern UI**: Access to latest React Native features and UI libraries
- **Team Efficiency**: Existing React knowledge transfers directly
- **OTA Updates**: Push updates without app store approval
- **Cross-Platform**: Single codebase for iOS and Android

### What We're Building

A native mobile app for Actual Budget that:
- Provides full budget management on mobile devices
- Maintains offline-first architecture
- Syncs seamlessly with existing web/desktop apps
- Delivers modern, native mobile experience
- Reuses core business logic from loot-core

---

## Architecture

### Monorepo Structure

```
/actual
├── packages/
│   ├── loot-core/              # ✅ Business logic (REUSE)
│   ├── crdt/                   # ✅ Sync logic (REUSE)
│   ├── component-library/      # ⚠️ Partial reuse
│   ├── desktop-client/         # Web UI
│   ├── mobile-app/             # 🆕 NEW - React Native app
│   │   ├── src/
│   │   │   ├── components/        # Mobile UI components
│   │   │   ├── screens/           # Screen components
│   │   │   ├── navigation/        # Navigation config
│   │   │   ├── hooks/             # Custom hooks
│   │   │   ├── store/             # Redux store setup
│   │   │   ├── platform/          # Platform-specific adapters
│   │   │   ├── theme/             # Theming and styles
│   │   │   ├── utils/             # Utilities
│   │   │   └── types/             # TypeScript types
│   │   ├── app/                   # Expo Router (optional)
│   │   ├── assets/                # Images, fonts, etc.
│   │   ├── app.json               # Expo configuration
│   │   ├── babel.config.js
│   │   ├── metro.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
```

### Layered Architecture

```
┌─────────────────────────────────────┐
│   Mobile UI Layer (React Native)   │  ← NEW
│   - Screens, Components, Navigation │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Presentation Layer (Redux)        │  ← REUSE
│   - Redux slices from loot-core    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Business Logic (loot-core)        │  ← REUSE
│   - Queries, Calculations, Rules   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Data Layer                         │  ← ADAPT
│   - SQLite (expo-sqlite)            │
│   - CRDT Sync                       │
└─────────────────────────────────────┘
```

---

## Technology Stack

### Core Dependencies

```json
{
  "dependencies": {
    // Expo & React Native
    "expo": "~54.0.0",
    "react-native": "0.77.x",
    "expo-router": "~4.x",

    // State Management (REUSE from loot-core)
    "@reduxjs/toolkit": "^2.9.1",
    "react-redux": "^9.2.0",
    "loot-core": "workspace:*",
    "@actual-app/crdt": "workspace:*",

    // Navigation
    "@react-navigation/native": "^7.x",
    "@react-navigation/native-stack": "^7.x",
    "@react-navigation/bottom-tabs": "^7.x",
    "react-native-screens": "~4.x",
    "react-native-safe-area-context": "4.x",

    // UI Framework (Choose one)
    "tamagui": "^1.x",              // Modern, performant
    // OR
    "react-native-paper": "^5.x",   // Material Design

    // Database
    "expo-sqlite": "~15.x",
    // OR
    "react-native-quick-sqlite": "^8.x",  // Better performance

    // Animations & Gestures
    "react-native-reanimated": "~3.16.x",
    "react-native-gesture-handler": "~2.20.x",
    "react-native-swipe-list-view": "^3.x",

    // Utilities
    "date-fns": "^4.1.0",           // Date handling (REUSE)
    "uuid": "^13.0.0",              // (REUSE)
    "memoize-one": "^6.0.0",        // (REUSE)

    // Features
    "expo-secure-store": "~14.x",   // Secure storage
    "expo-local-authentication": "~15.x",  // Biometrics
    "expo-haptics": "~14.x",        // Haptic feedback
    "expo-notifications": "~0.29.x", // Push notifications
    "expo-file-system": "~18.x",    // File operations

    // Networking
    "axios": "^1.x",                // HTTP client

    // Forms
    "react-hook-form": "^7.x",

    // i18n
    "react-i18next": "^16.0.0",
    "i18next": "^25.6.0",

    // Charts (optional)
    "react-native-chart-kit": "^6.x",
    // OR
    "victory-native": "^37.x"
  },

  "devDependencies": {
    "@babel/core": "^7.x",
    "@types/react": "~19.2.2",
    "typescript": "^5.9.3",
    "jest": "^29.x",
    "@testing-library/react-native": "^12.x",
    "detox": "^20.x",
    "metro-react-native-babel-preset": "^0.77.x"
  }
}
```

### Recommended UI Library: Tamagui

**Why Tamagui?**
- 🚀 Extremely performant (compiles to native styles)
- 🎨 Beautiful default components
- 🌓 Built-in dark mode support
- 📱 Responsive design system
- 🔧 Fully typed with TypeScript
- 🎭 Animation support via Reanimated

---

## Project Setup

### Step 1: Create Expo App

```bash
# Navigate to packages directory
cd packages

# Create new Expo app with TypeScript template
npx create-expo-app mobile-app --template blank-typescript

cd mobile-app
```

### Step 2: Install Dependencies

```bash
# Install Expo modules
npx expo install expo-sqlite expo-router expo-secure-store
npx expo install expo-local-authentication expo-haptics
npx expo install expo-notifications expo-file-system
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install react-native-screens react-native-safe-area-context

# Install navigation
npm install @react-navigation/native @react-navigation/native-stack
npm install @react-navigation/bottom-tabs @react-navigation/drawer

# Install UI framework (Tamagui recommended)
npm install tamagui @tamagui/config

# Install state management & business logic
npm install @reduxjs/toolkit react-redux
npm install loot-core@workspace:*
npm install @actual-app/crdt@workspace:*

# Install utilities
npm install react-hook-form date-fns uuid memoize-one

# Install dev dependencies
npm install -D @types/react @types/react-native
npm install -D jest @testing-library/react-native
```

### Step 3: Configure app.json

```json
{
  "expo": {
    "name": "Actual Budget",
    "slug": "actual-budget",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.actualbudget.app",
      "infoPlist": {
        "NSFaceIDUsageDescription": "Use Face ID to unlock Actual Budget"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.actualbudget.app",
      "permissions": [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-local-authentication",
      [
        "expo-build-properties",
        {
          "android": {
            "kotlinVersion": "1.9.0"
          }
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

### Step 4: Configure babel.config.js

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for React Native Reanimated
      'react-native-reanimated/plugin',

      // Tamagui (if using)
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts',
        },
      ],
    ],
  };
};
```

### Step 5: Configure metro.config.js

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Support for monorepo
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Resolve workspace packages
config.resolver.extraNodeModules = {
  'loot-core': path.resolve(workspaceRoot, 'packages/loot-core'),
  '@actual-app/crdt': path.resolve(workspaceRoot, 'packages/crdt'),
};

module.exports = config;
```

### Step 6: Configure tsconfig.json

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
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### Step 7: Update Root package.json

Add mobile app to workspace scripts:

```json
{
  "scripts": {
    "start:mobile": "yarn workspace @actual-app/mobile start",
    "build:mobile:ios": "yarn workspace @actual-app/mobile build:ios",
    "build:mobile:android": "yarn workspace @actual-app/mobile build:android"
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Set up project structure and core integrations

#### Tasks:
1. ✅ Create Expo project
2. ✅ Configure monorepo integration
3. ✅ Set up TypeScript
4. ✅ Create folder structure
5. ✅ Set up Redux store with loot-core slices
6. ✅ Create SQLite adapter
7. ✅ Implement platform-specific modules
8. ✅ Set up navigation structure
9. ✅ Create theme configuration

#### Deliverables:
- Working app shell
- Redux store connected to loot-core
- SQLite database operational
- Basic navigation working

---

### Phase 2: Core Features (Week 3-6)

**Goal:** Implement main budget management features

#### Tasks:
1. **Accounts Module**
   - Account list screen
   - Account detail/transaction view
   - Add/Edit account
   - Account reconciliation

2. **Transactions Module**
   - Transaction list (with virtual scrolling)
   - Add/Edit transaction
   - Split transactions
   - Search and filters
   - Swipe actions (delete, categorize)

3. **Budget Module**
   - Budget overview
   - Category groups
   - Category detail
   - Budget allocation
   - Monthly navigation

4. **Payees Module**
   - Payee list
   - Payee management
   - Rules integration

#### Deliverables:
- Core budget functionality working
- CRUD operations for all entities
- UI matches mobile design guidelines

---

### Phase 3: Advanced Features (Week 7-10)

**Goal:** Add advanced features and polish

#### Tasks:
1. **Sync Integration**
   - Server connection setup
   - CRDT sync implementation
   - Conflict resolution UI
   - Offline queue management

2. **Reports & Insights**
   - Spending reports
   - Net worth charts
   - Category trends
   - Custom date ranges

3. **Import/Export**
   - Bank file import (OFX, QFX, etc.)
   - CSV import/export
   - File picker integration

4. **Rules Engine**
   - Rule list
   - Create/Edit rules
   - Rule testing
   - Auto-categorization

5. **Scheduled Transactions**
   - Schedule list
   - Create/Edit schedules
   - Upcoming transactions
   - Post scheduled transactions

#### Deliverables:
- All major features implemented
- Reports with charts
- Import/export working
- Rules engine functional

---

### Phase 4: Polish & Optimization (Week 11-14)

**Goal:** Polish UI, optimize performance, prepare for release

#### Tasks:
1. **UI/UX Polish**
   - Dark mode refinement
   - Animations and transitions
   - Haptic feedback
   - Loading states
   - Error handling UI
   - Empty states

2. **Performance**
   - Large transaction list optimization
   - Memory management
   - Bundle size optimization
   - Startup time optimization
   - Database query optimization

3. **Security**
   - Biometric authentication
   - Secure storage for credentials
   - App lock/timeout
   - Data encryption at rest

4. **Settings & Preferences**
   - App settings
   - Theme selection
   - Notification preferences
   - Data management

5. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests with Detox
   - Manual QA

#### Deliverables:
- Polished, production-ready app
- Comprehensive test coverage
- Performance optimized
- Security features implemented

---

### Phase 5: Beta & Launch (Week 15-16)

**Goal:** Beta testing and production release

#### Tasks:
1. Internal beta testing
2. TestFlight/Play Store beta
3. Bug fixes from beta feedback
4. App store assets (screenshots, descriptions)
5. Production build
6. App store submission
7. Launch coordination

#### Deliverables:
- App live on iOS App Store
- App live on Google Play Store
- Marketing materials ready
- Support documentation

---

## Code Integration Strategy

### Redux Store Setup

```typescript
// packages/mobile-app/src/store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices from loot-core (REUSE)
import accountsSlice from 'loot-core/client/accounts/accountsSlice';
import appSlice from 'loot-core/client/app/appSlice';
import budgetSlice from 'loot-core/client/budgets/budgetSlice';
import modalsSlice from 'loot-core/client/modals/modalsSlice';
import notificationsSlice from 'loot-core/client/notifications/notificationsSlice';
import payeesSlice from 'loot-core/client/payees/payeesSlice';
import prefsSlice from 'loot-core/client/prefs/prefsSlice';
import transactionsSlice from 'loot-core/client/transactions/transactionsSlice';

// Import shared listeners
import { createSharedListeners } from 'loot-core/client/shared-listeners';

export const store = configureStore({
  reducer: {
    accounts: accountsSlice.reducer,
    app: appSlice.reducer,
    budget: budgetSlice.reducer,
    modals: modalsSlice.reducer,
    notifications: notificationsSlice.reducer,
    payees: payeesSlice.reducer,
    prefs: prefsSlice.reducer,
    transactions: transactionsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific action types if needed
        ignoredActions: ['your/action/type'],
      },
    }).prepend(createSharedListeners().middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### SQLite Adapter

```typescript
// packages/mobile-app/src/platform/sqlite-adapter.ts

import * as SQLite from 'expo-sqlite';
// OR
// import { open } from 'react-native-quick-sqlite';

/**
 * Adapter to make mobile SQLite compatible with loot-core expectations
 */
export class MobileSQLiteAdapter {
  private db: SQLite.SQLiteDatabase | null = null;

  async openDatabase(name: string) {
    this.db = await SQLite.openDatabaseAsync(name);
    return this.db;
  }

  async execQuery(sql: string, params: any[] = []) {
    if (!this.db) throw new Error('Database not opened');

    return await this.db.runAsync(sql, params);
  }

  async selectQuery(sql: string, params: any[] = []) {
    if (!this.db) throw new Error('Database not opened');

    return await this.db.getAllAsync(sql, params);
  }

  async transaction(callback: (tx: any) => Promise<void>) {
    if (!this.db) throw new Error('Database not opened');

    await this.db.withTransactionAsync(async () => {
      await callback(this.db);
    });
  }

  async closeDatabase() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const sqliteAdapter = new MobileSQLiteAdapter();
```

### Platform-Specific Module

```typescript
// packages/mobile-app/src/platform/index.ts

import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Platform-specific implementations for mobile
 * These match the interface expected by loot-core
 */

export const platform = {
  OS: Platform.OS as 'ios' | 'android',

  // File system operations
  async readFile(path: string): Promise<string> {
    return await FileSystem.readAsStringAsync(path);
  },

  async writeFile(path: string, content: string): Promise<void> {
    await FileSystem.writeAsStringAsync(path, content);
  },

  async deleteFile(path: string): Promise<void> {
    await FileSystem.deleteAsync(path, { idempotent: true });
  },

  async ensureDir(path: string): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(path);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
    }
  },

  // Secure storage
  async getSecureItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },

  async setSecureItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async deleteSecureItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },

  // Database path
  getDatabasePath(filename: string): string {
    return `${FileSystem.documentDirectory}SQLite/${filename}`;
  },
};
```

### Reusing Queries from loot-core

```typescript
// packages/mobile-app/src/hooks/useTransactions.ts

import { useAppSelector, useAppDispatch } from '@/store';
import { useQuery } from 'loot-core/client/query-hooks';
import { q } from 'loot-core/client/queries';

export function useTransactions(accountId?: string) {
  const dispatch = useAppDispatch();

  // Reuse query logic from loot-core
  const query = accountId
    ? q('transactions')
        .filter({ account: accountId })
        .select('*')
        .orderBy({ date: 'desc' })
    : q('transactions')
        .select('*')
        .orderBy({ date: 'desc' });

  const { data, isLoading, error } = useQuery(query);

  return {
    transactions: data || [],
    isLoading,
    error,
  };
}
```

---

## UI/UX Guidelines

### Design Principles

1. **Mobile-First**: Design for thumb-friendly interactions
2. **Performance**: 60fps animations, instant feedback
3. **Offline-First**: Full functionality without internet
4. **Accessibility**: Support screen readers, dynamic type
5. **Native Feel**: Platform-specific interactions (iOS/Android)

### Screen Patterns

#### 1. List Screens (Accounts, Transactions, etc.)

```typescript
// Example: Transaction List Screen

import { FlashList } from '@shopify/flash-list';
import { Swipeable } from 'react-native-gesture-handler';

export function TransactionListScreen() {
  const { transactions, isLoading } = useTransactions();

  const renderItem = ({ item }: { item: Transaction }) => (
    <Swipeable
      renderRightActions={() => (
        <SwipeActions
          onDelete={() => handleDelete(item.id)}
          onEdit={() => handleEdit(item.id)}
        />
      )}
    >
      <TransactionRow transaction={item} />
    </Swipeable>
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <FlashList
      data={transactions}
      renderItem={renderItem}
      estimatedItemSize={72}
      keyExtractor={(item) => item.id}
    />
  );
}
```

#### 2. Form Screens (Add/Edit)

```typescript
// Example: Add Transaction Screen

import { useForm, Controller } from 'react-hook-form';
import { YStack, Button, Input } from 'tamagui';

export function AddTransactionScreen() {
  const { control, handleSubmit } = useForm();
  const dispatch = useAppDispatch();

  const onSubmit = async (data: TransactionFormData) => {
    await dispatch(addTransaction(data));
    navigation.goBack();
  };

  return (
    <YStack f={1} p="$4" gap="$4">
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Input
            placeholder="Description"
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <AmountInput
            value={field.value}
            onChangeAmount={field.onChange}
          />
        )}
      />

      <Button onPress={handleSubmit(onSubmit)}>
        Save Transaction
      </Button>
    </YStack>
  );
}
```

### Navigation Structure

```typescript
// packages/mobile-app/src/navigation/RootNavigator.tsx

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
      <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
    </Stack.Navigator>
  );
}
```

### Theming with Tamagui

```typescript
// packages/mobile-app/src/theme/tamagui.config.ts

import { createTamagui, createTokens } from 'tamagui';

const tokens = createTokens({
  color: {
    // Brand colors (match Actual Budget web)
    primary: '#5850ec',
    primaryDark: '#4338ca',
    secondary: '#06b6d4',

    // Semantic colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',

    // Neutral colors
    background: '#ffffff',
    backgroundDark: '#1f2937',
    surface: '#f9fafb',
    surfaceDark: '#374151',

    // Text colors
    text: '#111827',
    textDark: '#f9fafb',
    textSecondary: '#6b7280',
    textSecondaryDark: '#9ca3af',
  },

  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
  },

  size: {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  },

  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
});

export const config = createTamagui({
  tokens,
  themes: {
    light: {
      background: tokens.color.background,
      text: tokens.color.text,
      // ... more mappings
    },
    dark: {
      background: tokens.color.backgroundDark,
      text: tokens.color.textDark,
      // ... more mappings
    },
  },
});
```

---

## Key Implementation Details

### 1. Handling Large Transaction Lists

Use `FlashList` instead of `FlatList` for better performance:

```bash
npm install @shopify/flash-list
```

```typescript
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={transactions}
  renderItem={renderTransaction}
  estimatedItemSize={72} // Important for performance
  keyExtractor={(item) => item.id}
/>
```

### 2. Offline Support

Implement offline queue for sync operations:

```typescript
// packages/mobile-app/src/sync/offline-queue.ts

import NetInfo from '@react-native-community/netinfo';

class OfflineQueue {
  private queue: SyncOperation[] = [];

  async addOperation(operation: SyncOperation) {
    this.queue.push(operation);
    await this.saveQueue();

    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      await this.processQueue();
    }
  }

  async processQueue() {
    while (this.queue.length > 0) {
      const operation = this.queue[0];
      try {
        await this.executeOperation(operation);
        this.queue.shift();
        await this.saveQueue();
      } catch (error) {
        // Keep in queue, will retry
        break;
      }
    }
  }
}
```

### 3. Biometric Authentication

```typescript
// packages/mobile-app/src/auth/biometric.ts

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export async function setupBiometricAuth() {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();

  return compatible && enrolled;
}

export async function authenticateWithBiometric() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Actual Budget',
    fallbackLabel: 'Use passcode',
    disableDeviceFallback: false,
  });

  return result.success;
}

export async function saveCredentialsSecurely(username: string, password: string) {
  await SecureStore.setItemAsync('username', username);
  await SecureStore.setItemAsync('password', password);
}
```

### 4. Push Notifications (for sync alerts)

```typescript
// packages/mobile-app/src/notifications/push.ts

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotifications() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}
```

### 5. Charts for Reports

```typescript
// Using Victory Native for charts

import { VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';

export function SpendingChart({ data }: { data: ChartData[] }) {
  return (
    <VictoryChart theme={VictoryTheme.material}>
      <VictoryBar
        data={data}
        x="category"
        y="amount"
        style={{
          data: { fill: '#5850ec' }
        }}
      />
    </VictoryChart>
  );
}
```

---

## Testing Strategy

### Unit Tests with Jest

```typescript
// packages/mobile-app/__tests__/store/transactions.test.ts

import { store } from '@/store';
import { addTransaction } from 'loot-core/client/transactions/transactionsSlice';

describe('Transactions', () => {
  it('should add transaction to store', () => {
    const transaction = {
      id: '1',
      description: 'Test',
      amount: 100,
      date: new Date().getTime(),
    };

    store.dispatch(addTransaction(transaction));

    const state = store.getState();
    expect(state.transactions.items).toContainEqual(transaction);
  });
});
```

### Component Tests with React Native Testing Library

```typescript
// packages/mobile-app/__tests__/components/TransactionRow.test.tsx

import { render, fireEvent } from '@testing-library/react-native';
import { TransactionRow } from '@/components/TransactionRow';

describe('TransactionRow', () => {
  it('should render transaction details', () => {
    const transaction = {
      id: '1',
      description: 'Grocery Store',
      amount: -5000,
      date: new Date('2024-01-01').getTime(),
    };

    const { getByText } = render(<TransactionRow transaction={transaction} />);

    expect(getByText('Grocery Store')).toBeTruthy();
    expect(getByText('-$50.00')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const transaction = { /* ... */ };

    const { getByTestId } = render(
      <TransactionRow transaction={transaction} onPress={onPress} />
    );

    fireEvent.press(getByTestId('transaction-row'));
    expect(onPress).toHaveBeenCalledWith(transaction);
  });
});
```

### E2E Tests with Detox

```typescript
// packages/mobile-app/e2e/transactions.e2e.ts

describe('Transactions Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should add a new transaction', async () => {
    await element(by.id('add-transaction-button')).tap();

    await element(by.id('description-input')).typeText('Test Transaction');
    await element(by.id('amount-input')).typeText('50.00');
    await element(by.id('save-button')).tap();

    await expect(element(by.text('Test Transaction'))).toBeVisible();
  });
});
```

---

## Deployment

### Development Builds

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Create development build for iOS
eas build --profile development --platform ios

# Create development build for Android
eas build --profile development --platform android
```

### Production Builds

```bash
# iOS Production Build
eas build --profile production --platform ios

# Android Production Build
eas build --profile production --platform android

# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

### Over-the-Air (OTA) Updates

```bash
# Publish update to production
eas update --branch production --message "Bug fixes and improvements"

# Publish to specific channel
eas update --channel preview --message "Beta features"
```

### EAS Configuration (eas.json)

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production",
      "ios": {
        "bundleIdentifier": "com.actualbudget.app"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account.json",
        "track": "production"
      }
    }
  },
  "update": {
    "production": {
      "channel": "production"
    },
    "preview": {
      "channel": "preview"
    }
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Metro Bundler Can't Find Workspace Packages

**Solution:** Check `metro.config.js` has correct `watchFolders` and `nodeModulesPaths`

```javascript
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
```

#### 2. SQLite Not Working on iOS

**Solution:** Rebuild native modules

```bash
cd ios
pod install
cd ..
npx expo run:ios
```

#### 3. Redux Actions Not Firing

**Solution:** Ensure middleware is properly configured

```typescript
const store = configureStore({
  // ...
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(
      createSharedListeners().middleware
    ),
});
```

#### 4. Large Bundle Size

**Solution:** Enable Hermes and production builds

```json
// app.json
{
  "expo": {
    "jsEngine": "hermes",
    "android": {
      "enableProguardInReleaseBuilds": true
    }
  }
}
```

#### 5. Slow List Performance

**Solution:** Use FlashList and proper memoization

```typescript
import { FlashList } from '@shopify/flash-list';
import { memo } from 'react';

const TransactionRow = memo(({ transaction }) => {
  // Component implementation
});
```

---

## Resources

### Documentation

- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [Tamagui](https://tamagui.dev/docs/intro/introduction)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Redux Toolkit](https://redux-toolkit.js.org/)

### Tools

- [Expo Dev Tools](https://docs.expo.dev/workflow/development-mode/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - Debug tool
- [Reactotron](https://github.com/infinitered/reactotron) - Redux inspector

### Community

- [Actual Budget Discord](https://discord.gg/actualbudget)
- [React Native Community](https://github.com/react-native-community)
- [Expo Discord](https://discord.gg/expo)

---

## Next Steps

1. **Review this guide** with the development team
2. **Set up development environment** (Xcode, Android Studio)
3. **Create Expo project** following Phase 1 setup
4. **Implement SQLite adapter** and test with loot-core
5. **Build first screen** (e.g., Accounts list)
6. **Iterate and expand** following the phase plan

---

## Notes

- This guide assumes familiarity with React, TypeScript, and Redux
- Adjust timeline based on team size and experience
- Consider hiring React Native consultant for initial setup if needed
- Plan for 20% buffer time for unexpected issues
- Regular testing on physical devices is critical

---

**Last Updated:** 2025-11-01
**Version:** 1.0
**Maintainer:** Development Team
