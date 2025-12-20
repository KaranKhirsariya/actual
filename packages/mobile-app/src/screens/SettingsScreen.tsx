import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

import * as backend from '../backend';

export function SettingsScreen() {
    const isDemoMode = backend.isDemoMode();

    return (
        <ScrollView style={styles.container}>
            {/* Demo Mode Banner */}
            {isDemoMode && (
                <View style={styles.demoBanner}>
                    <Text style={styles.demoBannerText}>
                        🎭 Running in Demo Mode
                    </Text>
                    <Text style={styles.demoBannerSubtext}>
                        Connect to a budget file to see real data
                    </Text>
                </View>
            )}

            {/* Server Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Server</Text>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Server URL</Text>
                        <Text style={styles.settingValue}>Not connected</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Budget Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Budget</Text>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Current Budget</Text>
                        <Text style={styles.settingValue}>Demo Budget</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Import Budget</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Export Budget</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Appearance Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Appearance</Text>
                <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Dark Mode</Text>
                    </View>
                    <Switch
                        value={true}
                        disabled={true}
                        trackColor={{ false: '#374151', true: '#6366f1' }}
                    />
                </View>
            </View>

            {/* Security Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>
                <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Biometric Lock</Text>
                        <Text style={styles.settingDescription}>
                            Require Face ID or fingerprint to open app
                        </Text>
                    </View>
                    <Switch
                        value={false}
                        trackColor={{ false: '#374151', true: '#6366f1' }}
                    />
                </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Version</Text>
                    <Text style={styles.settingValue}>0.0.1 (dev)</Text>
                </View>
                <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingLabel}>View on GitHub</Text>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Actual Budget Mobile
                </Text>
                <Text style={styles.footerSubtext}>
                    A local-first personal finance app
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e2e',
    },
    demoBanner: {
        backgroundColor: '#4f46e5',
        padding: 16,
        alignItems: 'center',
    },
    demoBannerText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    demoBannerSubtext: {
        color: '#c7d2fe',
        fontSize: 12,
        marginTop: 4,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9ca3af',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2d2d3d',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    settingInfo: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        color: '#ffffff',
    },
    settingValue: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 2,
    },
    settingDescription: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 4,
    },
    chevron: {
        fontSize: 20,
        color: '#6b7280',
        marginLeft: 8,
    },
    footer: {
        padding: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#6b7280',
    },
    footerSubtext: {
        fontSize: 12,
        color: '#4b5563',
        marginTop: 4,
    },
});
