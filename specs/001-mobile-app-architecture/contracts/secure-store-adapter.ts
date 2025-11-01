/**
 * SecureStore Adapter Contract for Mobile
 * 
 * This interface defines the SecureStore adapter for mobile-specific
 * secure credential storage (not in loot-core, mobile addition).
 * 
 * Uses: Expo SecureStore for iOS Keychain and Android Keystore integration
 */

/**
 * Get item from secure storage
 * 
 * @param key - Item key
 * @returns Item value or null if not found
 * 
 * Use Cases:
 * - Retrieve sync server credentials
 * - Get encryption keys
 * - Load saved passwords
 */
export declare function getItem(key: string): Promise<string | null>;

/**
 * Set item in secure storage
 * 
 * @param key - Item key
 * @param value - Item value to store
 * 
 * Use Cases:
 * - Store sync server credentials
 * - Save encryption keys
 * - Store authentication tokens
 * 
 * Security:
 * - iOS: Stored in Keychain
 * - Android: Stored in Keystore (encrypted)
 */
export declare function setItem(key: string, value: string): Promise<void>;

/**
 * Delete item from secure storage
 * 
 * @param key - Item key to delete
 * 
 * Use Cases:
 * - User logs out
 * - Credentials invalidated
 * - Security requirement to clear data
 */
export declare function deleteItem(key: string): Promise<void>;

/**
 * Example Mobile Implementation:
 * 
 * ```typescript
 * import * as SecureStore from 'expo-secure-store';
 * 
 * export async function getItem(key: string): Promise<string | null> {
 *   try {
 *     return await SecureStore.getItemAsync(key);
 *   } catch (error) {
 *     console.error('SecureStore getItem error:', error);
 *     return null;
 *   }
 * }
 * 
 * export async function setItem(key: string, value: string): Promise<void> {
 *   try {
 *     await SecureStore.setItemAsync(key, value);
 *   } catch (error) {
 *     console.error('SecureStore setItem error:', error);
 *     throw error;
 *   }
 * }
 * 
 * export async function deleteItem(key: string): Promise<void> {
 *   try {
 *     await SecureStore.deleteItemAsync(key);
 *   } catch (error) {
 *     console.error('SecureStore deleteItem error:', error);
 *   }
 * }
 * ```
 * 
 * Example Usage:
 * 
 * ```typescript
 * import * as SecureStore from '../platform/secure-store-adapter';
 * 
 * // Store sync credentials
 * await SecureStore.setItem('sync-token', userToken);
 * await SecureStore.setItem('sync-url', syncServerUrl);
 * 
 * // Retrieve credentials
 * const token = await SecureStore.getItem('sync-token');
 * const url = await SecureStore.getItem('sync-url');
 * 
 * // Clear on logout
 * await SecureStore.deleteItem('sync-token');
 * await SecureStore.deleteItem('sync-url');
 * ```
 */
