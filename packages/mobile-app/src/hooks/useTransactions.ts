/**
 * useTransactions Hook
 * 
 * Fetches and manages transactions
 */

import { useState, useEffect, useCallback } from 'react';
import * as backend from '../backend';

export interface Transaction {
    id: string;
    account: string;
    date: string;
    amount: number;
    payee?: string;
    payee_name?: string;
    category?: string | null;
    notes?: string;
    cleared?: boolean;
    reconciled?: boolean;
    is_parent?: boolean;
    is_child?: boolean;
    parent_id?: string;
}

interface UseTransactionsOptions {
    accountId?: string;
    startDate?: string;
    endDate?: string;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
    const { accountId, startDate, endDate } = options;
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadTransactions = useCallback(async () => {
        if (!backend.isInitialized()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (accountId) {
                const data = await backend.getTransactions(accountId, startDate, endDate);
                setTransactions((data as Transaction[]) || []);
            } else {
                // Get all recent transactions
                const today = new Date().toISOString().split('T')[0];
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    .toISOString().split('T')[0];

                // Get transactions from all accounts - need to get accounts first
                const accounts = await backend.getAccounts();
                const allTransactions: Transaction[] = [];

                for (const account of (accounts as Array<{ id: string }>)) {
                    const txns = await backend.getTransactions(account.id, thirtyDaysAgo, today);
                    allTransactions.push(...((txns as Transaction[]) || []));
                }

                // Sort by date descending
                allTransactions.sort((a, b) => b.date.localeCompare(a.date));
                setTransactions(allTransactions);
            }
        } catch (err) {
            console.error('[useTransactions] Failed to load:', err);
            setError(err instanceof Error ? err : new Error('Failed to load transactions'));
        } finally {
            setIsLoading(false);
        }
    }, [accountId, startDate, endDate]);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const addTransaction = useCallback(async (
        targetAccountId: string,
        transaction: {
            date: string;
            amount: number;
            payee_name?: string;
            category?: string | null;
            notes?: string;
        },
    ) => {
        await backend.addTransaction(targetAccountId, [transaction]);
        // Refetch to get updated list
        await loadTransactions();
    }, [loadTransactions]);

    const refetch = useCallback(async () => {
        await loadTransactions();
    }, [loadTransactions]);

    return {
        transactions,
        isLoading,
        error,
        addTransaction,
        refetch,
    };
}
