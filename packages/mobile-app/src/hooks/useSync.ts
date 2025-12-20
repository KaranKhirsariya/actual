/**
 * useSync Hook
 * 
 * Manages synchronization with the server
 */

import { useState, useCallback, useEffect } from 'react';
import * as backend from '../backend';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export function useSync() {
    const [status, setStatus] = useState<SyncStatus>('idle');
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [error, setError] = useState<Error | null>(null);

    // Listen for sync events
    useEffect(() => {
        const unsubscribe = backend.listen('sync-event', (data) => {
            console.log('[useSync] Sync event:', data);
        });

        return () => unsubscribe();
    }, []);

    const sync = useCallback(async () => {
        if (!backend.isInitialized()) {
            console.warn('[useSync] Backend not initialized');
            return false;
        }

        if (status === 'syncing') {
            console.log('[useSync] Already syncing...');
            return false;
        }

        setStatus('syncing');
        setError(null);

        try {
            await backend.sync();
            setStatus('success');
            setLastSyncTime(new Date());

            // Reset to idle after a short delay
            setTimeout(() => {
                setStatus('idle');
            }, 2000);

            return true;
        } catch (err) {
            console.error('[useSync] Sync failed:', err);
            setError(err instanceof Error ? err : new Error('Sync failed'));
            setStatus('error');
            return false;
        }
    }, [status]);

    return {
        status,
        lastSyncTime,
        error,
        sync,
        isSyncing: status === 'syncing',
    };
}
