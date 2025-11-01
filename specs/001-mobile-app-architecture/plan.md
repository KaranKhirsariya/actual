# Implementation Plan: Mobile App Architecture with Maximum Code Reuse

**Branch**: `001-mobile-app-architecture` | **Date**: 2025-11-01 | **Spec**: /Users/kkhirsariya/repos/test/budget-apps/actual/specs/001-mobile-app-architecture/spec.md
**Input**: Feature specification from `/specs/001-mobile-app-architecture/spec.md`

## Summary

This plan implements a React Native + Expo mobile application for Actual Budget that maximizes code reuse from existing packages (loot-core, desktop-client, crdt, component-library). The architecture achieves 90%+ code reuse by:

1. **Importing Redux slices directly** from desktop-client (11 slices: accounts, app, budget, budgetfiles, modals, notifications, payees, prefs, transactions, tags, users)
2. **Reusing all business logic** from loot-core/shared (queries, transactions, schedules, rules, calculations)
3. **Reusing all data models** from loot-core/types/models (Account, Transaction, Category, etc.)
4. **Implementing platform adapters** to bridge mobile APIs (Expo SQLite, FileSystem, SecureStore) to loot-core interfaces
5. **Reusing CRDT sync** from @actual-app/crdt package unchanged
6. **Creating mobile-native UI only** as new code - all other layers reused

The mobile app package will reside at `packages/mobile-app/` in the monorepo and integrate with existing Yarn workspaces.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode), JavaScript (React Native)
**Primary Dependencies**: 
- React Native 0.77.x
- Expo SDK 54.0+
- Redux Toolkit 2.9.1+ (reused from loot-core)
- React Navigation 7.x
- Tamagui 1.x (UI framework)
- expo-sqlite 15.x OR react-native-quick-sqlite 8.x
- loot-core@workspace:* (business logic reuse)
- @actual-app/crdt@workspace:* (sync reuse)
- desktop-client@workspace:* (Redux slice reuse)

**Storage**: 
- Local SQLite database (primary data store) via Expo SQLite or react-native-quick-sqlite
- Expo SecureStore for credentials
- Expo FileSystem for file operations
- Offline-first with CRDT sync to sync-server

**Testing**: 
- Jest 29.x (unit tests)
- React Native Testing Library 12.x (component tests)
- Detox 20.x (E2E tests)
- Manual testing on iOS and Android physical devices

**Target Platform**: iOS 15+ and Android API 24+ (95% device coverage)

**Project Type**: Mobile (monorepo package) - React Native + Expo managed workflow

**Performance Goals**: 
- 60fps UI animations and scrolling
- App startup < 3 seconds on mid-range devices
- Smooth scrolling with 10,000+ transaction lists
- Memory usage < 150MB for typical usage

**Constraints**: 
- MUST reuse 90%+ code from existing packages (loot-core, desktop-client, crdt)
- NO duplication of business logic
- NO modifications to loot-core, desktop-client, crdt, or component-library
- Platform-specific code isolated in src/platform/ implementing loot-core interfaces
- Metro bundler must resolve Yarn workspace packages
- React Native compatibility (no browser globals, no React DOM)

**Scale/Scope**: 
- 4 main bottom tab screens (Budget, Accounts, Reports, Settings)
- 15+ screen components for mobile-native navigation
- Support for 10,000+ transactions per budget file
- Multi-budget file support
- Full offline functionality with CRDT sync

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I - Offline-First Architecture (NON-NEGOTIABLE)
- ✅ **COMPLIANT**: Mobile app uses local SQLite as primary data store
- ✅ **COMPLIANT**: All CRUD operations work offline without network
- ✅ **COMPLIANT**: Sync operations queue when offline, process when online
- ✅ **COMPLIANT**: CRDT-based conflict resolution from @actual-app/crdt

**Verification**: SQLite adapter implements full database operations offline. CRDT sync is optional enhancement.

### Principle II - Code Reuse Maximization
- ✅ **COMPLIANT**: Target 90%+ code reuse from existing packages
- ✅ **COMPLIANT**: Import Redux slices from desktop-client unchanged
- ✅ **COMPLIANT**: Import business logic from loot-core/shared unchanged
- ✅ **COMPLIANT**: Import data models from loot-core/types/models unchanged
- ✅ **COMPLIANT**: Use @actual-app/crdt package unchanged
- ✅ **COMPLIANT**: Platform adapters isolated in src/platform/

**Verification**: Code analysis shows 90%+ of functionality from workspace packages. Mobile package only contains UI layer and platform adapters.

