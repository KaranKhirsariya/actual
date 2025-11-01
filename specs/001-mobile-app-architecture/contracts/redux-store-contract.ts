/**
 * Redux Store Contract for Mobile
 * 
 * This defines the Redux store structure for mobile, showing all
 * imported slices from desktop-client (100% reuse).
 */

import type { PayloadAction } from '@reduxjs/toolkit';

/**
 * Root State Type
 * Combines all slice states into single app state
 */
export interface RootState {
  accounts: AccountsState;
  app: AppState;
  budget: BudgetState;
  budgetfiles: BudgetFilesState;
  modals: ModalsState;
  notifications: NotificationsState;
  payees: PayeesState;
  prefs: PrefsState;
  transactions: TransactionsState;
  tags: TagsState;
  users: UsersState;
}

/**
 * App Dispatch Type
 * Type-safe dispatch function
 */
export type AppDispatch = any; // Actual type from store.dispatch

/**
 * Slice State Types (imported from desktop-client)
 */

// AccountsSlice from desktop-client/src/accounts/accountsSlice.ts
export interface AccountsState {
  accounts: any[]; // AccountEntity[]
  selectedAccountId: string | null;
  loading: boolean;
  error: string | null;
}

// AppSlice from desktop-client/src/app/appSlice.ts
export interface AppState {
  isLoading: boolean;
  loadingText: string | null;
  updateInfo: any | null;
}

// BudgetSlice from desktop-client/src/budget/budgetSlice.ts
export interface BudgetState {
  categories: any[]; // CategoryEntity[]
  categoryGroups: any[]; // CategoryGroupEntity[]
  currentMonth: string;
  bounds: { start: string; end: string };
}

// BudgetFilesSlice from desktop-client/src/budgetfiles/budgetfilesSlice.ts
export interface BudgetFilesState {
  budgets: any[]; // BudgetMetadata[]
  currentBudgetId: string | null;
}

// ModalsSlice from desktop-client/src/modals/modalsSlice.ts
export interface ModalsState {
  stack: any[]; // Modal[]
}

// NotificationsSlice from desktop-client/src/notifications/notificationsSlice.ts
export interface NotificationsState {
  notifications: any[]; // Notification[]
}

// PayeesSlice from desktop-client/src/payees/payeesSlice.ts
export interface PayeesState {
  list: any[]; // PayeeEntity[]
}

// PrefsSlice from desktop-client/src/prefs/prefsSlice.ts
export interface PrefsState {
  local: any; // LocalPrefs
  global: any; // GlobalPrefs
}

// TransactionsSlice from desktop-client/src/transactions/transactionsSlice.ts
export interface TransactionsState {
  items: any[]; // TransactionEntity[]
  selectedIds: string[];
  filters: any;
}

// TagsSlice from desktop-client/src/tags/tagsSlice.ts
export interface TagsState {
  list: any[]; // TagEntity[]
}

// UsersSlice from desktop-client/src/users/usersSlice.ts
export interface UsersState {
  currentUser: any | null; // UserEntity | null
  users: any[]; // UserEntity[]
}

/**
 * Example Store Configuration:
 * 
 * ```typescript
 * import { configureStore } from '@reduxjs/toolkit';
 * 
 * // Import all 11 slices from desktop-client
 * import accountsSlice from 'desktop-client/src/accounts/accountsSlice';
 * import appSlice from 'desktop-client/src/app/appSlice';
 * import budgetSlice from 'desktop-client/src/budget/budgetSlice';
 * import budgetfilesSlice from 'desktop-client/src/budgetfiles/budgetfilesSlice';
 * import modalsSlice from 'desktop-client/src/modals/modalsSlice';
 * import notificationsSlice from 'desktop-client/src/notifications/notificationsSlice';
 * import payeesSlice from 'desktop-client/src/payees/payeesSlice';
 * import prefsSlice from 'desktop-client/src/prefs/prefsSlice';
 * import transactionsSlice from 'desktop-client/src/transactions/transactionsSlice';
 * import tagsSlice from 'desktop-client/src/tags/tagsSlice';
 * import usersSlice from 'desktop-client/src/users/usersSlice';
 * 
 * export const store = configureStore({
 *   reducer: {
 *     accounts: accountsSlice.reducer,
 *     app: appSlice.reducer,
 *     budget: budgetSlice.reducer,
 *     budgetfiles: budgetfilesSlice.reducer,
 *     modals: modalsSlice.reducer,
 *     notifications: notificationsSlice.reducer,
 *     payees: payeesSlice.reducer,
 *     prefs: prefsSlice.reducer,
 *     transactions: transactionsSlice.reducer,
 *     tags: tagsSlice.reducer,
 *     users: usersSlice.reducer,
 *   },
 *   middleware: (getDefaultMiddleware) =>
 *     getDefaultMiddleware({
 *       serializableCheck: {
 *         ignoredActions: [],
 *       },
 *     }),
 * });
 * 
 * export type RootState = ReturnType<typeof store.getState>;
 * export type AppDispatch = typeof store.dispatch;
 * ```
 * 
 * Typed Hooks:
 * 
 * ```typescript
 * import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
 * import type { RootState, AppDispatch } from './index';
 * 
 * export const useAppDispatch: () => AppDispatch = useDispatch;
 * export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
 * ```
 * 
 * Usage in Components:
 * 
 * ```typescript
 * import { useAppSelector, useAppDispatch } from '../store/hooks';
 * import { setAccounts } from 'desktop-client/src/accounts/accountsSlice';
 * 
 * function AccountsScreen() {
 *   const dispatch = useAppDispatch();
 *   const accounts = useAppSelector(state => state.accounts.accounts);
 *   
 *   useEffect(() => {
 *     // Dispatch action from desktop-client slice
 *     dispatch(setAccounts(fetchedAccounts));
 *   }, []);
 *   
 *   return <AccountList accounts={accounts} />;
 * }
 * ```
 */
