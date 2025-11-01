/**
 * Fetch Adapter Contract for Mobile
 * 
 * This interface defines the Fetch adapter that mobile must implement
 * for network operations with loot-core.
 * 
 * Source Reference: packages/loot-core/src/platform/client/fetch/index.ts
 */

/**
 * Fetch function compatible with standard Fetch API
 * 
 * React Native provides global fetch by default, which is compatible
 * with loot-core's expectations. No custom implementation needed.
 * 
 * Mobile Implementation:
 * Simply re-export the global fetch:
 * 
 * ```typescript
 * // packages/mobile-app/src/platform/fetch-adapter.ts
 * export const fetch = globalThis.fetch;
 * export default fetch;
 * ```
 * 
 * Use Cases:
 * - Sync server communication (CRDT sync)
 * - Import/export operations (bank sync)
 * - User authentication
 * - File uploads/downloads
 */
export declare const fetch: typeof globalThis.fetch;
export default fetch;

/**
 * Example Usage in Mobile:
 * 
 * ```typescript
 * import { fetch } from '../platform/fetch-adapter';
 * 
 * // Sync with server
 * const response = await fetch('https://sync.actualbudget.com/sync', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Authorization': `Bearer ${token}`,
 *   },
 *   body: JSON.stringify({
 *     merkle: localMerkle,
 *     operations: pendingOps,
 *   }),
 * });
 * 
 * const data = await response.json();
 * ```
 */
