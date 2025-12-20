/**
 * Mobile Platform: Fetch Implementation
 *
 * Uses React Native's built-in fetch.
 */

/**
 * Fetch wrapper for loot-core compatibility
 */
export async function fetch(
    url: string,
    options?: RequestInit,
): Promise<Response> {
    return global.fetch(url, options);
}

export default fetch;
