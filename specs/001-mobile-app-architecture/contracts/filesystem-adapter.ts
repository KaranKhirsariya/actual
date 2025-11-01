/**
 * FileSystem Adapter Contract for Mobile
 * 
 * This interface defines the FileSystem adapter that mobile must implement
 * to be compatible with loot-core's expectations.
 * 
 * Source Reference: packages/loot-core/src/platform/server/fs/index.ts
 */

/**
 * Initialize file system module
 * Called once at app startup to set up directories
 */
export declare function init(): void;

/**
 * Get data directory path
 * @returns Absolute path to app's data directory
 */
export declare function getDataDir(): string;

/**
 * Get document directory path
 * @returns Absolute path to app's document directory
 */
export declare function getDocumentDir(): string;

/**
 * Get budget directory path for specific budget
 * @param id - Budget ID
 * @returns Path to budget's directory
 */
export declare function getBudgetDir(id: string): string;

/**
 * Get base name of file path
 * @param filepath - Full file path
 * @returns File name without directory
 */
export declare function basename(filepath: string): string;

/**
 * List files/directories in a directory
 * @param filepath - Directory path
 * @returns Array of file/directory names
 */
export declare function listDir(filepath: string): Promise<string[]>;

/**
 * Check if file/directory exists
 * @param filepath - Path to check
 * @returns True if exists
 */
export declare function exists(filepath: string): Promise<boolean>;

/**
 * Create a directory (including parent directories)
 * @param filepath - Directory path to create
 */
export declare function mkdir(filepath: string): Promise<undefined>;

/**
 * Get file size in bytes
 * @param filepath - File path
 * @returns Size in bytes
 */
export declare function size(filepath: string): Promise<number>;

/**
 * Copy file from one location to another
 * @param frompath - Source file path
 * @param topath - Destination file path
 * @returns True if successful
 */
export declare function copyFile(
  frompath: string,
  topath: string,
): Promise<boolean>;

/**
 * Read file contents
 * @param filepath - File path
 * @param encoding - 'utf8' for text, 'binary' for bytes
 * @returns File contents as string or Buffer
 */
export declare function readFile(
  filepath: string,
  encoding: 'binary' | null,
): Promise<Buffer>;
export declare function readFile(
  filepath: string,
  encoding?: 'utf8',
): Promise<string>;

/**
 * Write file contents
 * @param filepath - File path
 * @param contents - Data to write (string or binary)
 */
export declare function writeFile(
  filepath: string,
  contents: string | ArrayBuffer | NodeJS.ArrayBufferView,
): Promise<undefined>;

/**
 * Delete a file
 * @param filepath - File path to delete
 */
export declare function removeFile(filepath: string): Promise<undefined>;

/**
 * Delete a directory (must be empty)
 * @param dirpath - Directory path to delete
 */
export declare function removeDir(dirpath: string): Promise<undefined>;

/**
 * Delete a directory and all contents
 * @param dirpath - Directory path to delete recursively
 */
export declare function removeDirRecursively(
  dirpath: string,
): Promise<undefined>;

/**
 * Get file modification time
 * @param filepath - File path
 * @returns ISO timestamp string
 */
export declare function getModifiedTime(filepath: string): Promise<string>;

/**
 * Example Mobile Implementation:
 * 
 * ```typescript
 * import * as FileSystem from 'expo-file-system';
 * import * as path from 'path';
 * 
 * let dataDir: string;
 * let documentDir: string;
 * 
 * export function init(): void {
 *   documentDir = FileSystem.documentDirectory || '';
 *   dataDir = `${documentDir}actual-data/`;
 *   FileSystem.makeDirectoryAsync(dataDir, { intermediates: true }).catch(() => {});
 * }
 * 
 * export function getDataDir(): string {
 *   return dataDir;
 * }
 * 
 * export function getDocumentDir(): string {
 *   return documentDir;
 * }
 * 
 * export function getBudgetDir(id: string): string {
 *   return `${dataDir}budgets/${id}/`;
 * }
 * 
 * export function basename(filepath: string): string {
 *   return path.basename(filepath);
 * }
 * 
 * export async function listDir(filepath: string): Promise<string[]> {
 *   return await FileSystem.readDirectoryAsync(filepath);
 * }
 * 
 * export async function exists(filepath: string): Promise<boolean> {
 *   const info = await FileSystem.getInfoAsync(filepath);
 *   return info.exists;
 * }
 * 
 * export async function mkdir(filepath: string): Promise<undefined> {
 *   await FileSystem.makeDirectoryAsync(filepath, { intermediates: true });
 *   return undefined;
 * }
 * 
 * export async function size(filepath: string): Promise<number> {
 *   const info = await FileSystem.getInfoAsync(filepath, { size: true });
 *   return info.exists && 'size' in info ? info.size : 0;
 * }
 * 
 * export async function copyFile(frompath: string, topath: string): Promise<boolean> {
 *   try {
 *     await FileSystem.copyAsync({ from: frompath, to: topath });
 *     return true;
 *   } catch {
 *     return false;
 *   }
 * }
 * 
 * export async function readFile(
 *   filepath: string,
 *   encoding: 'utf8' | 'binary' | null = 'utf8'
 * ): Promise<string | Buffer> {
 *   if (encoding === 'binary' || encoding === null) {
 *     const base64 = await FileSystem.readAsStringAsync(filepath, {
 *       encoding: FileSystem.EncodingType.Base64,
 *     });
 *     return Buffer.from(base64, 'base64');
 *   } else {
 *     return await FileSystem.readAsStringAsync(filepath);
 *   }
 * }
 * 
 * export async function writeFile(
 *   filepath: string,
 *   contents: string | ArrayBuffer | NodeJS.ArrayBufferView
 * ): Promise<undefined> {
 *   if (typeof contents === 'string') {
 *     await FileSystem.writeAsStringAsync(filepath, contents);
 *   } else {
 *     const buffer = Buffer.from(contents as ArrayBuffer);
 *     await FileSystem.writeAsStringAsync(filepath, buffer.toString('base64'), {
 *       encoding: FileSystem.EncodingType.Base64,
 *     });
 *   }
 *   return undefined;
 * }
 * 
 * export async function removeFile(filepath: string): Promise<undefined> {
 *   await FileSystem.deleteAsync(filepath, { idempotent: true });
 *   return undefined;
 * }
 * 
 * export async function removeDir(dirpath: string): Promise<undefined> {
 *   await FileSystem.deleteAsync(dirpath, { idempotent: true });
 *   return undefined;
 * }
 * 
 * export async function removeDirRecursively(dirpath: string): Promise<undefined> {
 *   await FileSystem.deleteAsync(dirpath, { idempotent: true });
 *   return undefined;
 * }
 * 
 * export async function getModifiedTime(filepath: string): Promise<string> {
 *   const info = await FileSystem.getInfoAsync(filepath);
 *   if (info.exists && 'modificationTime' in info) {
 *     return new Date(info.modificationTime * 1000).toISOString();
 *   }
 *   throw new Error(`File not found: ${filepath}`);
 * }
 * ```
 */
