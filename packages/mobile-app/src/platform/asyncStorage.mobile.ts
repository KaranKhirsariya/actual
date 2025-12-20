/**
 * Mobile Platform: Async Storage Implementation
 *
 * Uses @react-native-async-storage/async-storage for persistence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@actual:';

/**
 * Initialize async storage
 */
export function init(options?: { persist?: boolean }): void {
    console.log('[AsyncStorage Mobile] Initialized', options);
}

/**
 * Get an item from storage
 */
export async function getItem(key: string): Promise<string | null> {
    try {
        const value = await AsyncStorage.getItem(PREFIX + key);
        if (value === null) return null;

        // Try to parse JSON values
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    } catch (error) {
        console.error('[AsyncStorage Mobile] getItem error:', error);
        return null;
    }
}

/**
 * Set an item in storage
 */
export async function setItem(key: string, value: unknown): Promise<void> {
    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await AsyncStorage.setItem(PREFIX + key, stringValue);
    } catch (error) {
        console.error('[AsyncStorage Mobile] setItem error:', error);
    }
}

/**
 * Remove an item from storage
 */
export async function removeItem(key: string): Promise<void> {
    try {
        await AsyncStorage.removeItem(PREFIX + key);
    } catch (error) {
        console.error('[AsyncStorage Mobile] removeItem error:', error);
    }
}

/**
 * Get multiple items
 */
export async function multiGet(
    keys: string[],
): Promise<Array<[string, string | null]>> {
    try {
        const prefixedKeys = keys.map(k => PREFIX + k);
        const results = await AsyncStorage.multiGet(prefixedKeys);
        return results.map(([k, v]) => [k.replace(PREFIX, ''), v]);
    } catch (error) {
        console.error('[AsyncStorage Mobile] multiGet error:', error);
        return keys.map(k => [k, null]);
    }
}

/**
 * Set multiple items
 */
export async function multiSet(
    keyValuePairs: Array<[string, unknown]>,
): Promise<void> {
    try {
        const pairs = keyValuePairs.map(([k, v]) => [
            PREFIX + k,
            typeof v === 'string' ? v : JSON.stringify(v),
        ]) as Array<[string, string]>;
        await AsyncStorage.multiSet(pairs);
    } catch (error) {
        console.error('[AsyncStorage Mobile] multiSet error:', error);
    }
}

/**
 * Get all keys
 */
export async function getAllKeys(): Promise<string[]> {
    try {
        const keys = await AsyncStorage.getAllKeys();
        return keys
            .filter(k => k.startsWith(PREFIX))
            .map(k => k.replace(PREFIX, ''));
    } catch (error) {
        console.error('[AsyncStorage Mobile] getAllKeys error:', error);
        return [];
    }
}

/**
 * Clear all storage
 */
export async function clear(): Promise<void> {
    try {
        const keys = await getAllKeys();
        await AsyncStorage.multiRemove(keys.map(k => PREFIX + k));
    } catch (error) {
        console.error('[AsyncStorage Mobile] clear error:', error);
    }
}

/**
 * Remove multiple items
 */
export async function multiRemove(keys: string[]): Promise<void> {
    try {
        const prefixedKeys = keys.map(k => PREFIX + k);
        await AsyncStorage.multiRemove(prefixedKeys);
    } catch (error) {
        console.error('[AsyncStorage Mobile] multiRemove error:', error);
    }
}
