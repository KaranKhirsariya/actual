<!--
SYNC IMPACT REPORT
==================
Version Change: INITIAL → 1.0.0
Created: 2025-11-01
Type: Initial Constitution Creation

Summary:
This is the initial constitution for the Actual Budget Mobile App project.
It establishes the core principles and governance for building a React Native + Expo
mobile application that maximizes code reuse from the existing loot-core business logic.

Added Sections:
- I. Offline-First Architecture (NON-NEGOTIABLE)
- II. Code Reuse Maximization
- III. Privacy & Security First
- IV. Cross-Platform Parity
- V. Performance Standards
- VI. Testing Requirements
- Technology Constraints
- Development Workflow
- Governance

Templates Requiring Updates:
✅ .specify/templates/spec-template.md - Aligned with principles
✅ .specify/templates/plan-template.md - Aligned with phased approach
✅ .specify/templates/tasks-template.md - Aligned with task categorization
✅ .specify/templates/checklist-template.md - Ready for feature checklists

Follow-up TODOs:
- None. All placeholders filled.
-->

# Actual Budget Mobile App Constitution

## Core Principles

### I. Offline-First Architecture (NON-NEGOTIABLE)

The mobile app MUST maintain full functionality without internet connectivity. All core features (budgeting, transactions, accounts, reports) MUST work completely offline. Synchronization is an optional enhancement, never a requirement for basic operation.

**Rationale:** Actual Budget's core value proposition is privacy and local-first data ownership. The mobile app must honor this principle by ensuring users can manage their finances anywhere, anytime, regardless of network availability. This aligns with the existing desktop and web application architecture.

**Requirements:**
- Local SQLite database MUST be the primary data store
- All CRUD operations MUST complete without network calls
- Sync operations MUST queue when offline and process when online
- No feature degradation when network unavailable
- CRDT-based conflict resolution for multi-device sync

### II. Code Reuse Maximization

The mobile app MUST reuse 70-80% of business logic from the existing `loot-core` package. New mobile-specific code MUST be limited to UI layer, platform adapters, and mobile-specific features (biometrics, haptics, notifications).

**Rationale:** The existing `loot-core` package contains battle-tested business logic, calculations, queries, and data models. Reusing this code ensures consistency across platforms, reduces development time, minimizes bugs, and simplifies maintenance.

**Requirements:**
- Redux store MUST import slices directly from `loot-core/client/*`
- Business logic MUST NOT be duplicated in mobile package
- Platform-specific implementations MUST use adapter pattern
- Query system MUST reuse `loot-core/client/queries`
- Validation and calculation logic MUST come from `loot-core`

### III. Privacy & Security First

User financial data MUST be protected with industry-standard security measures. No telemetry, analytics, or tracking MUST be implemented without explicit user consent and clear disclosure.

**Rationale:** Financial data is highly sensitive. Users trust Actual Budget because it respects privacy. The mobile app must maintain this trust through robust security and transparent data practices.

**Requirements:**
- Biometric authentication (Face ID, Touch ID, fingerprint) MUST be supported (Post MVP)
- Credentials MUST be stored in secure storage (Expo SecureStore)
- Database encryption at rest SHOULD be implemented for production (Should work same as desktop app)
- No third-party analytics SDKs without user opt-in
- All network communications MUST use HTTPS (can reuse existing code)
- App lock/timeout feature MUST be configurable (Post MVP)
- No data MUST leave device except for explicit user-initiated sync (Follow what desktop app does)

### IV. Cross-Platform Parity

The mobile app MUST provide feature parity with web/desktop versions within reasonable mobile UX constraints. Core budgeting functionality MUST work identically across all platforms.

**Rationale:** Users should be able to switch between desktop, web, and mobile seamlessly without encountering missing features or data inconsistencies. This ensures a cohesive user experience.

**Requirements:**
- All budget management features MUST be available on mobile
- Data models MUST match exactly across platforms
- Reports and insights MUST show same calculations
- Import/export functionality MUST support same formats
- Mobile-specific features (biometrics, haptics) are additions, not replacements
- UI patterns MAY differ for mobile ergonomics but functionality MUST NOT

