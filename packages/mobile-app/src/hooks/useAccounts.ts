/**
 * useAccounts Hook
 * 
 * Fetches and manages account data from loot-core
 */

import { useState, useEffect, useCallback } from 'react';
import * as backend from '../backend';

export interface Account {
    id: string;
    name: string;
    type: string;
    offbudget: boolean;
    closed: boolean;
    bank?: string;
    bankId?: string;
    balance?: number;
}

export function useAccounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadAccounts = useCallback(async () => {
        if (!backend.isInitialized()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await backend.getAccounts();
            setAccounts((data as Account[]) || []);
        } catch (err) {
            console.error('[useAccounts] Failed to load:', err);
            setError(err instanceof Error ? err : new Error('Failed to load accounts'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const refetch = useCallback(async () => {
        await loadAccounts();
    }, [loadAccounts]);

    return {
        accounts,
        isLoading,
        error,
        refetch,
    };
}
