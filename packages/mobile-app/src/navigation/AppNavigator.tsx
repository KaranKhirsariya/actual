import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';

import { BudgetScreen } from '../screens/BudgetScreen';
import { AccountsScreen } from '../screens/AccountsScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Simple icon components
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
    const icons: Record<string, string> = {
        Budget: '💰',
        Accounts: '🏦',
        Transactions: '📝',
        More: '☰',
    };

    return (
        <View style={styles.iconContainer}>
            <Text style={[styles.icon, focused && styles.iconFocused]}>
                {icons[name] || '•'}
            </Text>
        </View>
    );
}

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => (
                    <TabIcon name={route.name} focused={focused} />
                ),
                tabBarActiveTintColor: '#6366f1',
                tabBarInactiveTintColor: '#9ca3af',
                headerStyle: {
                    backgroundColor: '#1e1e2e',
                    shadowColor: 'transparent',
                    elevation: 0,
                },
                headerTintColor: '#ffffff',
                headerTitleStyle: {
                    fontWeight: '600',
                },
                tabBarStyle: {
                    backgroundColor: '#1e1e2e',
                    borderTopColor: '#374151',
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 65,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen
                name="Budget"
                component={BudgetScreen}
                options={{ title: 'Budget' }}
            />
            <Tab.Screen
                name="Accounts"
                component={AccountsScreen}
                options={{ title: 'Accounts' }}
            />
            <Tab.Screen
                name="Transactions"
                component={TransactionsScreen}
                options={{ title: 'Transactions' }}
            />
            <Tab.Screen
                name="More"
                component={MoreScreen}
                options={{ title: 'More' }}
            />
        </Tab.Navigator>
    );
}

export function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#1e1e2e',
                    },
                    headerTintColor: '#ffffff',
                    headerTitleStyle: {
                        fontWeight: '600',
                    },
                }}
            >
                <Stack.Screen
                    name="Main"
                    component={MainTabs}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AddTransaction"
                    component={AddTransactionScreen}
                    options={{
                        title: 'Add Transaction',
                        presentation: 'modal',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 22,
        opacity: 0.7,
    },
    iconFocused: {
        opacity: 1,
    },
});
