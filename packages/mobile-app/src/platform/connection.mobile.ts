/**
 * Mobile Platform: Connection Implementation
 *
 * Unlike the web version which uses Web Workers for communication,
 * the mobile app runs loot-core directly in the same JavaScript context.
 * This module provides a simplified connection interface.
 */

// Generic handlers type to avoid loot-core import issues
type Handlers = Record<string, (args?: unknown) => Promise<unknown>>;

// Event listeners for server-pushed events
type EventCallback = (args: unknown) => void;
const eventListeners = new Map<string, EventCallback[]>();

// Store handlers reference for direct invocation
let _handlers: Handlers | null = null;

/**
 * Initialize the connection
 * On mobile, we don't need a message channel since loot-core runs in the same context
 */
export function init(
    _channel: unknown,
    handlers: Handlers,
): void {
    _handlers = handlers;
    console.log('[Connection Mobile] Initialized with direct handler access');
}

/**
 * Send a push notification to listeners
 */
export function send(name: string, args?: unknown): void {
    const listeners = eventListeners.get(name) || [];
    listeners.forEach(callback => {
        try {
            callback(args);
        } catch (error) {
            console.error(`[Connection Mobile] Error in listener for ${name}:`, error);
        }
    });
}

/**
 * Get number of connected clients (always 1 on mobile)
 */
export function getNumClients(): number {
    return 1;
}

/**
 * Reset all event listeners
 */
export function resetEvents(): void {
    eventListeners.clear();
}

/**
 * Subscribe to server-pushed events
 */
export function onEvent(name: string, callback: EventCallback): () => void {
    const listeners = eventListeners.get(name) || [];
    listeners.push(callback);
    eventListeners.set(name, listeners);

    // Return unsubscribe function
    return () => {
        const current = eventListeners.get(name) || [];
        eventListeners.set(
            name,
            current.filter(cb => cb !== callback),
        );
    };
}

/**
 * Get the handlers reference (for direct invocation if needed)
 */
export function getHandlers(): Handlers | null {
    return _handlers;
}
