/**
 * usePayees Hook
 * 
 * Fetches payees for autocomplete
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as backend from '../backend';

export interface Payee {
    id: string;
    name: string;
    category?: string;
    transfer_acct?: string;
}

export function usePayees() {
    const [payees, setPayees] = useState<Payee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadPayees = useCallback(async () => {
        if (!backend.isInitialized()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await backend.getPayees();
            setPayees((data as Payee[]) || []);
        } catch (err) {
            console.error('[usePayees] Failed to load:', err);
            setError(err instanceof Error ? err : new Error('Failed to load payees'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPayees();
    }, [loadPayees]);

    const refetch = useCallback(async () => {
        await loadPayees();
    }, [loadPayees]);

    // Get payee by ID
    const getPayeeById = useCallback((id: string) => {
        return payees.find(p => p.id === id);
    }, [payees]);

    // Search payees by name
    const searchPayees = useCallback((query: string, limit = 10): Payee[] => {
        if (!query) return payees.slice(0, limit);

        const lowerQuery = query.toLowerCase();
        return payees
            .filter(p => p.name.toLowerCase().includes(lowerQuery))
            .slice(0, limit);
    }, [payees]);

    // Sorted payees by name
    const sortedPayees = useMemo(() => {
        return [...payees].sort((a, b) => a.name.localeCompare(b.name));
    }, [payees]);

    return {
        payees: sortedPayees,
        isLoading,
        error,
        getPayeeById,
        searchPayees,
        refetch,
    };
}
