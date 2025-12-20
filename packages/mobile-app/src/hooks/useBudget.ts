/**
 * useBudget Hook
 * 
 * Fetches and manages budget data for a specific month
 */

import { useState, useEffect, useCallback } from 'react';
import * as backend from '../backend';

export interface BudgetCategory {
    id: string;
    name: string;
    budgeted: number;
    spent: number;
    balance: number;
    carryover?: number;
}

export interface BudgetGroup {
    id: string;
    name: string;
    is_income: boolean;
    hidden: boolean;
    categories: BudgetCategory[];
}

export interface BudgetMonth {
    month: string;
    incomeAvailable: number;
    toBudget: number;
    categoryGroups: BudgetGroup[];
}

export function useBudget(month: string) {
    const [data, setData] = useState<BudgetMonth | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadBudget = useCallback(async () => {
        if (!backend.isInitialized() || !month) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await backend.getBudgetMonth(month);
            setData(result as BudgetMonth);
        } catch (err) {
            console.error('[useBudget] Failed to load:', err);
            setError(err instanceof Error ? err : new Error('Failed to load budget'));
        } finally {
            setIsLoading(false);
        }
    }, [month]);

    useEffect(() => {
        loadBudget();
    }, [loadBudget]);

    const setBudgetAmount = useCallback(async (categoryId: string, amount: number) => {
        if (!month) return;

        await backend.setBudgetAmount(month, categoryId, amount);
        // Refetch to get updated data
        await loadBudget();
    }, [month, loadBudget]);

    const refetch = useCallback(async () => {
        await loadBudget();
    }, [loadBudget]);

    return {
        data,
        isLoading,
        error,
        setBudgetAmount,
        refetch,
    };
}
