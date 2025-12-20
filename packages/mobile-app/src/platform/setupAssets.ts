/**
 * Platform Assets Setup
 * 
 * This module handles copying bundled assets (like default-db.sqlite) 
 * to the app's document directory where loot-core can find them.
 * 
 * IMPORTANT: Also copies to SQLite/ folder where expo-sqlite actually looks
 * 
 * Must run BEFORE loot-core initialization.
 */

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

// Import the bundled database asset
// eslint-disable-next-line @typescript-eslint/no-require-imports
const defaultDbAsset = require('../../assets/data/default-db.sqlite');

/**
 * Set up bundled assets in the document directory
 * This copies the default-db.sqlite to:
 * 1. Document directory root (for loot-core's fs.bundledDatabasePath)
 * 2. SQLite/ folder (where expo-sqlite actually stores databases)
 */
export async function setupBundledAssets(): Promise<void> {
    const dataDir = FileSystem.documentDirectory;
    if (!dataDir) {
        throw new Error('Document directory not available');
    }

    // Load the asset first
    const asset = Asset.fromModule(defaultDbAsset);
    await asset.downloadAsync();

    if (!asset.localUri) {
        throw new Error('Failed to download default-db.sqlite asset');
    }

    // Path 1: Document directory root (for loot-core fs.bundledDatabasePath)
    const defaultDbPath = `${dataDir}default-db.sqlite`;
    const dbInfo = await FileSystem.getInfoAsync(defaultDbPath);
    if (!dbInfo.exists) {
        console.log('[SetupAssets] Copying bundled default-db.sqlite to doc root...');
        await FileSystem.copyAsync({
            from: asset.localUri,
            to: defaultDbPath,
        });
        console.log('[SetupAssets] Copied default-db.sqlite to:', defaultDbPath);
    } else {
        console.log('[SetupAssets] default-db.sqlite already exists in doc root');
    }

    // Path 2: SQLite/ folder (where expo-sqlite actually looks for databases)
    // This is CRITICAL: expo-sqlite's openDatabaseSync creates databases here
    const sqliteDir = `${dataDir}SQLite/`;
    const sqliteDbPath = `${sqliteDir}db.sqlite`;

    // Ensure SQLite directory exists
    const sqliteDirInfo = await FileSystem.getInfoAsync(sqliteDir);
    if (!sqliteDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
    }

    // Always copy to SQLite folder to ensure we have the latest template
    // (This ensures the template with all tables is in place before openDatabaseSync)
    const sqliteDbInfo = await FileSystem.getInfoAsync(sqliteDbPath);
    if (!sqliteDbInfo.exists) {
        console.log('[SetupAssets] Copying template to SQLite/ folder for expo-sqlite...');
        await FileSystem.copyAsync({
            from: asset.localUri,
            to: sqliteDbPath,
        });
        console.log('[SetupAssets] Copied db.sqlite template to:', sqliteDbPath);
    } else {
        console.log('[SetupAssets] db.sqlite already exists in SQLite/ folder');
    }
}
