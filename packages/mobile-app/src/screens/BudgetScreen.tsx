import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';

import { useBudget, useSync } from '../hooks';
import { formatCurrency, formatMonth, getCurrentMonth } from '../utils/format';

// Month navigation helpers
function addMonths(month: string, count: number): string {
    const [year, m] = month.split('-').map(Number);
    const date = new Date(year, m - 1 + count, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    return `${newYear}-${newMonth}`;
}

interface CategoryRowProps {
    name: string;
    budgeted: number;
    spent: number;
    available: number;
    onPress?: () => void;
}

function CategoryRow({ name, budgeted, spent, available, onPress }: CategoryRowProps) {
    const isOverspent = available < 0;
    const isLow = available > 0 && available < budgeted * 0.2;

    const progress = budgeted > 0 ? Math.min(Math.abs(spent) / budgeted, 1) : 0;

    return (
        <TouchableOpacity style={styles.categoryRow} onPress={onPress}>
            <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{name}</Text>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${progress * 100}%`,
                                backgroundColor: isOverspent ? '#ef4444' : '#6366f1'
                            }
                        ]}
                    />
                </View>
                <Text style={styles.categorySpent}>
                    {formatCurrency(Math.abs(spent))} of {formatCurrency(budgeted)}
                </Text>
            </View>
            <Text style={[
                styles.categoryAvailable,
                isOverspent ? styles.negative : isLow ? styles.warning : styles.positive
            ]}>
                {formatCurrency(available)}
            </Text>
        </TouchableOpacity>
    );
}

interface CategoryGroupProps {
    name: string;
    categories: Array<{
        id: string;
        name: string;
        budgeted: number;
        spent: number;
        balance: number;
    }>;
    isCollapsed: boolean;
    onToggle: () => void;
    onCategoryPress?: (categoryId: string) => void;
}

function CategoryGroup({
    name,
    categories,
    isCollapsed,
    onToggle,
    onCategoryPress
}: CategoryGroupProps) {
    const groupAvailable = categories.reduce((sum, c) => sum + c.balance, 0);

    return (
        <View style={styles.categoryGroup}>
            <TouchableOpacity style={styles.groupHeader} onPress={onToggle}>
                <View style={styles.groupLeft}>
                    <Text style={styles.groupChevron}>{isCollapsed ? '▶' : '▼'}</Text>
                    <Text style={styles.groupName}>{name.toUpperCase()}</Text>
                </View>
                <Text style={[
                    styles.groupAvailable,
                    groupAvailable >= 0 ? styles.positive : styles.negative
                ]}>
                    {formatCurrency(groupAvailable)}
                </Text>
            </TouchableOpacity>

            {!isCollapsed && (
                <View style={styles.categoryList}>
                    {categories.map(category => (
                        <CategoryRow
                            key={category.id}
                            name={category.name}
                            budgeted={category.budgeted}
                            spent={Math.abs(category.spent)}
                            available={category.balance}
                            onPress={() => onCategoryPress?.(category.id)}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

export function BudgetScreen() {
    const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
    const { data: budget, isLoading, refetch } = useBudget(currentMonth);
    const { sync, isSyncing } = useSync();
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    const onRefresh = useCallback(async () => {
        await sync();
        await refetch();
    }, [sync, refetch]);

    const goToPrevMonth = useCallback(() => {
        setCurrentMonth(prev => addMonths(prev, -1));
    }, []);

    const goToNextMonth = useCallback(() => {
        setCurrentMonth(prev => addMonths(prev, 1));
    }, []);

    const goToCurrentMonth = useCallback(() => {
        setCurrentMonth(getCurrentMonth());
    }, []);

    const toggleGroup = useCallback((groupId: string) => {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    }, []);

    const isCurrentMonth = currentMonth === getCurrentMonth();

    // Calculate ready to assign (simplified)
    const readyToAssign = budget?.toBudget || 0;

    if (isLoading && !budget) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    // Filter expense groups (non-income)
    const expenseGroups = (budget?.categoryGroups || []).filter(g => !g.is_income && !g.hidden);

    return (
        <View style={styles.container}>
            {/* Month Picker */}
            <View style={styles.monthPicker}>
                <TouchableOpacity onPress={goToPrevMonth} style={styles.monthNav}>
                    <Text style={styles.monthNavText}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goToCurrentMonth}>
                    <Text style={styles.monthTitle}>{formatMonth(currentMonth)}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goToNextMonth} style={styles.monthNav}>
                    <Text style={styles.monthNavText}>›</Text>
                </TouchableOpacity>
                {!isCurrentMonth && (
                    <TouchableOpacity
                        style={styles.todayButton}
                        onPress={goToCurrentMonth}
                    >
                        <Text style={styles.todayButtonText}>Today</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isSyncing}
                        onRefresh={onRefresh}
                        tintColor="#6366f1"
                        colors={['#6366f1']}
                    />
                }
            >
                {/* Ready to Assign Card */}
                <View style={[
                    styles.readyToAssignCard,
                    readyToAssign >= 0 ? styles.readyPositive : styles.readyNegative
                ]}>
                    <Text style={styles.readyLabel}>Ready to Assign</Text>
                    <Text style={styles.readyAmount}>{formatCurrency(readyToAssign)}</Text>
                    {readyToAssign !== 0 && (
                        <View style={styles.readyActions}>
                            <TouchableOpacity style={styles.readyButton}>
                                <Text style={styles.readyButtonText}>
                                    {readyToAssign > 0 ? 'Assign' : 'Cover'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Category Groups */}
                {expenseGroups.length > 0 ? (
                    expenseGroups.map(group => (
                        <CategoryGroup
                            key={group.id}
                            name={group.name}
                            categories={group.categories || []}
                            isCollapsed={collapsedGroups.has(group.id)}
                            onToggle={() => toggleGroup(group.id)}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyTitle}>No Budget Data</Text>
                        <Text style={styles.emptyText}>
                            Create a budget to start tracking your spending
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e2e',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#1e1e2e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthPicker: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    monthNav: {
        padding: 8,
    },
    monthNavText: {
        fontSize: 28,
        color: '#6366f1',
        fontWeight: 'bold',
    },
    monthTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    todayButton: {
        position: 'absolute',
        right: 16,
        backgroundColor: '#374151',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    todayButtonText: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    readyToAssignCard: {
        margin: 16,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    readyPositive: {
        backgroundColor: 'rgba(74, 222, 128, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.3)',
    },
    readyNegative: {
        backgroundColor: 'rgba(248, 113, 113, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(248, 113, 113, 0.3)',
    },
    readyLabel: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 4,
    },
    readyAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    readyActions: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 12,
    },
    readyButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    readyButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    categoryGroup: {
        marginBottom: 8,
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    groupLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    groupChevron: {
        fontSize: 12,
        color: '#9ca3af',
    },
    groupName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9ca3af',
        letterSpacing: 1,
    },
    groupAvailable: {
        fontSize: 14,
        fontWeight: '600',
    },
    categoryList: {
        marginHorizontal: 16,
        backgroundColor: '#2d2d3d',
        borderRadius: 12,
        overflow: 'hidden',
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 6,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#374151',
        borderRadius: 2,
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    categorySpent: {
        fontSize: 12,
        color: '#9ca3af',
    },
    categoryAvailable: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 16,
    },
    positive: {
        color: '#4ade80',
    },
    warning: {
        color: '#fbbf24',
    },
    negative: {
        color: '#f87171',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
    },
});
