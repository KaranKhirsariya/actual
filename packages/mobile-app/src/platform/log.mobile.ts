/**
 * Mobile Platform: Logging Implementation
 *
 * Simple logging using React Native's console.
 */

let verboseMode = false;

/**
 * Set verbose logging mode
 */
export function setVerboseMode(enabled: boolean): void {
    verboseMode = enabled;
}

/**
 * Check if verbose mode is enabled
 */
export function isVerboseMode(): boolean {
    return verboseMode;
}

/**
 * Logger object with standard logging methods
 */
export const logger = {
    log: (...args: unknown[]): void => {
        console.log('[Actual]', ...args);
    },

    info: (...args: unknown[]): void => {
        console.info('[Actual]', ...args);
    },

    warn: (...args: unknown[]): void => {
        console.warn('[Actual]', ...args);
    },

    error: (...args: unknown[]): void => {
        console.error('[Actual]', ...args);
    },

    debug: (...args: unknown[]): void => {
        if (verboseMode) {
            console.debug('[Actual Debug]', ...args);
        }
    },

    trace: (...args: unknown[]): void => {
        if (verboseMode) {
            console.trace('[Actual Trace]', ...args);
        }
    },
};

// Export individual functions for direct use
export const { log, info, warn, error, debug, trace } = logger;
