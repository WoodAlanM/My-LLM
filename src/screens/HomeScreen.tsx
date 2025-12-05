import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import SettingsModal from '../components/SettingsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightTheme, darkTheme } from '../utils/theme';
import ConnectionCard from '../components/ConnectionCard';

const HomeScreen = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [ipAddress, setIpAddress] = useState('');
    const [modelName, setModelName] = useState('');
    const [verbose, setVerbose] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [inputHeight, setInputHeight] = useState(40);
    const scrollViewRef = useRef<ScrollView>(null);

    const theme = darkMode ? darkTheme : lightTheme;

    // Add changes to make the send message thing work better with keyboard avoiding stuff.

    useEffect(() => {
        const loadSettings = async () => {
            const savedIp = await AsyncStorage.getItem('llmIpAddress');
            const savedModel = await AsyncStorage.getItem('modelName');
            const savedVerbose = await AsyncStorage.getItem('verbose');
            const savedDarkMode = await AsyncStorage.getItem('darkMode');
            if (savedIp) setIpAddress(savedIp);
            if (savedModel) setModelName(savedModel);
            if (savedVerbose) setVerbose(savedVerbose === 'true');
            if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
        };
        loadSettings();
    }, []);

    const addLog = (msg: string) => {
        setLogs((prev) => [...prev, msg]);
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleSendMessage = async () => {
        if (message.trim() === '') return;
        addLog('Sent: ' + message);
        if (!ipAddress) {
            addLog('No IP address set. Please configure in settings.');
            return;
        }
        try {
            const response = await fetch(`http://${ipAddress}:11434/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // model name: like qwen3:4b
                    model: modelName,
                    prompt: message,
                    stream: verbose,
                }),
            });
            const text = await response.text();
            const lines = text.split('\n').filter(Boolean);
            let finalResponse = '';
            lines.forEach((line) => {
                try {
                    const obj = JSON.parse(line);
                    if (obj.response) finalResponse += obj.response;
                } catch {}
            });
            addLog('Ollama final response: ' + finalResponse.trim());
        } catch (err) {
            addLog('Connection failed: ' + err);
        }
        setMessage('');
        setInputHeight(40);
    };

    const handleOpenSettings = () => {
        setSettingsVisible(true);
    };

    const handleSaveSettings = async ({
        ipAddress,
        modelName,
        verbose,
        darkMode,
    }: {
        ipAddress: string;
        modelName: string;
        verbose: boolean;
        darkMode: boolean;
    }) => {
        setSettingsVisible(false);
        setIpAddress(ipAddress);
        setModelName(modelName);
        setVerbose(verbose);
        setDarkMode(darkMode);
        await AsyncStorage.setItem('llmIpAddress', ipAddress);
        await AsyncStorage.setItem('modelName', modelName);
        await AsyncStorage.setItem('verbose', verbose ? 'true' : 'false');
        await AsyncStorage.setItem('darkMode', darkMode ? 'true' : 'false');
        addLog('Settings saved.');
    };

    const handleDeleteLogs = () => {
        setLogs([]);
        addLog('Logs deleted.');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.safeViewBackground }}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Top Bar */}
                <View
                    style={[
                        styles.topBar,
                        { backgroundColor: theme.card, borderBottomColor: theme.border },
                    ]}
                >
                    <View style={styles.titleRow}>
                        <Image
                            source={require('../../assets/adaptive-icon.png')}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                        <Text style={[styles.title, { color: theme.text }]}>LLM-mar</Text>
                    </View>
                    <TouchableOpacity style={styles.hamburger} onPress={handleOpenSettings}>
                        <Ionicons name="menu" size={28} color={theme.text} />
                    </TouchableOpacity>
                </View>
                {/* Settings Modal */}
                <SettingsModal
                    visible={settingsVisible}
                    onCancel={() => setSettingsVisible(false)}
                    onSave={handleSaveSettings}
                    onDeleteLogs={handleDeleteLogs}
                    initialIpAddress={ipAddress}
                    initialModelName={modelName}
                    initialVerbose={verbose}
                    initialDarkMode={darkMode}
                    theme={theme}
                />
                {/* Logs */}
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={20}
                >
                    <ConnectionCard ipAddress={ipAddress} theme={theme} />

                    <View
                        style={[
                            styles.logContainer,
                            { backgroundColor: theme.card, borderColor: theme.border },
                        ]}
                    >
                        <ScrollView ref={scrollViewRef} style={styles.logScroll}>
                            {logs.map((log, idx) => (
                                <Text
                                    key={idx}
                                    style={[styles.logText, { color: theme.logText }]}
                                    selectable
                                >
                                    {log}
                                </Text>
                            ))}
                        </ScrollView>
                        {/* Send Message Feature */}
                        <View style={styles.sendRow}>
                            <TextInput
                                style={[
                                    styles.sendInput,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        color: theme.inputText,
                                        borderColor: theme.border,
                                        height: Math.max(40, Math.min(inputHeight, 90)),
                                        textAlignVertical: 'top',
                                    },
                                ]}
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Type a message..."
                                placeholderTextColor={theme.inputText}
                                onSubmitEditing={handleSendMessage}
                                returnKeyType="send"
                                multiline
                                onContentSizeChange={(e) =>
                                    setInputHeight(e.nativeEvent.contentSize.height)
                                }
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, { backgroundColor: theme.button }]}
                                onPress={handleSendMessage}
                            >
                                <Ionicons name="send" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 50,
        height: 50,
        marginRight: 8,
    },
    title: { fontSize: 20, fontWeight: 'bold' },
    hamburger: { padding: 4 },
    logContainer: {
        flex: 1,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        justifyContent: 'flex-end',
    },
    logScroll: {
        flex: 1,
    },
    logText: {
        fontSize: 13,
        marginBottom: 4,
    },
    sendRow: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align send button to top
        marginTop: 8,
    },
    sendInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        minHeight: 40,
        maxHeight: 90,
    },
    sendButton: {
        borderRadius: 10,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomBar: {
        padding: 10,
        borderTopWidth: 1,
    },
});

export default HomeScreen;
