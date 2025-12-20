/**
 * Simplified types for mobile app
 * These mirror the core types from loot-core but are simplified for initial development
 */

export type AccountEntity = {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
    offbudget: boolean;
    closed: boolean;
    balance: number; // in cents
    bank?: string;
    sort_order?: number;
};

export type TransactionEntity = {
    id: string;
    account: string;
    date: string; // YYYY-MM-DD
    payee_name?: string;
    payee?: string; // payee ID
    category: string | null;
    amount: number; // in cents (negative for outflow)
    notes?: string;
    cleared?: boolean;
    reconciled?: boolean;
    transfer_id?: string;
    is_parent?: boolean;
    is_child?: boolean;
    parent_id?: string;
};

export type CategoryEntity = {
    id: string;
    name: string;
    group_id: string;
    hidden?: boolean;
    is_income?: boolean;
};

export type CategoryGroupEntity = {
    id: string;
    name: string;
    hidden?: boolean;
    is_income?: boolean;
};

export type PayeeEntity = {
    id: string;
    name: string;
    category?: string;
    transfer_acct?: string;
};

export type BudgetMonth = {
    month: string; // YYYY-MM
    categories: BudgetCategory[];
};

export type BudgetCategory = {
    id: string;
    name: string;
    budgeted: number;
    spent: number;
    balance: number;
    carryover?: number;
};
