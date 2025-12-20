import React, { useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SectionList,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTransactions, useSync, useCategories, Transaction } from '../hooks';
import { formatCurrency, formatDate } from '../utils/format';

type RootStackParamList = {
    Main: undefined;
    AddTransaction: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TransactionGroup {
    title: string;
    data: Transaction[];
}

// Group transactions by date
function groupTransactionsByDate(transactions: Transaction[]): TransactionGroup[] {
    const groups: Record<string, Transaction[]> = {};
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const tx of transactions) {
        let title: string;
        if (tx.date === today) {
            title = 'Today';
        } else if (tx.date === yesterday) {
            title = 'Yesterday';
        } else {
            title = formatDate(tx.date);
        }

        if (!groups[title]) {
            groups[title] = [];
        }
        groups[title].push(tx);
    }

    // Convert to array and sort by date (most recent first)
    return Object.entries(groups)
        .map(([title, data]) => ({ title, data }))
        .sort((a, b) => {
            // Keep Today and Yesterday at the top
            if (a.title === 'Today') return -1;
            if (b.title === 'Today') return 1;
            if (a.title === 'Yesterday') return -1;
            if (b.title === 'Yesterday') return 1;
            // Otherwise sort by date
            return b.data[0].date.localeCompare(a.data[0].date);
        });
}

export function TransactionsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { transactions, isLoading, refetch } = useTransactions();
    const { getCategoryById } = useCategories();
    const { sync, isSyncing } = useSync();

    const onRefresh = useCallback(async () => {
        await sync();
        await refetch();
    }, [sync, refetch]);

    const sections = useMemo(
        () => groupTransactionsByDate(transactions),
        [transactions]
    );

    const renderTransaction = ({ item }: { item: Transaction }) => {
        const category = item.category ? getCategoryById(item.category) : null;
        const isExpense = item.amount < 0;

        return (
            <TouchableOpacity
                style={styles.transactionItem}
                onPress={() => {
                    // Navigate to transaction detail/edit
                }}
            >
                <View style={styles.transactionLeft}>
                    <Text style={styles.transactionPayee}>
                        {item.payee_name || 'Unknown'}
                    </Text>
                    <Text style={styles.transactionCategory}>
                        {category?.name || 'Uncategorized'}
                    </Text>
                </View>
                <Text style={[
                    styles.transactionAmount,
                    isExpense ? styles.negative : styles.positive
                ]}>
                    {formatCurrency(item.amount)}
                </Text>
            </TouchableOpacity>
        );
    };

    if (isLoading && transactions.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderTransaction}
                renderSectionHeader={({ section }) => (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📝</Text>
                        <Text style={styles.emptyTitle}>No Transactions</Text>
                        <Text style={styles.emptyText}>
                            Add a transaction to start tracking your spending
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isSyncing}
                        onRefresh={onRefresh}
                        tintColor="#6366f1"
                        colors={['#6366f1']}
                    />
                }
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddTransaction')}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
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
    listContent: {
        paddingBottom: 100,
    },
    sectionHeader: {
        backgroundColor: '#1e1e2e',
        paddingHorizontal: 16,
        paddingVertical: 8,
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9ca3af',
        letterSpacing: 0.5,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2d2d3d',
        marginHorizontal: 16,
        marginBottom: 2,
        padding: 16,
        borderRadius: 8,
    },
    transactionLeft: {
        flex: 1,
    },
    transactionPayee: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    transactionCategory: {
        fontSize: 13,
        color: '#9ca3af',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    positive: {
        color: '#4ade80',
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
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 32,
        color: '#ffffff',
        lineHeight: 36,
    },
});
