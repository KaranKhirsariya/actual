import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAccounts, useCategories, usePayees, useTransactions } from '../hooks';
import { getToday } from '../utils/format';

type TransactionType = 'expense' | 'income';

export function AddTransactionScreen() {
    const navigation = useNavigation();

    // Form state
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [payee, setPayee] = useState('');
    const [date, setDate] = useState(getToday());
    const [notes, setNotes] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Data hooks
    const { accounts, isLoading: accountsLoading } = useAccounts();
    const { categories, isLoading: categoriesLoading } = useCategories();
    const { addTransaction } = useTransactions();
    const { searchPayees } = usePayees();

    // Set default account when loaded
    React.useEffect(() => {
        if (!selectedAccount && accounts.length > 0) {
            const defaultAccount = accounts.find(a => !a.offbudget && !a.closed);
            if (defaultAccount) {
                setSelectedAccount(defaultAccount.id);
            }
        }
    }, [accounts, selectedAccount]);

    const handleSave = useCallback(async () => {
        // Validation
        if (!amount || parseFloat(amount) === 0) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }
        if (!selectedAccount) {
            Alert.alert('Error', 'Please select an account');
            return;
        }
        if (!payee.trim()) {
            Alert.alert('Error', 'Please enter a payee');
            return;
        }

        setIsSaving(true);

        try {
            // Convert amount to cents (negative for expense, positive for income)
            const amountCents = Math.round(parseFloat(amount) * 100);
            const finalAmount = type === 'expense' ? -amountCents : amountCents;

            await addTransaction(selectedAccount, {
                date,
                amount: finalAmount,
                payee_name: payee.trim(),
                category: selectedCategory,
                notes: notes.trim() || undefined,
            });

            Alert.alert('Success', 'Transaction added!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Failed to add transaction:', error);
            Alert.alert('Error', 'Failed to add transaction');
        } finally {
            setIsSaving(false);
        }
    }, [amount, selectedAccount, payee, type, date, selectedCategory, notes, addTransaction, navigation]);

    const isLoading = accountsLoading || categoriesLoading;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Transaction Type Toggle */}
                <View style={styles.typeToggle}>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            type === 'expense' && styles.typeButtonActive,
                            type === 'expense' && styles.expenseActive,
                        ]}
                        onPress={() => setType('expense')}
                    >
                        <Text style={[
                            styles.typeButtonText,
                            type === 'expense' && styles.typeButtonTextActive
                        ]}>
                            Expense
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            type === 'income' && styles.typeButtonActive,
                            type === 'income' && styles.incomeActive,
                        ]}
                        onPress={() => setType('income')}
                    >
                        <Text style={[
                            styles.typeButtonText,
                            type === 'income' && styles.typeButtonTextActive
                        ]}>
                            Income
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View style={styles.amountContainer}>
                    <Text style={[
                        styles.currencySymbol,
                        type === 'expense' ? styles.expenseText : styles.incomeText
                    ]}>
                        {type === 'expense' ? '-$' : '+$'}
                    </Text>
                    <TextInput
                        style={[
                            styles.amountInput,
                            type === 'expense' ? styles.expenseText : styles.incomeText
                        ]}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        placeholderTextColor="#6b7280"
                        keyboardType="decimal-pad"
                        autoFocus
                    />
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    {/* Payee */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Payee</Text>
                        <TextInput
                            style={styles.input}
                            value={payee}
                            onChangeText={setPayee}
                            placeholder="Enter payee name"
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    {/* Date */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Date</Text>
                        <TextInput
                            style={styles.input}
                            value={date}
                            onChangeText={setDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    {/* Account Selector */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Account</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.chipContainer}>
                                {accounts
                                    .filter(a => !a.closed)
                                    .map(account => (
                                        <TouchableOpacity
                                            key={account.id}
                                            style={[
                                                styles.chip,
                                                selectedAccount === account.id && styles.chipSelected
                                            ]}
                                            onPress={() => setSelectedAccount(account.id)}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                selectedAccount === account.id && styles.chipTextSelected
                                            ]}>
                                                {account.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Category Selector */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.chipContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.chip,
                                        selectedCategory === null && styles.chipSelected
                                    ]}
                                    onPress={() => setSelectedCategory(null)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        selectedCategory === null && styles.chipTextSelected
                                    ]}>
                                        None
                                    </Text>
                                </TouchableOpacity>
                                {categories
                                    .filter(c => !c.hidden)
                                    .slice(0, 20) // Show first 20 categories
                                    .map(category => (
                                        <TouchableOpacity
                                            key={category.id}
                                            style={[
                                                styles.chip,
                                                selectedCategory === category.id && styles.chipSelected
                                            ]}
                                            onPress={() => setSelectedCategory(category.id)}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                selectedCategory === category.id && styles.chipTextSelected
                                            ]}>
                                                {category.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Notes */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Notes (optional)</Text>
                        <TextInput
                            style={[styles.input, styles.notesInput]}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Add a note..."
                            placeholderTextColor="#6b7280"
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    <Text style={styles.saveButtonText}>
                        {isSaving ? 'Saving...' : 'Save Transaction'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    typeToggle: {
        flexDirection: 'row',
        backgroundColor: '#2d2d3d',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    typeButtonActive: {
        backgroundColor: '#374151',
    },
    expenseActive: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    incomeActive: {
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
    },
    typeButtonText: {
        fontSize: 16,
        color: '#9ca3af',
        fontWeight: '500',
    },
    typeButtonTextActive: {
        color: '#ffffff',
        fontWeight: '600',
    },
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    currencySymbol: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    amountInput: {
        fontSize: 48,
        fontWeight: 'bold',
        minWidth: 150,
        textAlign: 'center',
    },
    expenseText: {
        color: '#f87171',
    },
    incomeText: {
        color: '#4ade80',
    },
    form: {
        gap: 20,
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        color: '#9ca3af',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#2d2d3d',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#ffffff',
    },
    notesInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    chipContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 4,
    },
    chip: {
        backgroundColor: '#2d2d3d',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    chipSelected: {
        backgroundColor: '#6366f1',
    },
    chipText: {
        color: '#9ca3af',
        fontSize: 14,
    },
    chipTextSelected: {
        color: '#ffffff',
        fontWeight: '500',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#374151',
    },
    saveButton: {
        backgroundColor: '#6366f1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
});
