/**
 * useCategories Hook
 * 
 * Fetches category groups with their categories
 */

import { useState, useEffect, useCallback } from 'react';
import * as backend from '../backend';

export interface Category {
    id: string;
    name: string;
    group_id: string;
    hidden: boolean;
    is_income: boolean;
}

export interface CategoryGroup {
    id: string;
    name: string;
    hidden: boolean;
    is_income: boolean;
    categories: Category[];
}

export function useCategories() {
    const [groups, setGroups] = useState<CategoryGroup[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadCategories = useCallback(async () => {
        if (!backend.isInitialized()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await backend.getCategoryGroups();
            const groupsData = (data as CategoryGroup[]) || [];
            setGroups(groupsData);

            // Flatten categories for easy lookup
            const allCategories = groupsData.flatMap(g => g.categories || []);
            setCategories(allCategories);
        } catch (err) {
            console.error('[useCategories] Failed to load:', err);
            setError(err instanceof Error ? err : new Error('Failed to load categories'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const refetch = useCallback(async () => {
        await loadCategories();
    }, [loadCategories]);

    // Get category by ID
    const getCategoryById = useCallback((id: string) => {
        return categories.find(c => c.id === id);
    }, [categories]);

    // Get expense groups (non-income)
    const expenseGroups = groups.filter(g => !g.is_income);

    // Get income groups
    const incomeGroups = groups.filter(g => g.is_income);

    return {
        groups,
        categories,
        expenseGroups,
        incomeGroups,
        isLoading,
        error,
        getCategoryById,
        refetch,
    };
}
