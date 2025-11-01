# Feature Specification: Mobile App Architecture with Maximum Code Reuse

**Feature Branch**: `001-mobile-app-architecture`
**Created**: 2025-11-01
**Status**: Draft
**Input**: User description: "Mobile app architecture design for Actual Budget that maximizes code reuse from existing web and desktop applications"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Offline Budget Management with Shared Business Logic (Priority: P1)

As an Actual Budget user, I want to manage my budget on my mobile device using the same reliable calculations, validation rules, and data models as the desktop app, so that I can trust the numbers are identical regardless of which device I use.

**Why this priority**: This validates the core architectural principle - maximum code reuse from existing packages. Users need confidence that mobile calculations match desktop exactly. Without this, the mobile app cannot be trusted for financial data.

**Independent Test**: Can be fully tested by adding a transaction on mobile, verifying it uses the same validation from `loot-core/shared/transactions.ts`, seeing budget recalculate using shared logic from `loot-core/server/budget`, and confirming the data model from `loot-core/types/models` works identically. Delivers immediate value by proving architectural viability.

**Acceptance Scenarios**:

1. **Given** mobile app is installed with budget loaded, **When** user adds a transaction, **Then** validation logic from `loot-core/shared/transactions.ts` runs identically to desktop (amount parsing, date validation, category rules)
2. **Given** user enters split transaction, **When** splits are saved, **Then** data model from `loot-core/types/models/transaction` matches desktop exactly (same fields, same structure)
3. **Given** user categorizes transaction, **When** budget recalculates, **Then** calculation logic from `loot-core/server/budget` produces identical results to desktop
4. **Given** user creates recurring schedule, **When** schedule processes, **Then** logic from `loot-core/shared/schedules.ts` generates same transactions as desktop
5. **Given** user sets up categorization rule, **When** matching transactions appear, **Then** rules engine from `loot-core/shared/rules.ts` applies rules identically to desktop

---

### User Story 2 - State Management with Reused Redux Slices (Priority: P1)

As a mobile app developer, I want to reuse all Redux slices from desktop-client (accounts, budget, transactions, payees, prefs, notifications, etc.) without modification, so that state management logic doesn't need to be duplicated or maintained separately.

**Why this priority**: Redux slices contain critical state management logic tested in production on desktop. Reusing them eliminates entire classes of bugs and ensures mobile state behaves identically to desktop. This is foundational for all features.

**Independent Test**: Can be tested by importing desktop-client Redux slices into mobile store, dispatching actions (add account, update budget, sync preferences), and verifying state updates match desktop behavior exactly. Delivers confidence in architectural code reuse strategy.

**Acceptance Scenarios**:

