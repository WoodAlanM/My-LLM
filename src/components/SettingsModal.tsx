import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Switch,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme } from '../utils/theme';

const SettingsModal = ({
    visible,
    onCancel,
    onSave,
    onDeleteLogs,
    initialIpAddress = '',
    initialModelName = '',
    initialVerbose = false,
    initialDarkMode = false,
    theme,
}: {
    visible: boolean;
    onCancel: () => void;
    onSave: (settings: {
        ipAddress: string;
        modelName: string;
        verbose: boolean;
        darkMode: boolean;
    }) => void;
    onDeleteLogs: () => void;
    initialIpAddress?: string;
    initialModelName?: string;
    initialVerbose?: boolean;
    initialDarkMode?: boolean;
    theme: any;
}) => {
    const [ipAddress, setIpAddress] = useState(initialIpAddress);
    const [modelName, setModelName] = useState(initialModelName);
    const [verbose, setVerbose] = useState(initialVerbose);
    const [localDarkMode, setLocalDarkMode] = useState(initialDarkMode);

    useEffect(() => {
        setIpAddress(initialIpAddress);
    }, [initialIpAddress, visible]);

    useEffect(() => {
        setModelName(initialModelName);
    }, [initialModelName, visible]);

    useEffect(() => {
        setVerbose(initialVerbose);
    }, [initialVerbose, visible]);

    useEffect(() => {
        setLocalDarkMode(initialDarkMode);
    }, [initialDarkMode, visible]);

    const modalTheme = localDarkMode ? darkTheme : lightTheme;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View
                style={{
                    flex: 1,
                    backgroundColor: modalTheme.background,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <View style={[styles.modal, { backgroundColor: modalTheme.card }]}>
                    <Text style={[styles.header, { color: modalTheme.text }]}>Settings</Text>
                    <Text style={[styles.label, { color: modalTheme.text }]}>
                        LLM IP Address (Tailscale)
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: modalTheme.inputBackground,
                                color: modalTheme.inputText,
                                borderColor: modalTheme.border,
                            },
                        ]}
                        value={ipAddress}
                        onChangeText={setIpAddress}
                        placeholder="Enter IP address"
                        placeholderTextColor={modalTheme.inputText}
                        autoCapitalize="none"
                    />
                    <Text style={[styles.label, { color: modalTheme.text }]}>Model Name</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: modalTheme.inputBackground,
                                color: modalTheme.inputText,
                                borderColor: modalTheme.border,
                            },
                        ]}
                        value={modelName}
                        onChangeText={setModelName}
                        placeholder="Enter model name"
                        placeholderTextColor={modalTheme.inputText}
                        autoCapitalize="none"
                    />
                    {/* Toggles aligned in a column */}
                    <View style={styles.togglesColumn}>
                        <View style={styles.toggleRow}>
                            <Text style={[styles.label, { color: modalTheme.text }]}>Verbose</Text>
                            <Switch
                                value={verbose}
                                onValueChange={setVerbose}
                                thumbColor={verbose ? '#222' : '#eee'}
                            />
                        </View>
                        <View style={styles.toggleRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons
                                    name={localDarkMode ? 'moon' : 'sunny'}
                                    size={22}
                                    color={modalTheme.text}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={{ color: modalTheme.text, marginRight: 8 }}>
                                    Dark Mode
                                </Text>
                            </View>
                            <Switch
                                value={localDarkMode}
                                onValueChange={setLocalDarkMode}
                                thumbColor={localDarkMode ? '#222' : '#eee'}
                            />
                        </View>
                        <View style={{ height: 8 }} />
                        <TouchableOpacity
                            style={[
                                {
                                    width: '100%',
                                    backgroundColor: '#FFDD00',
                                    paddingVertical: 12,
                                    borderRadius: 6,
                                    alignItems: 'center',
                                    marginTop: 8,
                                    marginBottom: 8,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.08,
                                    shadowRadius: 4,
                                    elevation: 2,
                                },
                            ]}
                            onPress={() => Linking.openURL('https://buymeacoffee.com/woodalanmc')}
                        >
                            <Text style={{ color: '#333', fontWeight: 'bold', fontSize: 16 }}>
                                ☕ Buy Me a Coffee
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.buttonRow}>
                    <Button title="Delete Logs" color="#d9534f" onPress={onDeleteLogs} />
                </View>
                <View style={styles.buttonRow}>
                    <Button title="Cancel" onPress={onCancel} />
                    <Button
                        title="Save Settings"
                        onPress={() =>
                            onSave({
                                ipAddress,
                                modelName,
                                verbose,
                                darkMode: localDarkMode,
                            })
                        }
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        marginTop: 12,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginBottom: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    togglesColumn: {
        flexDirection: 'column',
        marginTop: 12,
        marginBottom: 4,
        gap: 8,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
});

export default SettingsModal;
