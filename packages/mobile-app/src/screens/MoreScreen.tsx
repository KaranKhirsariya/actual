import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useSync } from '../hooks';

interface MenuItemProps {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
}

function MenuItem({ icon, title, subtitle, onPress }: MenuItemProps) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Text style={styles.menuIcon}>{icon}</Text>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <Text style={styles.menuChevron}>›</Text>
        </TouchableOpacity>
    );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );
}

export function MoreScreen() {
    const { lastSyncTime, sync, isSyncing } = useSync();

    const formatLastSync = () => {
        if (!lastSyncTime) return 'Never';
        const diff = Date.now() - lastSyncTime.getTime();
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        return lastSyncTime.toLocaleTimeString();
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Features */}
            <MenuSection title="FEATURES">
                <MenuItem
                    icon="📊"
                    title="Reports"
                    subtitle="Spending trends and insights"
                />
                <MenuItem
                    icon="👥"
                    title="Payees"
                    subtitle="Manage payee list"
                />
                <MenuItem
                    icon="📋"
                    title="Rules"
                    subtitle="Auto-categorization rules"
                />
                <MenuItem
                    icon="📅"
                    title="Schedules"
                    subtitle="Recurring transactions"
                />
            </MenuSection>

            {/* Budget */}
            <MenuSection title="BUDGET">
                <MenuItem
                    icon="📁"
                    title="Switch Budget"
                    subtitle="Change budget file"
                />
                <MenuItem
                    icon="📤"
                    title="Import/Export"
                    subtitle="Backup and restore"
                />
            </MenuSection>

            {/* Server */}
            <MenuSection title="SERVER">
                <View style={styles.syncCard}>
                    <View style={styles.syncHeader}>
                        <Text style={styles.syncIcon}>🌐</Text>
                        <View style={styles.syncInfo}>
                            <Text style={styles.syncTitle}>Sync Status</Text>
                            <Text style={styles.syncSubtitle}>
                                Last sync: {formatLastSync()}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
                        onPress={() => sync()}
                        disabled={isSyncing}
                    >
                        <Text style={styles.syncButtonText}>
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </MenuSection>

            {/* Settings */}
            <MenuSection title="SETTINGS">
                <MenuItem
                    icon="⚙️"
                    title="Settings"
                    subtitle="Appearance and preferences"
                />
                <MenuItem
                    icon="🔐"
                    title="Security"
                    subtitle="PIN and biometrics"
                />
                <MenuItem
                    icon="ℹ️"
                    title="About"
                    subtitle="Version and licenses"
                />
            </MenuSection>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Actual Budget • Mobile</Text>
                <Text style={styles.footerVersion}>v0.0.1</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e2e',
    },
    content: {
        paddingBottom: 100,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9ca3af',
        letterSpacing: 1,
        marginBottom: 8,
    },
    sectionContent: {
        backgroundColor: '#2d2d3d',
        borderRadius: 12,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    menuIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#9ca3af',
        marginTop: 2,
    },
    menuChevron: {
        fontSize: 20,
        color: '#9ca3af',
    },
    syncCard: {
        padding: 16,
    },
    syncHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    syncIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    syncInfo: {
        flex: 1,
    },
    syncTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    syncSubtitle: {
        fontSize: 13,
        color: '#9ca3af',
        marginTop: 2,
    },
    syncButton: {
        backgroundColor: '#6366f1',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    syncButtonDisabled: {
        opacity: 0.6,
    },
    syncButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        padding: 32,
    },
    footerText: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 4,
    },
    footerVersion: {
        fontSize: 12,
        color: '#6b7280',
    },
});
