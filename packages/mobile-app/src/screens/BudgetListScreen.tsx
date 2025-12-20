/**
 * Budget List Screen
 *
 * Shows available budgets and allows creating new ones.
 * This is shown when no budget is loaded.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    Modal,
    ActivityIndicator,
    Alert,
} from 'react-native';
import * as backend from '../backend';

interface Budget {
    id: string;
    name: string;
    cloudFileId?: string;
}

interface BudgetListScreenProps {
    onBudgetLoaded: () => void;
}

export function BudgetListScreen({ onBudgetLoaded }: BudgetListScreenProps) {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newBudgetName, setNewBudgetName] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loadingBudgetId, setLoadingBudgetId] = useState<string | null>(null);

    const loadBudgets = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await backend.getBudgets();
            setBudgets(result as Budget[]);
        } catch (error) {
            console.error('[BudgetListScreen] Failed to load budgets:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBudgets();
    }, [loadBudgets]);

    const handleLoadBudget = async (budget: Budget) => {
        setLoadingBudgetId(budget.id);
        try {
            const result = await backend.loadBudget(budget.id);
            if (result && typeof result === 'object' && 'error' in result) {
                Alert.alert('Error', `Failed to load budget: ${(result as { error: string }).error}`);
            } else {
                onBudgetLoaded();
            }
        } catch (error) {
            console.error('[BudgetListScreen] Failed to load budget:', error);
            Alert.alert('Error', 'Failed to load budget');
        } finally {
            setLoadingBudgetId(null);
        }
    };

    const handleCreateBudget = async () => {
        if (!newBudgetName.trim()) {
            Alert.alert('Error', 'Please enter a budget name');
            return;
        }

        setIsCreating(true);
        try {
            const lib = backend.getLib();
            if (!lib) throw new Error('Backend not initialized');

            // Create the budget
            await lib.send('create-budget', { budgetName: newBudgetName.trim() });

            // Refresh the list
            await loadBudgets();

            // Close modal
            setShowCreateModal(false);
            setNewBudgetName('');

            // Load the newly created budget (it should be the first one)
            const updatedBudgets = await backend.getBudgets() as Budget[];
            if (updatedBudgets.length > 0) {
                await handleLoadBudget(updatedBudgets[0]);
            }
        } catch (error) {
            console.error('[BudgetListScreen] Failed to create budget:', error);
            Alert.alert('Error', 'Failed to create budget');
        } finally {
            setIsCreating(false);
        }
    };

    const renderBudget = ({ item }: { item: Budget }) => (
        <TouchableOpacity
            style={styles.budgetItem}
            onPress={() => handleLoadBudget(item)}
            disabled={loadingBudgetId === item.id}
        >
            <View style={styles.budgetInfo}>
                <Text style={styles.budgetName}>{item.name}</Text>
                {item.cloudFileId && (
                    <Text style={styles.budgetSync}>☁️ Synced</Text>
                )}
            </View>
            {loadingBudgetId === item.id ? (
                <ActivityIndicator size="small" color="#4A90A4" />
            ) : (
                <Text style={styles.budgetArrow}>→</Text>
            )}
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90A4" />
                <Text style={styles.loadingText}>Loading budgets...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Budgets</Text>
                <Text style={styles.subtitle}>Select a budget to open or create a new one</Text>
            </View>

            {budgets.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📊</Text>
                    <Text style={styles.emptyTitle}>No budgets yet</Text>
                    <Text style={styles.emptyText}>
                        Create your first budget to start tracking your finances
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={budgets}
                    keyExtractor={item => item.id}
                    renderItem={renderBudget}
                    contentContainerStyle={styles.list}
                />
            )}

            <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
            >
                <Text style={styles.createButtonText}>+ Create New Budget</Text>
            </TouchableOpacity>

            {/* Create Budget Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create New Budget</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Budget name"
                            placeholderTextColor="#666"
                            value={newBudgetName}
                            onChangeText={setNewBudgetName}
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setShowCreateModal(false);
                                    setNewBudgetName('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.confirmButton, isCreating && styles.buttonDisabled]}
                                onPress={handleCreateBudget}
                                disabled={isCreating}
                            >
                                {isCreating ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.confirmButtonText}>Create</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
    },
    loadingText: {
        marginTop: 16,
        color: '#888',
        fontSize: 16,
    },
    header: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginTop: 8,
    },
    list: {
        padding: 16,
    },
    budgetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#252542',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    budgetInfo: {
        flex: 1,
    },
    budgetName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    budgetSync: {
        fontSize: 14,
        color: '#4A90A4',
        marginTop: 4,
    },
    budgetArrow: {
        fontSize: 20,
        color: '#4A90A4',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: '#4A90A4',
        margin: 16,
        marginBottom: 40,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#252542',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#fff',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#3a3a5a',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#4A90A4',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