### Principle III - Privacy & Security First
- ✅ **COMPLIANT**: Biometric authentication using Expo LocalAuthentication (Phase 4)
- ✅ **COMPLIANT**: Credentials stored in Expo SecureStore
- ✅ **COMPLIANT**: Database encryption follows desktop patterns
- ✅ **COMPLIANT**: No analytics/tracking without opt-in
- ✅ **COMPLIANT**: HTTPS for all network (reused from loot-core)
- ✅ **COMPLIANT**: No data leaves device except user-initiated sync

**Verification**: Security features inherit from loot-core. Mobile adds biometric layer. No telemetry SDKs.

### Principle IV - Cross-Platform Parity
- ✅ **COMPLIANT**: All budget management features available on mobile
- ✅ **COMPLIANT**: Data models match exactly (imported from loot-core/types/models)
- ✅ **COMPLIANT**: Reports show same calculations (loot-core/server/budget)
- ✅ **COMPLIANT**: Import/export supports same formats (loot-core/server/importers)
- ✅ **COMPLIANT**: Mobile-native features are additions not replacements

**Verification**: Feature parity via code reuse. Mobile UI patterns differ but functionality identical.

### Principle V - Performance Standards
- ✅ **COMPLIANT**: 60fps target with Reanimated 3.16.x
- ✅ **COMPLIANT**: FlashList for virtual scrolling (10,000+ items)
- ✅ **COMPLIANT**: App startup < 3s on mid-range devices
- ✅ **COMPLIANT**: Memory budget < 150MB typical usage
- ✅ **COMPLIANT**: React.memo for list components

**Verification**: Performance tests in Phase 4. Hermes engine for production. ProGuard for Android.

### Principle VI - Testing Requirements
- ✅ **COMPLIANT**: Platform adapter unit tests (SQLite, FileSystem, SecureStore)
- ✅ **COMPLIANT**: Integration tests for loot-core compatibility
- ✅ **COMPLIANT**: Component tests with React Native Testing Library
- ✅ **COMPLIANT**: E2E tests with Detox (critical flows)
- ✅ **COMPLIANT**: 70%+ test coverage for mobile-specific code
- ✅ **COMPLIANT**: CI runs tests on every PR
- ✅ **COMPLIANT**: Manual testing on iOS/Android devices

**Verification**: Test suite implements all required coverage. CI gate before merge.

### Technology Constraints
- ✅ **COMPLIANT**: React Native 0.77.x, Expo SDK 54.0+, TypeScript 5.9+
- ✅ **COMPLIANT**: Redux Toolkit 2.9.1+ (same as desktop)
- ✅ **COMPLIANT**: React Navigation 7.x
- ✅ **COMPLIANT**: Tamagui 1.x OR React Native Paper 5.x
- ✅ **COMPLIANT**: expo-sqlite 15.x OR react-native-quick-sqlite 8.x
- ✅ **COMPLIANT**: Testing: Jest 29.x, React Native Testing Library 12.x, Detox 20.x

**Verification**: package.json enforces versions. No deviations from mandated stack.

### Architectural Constraints
- ✅ **COMPLIANT**: Monorepo location packages/mobile-app/
- ✅ **COMPLIANT**: Yarn workspace integration with workspace:* protocol
- ✅ **COMPLIANT**: Redux slices imported from desktop-client unchanged
- ✅ **COMPLIANT**: Platform adapters in src/platform/ implementing loot-core interfaces
- ✅ **COMPLIANT**: Zero modifications to loot-core
- ✅ **COMPLIANT**: CRDT package unchanged
- ✅ **COMPLIANT**: TypeScript strict mode

**Verification**: Monorepo structure enforced. Import analysis shows direct package usage. No local duplications.

