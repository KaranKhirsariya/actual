import React, { useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAccounts, useSync, Account } from '../hooks';
import { formatCurrency } from '../utils/format';

type RootStackParamList = {
    Main: undefined;
    AddTransaction: undefined;
    AccountTransactions: { accountId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function AccountsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { accounts, isLoading, refetch } = useAccounts();
    const { sync, isSyncing } = useSync();

    const onRefresh = useCallback(async () => {
        await sync();
        await refetch();
    }, [sync, refetch]);

    // Group accounts
    const onBudgetAccounts = accounts.filter(a => !a.offbudget && !a.closed);
    const offBudgetAccounts = accounts.filter(a => a.offbudget && !a.closed);
    const creditCards = onBudgetAccounts.filter(a => a.type === 'credit');
    const bankAccounts = onBudgetAccounts.filter(a => a.type !== 'credit');

    // Calculate totals
    const onBudgetTotal = bankAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
    const creditTotal = creditCards.reduce((sum, a) => sum + (a.balance || 0), 0);
    const offBudgetTotal = offBudgetAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
    const netWorth = onBudgetTotal + creditTotal + offBudgetTotal;

    if (isLoading && accounts.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    const renderAccountItem = ({ item }: { item: Account }) => (
        <TouchableOpacity
            style={styles.accountItem}
            onPress={() => {
                // Navigate to account transactions
                // navigation.navigate('AccountTransactions', { accountId: item.id });
            }}
        >
            <View style={styles.accountLeft}>
                {item.bankId && (
                    <View style={[
                        styles.syncIndicator,
                        { backgroundColor: '#4ade80' }
                    ]} />
                )}
                <Text style={styles.accountName}>{item.name}</Text>
            </View>
            <Text style={[
                styles.accountBalance,
                (item.balance || 0) >= 0 ? styles.positive : styles.negative
            ]}>
                {formatCurrency(item.balance || 0)}
            </Text>
        </TouchableOpacity>
    );

    const renderSection = (
        title: string,
        data: Account[],
        total: number,
        showTotal = true
    ) => {
        if (data.length === 0) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    {showTotal && (
                        <Text style={[
                            styles.sectionTotal,
                            total >= 0 ? styles.positive : styles.negative
                        ]}>
                            {formatCurrency(total)}
                        </Text>
                    )}
                </View>
                <View style={styles.accountList}>
                    {data.map(account => (
                        <React.Fragment key={account.id}>
                            {renderAccountItem({ item: account })}
                        </React.Fragment>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={[]}
                renderItem={() => null}
                ListHeaderComponent={
                    <>
                        {/* Net Worth Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerLabel}>Net Worth</Text>
                            <Text style={[
                                styles.headerBalance,
                                netWorth >= 0 ? styles.positive : styles.negative
                            ]}>
                                {formatCurrency(netWorth)}
                            </Text>
                        </View>

                        {/* Account Sections */}
                        {renderSection('ON BUDGET', bankAccounts, onBudgetTotal)}
                        {renderSection('CREDIT CARDS', creditCards, creditTotal)}
                        {renderSection('OFF BUDGET', offBudgetAccounts, offBudgetTotal)}

                        {accounts.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>🏦</Text>
                                <Text style={styles.emptyTitle}>No Accounts</Text>
                                <Text style={styles.emptyText}>
                                    Add an account to start tracking your finances
                                </Text>
                            </View>
                        )}
                    </>
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
    header: {
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    headerLabel: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 4,
    },
    headerBalance: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    section: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9ca3af',
        letterSpacing: 1,
    },
    sectionTotal: {
        fontSize: 14,
        fontWeight: '600',
    },
    accountList: {
        backgroundColor: '#2d2d3d',
        borderRadius: 12,
        overflow: 'hidden',
    },
    accountItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    accountLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    syncIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    accountBalance: {
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
