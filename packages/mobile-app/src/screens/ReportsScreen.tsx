import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';

export function ReportsScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>📊</Text>
                <Text style={styles.title}>Reports</Text>
                <Text style={styles.subtitle}>
                    Spending charts and trends will appear here
                </Text>
                <Text style={styles.hint}>
                    Coming in a future update
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e2e',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: 24,
    },
    hint: {
        fontSize: 14,
        color: '#6b7280',
        fontStyle: 'italic',
    },
});
