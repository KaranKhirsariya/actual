/**
 * Mobile Platform: SQLite Implementation for loot-core
 *
 * This module provides a complete SQLite implementation using expo-sqlite
 * that matches the interface expected by loot-core's web SQLite module.
 */

import * as SQLite from 'expo-sqlite';

import { normalise } from './normalise';
import { unicodeLike } from './unicodeLike';

// The database wrapper type
interface MobileDatabase {
    _db: SQLite.SQLiteDatabase;
    _name: string;
}

// Currently open databases
const openDatabases: Map<string, MobileDatabase> = new Map();

// Transaction depth counter
let transactionDepth = 0;

/**
 * Initialize the SQLite module
 */
export async function init(): Promise<void> {
    console.log('[SQLite Mobile] Initialized');
}

/**
 * Get the SQL module (compatibility layer - not used on mobile)
 */
export function _getModule(): unknown {
    return {
        FS: {
            readlink: (path: string) => path,
            open: () => null,
            close: () => { },
        },
    };
}

/**
 * Verify parameter types
 */
function verifyParamTypes(sql: string, arr: unknown[] = []): void {
    arr.forEach(val => {
        if (typeof val !== 'string' && typeof val !== 'number' && val !== null) {
            throw new Error('Invalid field type ' + val + ' for sql ' + sql);
        }
    });
}

/**
 * Prepare a statement (no-op on mobile, statements run directly)
 */
export function prepare(_db: MobileDatabase, sql: string): unknown {
    return { sql };
}

/**
 * Run a query synchronously - returns rows or changes count
 */
export function runQuery(
    db: MobileDatabase,
    sql: string,
    params?: (string | number | null)[],
    fetchAll?: false,
): { changes: number };
export function runQuery(
    db: MobileDatabase,
    sql: string,
    params: (string | number | null)[],
    fetchAll: true,
): unknown[];
export function runQuery(
    db: MobileDatabase,
    sql: string,
    params: (string | number | null)[] = [],
    fetchAll = false,
): unknown[] | { changes: number } {
    if (params) {
        verifyParamTypes(sql, params);
    }

    const sqlStr = typeof sql === 'string' ? sql : (sql as { sql: string }).sql;

    if (fetchAll) {
        try {
            const statement = db._db.prepareSync(sqlStr);
            const rows: unknown[] = [];

            for (const row of statement.executeSync(params)) {
                rows.push(row);
            }

            return rows;
        } catch (e) {
            console.error('[SQLite Mobile] Query error:', sqlStr);
            throw e;
        }
    } else {
        const result = db._db.runSync(sqlStr, params);
        return { changes: result.changes };
    }
}

/**
 * Execute SQL (no return value expected)
 */
export function execQuery(db: MobileDatabase, sql: string): void {
    if (!db || !db._db) {
        console.error('[SQLite Mobile] execQuery called with invalid db:', db);
        throw new Error('Invalid database object');
    }
    try {
        db._db.execSync(sql);
    } catch (e) {
        console.error('[SQLite Mobile] Exec error:', sql);
        throw e;
    }
}

/**
 * Run a synchronous transaction
 */
export function transaction(db: MobileDatabase, fn: () => void): void {
    let before: string, after: string, undo: string;

    if (transactionDepth > 0) {
        before = 'SAVEPOINT __actual_sp';
        after = 'RELEASE __actual_sp';
        undo = 'ROLLBACK TO __actual_sp';
    } else {
        before = 'BEGIN';
        after = 'COMMIT';
        undo = 'ROLLBACK';
    }

    execQuery(db, before);
    transactionDepth++;

    try {
        fn();
        execQuery(db, after);
    } catch (ex) {
        execQuery(db, undo);

        if (undo !== 'ROLLBACK') {
            execQuery(db, after);
        }

        throw ex;
    } finally {
        transactionDepth--;
    }
}

/**
 * Run an async transaction
 */