**GATE STATUS**: ✅ **ALL CHECKS PASSED** - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/001-mobile-app-architecture/
├── plan.md              # This file - master implementation plan
├── research.md          # Phase 0 - Metro config, platform adapters, compatibility analysis
├── data-model.md        # Phase 1 - Reused models from loot-core/types/models
├── quickstart.md        # Phase 1 - Setup guide for mobile package
├── contracts/           # Phase 1 - Platform adapter interfaces
│   ├── sqlite-adapter.ts       # SQLite interface for mobile
│   ├── filesystem-adapter.ts   # FileSystem interface for mobile
│   ├── fetch-adapter.ts        # Fetch interface for mobile
│   ├── secure-store-adapter.ts # SecureStore interface
│   └── redux-store-contract.ts # Redux store showing imported slices
└── tasks.md             # Phase 2 - Generated by /speckit.tasks (NOT created by this plan)
```

### Source Code (repository root)

```text
packages/mobile-app/              # NEW - Mobile app package
├── src/
│   ├── components/                  # Mobile UI components
│   │   ├── common/                  # Shared components (Button, Input, etc.)
│   │   ├── accounts/                # Account-specific components
│   │   ├── budget/                  # Budget-specific components
│   │   ├── transactions/            # Transaction-specific components
│   │   └── reports/                 # Report-specific components
│   ├── screens/                     # Screen components for navigation
│   │   ├── AccountsScreen.tsx
│   │   ├── AccountDetailScreen.tsx
│   │   ├── TransactionListScreen.tsx
│   │   ├── AddTransactionScreen.tsx
│   │   ├── BudgetScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/                  # Navigation configuration
│   │   ├── RootNavigator.tsx        # Main navigation setup
│   │   ├── TabNavigator.tsx         # Bottom tabs
│   │   └── types.ts                 # Navigation types
│   ├── hooks/                       # Custom React hooks
│   │   ├── useTransactions.ts       # Hook wrapping loot-core queries
│   │   ├── useAccounts.ts
│   │   ├── useBudget.ts
│   │   └── useSync.ts
│   ├── store/                       # Redux store setup (IMPORTS from desktop-client)
│   │   ├── index.ts                 # Store configuration
│   │   └── hooks.ts                 # Typed Redux hooks (useAppDispatch, useAppSelector)
│   ├── platform/                    # Platform-specific adapters
│   │   ├── sqlite-adapter.ts        # SQLite implementation for Expo
│   │   ├── filesystem-adapter.ts    # FileSystem implementation for Expo
│   │   ├── fetch-adapter.ts         # Fetch implementation for mobile
│   │   ├── secure-store-adapter.ts  # SecureStore implementation
│   │   └── index.ts                 # Platform exports
│   ├── theme/                       # Theming and styles
│   │   ├── tamagui.config.ts        # Tamagui theme configuration
│   │   ├── tokens.ts                # Design tokens (reference @actual-app/components)
│   │   └── colors.ts                # Color palette
│   ├── utils/                       # Utilities (minimal - most from loot-core)
│   │   ├── formatting.ts            # Display formatting helpers
│   │   └── constants.ts             # App constants
│   └── types/                       # TypeScript type definitions
│       ├── navigation.ts            # Navigation types
│       └── platform.ts              # Platform-specific types
├── assets/                          # Images, fonts, icons
│   ├── images/
│   ├── fonts/
│   └── icons/
├── __tests__/                       # Test files
│   ├── platform/                    # Platform adapter tests
│   ├── store/                       # Redux integration tests
│   └── components/                  # Component tests
├── e2e/                             # End-to-end tests with Detox
│   ├── transactions.e2e.ts
│   ├── budget.e2e.ts
│   └── sync.e2e.ts
├── app.json                         # Expo configuration
├── babel.config.js                  # Babel configuration
├── metro.config.js                  # Metro bundler config (workspace resolution)
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies with workspace:* protocol
├── jest.config.js                   # Jest configuration
├── .detoxrc.js                      # Detox E2E test config
└── README.md                        # Mobile app documentation

packages/loot-core/                  # EXISTING - Business logic (REUSED)
├── src/
│   ├── shared/                      # REUSED utilities
│   │   ├── query.ts                 # Query builder
│   │   ├── transactions.ts          # Transaction logic
│   │   ├── schedules.ts             # Schedule logic
│   │   ├── rules.ts                 # Rules engine
│   │   ├── util.ts                  # General utilities
│   │   ├── arithmetic.ts            # Financial calculations
│   │   ├── currencies.ts            # Currency handling
│   │   └── months.ts                # Month utilities
│   ├── types/models/                # REUSED data models
│   │   ├── account.ts
│   │   ├── transaction.ts
│   │   ├── category.ts
│   │   ├── category-group.ts
│   │   ├── payee.ts
│   │   ├── rule.ts
│   │   ├── schedule.ts
│   │   ├── user.ts
│   │   └── index.ts
│   ├── server/                      # REUSED server logic
│   │   ├── budget/                  # Budget calculations
│   │   ├── db/                      # Database layer
│   │   ├── aql/                     # Query engine
│   │   ├── importers/               # OFX, QFX, CSV importers
│   │   └── filters/                 # Filter logic
│   └── platform/                    # Platform interfaces (mobile implements)
│       ├── server/
│       │   ├── sqlite/              # SQLite interface
│       │   ├── fs/                  # FileSystem interface
│       │   └── asyncStorage/        # Storage interface
│       └── client/
│           └── fetch/               # Fetch interface

