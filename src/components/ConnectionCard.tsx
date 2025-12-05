import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConnectionCard = ({
    ipAddress,
    theme,
    onStatusChange,
}: {
    ipAddress: string;
    theme: any;
    onStatusChange?: (status: string) => void;
}) => {
    const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    const checkServer = async () => {
        if (!ipAddress) {
            setServerStatus('offline');
            onStatusChange && onStatusChange('offline');
            return;
        }
        setServerStatus('checking');
        setLoading(true);
        try {
            const response = await fetch(`http://${ipAddress}:11434/api/tags`);
            if (response.ok) {
                setServerStatus('online');
                onStatusChange && onStatusChange('online');
            } else {
                setServerStatus('offline');
                onStatusChange && onStatusChange('offline');
            }
        } catch {
            setServerStatus('offline');
            onStatusChange && onStatusChange('offline');
        }
        setLoading(false);
    };

    useEffect(() => {
        checkServer();
    }, [ipAddress, connected]);

    const handleToggleConnection = () => {
        setConnected(!connected);
        // Optionally, trigger connection/disconnection logic here
    };

    // Set toggle color based on connection status
    const toggleColor =
        serverStatus === 'online'
            ? '#4CAF50' // green
            : '#747474ff'; // red

    return (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.row}>
                <Switch
                    value={connected}
                    onValueChange={handleToggleConnection}
                    thumbColor={toggleColor}
                    trackColor={{ false: '#ccc', true: toggleColor }}
                    style={{ marginRight: 12 }}
                    disabled={!ipAddress}
                />
                <Text style={[styles.label, { color: theme.text }]}>
                    {serverStatus === 'checking'
                        ? 'Checking server...'
                        : serverStatus === 'online'
                        ? 'Server Online'
                        : 'No Server Connection'}
                </Text>
                <TouchableOpacity
                    onPress={checkServer}
                    style={{
                        marginLeft: 'auto',
                        backgroundColor: theme.button,
                        borderRadius: 10,
                        padding: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Ionicons name="refresh" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 16,
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 12,
    },
});

export default ConnectionCard;