### V. Performance Standards

The mobile app MUST deliver native-level performance. All user interactions MUST feel instant and smooth.

**Rationale:** Users expect mobile apps to be fast and responsive. Poor performance leads to abandonment. Given that users interact with budget apps daily, performance directly impacts user satisfaction and retention.

**Requirements:**
- UI MUST maintain 60fps during animations and scrolling
- List rendering MUST use FlashList for virtual scrolling
- App startup MUST complete in under 3 seconds on mid-range devices
- Large transaction lists (10,000+ items) MUST scroll smoothly
- Memory usage MUST stay under 150MB for typical usage
- Component rendering MUST use React.memo where appropriate

### VI. Testing Requirements

Comprehensive testing MUST cover business logic reuse, platform adapters, and mobile UI interactions. Tests MUST be automated and run on every pull request.

**Rationale:** Given the complexity of reusing shared business logic across platforms and the critical nature of financial data, robust testing is essential to prevent regressions and ensure reliability.

**Requirements:**
- Unit tests MUST cover all platform adapters (SQLite, file system, secure storage)
- Integration tests MUST verify loot-core integration points
- Component tests MUST use React Native Testing Library
- E2E tests MUST cover critical user flows (add transaction, create budget, sync)
- Test coverage MUST be at least 70% for new mobile-specific code
- Tests MUST run on CI for every PR
- Manual testing MUST occur on both iOS and Android physical devices before release

## Technology Constraints

### Mandated Stack

The following technology choices are **non-negotiable** for this project:

**Core Framework:**
- React Native 0.77.x or later
- Expo SDK 54.0 or later (managed workflow)
- TypeScript 5.9.x or later (strict mode enabled)

**State Management:**
- Redux Toolkit 2.9.x or later (reused from loot-core)
- React Redux 9.2.x or later

**Navigation:**
- React Navigation 7.x or later (native stack + bottom tabs)

**UI Framework:**
- Tamagui 1.x (preferred for performance) OR React Native Paper 5.x

**Database:**
- expo-sqlite 15.x OR react-native-quick-sqlite 8.x

**Key Libraries:**
- react-native-reanimated ~3.16.x (animations)
- react-native-gesture-handler ~2.20.x (gestures)
- @shopify/flash-list (list performance)
- date-fns 4.1.0 (date handling, reused)
- react-hook-form 7.x (forms)
- i18next 25.6.0 + react-i18next 16.0.0 (internationalization)

**Testing:**
- Jest 29.x (unit tests)
- React Native Testing Library 12.x (component tests)
- Detox 20.x (E2E tests)

### Architectural Constraints

**Monorepo Structure:**
- Mobile app MUST reside in `packages/mobile-app/`
- MUST integrate with existing Yarn workspaces
- MUST use workspace protocol for internal dependencies (`loot-core@workspace:*`)

**Code Organization:**
```
packages/mobile-app/
├── src/
│   ├── components/     # Mobile UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── hooks/          # Custom React hooks
│   ├── store/          # Redux store setup (imports from loot-core)
│   ├── platform/       # Platform-specific adapters
│   ├── theme/          # Theming configuration
│   ├── utils/          # Utilities
│   └── types/          # TypeScript type definitions
├── assets/             # Images, fonts, icons
├── __tests__/          # Test files
├── e2e/                # End-to-end tests
└── [config files]      # app.json, babel.config.js, metro.config.js, etc.
```

**Platform Abstraction:**
All platform-specific code (file system, SQLite, secure storage) MUST be isolated in `src/platform/` and MUST implement interfaces expected by loot-core.

## Development Workflow

### Implementation Phases

Development MUST follow this phased approach:

**Phase 1 (Week 1-2): Foundation**
- Project setup and monorepo integration
- Redux store with loot-core slices
- SQLite adapter implementation
- Platform-specific modules
- Navigation structure
- Theme configuration

**Phase 2 (Week 3-6): Core Features**
- Accounts module (list, detail, CRUD)
- Transactions module (list, add/edit, split, search, swipe actions)
- Budget module (overview, categories, allocation)
- Payees module (list, management, rules)