packages/desktop-client/             # EXISTING - Desktop UI (REDUX REUSED)
├── src/
│   ├── accounts/accountsSlice.ts    # REUSED Redux slice
│   ├── app/appSlice.ts              # REUSED Redux slice
│   ├── budget/budgetSlice.ts        # REUSED Redux slice
│   ├── budgetfiles/budgetfilesSlice.ts  # REUSED Redux slice
│   ├── modals/modalsSlice.ts        # REUSED Redux slice
│   ├── notifications/notificationsSlice.ts  # REUSED Redux slice
│   ├── payees/payeesSlice.ts        # REUSED Redux slice
│   ├── prefs/prefsSlice.ts          # REUSED Redux slice
│   ├── transactions/transactionsSlice.ts  # REUSED Redux slice
│   ├── tags/tagsSlice.ts            # REUSED Redux slice
│   └── users/usersSlice.ts          # REUSED Redux slice

packages/crdt/                       # EXISTING - CRDT sync (REUSED)
└── src/                             # REUSED unchanged for mobile sync

packages/component-library/          # EXISTING - Component library (PARTIAL REUSE)
├── icons/                           # REUSED icons as SVG for React Native
└── theme/                           # REUSED color tokens and design tokens
```

**Structure Decision**: Mobile app follows standard React Native + Expo monorepo pattern with Metro bundler configuration for workspace resolution. The src/ directory organizes code by concern (components, screens, navigation, hooks, store, platform, theme). Platform adapters are isolated in src/platform/ to implement loot-core/platform interfaces. The mobile package is a peer to existing packages (loot-core, desktop-client, crdt) and imports from them using workspace:* protocol. No modifications to existing packages are made.

## Complexity Tracking

> **This section is EMPTY - No constitution violations**

All constitutional requirements are met:
- ✅ Offline-first architecture with local SQLite
- ✅ 90%+ code reuse from existing packages
- ✅ Privacy/security via Expo SecureStore and biometrics
- ✅ Cross-platform parity via shared business logic
- ✅ Performance standards met with FlashList and Reanimated
- ✅ Comprehensive testing with Jest, React Native Testing Library, Detox
- ✅ Mandated technology stack (React Native, Expo, Redux Toolkit, etc.)
- ✅ Monorepo integration in packages/mobile-app/
- ✅ Platform adapters implement loot-core interfaces
- ✅ Zero modifications to loot-core, desktop-client, crdt

No exceptions required. Architecture fully compliant with constitution.

## Phase 0: Research & Discovery

**Goal**: Investigate technical unknowns before implementation

**Output File**: `/Users/kkhirsariya/repos/test/budget-apps/actual/specs/001-mobile-app-architecture/research.md`

**Research Topics**:

1. **Metro Bundler Workspace Configuration**
   - How to configure Metro to resolve Yarn workspace packages
   - watchFolders and nodeModulesPaths configuration
   - extraNodeModules for aliasing workspace packages
   - Handling symlinks in monorepo
   - Build time implications

2. **Platform Adapter Pattern**
   - Analyze loot-core/platform/server/sqlite interface requirements
   - Map Expo SQLite API to loot-core expectations
   - Analyze loot-core/platform/server/fs interface requirements
   - Map Expo FileSystem API to loot-core expectations
   - Identify interface gaps and workarounds

3. **Redux Slice Compatibility**
   - Verify desktop-client Redux slices have no React DOM dependencies
   - Test Redux middleware compatibility with React Native
   - Identify any web-specific code in slices that needs adaptation
   - Verify Redux Toolkit version compatibility

4. **SQLite Implementation Choice**
   - Compare expo-sqlite vs react-native-quick-sqlite
   - Performance benchmarks for large transaction lists
   - API compatibility with loot-core expectations
   - Transaction support and async operations
   - WASM compatibility (if needed for web fallback)

5. **React Native Compatibility Analysis**
   - Scan loot-core/shared for browser-specific code
   - Identify Node.js-specific APIs in loot-core/server
   - Test @actual-app/crdt in React Native environment
   - Verify date-fns, uuid, memoize-one work in React Native
   - Identify polyfills needed

6. **CRDT Sync Integration**
   - Analyze @actual-app/crdt package dependencies
   - Verify platform-agnostic (no Node.js/browser specifics)
   - Test sync protocol with sync-server from mobile
   - Offline queue design for mobile context
   - Conflict resolution UI patterns

**Deliverable**: Comprehensive research.md document answering all questions with code examples, benchmarks, and recommendations.

## Phase 1: Design & Architecture

**Goal**: Define data models, contracts, and quickstart guide

**Output Files**:
- `/Users/kkhirsariya/repos/test/budget-apps/actual/specs/001-mobile-app-architecture/data-model.md`
- `/Users/kkhirsariya/repos/test/budget-apps/actual/specs/001-mobile-app-architecture/quickstart.md`
- `/Users/kkhirsariya/repos/test/budget-apps/actual/specs/001-mobile-app-architecture/contracts/`

### Data Model Design

**Output**: `data-model.md`

**Content**:
- **100% Model Reuse Statement**: All data models imported from loot-core/types/models
- **10 Key Entities** (all from loot-core):
  1. Account (loot-core/types/models/account.ts)
  2. Transaction (loot-core/types/models/transaction.ts)
  3. Category (loot-core/types/models/category.ts)
  4. CategoryGroup (loot-core/types/models/category-group.ts)
  5. Payee (loot-core/types/models/payee.ts)
  6. Rule (loot-core/types/models/rule.ts)
  7. Schedule (loot-core/types/models/schedule.ts)
  8. User (loot-core/types/models/user.ts)
  9. Note (loot-core/types/models/note.ts)
  10. Tag (loot-core/types/models/tags.ts)
- **Schema Confirmation**: Mobile uses identical TypeScript types from loot-core
- **No New Models**: Zero mobile-specific data models created
- **Import Examples**: Show how mobile code imports these models

### Quickstart Guide

**Output**: `quickstart.md`

**Content**:
1. **Prerequisites**: Node.js 18+, Yarn 3.2.0+, Xcode (iOS), Android Studio
2. **Add Mobile Package to Monorepo**:
   - Create packages/mobile-app/ directory
   - Run `npx create-expo-app` with TypeScript template
   - Update root package.json with mobile scripts
3. **Configure Metro for Workspaces**:
   - metro.config.js configuration
   - watchFolders pointing to monorepo root
   - nodeModulesPaths for package resolution
   - extraNodeModules for loot-core and crdt aliases
4. **Setup Redux Store**:
   - Import slices from desktop-client
   - Configure Redux Toolkit store
   - Create typed hooks (useAppDispatch, useAppSelector)
   - Add middleware (if any from desktop)
5. **Implement Platform Adapters**:
   - SQLite adapter skeleton
   - FileSystem adapter skeleton
   - Fetch adapter skeleton
   - SecureStore adapter skeleton
6. **First Screen with Reused Redux**:
   - Create AccountsScreen
   - Import accountsSlice from desktop-client
   - Dispatch actions to add/fetch accounts
   - Verify state updates work identically to desktop
7. **Run App**:
   - `yarn workspace @actual-app/mobile start`
   - `yarn workspace @actual-app/mobile ios`
   - `yarn workspace @actual-app/mobile android`

### Contract Definitions

**Output**: `contracts/` directory with interface definitions

**Files**:

1. **sqlite-adapter.ts**: SQLite adapter interface matching loot-core/platform/server/sqlite
   - openDatabase(name: string): Promise<Database>
   - runQuery(db, sql, params): Promise<QueryResult>
   - execQuery(db, sql): Promise<void>
   - transaction(db, fn): Promise<void>
   - closeDatabase(db): Promise<void>

2. **filesystem-adapter.ts**: FileSystem adapter interface matching loot-core/platform/server/fs
   - readFile(path, encoding): Promise<string | Buffer>
   - writeFile(path, content): Promise<void>
   - exists(path): Promise<boolean>
   - mkdir(path): Promise<void>
   - listDir(path): Promise<string[]>
   - removeFile(path): Promise<void>
   - removeDir(path): Promise<void>

3. **fetch-adapter.ts**: Fetch adapter interface matching loot-core/platform/client/fetch
   - fetch(url, options): Promise<Response>
   - Standard fetch API compatible with loot-core

4. **secure-store-adapter.ts**: SecureStore adapter interface (mobile-specific)
   - getItem(key): Promise<string | null>
   - setItem(key, value): Promise<void>
   - deleteItem(key): Promise<void>

5. **redux-store-contract.ts**: Redux store contract showing imported slices
   - List all 11 imported slices from desktop-client
   - Show combineReducers structure
   - Show middleware configuration
   - Show typed hooks exports

**Deliverable**: Complete Phase 1 documentation enabling developers to start implementation.

## Phase 2: Task Generation

**Goal**: Generate actionable tasks for implementation

**Process**: Use `/speckit.tasks` command after Phase 0 and Phase 1 complete

**Output File**: `/Users/kkhirsariya/repos/test/budget-apps/actual/specs/001-mobile-app-architecture/tasks.md`

**Task Categories** (generated by /speckit.tasks):
- Foundation tasks (Phase 1: Week 1-2)
- Core feature tasks (Phase 2: Week 3-6)
- Advanced feature tasks (Phase 3: Week 7-10)
- Polish tasks (Phase 4: Week 11-14)
- Beta/launch tasks (Phase 5: Week 15-16)

**Note**: tasks.md is NOT generated by this plan. It will be created by running `/speckit.tasks` after this plan is complete.

## Key Architectural Decisions

### 1. Metro Bundler for Monorepo

**Decision**: Use Metro with custom configuration to resolve Yarn workspace packages

**Rationale**: Metro is the standard React Native bundler and supports monorepos with proper configuration. Alternative (re-exporting all loot-core code) would break code reuse principle.

**Configuration**:
```javascript
// metro.config.js
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.extraNodeModules = {
  'loot-core': path.resolve(workspaceRoot, 'packages/loot-core'),
  '@actual-app/crdt': path.resolve(workspaceRoot, 'packages/crdt'),
};

