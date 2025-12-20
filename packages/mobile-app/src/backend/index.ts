/**
 * Mobile Backend
 *
 * This module initializes loot-core using the pre-built mobile bundle
 * which uses expo-sqlite for native SQLite support.
 */

import * as ExpoFileSystem from 'expo-file-system';

// Import the pre-built loot-core mobile bundle
// Built via: cd packages/loot-core && yarn vite build --config ./vite.mobile.config.ts
import * as lootCore from 'loot-core/lib-dist/mobile/loot-core.mobile.js';

// Types
type EventCallback = (args: unknown) => void;

// The loot-core lib interface (from main.ts export)
interface LootCoreLib {
    getDataDir: () => string;
    sendMessage: (msg: string, args?: unknown) => unknown;
    send: <T = unknown>(name: string, args?: unknown) => Promise<T>;
    on: (name: string, func: (...args: unknown[]) => void) => void;
    q: (table: string) => QueryBuilder;
    db: unknown;
    amountToInteger: (amount: number) => number;
    integerToAmount: (integer: number) => number;
}

interface QueryBuilder {
    select: (fields: string | string[]) => QueryBuilder;
    filter: (conditions: Record<string, unknown>) => QueryBuilder;
    orderBy: (order: Record<string, 'asc' | 'desc'>) => QueryBuilder;
    limit: (n: number) => QueryBuilder;
    serialize: () => unknown;
}

// State
let _lib: LootCoreLib | null = null;
let _isInitialized = false;
const _eventListeners = new Map<string, EventCallback[]>();

/**
 * Get the data directory for the app
 */
function getDataDir(): string {
    const docDir = ExpoFileSystem.documentDirectory;
    return docDir ? `${docDir}actual-data/` : '/actual-data/';
}

/**
 * Ensure the data directory exists
 */
async function ensureDataDir(): Promise<void> {
    const dataDir = getDataDir();
    const info = await ExpoFileSystem.getInfoAsync(dataDir);
    if (!info.exists) {
        await ExpoFileSystem.makeDirectoryAsync(dataDir, { intermediates: true });
        console.log('[Backend] Created data directory:', dataDir);
    }
}

/**
 * Initialize the backend with loot-core
 */
export async function init(): Promise<void> {
    if (_isInitialized) {
        console.log('[Backend] Already initialized');
        return;
    }

    console.log('[Backend] Initializing loot-core...');

    try {
        await ensureDataDir();

        // The init function returns the lib object
        const lib = await lootCore.init({
            dataDir: getDataDir(),
        });

        // Debug: Log what lib contains
        console.log('[Backend] lib type:', typeof lib);
        console.log('[Backend] lib keys:', lib ? Object.keys(lib as object) : 'null');
        console.log('[Backend] lib.send type:', lib ? typeof (lib as { send?: unknown }).send : 'null');

        _lib = lib as LootCoreLib;
        _isInitialized = true;
        console.log('[Backend] loot-core initialized successfully');
    } catch (error) {
        console.error('[Backend] Failed to initialize loot-core:', error);
        throw error;
    }
}

/**
 * Check if backend is initialized
 */
export function isInitialized(): boolean {
    return _isInitialized;
}

/**
 * Get the loot-core lib reference
 */
export function getLib(): LootCoreLib | null {
    return _lib;
}

// ============ High-level API methods ============

/**
 * Get list of available budgets
 */
export async function getBudgets(): Promise<unknown[]> {
    if (!_lib) throw new Error('Backend not initialized');
    return _lib.send('get-budgets');
}

/**
 * Load a specific budget
 */
export async function loadBudget(id: string): Promise<unknown> {
    if (!_lib) throw new Error('Backend not initialized');
    return _lib.send('load-budget', { id });
}

/**
 * Get all accounts
 */
export async function getAccounts(): Promise<unknown[]> {
    if (!_lib) throw new Error('Backend not initialized');
    return _lib.send('accounts-get');
}

/**
 * Get budget data for a month
 */
export async function getBudgetMonth(month: string): Promise<unknown> {
    if (!_lib) throw new Error('Backend not initialized');
    return _lib.send('api/budget-month', { month });
}

/**
 * Set budget amount for a category
 */
export async function setBudgetAmount(
    month: string,
    categoryId: string,
    amount: number,
): Promise<unknown> {
    if (!_lib) throw new Error('Backend not initialized');
    return _lib.send('api/budget-set-amount', { month, categoryId, amount });
}

/**
 * Get all category groups
 */
export async function getCategoryGroups(): Promise<unknown[]> {
    if (!_lib) throw new Error('Backend not initialized');
    return _lib.send('get-category-groups');
}

/**
 * Get transactions
 */
export async function getTransactions(
    accountId?: string,
    startDate?: string,
    endDate?: string,
): Promise<unknown[]> {
    if (!_lib) throw new Error('Backend not initialized');

    let query = _lib.q('transactions').select('*');

    if (accountId) {
        query = query.filter({ account: accountId });
    }
    if (startDate) {
        query = query.filter({ date: { $gte: startDate } });
    }
    if (endDate) {
        query = query.filter({ date: { $lte: endDate } });
    }

    query = query.orderBy({ date: 'desc' }).limit(100);

    const result = await _lib.send<{ data?: unknown[] }>('query', query.serialize());
    return result?.data || [];
}

/**
 * Add a new transaction
 */
export async function addTransaction(transaction: {
    account: string;
    date: string;
    amount: number;
    payee_name?: string;
    category?: string;
    notes?: string;
}): Promise<unknown> {
    if (!_lib) throw new Error('Backend not initialized');
    return _lib.send('transaction-add', transaction);
}

/**
 * Sync with server
 */
export async function sync(): Promise<unknown> {
    if (!_lib) throw new Error('Backend not initialized');
    return _lib.send('sync');
}

/**
 * Get all payees
 */
export async function getPayees(): Promise<unknown[]> {
    if (!_lib) throw new Error('Backend not initialized');
    return _lib.send('payees-get');
}

// ============ Event handling ============

/**
 * Listen for backend events
 */
export function listen(event: string, callback: EventCallback): () => void {
    const listeners = _eventListeners.get(event) || [];
    listeners.push(callback);
    _eventListeners.set(event, listeners);

    // Also register with loot-core if available
    if (_lib) {
        _lib.on(event, callback as (...args: unknown[]) => void);
    }

    return () => {
        const current = _eventListeners.get(event) || [];
        _eventListeners.set(
            event,
            current.filter(cb => cb !== callback),
        );
    };
}

/**
 * Emit an event to listeners
 */
export function emit(event: string, args?: unknown): void {
    const listeners = _eventListeners.get(event) || [];
    listeners.forEach(callback => {
        try {
            callback(args);
        } catch (error) {
            console.error(`[Backend] Error in event listener for ${event}:`, error);
        }
    });
}