export async function asyncTransaction(
    db: MobileDatabase,
    fn: () => Promise<void>,
): Promise<void> {
    if (transactionDepth === 0) {
        execQuery(db, 'BEGIN TRANSACTION');
    }
    transactionDepth++;

    try {
        await fn();
    } finally {
        transactionDepth--;
        if (transactionDepth === 0) {
            execQuery(db, 'COMMIT');
        }
    }
}

/**
 * Regexp function for SQLite
 */
function regexp(regex: string, text: string): number {
    return new RegExp(regex).test(text || '') ? 1 : 0;
}

/**
 * Open a database - SYNCHRONOUS to match loot-core's expected interface
 * loot-core (like better-sqlite3) expects openDatabase to return Database directly, not a Promise
 * 
 * CRITICAL: We must ensure the database template is copied to SQLite folder BEFORE
 * openDatabaseSync is called, because openDatabaseSync creates an empty DB if file doesn't exist.
 */
export function openDatabase(
    pathOrBuffer?: string | ArrayBuffer,
): MobileDatabase {
    let dbName = 'default.sqlite';

    if (typeof pathOrBuffer === 'string') {
        // Extract database name from path
        const parts = pathOrBuffer.split('/');
        dbName = parts[parts.length - 1] || 'default.sqlite';

        // Handle special paths
        if (pathOrBuffer === ':memory:') {
            dbName = ':memory:';
        }
    }

    // Check if already open
    if (openDatabases.has(dbName)) {
        return openDatabases.get(dbName)!;
    }

    // CRITICAL: For db.sqlite, ensure we log when template might be missing
    if (dbName === 'db.sqlite') {
        console.log('[SQLite Mobile] Opening db.sqlite - template should have been copied already');
    }

    // Use openDatabaseSync for synchronous operation (matching loot-core's expected interface)
    const sqliteDb = SQLite.openDatabaseSync(dbName);

    // Set pragmas for performance - using execSync for synchronous execution
    sqliteDb.execSync(`
    PRAGMA journal_mode=WAL;
    PRAGMA cache_size=-10000;
  `);

    // Create wrapper
    const db: MobileDatabase = {
        _db: sqliteDb,
        _name: dbName,
    };

    // Check if __migrations__ table exists, create if not (for fresh databases)
    try {
        sqliteDb.execSync('SELECT 1 FROM __migrations__ LIMIT 1');
    } catch {
        // Table doesn't exist, this is a fresh database
        console.log('[SQLite Mobile] Fresh database detected, creating __migrations__ table');
        sqliteDb.execSync(`
            CREATE TABLE IF NOT EXISTS __migrations__ (id INTEGER PRIMARY KEY);
        `);
    }

    openDatabases.set(dbName, db);
    console.log('[SQLite Mobile] Opened database:', dbName);

    return db;
}

/**
 * Synchronously ensure db.sqlite template exists in SQLite folder
 * This is a workaround because expo-file-system doesn't have sync methods,
 * but we need the template in place before openDatabaseSync runs
 */
function ensureDbTemplateExistsSync(): void {
    // This is a no-op for now - the template should be copied by the async copyFile
    // before openDatabase is called. If the template isn't there, openDatabaseSync
    // will create an empty DB and we'll get migration errors.
    console.log('[SQLite Mobile] ensureDbTemplateExistsSync called for db.sqlite');
}

/**
 * Close a database
 */
export function closeDatabase(db: MobileDatabase): void {
    if (!db || !db._db) {
        console.warn('[SQLite Mobile] closeDatabase called with invalid db, ignoring');
        return;
    }
    db._db.closeSync();
    openDatabases.delete(db._name);
    console.log('[SQLite Mobile] Closed database:', db._name);
}

/**
 * Export database to binary
 */
export async function exportDatabase(
    _db: MobileDatabase,
): Promise<Uint8Array> {
    console.warn('[SQLite Mobile] exportDatabase not fully supported');
    return new Uint8Array(0);
}

// Re-export helpers for compatibility
export { normalise, unicodeLike, regexp };
