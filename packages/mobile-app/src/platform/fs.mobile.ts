/**
 * Mobile Platform: File System Implementation
 *
 * Uses expo-file-system for all file operations.
 */

import * as ExpoFileSystem from 'expo-file-system';

let documentDir = '';

export const bundledDatabasePath = 'default-db.sqlite';
export const migrationsPath = '/migrations';
export const demoBudgetPath = '/demo-budget';

/**
 * Initialize the fs module
 */
export async function init(): Promise<void> {
    // Document directory will be set via _setDocumentDir
    console.log('[FS Mobile] Initialized');
}

/**
 * Set the document directory
 */
export function _setDocumentDir(dir: string): void {
    documentDir = dir;
}

/**
 * Get the data directory
 */
export function getDataDir(): string {
    return ExpoFileSystem.documentDirectory || '';
}

/**
 * Get the document directory
 */
export function getDocumentDir(): string {
    return documentDir;
}

/**
 * Get the budget directory for a budget ID
 */
export function getBudgetDir(budgetId: string): string {
    return join(documentDir, budgetId);
}

/**
 * Join path components
 */
export function join(...parts: string[]): string {
    return parts
        .map((p, i) => {
            if (i === 0) return p.replace(/\/$/, '');
            return p.replace(/^\//, '').replace(/\/$/, '');
        })
        .filter(p => p)
        .join('/');
}

/**
 * Get basename (directory part) of a path
 */
export function basename(filepath: string): string {
    const parts = filepath.split('/');
    return parts.slice(0, -1).join('/');
}

/**
 * Convert filepath to ID
 */
export function pathToId(filepath: string): string {
    return filepath.replace(/^\//, '').replace(/\//g, '-');
}

/**
 * Check if a file/directory exists
 */
export async function exists(filepath: string): Promise<boolean> {
    try {
        const fullPath = resolveFullPath(filepath);
        const info = await ExpoFileSystem.getInfoAsync(fullPath);
        return info.exists;
    } catch {
        return false;
    }
}

/**
 * Create a directory
 */
export async function mkdir(filepath: string): Promise<void> {
    const fullPath = resolveFullPath(filepath);
    await ExpoFileSystem.makeDirectoryAsync(fullPath, { intermediates: true });
}

/**
 * List contents of a directory
 * Returns empty array if directory doesn't exist (needed for migrations folder on mobile)
 */
export async function listDir(filepath: string): Promise<string[]> {
    const fullPath = resolveFullPath(filepath);

    // Check if directory exists first
    const info = await ExpoFileSystem.getInfoAsync(fullPath);
    if (!info.exists) {
        // Return empty array for non-existent directories
        // This is needed for migrations folder which doesn't exist on mobile
        // The pre-bundled JS migrations will handle everything
        console.log('[FS Mobile] Directory not found, returning empty list:', filepath);
        return [];
    }

    const files = await ExpoFileSystem.readDirectoryAsync(fullPath);
    return files;
}

/**
 * Get file size
 */
export async function size(filepath: string): Promise<number> {
    const fullPath = resolveFullPath(filepath);
    const info = await ExpoFileSystem.getInfoAsync(fullPath);
    return (info as { size?: number }).size || 0;
}

/**
 * Read file contents
 */
export async function readFile(
    filepath: string,
    encoding: 'utf8' | 'binary' = 'utf8',
): Promise<string | Uint8Array> {
    const fullPath = resolveFullPath(filepath);

    if (encoding === 'binary') {
        const base64 = await ExpoFileSystem.readAsStringAsync(fullPath, {
            encoding: ExpoFileSystem.EncodingType.Base64,
        });
        return base64ToUint8Array(base64);
    }

    return ExpoFileSystem.readAsStringAsync(fullPath, {
        encoding: ExpoFileSystem.EncodingType.UTF8,
    });
}

/**
 * Write file contents
 */
export async function writeFile(
    filepath: string,
    contents: string | Uint8Array | ArrayBuffer,
): Promise<boolean> {
    const fullPath = resolveFullPath(filepath);

    // Ensure parent directory exists
    const dir = basename(fullPath);
    if (dir) {
        try {
            await ExpoFileSystem.makeDirectoryAsync(dir, { intermediates: true });
        } catch {
            // Directory may already exist
        }
    }

    if (typeof contents === 'string') {
        await ExpoFileSystem.writeAsStringAsync(fullPath, contents, {
            encoding: ExpoFileSystem.EncodingType.UTF8,
        });
    } else {
        const uint8 = contents instanceof ArrayBuffer
            ? new Uint8Array(contents)
            : contents;
        const base64 = uint8ArrayToBase64(uint8);
        await ExpoFileSystem.writeAsStringAsync(fullPath, base64, {
            encoding: ExpoFileSystem.EncodingType.Base64,
        });
    }

    return true;
}

/**
 * Copy a file
 * Special handling for database: copies to expo-sqlite's SQLite folder
 * expo-sqlite looks for databases in documentDirectory/SQLite/, not our actual-data folder
 */
export async function copyFile(from: string, to: string): Promise<boolean> {
    const fromPath = resolveFullPath(from);
    let toPath = resolveFullPath(to);

    // DEBUG: Log path resolution
    console.log('[FS Mobile] copyFile - from:', from, '-> resolved:', fromPath);
    console.log('[FS Mobile] copyFile - to:', to, '-> resolved:', toPath);
    console.log('[FS Mobile] copyFile - bundledDatabasePath:', bundledDatabasePath);

    // Special handling for database files: expo-sqlite expects DBs in documentDirectory/SQLite/
    const isDbFile = to.endsWith('.sqlite') || to.endsWith('db.sqlite');
    if (isDbFile) {
        const dbName = to.split('/').pop() || 'db.sqlite';
        const sqliteDir = (ExpoFileSystem.documentDirectory || '') + 'SQLite/';

        // Ensure SQLite directory exists
        const sqliteDirInfo = await ExpoFileSystem.getInfoAsync(sqliteDir);
        if (!sqliteDirInfo.exists) {
            await ExpoFileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
        }

        toPath = sqliteDir + dbName;
        console.log('[FS Mobile] copyFile - redirecting DB to expo-sqlite location:', toPath);
    }

    // Check if source exists
    const sourceInfo = await ExpoFileSystem.getInfoAsync(fromPath);
    console.log('[FS Mobile] copyFile - source exists:', sourceInfo.exists);

    if (!sourceInfo.exists) {
        // Special case: if this is the bundled database path, create empty database
        if (from === bundledDatabasePath || from.endsWith('default-db.sqlite')) {
            console.log('[FS Mobile] Creating empty database at:', toPath);

            // Ensure parent directory exists
            const parentDir = dirname(toPath);
            const parentInfo = await ExpoFileSystem.getInfoAsync(parentDir);
            if (!parentInfo.exists) {
                await ExpoFileSystem.makeDirectoryAsync(parentDir, { intermediates: true });
            }

            // Create an empty file
            await ExpoFileSystem.writeAsStringAsync(toPath, '', {
                encoding: ExpoFileSystem.EncodingType.UTF8,
            });
            return true;
        }

        throw new Error(`Source file not found: ${fromPath}`);
    }

    console.log('[FS Mobile] copyFile - copying from bundled DB template to:', toPath);
    await ExpoFileSystem.copyAsync({ from: fromPath, to: toPath });
    return true;
}

/**
 * Get directory name from path
 */
function dirname(filepath: string): string {
    const parts = filepath.split('/');
    parts.pop();
    return parts.join('/');
}

/**
 * Remove a file
 */
export async function removeFile(filepath: string): Promise<void> {
    const fullPath = resolveFullPath(filepath);
    await ExpoFileSystem.deleteAsync(fullPath, { idempotent: true });
}

/**
 * Remove a directory
 */
export async function removeDir(filepath: string): Promise<void> {
    const fullPath = resolveFullPath(filepath);
    await ExpoFileSystem.deleteAsync(fullPath, { idempotent: true });
}

/**
 * Remove directory recursively
 */
export async function removeDirRecursively(filepath: string): Promise<void> {
    await removeDir(filepath);
}

/**
 * Get modified time (not fully supported on mobile)
 */
export async function getModifiedTime(filepath: string): Promise<number> {
    const fullPath = resolveFullPath(filepath);
    const info = await ExpoFileSystem.getInfoAsync(fullPath);
    return (info as { modificationTime?: number }).modificationTime || Date.now();
}

/**
 * Populate file hierarchy (no-op on mobile)
 */
export async function populateFileHeirarchy(): Promise<void> {
    // Not needed on mobile
}

// Helper functions

function resolveFullPath(filepath: string): string {
    // Already a full path
    if (filepath.startsWith('file://') || filepath.startsWith(ExpoFileSystem.documentDirectory || '')) {
        return filepath;
    }

    // For virtual paths like /documents, map to document directory
    if (filepath.startsWith('/documents')) {
        return (ExpoFileSystem.documentDirectory || '') + filepath.slice(11);
    }

    // For paths starting with /, remove the leading slash to avoid double slashes
    if (filepath.startsWith('/')) {
        return (ExpoFileSystem.documentDirectory || '') + filepath.slice(1);
    }

    // For other paths, append directly
    return (ExpoFileSystem.documentDirectory || '') + filepath;
}

function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function uint8ArrayToBase64(uint8: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
        binary += String.fromCharCode(uint8[i]);
    }
    return btoa(binary);
}
