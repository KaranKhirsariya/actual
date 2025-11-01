/**
 * SQLite Adapter Contract for Mobile
 * 
 * This interface defines the SQLite adapter that mobile must implement
 * to be compatible with loot-core's expectations.
 * 
 * Source Reference: packages/loot-core/src/platform/server/sqlite/index.ts
 */

/**
 * Database handle (opaque type)
 * Implementation: QuickSQLiteConnection from react-native-quick-sqlite
 */
export type Database = any;

/**
 * Initialize SQLite module
 * Called once at app startup before any database operations
 */
export declare function init(): Promise<void>;

/**
 * Open a SQLite database
 * 
 * @param pathOrBuffer - Database name or path (mobile uses name only)
 * @returns Database handle for subsequent operations
 * 
 * Mobile Implementation:
 * - Use react-native-quick-sqlite's open({ name })
 * - Database stored in app's document directory
 */
export declare function openDatabase(pathOrBuffer?: string | Buffer): Database;

/**
 * Close a database connection
 * 
 * @param db - Database handle to close
 * 
 * Mobile Implementation:
 * - Call db.close() on QuickSQLiteConnection
 */
export declare function closeDatabase(db: Database): void;

/**
 * Run a SQL query (SELECT or INSERT/UPDATE/DELETE)
 * 
 * @param db - Database handle
 * @param sql - SQL query string
 * @param params - Query parameters (for prepared statements)
 * @param fetchAll - If true, return rows; if false, return { changes }
 * @returns Query results (rows array or changes object)
 * 
 * Mobile Implementation:
 * - Use db.execute(sql, params)
 * - If fetchAll: return result.rows._array
 * - Else: return { changes: result.rowsAffected }
 */
export declare function runQuery(
  db: Database,
  sql: string,
  params?: (string | number)[],
  fetchAll?: boolean,
): any;

/**
 * Execute a SQL statement (no result expected)
 * 
 * @param db - Database handle
 * @param sql - SQL statement to execute
 * 
 * Mobile Implementation:
 * - Use db.execute(sql)
 * - Don't return anything
 * 
 * Use Cases:
 * - CREATE TABLE statements
 * - Schema migrations
 * - PRAGMA statements
 */
export declare function execQuery(db: Database, sql: string): void;

/**
 * Run operations within a transaction (synchronous)
 * 
 * @param db - Database handle
 * @param fn - Function containing operations to run in transaction
 * 
 * Mobile Implementation:
 * - Use db.transaction(() => { fn(); return true; })
 * - Commit if fn completes, rollback if throws
 */
export declare function transaction(db: Database, fn: () => void): void;

/**
 * Run async operations within a transaction
 * 
 * @param db - Database handle
 * @param fn - Async function containing operations
 * @returns Promise that resolves when transaction commits
 * 
 * Mobile Implementation:
 * - Wrap in Promise
 * - Use db.transaction(async () => { await fn(); return true; })
 */
export declare function asyncTransaction(
  db: Database,
  fn: () => Promise<void>,
): Promise<void>;

/**
 * Export database as binary data
 * 
 * @param db - Database handle
 * @returns Database file contents as Uint8Array
 * 
 * Mobile Implementation:
 * - Get database file path from FileSystem
 * - Read file as base64
 * - Convert to Uint8Array
 * 
 * Use Case:
 * - Export budget file for sharing/backup
 */
export declare function exportDatabase(db: Database): Promise<Uint8Array>;

/**
 * Example Mobile Implementation:
 * 
 * ```typescript
 * import { open, QuickSQLiteConnection } from 'react-native-quick-sqlite';
 * 
 * export type Database = QuickSQLiteConnection;
 * 
 * export async function init(): Promise<void> {
 *   // No initialization needed
 * }
 * 
 * export function openDatabase(name: string = 'actual.db'): Database {
 *   return open({ name });
 * }
 * 
 * export function closeDatabase(db: Database): void {
 *   db.close();
 * }
 * 
 * export function runQuery(
 *   db: Database,
 *   sql: string,
 *   params: (string | number)[] = [],
 *   fetchAll: boolean = false
 * ): any {
 *   const result = db.execute(sql, params);
 *   return fetchAll ? (result.rows?._array || []) : { changes: result.rowsAffected };
 * }
 * 
 * export function execQuery(db: Database, sql: string): void {
 *   db.execute(sql);
 * }
 * 
 * export function transaction(db: Database, fn: () => void): void {
 *   db.transaction(() => {
 *     fn();
 *     return true; // commit
 *   });
 * }
 * 
 * export async function asyncTransaction(
 *   db: Database,
 *   fn: () => Promise<void>
 * ): Promise<void> {
 *   return new Promise((resolve, reject) => {
 *     db.transaction(async () => {
 *       try {
 *         await fn();
 *         resolve();
 *         return true; // commit
 *       } catch (error) {
 *         reject(error);
 *         return false; // rollback
 *       }
 *     });
 *   });
 * }
 * 
 * export async function exportDatabase(db: Database): Promise<Uint8Array> {
 *   const FileSystem = require('expo-file-system');
 *   const dbPath = `${FileSystem.documentDirectory}SQLite/${db.name}`;
 *   const base64 = await FileSystem.readAsStringAsync(dbPath, {
 *     encoding: FileSystem.EncodingType.Base64,
 *   });
 *   const binaryString = atob(base64);
 *   const bytes = new Uint8Array(binaryString.length);
 *   for (let i = 0; i < binaryString.length; i++) {
 *     bytes[i] = binaryString.charCodeAt(i);
 *   }
 *   return bytes;
 * }
 * ```
 */