**Phase 3 (Week 7-10): Advanced Features**
- CRDT sync integration
- Reports and insights with charts
- Import/export functionality
- Rules engine
- Scheduled transactions

**Phase 4 (Week 11-14): Polish & Optimization**
- Dark mode refinement
- Animations and haptic feedback
- Performance optimization
- Security features (biometrics, app lock)
- Comprehensive testing

**Phase 5 (Week 15-16): Beta & Launch**
- Internal and external beta testing
- App store submission (iOS + Android)
- Documentation and support materials

### Code Review Requirements

All pull requests MUST:
- Pass automated tests (unit, integration, E2E)
- Meet TypeScript strict mode requirements (no `any` types)
- Include tests for new functionality
- Follow mobile performance best practices
- Verify compatibility with both iOS and Android
- Not introduce new dependencies without justification
- Maintain or improve code reuse percentage from loot-core

### Quality Gates

Before release, the following MUST be verified:
- All Phase 1-5 deliverables completed
- Test coverage ≥ 70% for mobile-specific code
- Performance benchmarks met (startup < 3s, 60fps scrolling)
- Security audit passed (biometrics, secure storage, encryption)
- Manual testing completed on:
  - iOS (latest 2 major versions)
  - Android (API 24+ covering 95% of users)
  - Physical devices (not just simulators)
- App store guidelines compliance verified
- Privacy policy updated for mobile app
- User documentation complete

### Mobile-Specific Considerations

**Offline Queue:**
Network operations MUST use an offline queue that:
- Persists operations when offline
- Automatically retries when connection restored
- Provides user feedback on sync status
- Handles conflicts with CRDT resolution

**Native Features:**
The following mobile-native features MUST be implemented:
- Biometric authentication (opt-in)
- Haptic feedback for important actions
- Pull-to-refresh on list screens
- Swipe gestures for common actions (delete, edit)
- Native share functionality for export
- System theme detection (light/dark mode)

**Performance Optimization:**
- Use FlashList for all long lists (transactions, accounts)
- Implement proper React.memo for list items
- Lazy load screens with React Navigation
- Optimize images with appropriate resolutions
- Enable Hermes JavaScript engine for production
- Use ProGuard for Android release builds

## Governance

### Constitution Authority

This constitution is the **supreme governing document** for the Actual Budget Mobile App project. All technical decisions, code reviews, and architectural choices MUST align with the principles and requirements defined herein.

In cases of conflict between this constitution and other documentation (README, comments, tickets), the constitution takes precedence.

### Amendment Process

Amendments to this constitution require:
1. **Proposal:** Document proposed changes with clear rationale
2. **Impact Analysis:** Assess effects on existing code, architecture, and timeline
3. **Review:** Team discussion and alignment on necessity
4. **Approval:** Consensus from project maintainers
5. **Migration Plan:** If changes affect existing code, provide migration strategy
6. **Version Bump:** Follow semantic versioning (see below)
7. **Template Sync:** Update all dependent templates and documentation

### Versioning Policy

Constitution version follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR:** Backward-incompatible principle changes, principle removal, or core architecture changes
- **MINOR:** New principles added, significant expansions to existing principles, or new sections
- **PATCH:** Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review

Compliance with this constitution MUST be verified:
- During code review for every pull request
- Before each phase completion milestone
- During release candidate preparation
- In post-mortems for major issues

Violations MUST be documented and addressed. Repeated violations indicate the constitution needs updating to reflect actual practices.

### Living Document

This constitution is a **living document** that evolves with the project. As we learn from implementation, testing, and user feedback, principles may need refinement. The amendment process ensures changes are deliberate and well-considered.

### Reference Documentation

For day-to-day development guidance, refer to:
- `MOBILE_APP_GUIDE.md` - Detailed technical implementation guide
- `.specify/templates/` - Specification and task templates
- `packages/loot-core/` - Shared business logic documentation

---

**Version:** 1.0.0
**Ratified:** 2025-11-01
**Last Amended:** 2025-11-01
**Maintainer:** Actual Budget Mobile Development Team