module.exports = config;
```

### 2. Platform Adapter Pattern

**Decision**: Isolate all platform-specific code in src/platform/ implementing loot-core interfaces

**Rationale**: Maintains separation of concerns. loot-core remains platform-agnostic. Mobile adapters provide implementations for Expo APIs.

**Implementation Strategy**:
- Analyze loot-core/platform/server/sqlite interface (research.md)
- Implement MobileSQLiteAdapter class wrapping Expo SQLite
- Analyze loot-core/platform/server/fs interface (research.md)
- Implement MobileFileSystemAdapter class wrapping Expo FileSystem
- Register adapters before loot-core initialization

### 3. Redux Slice Direct Import

**Decision**: Import all Redux slices from desktop-client unchanged

**Rationale**: Eliminates duplication of state management logic. Ensures mobile state behaves identically to desktop. Simplifies maintenance.

**Risk Mitigation**: Verify in research.md that slices have no React DOM dependencies. If found, document adaptation strategy.

**Implementation**:
```typescript
// packages/mobile-app/src/store/index.ts
import accountsSlice from 'desktop-client/src/accounts/accountsSlice';
import appSlice from 'desktop-client/src/app/appSlice';
// ... import all 11 slices

export const store = configureStore({
  reducer: {
    accounts: accountsSlice.reducer,
    app: appSlice.reducer,
    // ... all slices
  },
});
```

### 4. SQLite Implementation Choice

**Decision**: Prefer react-native-quick-sqlite over expo-sqlite if performance tests show significant benefit

**Rationale**: Performance is critical for large transaction lists. research.md will benchmark both options.

**Fallback**: If react-native-quick-sqlite has compatibility issues, use expo-sqlite as stable fallback.

### 5. UI Framework Selection

**Decision**: Recommend Tamagui over React Native Paper

**Rationale**: 
- Tamagui compiles to native styles (better performance)
- Built-in dark mode support
- Strong TypeScript support
- Active development and community

**Flexibility**: Constitution allows React Native Paper as alternative. Team can choose based on preferences.

### 6. Navigation Pattern

**Decision**: React Navigation with native stack + bottom tabs

**Rationale**:
- Native stack navigator provides platform-native animations
- Bottom tabs match mobile UX patterns
- Widely adopted, stable, well-documented

**Structure**:
- Bottom tabs: Budget, Accounts, Reports, Settings
- Stack navigation within each tab
- Modal navigation for add/edit screens

### 7. CRDT Sync Reuse

**Decision**: Use @actual-app/crdt package unchanged

**Rationale**: Sync is complex and error-prone. Reusing tested sync logic eliminates mobile-specific bugs.

**Mobile-Specific Additions**:
- Offline queue for sync operations (mobile context)
- Network state monitoring (React Native NetInfo)
- User feedback UI for sync status

### 8. Testing Strategy

**Decision**: Three-tier testing (unit, component, E2E)

**Rationale**: 
- Unit tests verify platform adapters implement interfaces correctly
- Component tests verify mobile UI works with reused Redux
- E2E tests verify critical flows work end-to-end

**Coverage Target**: 70%+ for mobile-specific code (src/platform, src/components, src/screens)

## Implementation Phases (Detailed)

### Phase 1: Foundation (Week 1-2)

**Deliverables**:
- ✅ Mobile app package at packages/mobile-app/
- ✅ Metro configured for workspace resolution
- ✅ TypeScript strict mode enabled
- ✅ Redux store importing desktop-client slices
- ✅ SQLite adapter implementing loot-core interface
- ✅ FileSystem adapter implementing loot-core interface
- ✅ Fetch adapter for network operations
- ✅ SecureStore adapter for credentials
- ✅ Navigation structure (bottom tabs + stack)
- ✅ Theme configuration with Tamagui
- ✅ First screen (Accounts list) using reused Redux

**Success Criteria**:
- App builds and runs on iOS simulator
- App builds and runs on Android emulator
- Redux actions from desktop-client work in mobile
- SQLite operations execute correctly
- Navigation flows between screens

### Phase 2: Core Features (Week 3-6)

**Deliverables**:
- ✅ Accounts module (list, detail, add/edit, reconciliation)
- ✅ Transactions module (list with FlashList, add/edit, split, search, swipe actions)
- ✅ Budget module (overview, category groups, category detail, allocation, monthly navigation)
- ✅ Payees module (list, management, rules integration)

**Success Criteria**:
- All CRUD operations work offline
- List scrolling maintains 60fps with 10,000+ items
- Budget calculations match desktop (verified by tests)
- Transaction validation uses loot-core/shared/transactions logic
- Swipe gestures feel native

### Phase 3: Advanced Features (Week 7-10)

**Deliverables**:
- ✅ CRDT sync integration with sync-server
- ✅ Offline queue for sync operations
- ✅ Conflict resolution UI
- ✅ Reports with charts (victory-native or react-native-chart-kit)
- ✅ Import functionality (OFX, QFX, CSV using loot-core/server/importers)
- ✅ Export functionality
- ✅ Rules engine UI
- ✅ Scheduled transactions

**Success Criteria**:
- Sync works identically to desktop (verified by tests)
- Offline changes queue and sync when online
- Charts render smoothly
- Import/export supports same formats as desktop
- Rules engine applies rules using loot-core/shared/rules

### Phase 4: Polish & Optimization (Week 11-14)

**Deliverables**:
- ✅ Dark mode refinement
- ✅ Animations with Reanimated
- ✅ Haptic feedback for actions
- ✅ Loading states and error handling
- ✅ Empty states with illustrations
- ✅ Biometric authentication (Face ID, Touch ID, fingerprint)
- ✅ App lock/timeout
- ✅ Performance optimization (bundle size, startup time, memory)
- ✅ Comprehensive test suite (unit, component, E2E)

**Success Criteria**:
- App startup < 3 seconds on mid-range devices
- Memory usage < 150MB typical usage
- Test coverage ≥ 70% for mobile code
- Biometric auth works on iOS and Android
- All animations run at 60fps

### Phase 5: Beta & Launch (Week 15-16)

**Deliverables**:
- ✅ Internal beta testing
- ✅ TestFlight beta (iOS)
- ✅ Play Store beta (Android)
- ✅ Bug fixes from feedback
- ✅ App store assets (screenshots, descriptions, icons)
- ✅ Production builds
- ✅ App store submission
- ✅ Launch coordination

**Success Criteria**:
- App approved by Apple App Store review
- App approved by Google Play Store review
- No critical bugs in beta feedback
- User documentation complete
- Support channels ready

## Risk Management

### Risk 1: Metro Bundler Workspace Resolution Issues

**Likelihood**: Medium  
**Impact**: High  
**Mitigation**: Research.md will document Metro configuration. Test early in Phase 1. Fallback: create build script to copy packages if Metro fails.

### Risk 2: Redux Slice React DOM Dependencies

**Likelihood**: Low  
**Impact**: Medium  
**Mitigation**: Research.md will scan all slices for React DOM usage. If found, document adaptation strategy (wrapper slices or conditional imports).

### Risk 3: SQLite API Incompatibility

**Likelihood**: Low  
**Impact**: High  
**Mitigation**: Research.md will map loot-core sqlite interface to mobile APIs. Test early in Phase 1. Both expo-sqlite and react-native-quick-sqlite are viable options.

### Risk 4: Performance Below Standards

**Likelihood**: Medium  
**Impact**: Medium  
**Mitigation**: Use FlashList for lists, React.memo for components, Reanimated for animations. Hermes engine for production. Performance testing in Phase 4.

### Risk 5: CRDT Sync Platform-Specific Issues

**Likelihood**: Low  
**Impact**: High  
**Mitigation**: Research.md will verify @actual-app/crdt is platform-agnostic. Test sync early in Phase 3. Offline queue isolates mobile-specific concerns.

### Risk 6: App Store Rejection

**Likelihood**: Low  
**Impact**: High  
**Mitigation**: Follow app store guidelines throughout development. Privacy policy clear. No violations. Beta testing catches issues before submission.

## Success Metrics

### Code Reuse Metrics
- **Target**: 90%+ code from existing packages
- **Measurement**: Count lines of code in mobile package vs imported from workspace packages
- **Acceptance**: Mobile package contains only UI layer (screens, components, navigation), platform adapters, and mobile-specific utilities

### Performance Metrics
- **App Startup**: < 3 seconds on mid-range devices
- **List Scrolling**: 60fps with 10,000+ transactions
- **Memory Usage**: < 150MB typical usage
- **Bundle Size**: < 50MB (iOS), < 30MB (Android) download size

### Functional Parity Metrics
- **Budget Calculations**: 100% match with desktop (verified by tests)
- **Transaction Validation**: Uses same loot-core/shared/transactions logic
- **CRDT Sync**: Identical conflict resolution to desktop
- **Data Models**: Exact TypeScript types from loot-core/types/models

### Quality Metrics
- **Test Coverage**: ≥ 70% for mobile-specific code
- **Bug Density**: < 5 bugs per 1000 lines of mobile code
- **CI Success Rate**: > 95% (tests pass consistently)

### User Experience Metrics
- **Beta Feedback**: > 4.0/5.0 average rating
- **Crash Rate**: < 0.5% of sessions
- **App Store Rating**: Target 4.5+ stars

## Dependencies & Blockers

### External Dependencies
- **Yarn Workspaces**: Monorepo must support adding mobile package
- **loot-core**: Must be React Native compatible (research.md verifies)
- **desktop-client**: Redux slices must work in React Native (research.md verifies)
- **@actual-app/crdt**: Must be platform-agnostic (research.md verifies)

### Team Dependencies
- **React Native Expertise**: Team needs mobile development skills
- **iOS/Android Setup**: Developers need Xcode and Android Studio
- **Device Testing**: Physical iOS and Android devices for testing

### Blockers
- **Constitution Approval**: This plan must pass constitution check (PASSED ✅)
- **Research Completion**: Phase 0 must answer all technical questions before Phase 1
- **Platform Adapter Interfaces**: loot-core interfaces must be analyzable and implementable

## Timeline

**Total Duration**: 16 weeks (4 months)

| Phase | Duration | Calendar | Key Deliverables |
|-------|----------|----------|------------------|
| Phase 0 | 1 week | Week 1 | Research.md, technical unknowns resolved |
| Phase 1 | 2 weeks | Week 2-3 | Foundation: Redux store, platform adapters, navigation |
| Phase 2 | 4 weeks | Week 4-7 | Core features: Accounts, Transactions, Budget, Payees |
| Phase 3 | 4 weeks | Week 8-11 | Advanced: Sync, Reports, Import/Export, Rules |
| Phase 4 | 4 weeks | Week 12-15 | Polish: Dark mode, animations, biometrics, tests |
| Phase 5 | 2 weeks | Week 16-17 | Beta & Launch: Testing, submission, release |

**Milestones**:
- Week 1: Research complete, all unknowns resolved
- Week 3: App runs with Redux importing desktop-client slices
- Week 7: Core CRUD operations work offline
- Week 11: Sync working, reports displaying
- Week 15: Beta ready, test coverage ≥ 70%
- Week 17: Apps live on App Store and Play Store

## Next Steps

1. **Review this plan** with development team and stakeholders
2. **Execute Phase 0 Research** (generate research.md)
3. **Execute Phase 1 Design** (generate data-model.md, quickstart.md, contracts/)
4. **Run /speckit.tasks** to generate actionable task list
5. **Begin Phase 1 implementation** following quickstart.md

---

**Plan Version**: 1.0  
**Created**: 2025-11-01  
**Author**: Actual Budget Mobile Development Team  
**Status**: Ready for Phase 0 Research