1. **Given** mobile Redux store configured, **When** importing slices from desktop-client/src/*Slice.ts, **Then** all 11 slices (accounts, app, budget, budgetfiles, modals, notifications, payees, prefs, transactions, tags, users) work without modification
2. **Given** user adds account on mobile, **When** dispatching action from accountsSlice, **Then** state updates using exact same reducer logic as desktop
3. **Given** user changes preference on mobile, **When** prefsSlice updates, **Then** preference logic from `loot-core/shared/util.ts` (parseNumberFormat, etc.) runs identically
4. **Given** user triggers notification on mobile, **When** notificationsSlice adds notification, **Then** notification data structure matches desktop exactly
5. **Given** modal opens on mobile, **When** modalsSlice manages modal state, **Then** modal state logic works identically enabling same modal patterns as desktop

---

### User Story 3 - Platform Adapters for Mobile-Specific APIs (Priority: P1)

As a mobile developer, I want to implement platform adapters that bridge mobile APIs (Expo SQLite, FileSystem, SecureStore) to the interfaces expected by loot-core, so that business logic remains platform-agnostic while working correctly on mobile.

**Why this priority**: loot-core uses platform abstraction (`loot-core/platform/`) expecting certain interfaces. Mobile must implement these interfaces using mobile APIs without changing loot-core code. This proves the architecture's separation of concerns.

**Independent Test**: Can be tested by implementing mobile SQLite adapter matching `loot-core/platform/server/sqlite` interface, running loot-core database operations, and verifying they execute correctly using Expo SQLite. Delivers proof that platform abstraction works.

**Acceptance Scenarios**:

1. **Given** mobile implements SQLite adapter, **When** loot-core/server/db executes query, **Then** adapter translates to Expo SQLite API and returns results in expected format
2. **Given** mobile implements FileSystem adapter, **When** loot-core/server requires file operations, **Then** adapter uses Expo FileSystem matching `loot-core/platform/server/fs` interface
3. **Given** mobile implements fetch adapter, **When** loot-core/platform/client/fetch sends requests, **Then** adapter uses mobile fetch API with same interface as web
4. **Given** mobile implements secure storage adapter, **When** credentials need storage, **Then** adapter uses Expo SecureStore matching expected interface
5. **Given** all platform adapters implemented, **When** loot-core business logic runs, **Then** zero code changes needed in loot-core adapters provide complete compatibility layer

---

### User Story 4 - CRDT Sync with Zero Mobile-Specific Code (Priority: P2)

As a multi-device user, I want my mobile budget to sync with desktop using the exact same CRDT logic from @actual-app/crdt package, so that conflict resolution works identically and I never lose data due to platform-specific sync bugs.

**Why this priority**: Sync is complex and error-prone. Reusing @actual-app/crdt package eliminates risk of mobile-specific sync bugs. Lower priority than core offline features but critical for multi-device users.

**Independent Test**: Can be tested by making offline changes on mobile and desktop simultaneously, connecting to sync server, and verifying @actual-app/crdt resolves conflicts identically on both platforms. Delivers confidence in multi-device reliability.

**Acceptance Scenarios**:

1. **Given** mobile app uses @actual-app/crdt package, **When** sync protocol executes, **Then** same CRDT operations (merkle trees, message passing, clock sync) run as desktop
2. **Given** user edits transaction offline on mobile and desktop, **When** sync occurs, **Then** conflict resolution from @actual-app/crdt produces identical result on both platforms
3. **Given** mobile generates CRDT messages, **When** desktop receives them, **Then** message format from @actual-app/crdt is compatible (no mobile-specific encoding)
4. **Given** sync-server receives mobile CRDT messages, **When** processing, **Then** server handles them identically to desktop messages (no platform detection needed)
5. **Given** mobile implements offline queue, **When** connection restored, **Then** queued CRDT operations from @actual-app/crdt process in correct order maintaining causality

---

### User Story 5 - Mobile UI with Shared Design Tokens and Icons (Priority: P3)

As a mobile user, I want the app to feel native to my phone (touch gestures, navigation patterns) while maintaining visual consistency with desktop through shared color tokens and icons from @actual-app/components.

**Why this priority**: UI must be mobile-native for good UX, but visual consistency (colors, icons, brand) builds trust. This validates UI layer separation from business logic. Lower priority as it doesn't affect correctness.

**Independent Test**: Can be tested by implementing mobile navigation with React Navigation, using color tokens from @actual-app/components/theme to match desktop palette, and importing icons from @actual-app/components/icons for consistent visual language. Delivers cohesive brand experience.

**Acceptance Scenarios**:

1. **Given** mobile imports theme tokens from @actual-app/components, **When** styling components, **Then** semantic color names (pageBackground, tableText, etc.) map to mobile theme maintaining visual consistency
2. **Given** mobile imports icons from @actual-app/components/icons, **When** rendering logos/loading states, **Then** same SVG icons display as desktop (no mobile-specific icon set needed)
3. **Given** mobile uses React Navigation, **When** user navigates, **Then** native mobile patterns (stack navigation, bottom tabs) feel platform-appropriate while showing same data as desktop
4. **Given** mobile implements swipe gestures, **When** user swipes transaction, **Then** native mobile interaction triggers same Redux actions as desktop button clicks
5. **Given** mobile adapts desktop layout patterns, **When** rendering budget screen, **Then** information hierarchy matches desktop but layout optimized for mobile viewport

---

### Edge Cases

- **What happens when mobile imports desktop-client Redux slice but mobile React Native doesn't support a dependency?** System must detect incompatible dependencies during build and provide clear error messages. May need to create mobile-compatible versions of specific slices (document which slices work as-is vs need adaptation).
- **How does system handle when loot-core/platform interface changes?** Mobile platform adapters must be updated to match interface changes. Use TypeScript to catch interface mismatches at compile time, preventing runtime errors.
- **What happens when @actual-app/components web-specific code (Emotion CSS, React DOM) gets imported?** Build system must exclude web-specific code or provide mobile equivalents. Only import theme tokens and icons (platform-agnostic) not React components.
- **How does system handle when loot-core/server code uses Node.js-specific APIs?** Platform adapters must provide mobile equivalents (e.g., better-sqlite3 → Expo SQLite). If API has no mobile equivalent, document limitation and potentially exclude that loot-core feature from mobile.
- **What happens when Redux slice uses browser-specific middleware?** Configure Redux store with mobile-compatible middleware only. Document which desktop middleware can be reused vs must be adapted/excluded.

## Requirements *(mandatory)*

### Functional Requirements

#### Architecture & Package Reuse

- **FR-001**: Mobile app MUST be organized in monorepo as `packages/mobile-app/` alongside existing packages (desktop-client, loot-core, crdt, component-library)
- **FR-002**: Mobile app MUST import and reuse all utilities from `loot-core/shared/*` without duplication: query.ts, transactions.ts, schedules.ts, rules.ts, util.ts, arithmetic.ts, currencies.ts, months.ts
- **FR-003**: Mobile app MUST import and reuse all TypeScript data models from `loot-core/types/models` ensuring identical data structures across platforms
- **FR-004**: Mobile app MUST import and reuse CRDT sync logic from `@actual-app/crdt` package without modification for conflict-free replication
- **FR-005**: Mobile app MUST configure build system (Metro bundler) to resolve workspace packages correctly using Yarn workspace protocol

#### Redux State Management Reuse

- **FR-006**: Mobile app MUST import and reuse Redux slices from desktop-client without modification: accountsSlice, appSlice, budgetSlice, budgetfilesSlice, modalsSlice, notificationsSlice, payeesSlice, prefsSlice, transactionsSlice, tagsSlice, usersSlice
- **FR-007**: Mobile Redux store MUST use same combineReducers pattern as desktop-client/redux/store.ts
- **FR-008**: Mobile app MUST configure Redux store middleware compatible with React Native (exclude web-specific middleware)
- **FR-009**: Mobile app MUST use Redux Toolkit (@reduxjs/toolkit ^2.9.1) same version as desktop for compatibility
- **FR-010**: Mobile app MUST create typed hooks (useAppDispatch, useAppSelector) matching desktop-client patterns

#### Platform Abstraction Layer

- **FR-011**: Mobile app MUST implement platform adapters in `src/platform/` matching interfaces from `loot-core/platform/*`
- **FR-012**: Mobile app MUST implement SQLite adapter translating loot-core/platform/server/sqlite interface to Expo SQLite or react-native-quick-sqlite
- **FR-013**: Mobile app MUST implement FileSystem adapter translating loot-core/platform/server/fs interface to Expo FileSystem API
- **FR-014**: Mobile app MUST implement fetch adapter translating loot-core/platform/client/fetch interface to mobile fetch API
- **FR-015**: Mobile app MUST implement secure storage adapter for credentials using Expo SecureStore or equivalent

#### Business Logic Reuse from loot-core/server

- **FR-016**: Mobile app MUST use budget calculation logic from loot-core/server/budget without duplication
- **FR-017**: Mobile app MUST use database layer from loot-core/server/db with mobile SQLite adapter
- **FR-018**: Mobile app MUST use AQL (Actual Query Language) query engine from loot-core/server/aql
- **FR-019**: Mobile app MUST use import/export logic from loot-core/server/importers (OFX, QFX, CSV) where mobile-compatible
- **FR-020**: Mobile app MUST use filter logic from loot-core/server/filters

#### Component Library Reuse

- **FR-021**: Mobile app MUST import icons from @actual-app/components/icons (logo, loading indicators) as SVG assets compatible with React Native
- **FR-022**: Mobile app MUST reference color tokens from @actual-app/components/theme for semantic color naming (pageBackground, tableText, etc.) adapting to mobile theme system
- **FR-023**: Mobile app MUST NOT import web-specific React components from @actual-app/components (Button, Input, etc.) - these use React DOM
- **FR-024**: Mobile app SHOULD reference design patterns from @actual-app/components to maintain visual consistency where mobile-appropriate
- **FR-025**: Mobile app MAY create mobile-specific component library inspired by @actual-app/components patterns

#### Mobile-Specific UI Layer

- **FR-026**: Mobile app MUST implement UI layer in React Native with zero business logic duplication from reusable packages
- **FR-027**: Mobile app MUST use React Navigation for mobile-native navigation patterns (stack, tabs, drawer)
- **FR-028**: Mobile app MUST create mobile screens that dispatch actions to reused Redux slices
- **FR-029**: Mobile app MUST use mobile-appropriate UI components (React Native elements) not web components
- **FR-030**: Mobile app MUST implement mobile gestures (swipe, pull-to-refresh, long-press) triggering same business logic as desktop

#### Testing & Validation

- **FR-031**: Mobile app MUST have automated tests verifying imported Redux slices work in React Native environment
- **FR-032**: Mobile app MUST have tests verifying platform adapters correctly implement loot-core interfaces
- **FR-033**: Mobile app MUST have tests comparing mobile calculations to desktop using same inputs (budget amounts, transaction totals, etc.)
- **FR-034**: Mobile app MUST have tests verifying CRDT sync produces identical results between mobile and desktop
- **FR-035**: Mobile app MUST have tests verifying data models from loot-core/types serialize/deserialize identically on mobile

### Key Entities *(all reused from loot-core/types/models)*

- **Account**: Bank account/credit card entity - imported from loot-core/types/models - identical schema
- **Transaction**: Financial transaction entity - imported from loot-core/types/models - identical schema
- **Category**: Budget category entity - imported from loot-core/types/models - identical schema
- **CategoryGroup**: Category grouping entity - imported from loot-core/types/models - identical schema
- **Payee**: Transaction payee entity - imported from loot-core/types/models - identical schema
- **Rule**: Categorization rule entity - imported from loot-core/types/models - identical schema
- **Schedule**: Recurring transaction schedule - imported from loot-core/types/models - identical schema
- **Budget**: Monthly budget allocation - data model from loot-core - identical schema
- **User**: Multi-user entity - imported from loot-core/types/models - identical schema
- **Preference**: User preferences - imported from loot-core/types/prefs - identical schema

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mobile app successfully imports and uses 90%+ of existing code from packages (loot-core/shared, loot-core/types, @actual-app/crdt, desktop-client Redux slices) measured by import analysis
- **SC-002**: Mobile budget calculations match desktop calculations with 100% accuracy verified through automated test suite comparing outputs
- **SC-003**: Mobile Redux store uses all 11 slices from desktop-client without modification (accounts, app, budget, budgetfiles, modals, notifications, payees, prefs, transactions, tags, users)
- **SC-004**: Mobile platform adapters successfully implement all required loot-core/platform interfaces verified through interface compliance tests
- **SC-005**: CRDT sync between mobile and desktop produces identical conflict resolution results in 100% of test scenarios
- **SC-006**: Mobile app introduces zero business logic duplication (no reimplementation of calculations, rules, queries) verified through code review
- **SC-007**: Mobile data models match desktop models exactly (same TypeScript types from loot-core/types/models) verified through type checking
- **SC-008**: Mobile build successfully resolves all workspace package dependencies (@actual-app/crdt, loot-core, desktop-client) in monorepo
- **SC-009**: Mobile imports shared utilities (query builder, transaction logic, schedules, rules) from loot-core/shared producing same results as desktop
- **SC-010**: Mobile implements only UI layer and platform adapters as new code - all other layers reused from existing packages

## Assumptions & Dependencies

### Assumptions

1. **Redux Slice Compatibility**: Assuming desktop-client Redux slices use only React-agnostic logic (no React DOM specific code) enabling direct reuse in React Native
2. **loot-core Platform Abstraction**: Assuming loot-core/platform interfaces are well-defined and stable, allowing mobile to implement without upstream changes
3. **TypeScript Model Portability**: Assuming loot-core/types/models use only standard TypeScript (no web-specific types) enabling use in React Native
4. **CRDT Package Universality**: Assuming @actual-app/crdt package is platform-agnostic (no Node.js or browser-specific dependencies)
5. **Component Library Separation**: Assuming @actual-app/components theme tokens and icons can be extracted separately from web-specific React components
6. **SQLite Interface Consistency**: Assuming Expo SQLite or react-native-quick-sqlite can implement same interface as better-sqlite3 used by loot-core
7. **Workspace Package Resolution**: Assuming Metro bundler can be configured to resolve Yarn workspace packages correctly for monorepo
8. **Business Logic Purity**: Assuming loot-core/shared utilities are pure functions without platform dependencies
9. **Redux Middleware Compatibility**: Assuming most Redux middleware used by desktop is React Native compatible (or can be excluded without breaking functionality)
10. **Build Tool Flexibility**: Assuming Metro bundler supports necessary transformations for importing code from desktop-client and loot-core

### Dependencies

- **loot-core Package**: Core business logic, shared utilities, data models, platform interfaces, server logic - MUST be compatible with React Native environment
- **desktop-client Package**: Redux slices for state management - MUST work in React Native without modification
- **@actual-app/crdt Package**: CRDT synchronization - MUST be platform-agnostic
- **@actual-app/components Package**: Icons, theme tokens - MUST export assets compatible with React Native
- **Yarn Workspaces**: Monorepo tooling - MUST support adding mobile-app package
- **Metro Bundler**: React Native build tool - MUST resolve workspace packages
- **Expo SDK**: Mobile framework - version 54.0+ providing SQLite, FileSystem, SecureStore APIs
- **React Native**: Mobile UI framework - version 0.77+
- **Redux Toolkit**: State management - version 2.9.1+ (same as desktop)
- **TypeScript**: Type system - version 5.9+ (same as desktop)
- **Expo SQLite or react-native-quick-sqlite**: Mobile SQLite implementation compatible with loot-core requirements

## Out of Scope

- **Modifications to Existing Packages**: Mobile app must adapt to existing packages, not modify loot-core, desktop-client, crdt, or component-library
- **New Business Logic**: Mobile app creates zero new calculation algorithms, validation rules, or query logic - all reused
- **Redux Slice Modifications**: Mobile app uses desktop-client slices as-is, not creating mobile-specific versions or modifications
- **Platform Abstraction Changes**: Mobile app implements mobile platform adapters without changing loot-core/platform interfaces
- **CRDT Protocol Changes**: Mobile app uses @actual-app/crdt without modifications, maintaining protocol compatibility
- **Alternative State Management**: Mobile app uses Redux only - no alternative state solutions (MobX, Zustand, Context API)
- **Component Library Fork**: Mobile app does not create forked version of @actual-app/components - only extracts reusable assets
- **Backend Changes**: Mobile app makes zero changes to sync-server or API packages
- **Build System Modifications**: Mobile app adds Metro configuration but does not modify existing Vite/build configurations for other packages

## Constraints

### Architectural Constraints

- **Package Reuse Mandate**: Mobile app MUST reuse 90%+ of code from existing packages; duplicating business logic is prohibited
- **Monorepo Integration**: Mobile app MUST reside in packages/mobile-app/ and integrate with Yarn workspaces
- **Redux Orthodoxy**: Mobile app MUST use exact Redux slices from desktop-client; creating parallel state management is prohibited
- **Platform Adapter Pattern**: All platform-specific code MUST be isolated in src/platform/ implementing loot-core interfaces
- **Zero loot-core Changes**: Mobile app MUST work with loot-core as-is; modifying loot-core for mobile is prohibited
- **CRDT Immutability**: Mobile app MUST use @actual-app/crdt unchanged; mobile-specific sync protocols prohibited
- **TypeScript Strict Mode**: Mobile app MUST use TypeScript strict mode matching desktop configuration
- **Workspace Dependencies**: Internal dependencies MUST use workspace:* protocol in package.json

### Technical Constraints

- **Metro Bundler Limitations**: Must work within Metro's module resolution capabilities for workspace packages
- **React Native Compatibility**: All imported code must be compatible with React Native environment (no browser globals, no React DOM)
- **SQLite Interface Compatibility**: Mobile SQLite implementation must support all SQL operations used by loot-core/server/db
- **Build Time**: Metro bundler must successfully resolve and bundle desktop-client and loot-core code
- **Memory Constraints**: Mobile devices have limited memory - imported code must not bloat bundle excessively
- **Platform API Availability**: Mobile platform adapters limited to APIs provided by Expo SDK or React Native core

### Constitutional Constraints (from project constitution)

- **Principle I - Offline-First**: Full functionality without internet (already supported by loot-core architecture)
- **Principle II - Code Reuse Maximization**: 70-80% reuse REQUIRED (this spec targets 90%+ through package reuse)
- **Principle III - Privacy & Security First**: No changes to existing privacy model - reuse as-is
- **Principle IV - Cross-Platform Parity**: Identical functionality achieved through code reuse
- **Principle V - Performance Standards**: Reused code must perform adequately on mobile hardware
- **Principle VI - Testing Requirements**: Comprehensive testing of code reuse strategy required
