import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    useColorScheme,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useEntryContext } from '../context/EntryContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const [showList, setShowList] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user, signOut } = useAuth();
    const { entries, addEntry, loading: contextLoading } = useEntryContext();

    const [form, setForm] = useState<{
        marketNomi: string;
        marketRaqami: string;
        mahsulotTuri: string;
        miqdori: string;
        narx: string;
        tolovHolati: 'to\'langan' | 'to\'lanmagan' | 'kutilmoqda';
    }>({
        marketNomi: '',
        marketRaqami: '+998',
        mahsulotTuri: '',
        miqdori: '',
        narx: '',
        tolovHolati: 'to\'lanmagan'
    });

    const theme = isDark ? darkStyles : lightStyles;

    const handleSave = async () => {
        if (!form.marketNomi || !form.mahsulotTuri || !form.miqdori || !form.narx) {
            Alert.alert('Xatolik', 'Barcha maydonlarni to\'ldiring');
            return;
        }
        await addEntry(form);
        setForm({
            marketNomi: '',
            marketRaqami: '+998',
            mahsulotTuri: '',
            miqdori: '',
            narx: '',
            tolovHolati: 'to\'lanmagan'
        });
        setShowList(true);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.topBar}>
                    <Text style={[styles.header, { color: theme.textColor }]}>Bo'zor Daftari</Text>
                    <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Chiqish</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Text style={[styles.subHeader, { color: theme.labelColor }]}>
                        Salom, {user?.user_metadata?.full_name || user?.email}
                    </Text>
                </TouchableOpacity>

                {!showList ? (
                    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.labelColor }]}>Market nomi</Text>
                            <TextInput
                                style={[styles.input, { color: theme.textColor, borderColor: theme.borderColor }]}
                                placeholder="Market nomi"
                                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                                value={form.marketNomi}
                                onChangeText={(text) => setForm({ ...form, marketNomi: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.labelColor }]}>Market raqami</Text>
                            <TextInput
                                style={[styles.input, { color: theme.textColor, borderColor: theme.borderColor }]}
                                value={form.marketRaqami}
                                onChangeText={(text) => setForm({ ...form, marketRaqami: text })}
                                keyboardType="phone-pad"
                                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.labelColor }]}>Mahsulot turi</Text>
                            <TextInput
                                style={[styles.input, { color: theme.textColor, borderColor: theme.borderColor }]}
                                placeholder="Mahsulot turi"
                                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                                value={form.mahsulotTuri}
                                onChangeText={(text) => setForm({ ...form, mahsulotTuri: text })}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.labelColor }]}>Miqdori</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.textColor, borderColor: theme.borderColor }]}
                                    placeholder="50 kg"
                                    placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                                    value={form.miqdori}
                                    onChangeText={(text) => setForm({ ...form, miqdori: text })}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.labelColor }]}>Narxi</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.textColor, borderColor: theme.borderColor }]}
                                    placeholder="15,000"
                                    keyboardType="numeric"
                                    placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                                    value={form.narx}
                                    onChangeText={(text) => setForm({ ...form, narx: text })}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.labelColor }]}>To'lov holati</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {(['to\'langan', 'to\'lanmagan', 'kutilmoqda'] as const).map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        onPress={() => setForm({ ...form, tolovHolati: status })}
                                        style={{
                                            flex: 1,
                                            padding: 10,
                                            borderRadius: 12,
                                            borderWidth: 1.5,
                                            backgroundColor: form.tolovHolati === status ? (isDark ? '#334155' : '#f1f5f9') : 'transparent',
                                            borderColor: form.tolovHolati === status ? '#2563eb' : theme.borderColor,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 10,
                                            fontWeight: 'bold',
                                            color: form.tolovHolati === status ? '#2563eb' : theme.labelColor,
                                            textTransform: 'capitalize'
                                        }}>{status}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={[styles.saveBtn, contextLoading && { opacity: 0.7 }]} onPress={handleSave} disabled={contextLoading}>
                            {contextLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveBtnText}>Saqlash</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.listBtn, { backgroundColor: isDark ? '#334155' : '#64748b' }]}
                            onPress={() => setShowList(true)}
                        >
                            <Text style={styles.listBtnText}>Yozuvlar ({entries.length})</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                        <View style={styles.listHeader}>
                            <Text style={[styles.listTitle, { color: theme.textColor }]}>Barcha yozuvlar</Text>
                            <TouchableOpacity onPress={() => setShowList(false)}>
                                <Text style={styles.backBtn}>Yangi qo'shish</Text>
                            </TouchableOpacity>
                        </View>

                        {entries.length === 0 ? (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <Text style={{ color: theme.labelColor }}>Yozuvlar mavjud emas</Text>
                            </View>
                        ) : (
                            entries.map(entry => (
                                <View key={entry.id} style={[styles.entryItem, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: theme.borderColor }]}>
                                    <View style={styles.entryMain}>
                                        <Text style={[styles.entryMarket, { color: theme.textColor }]}>{entry.marketNomi}</Text>
                                        <Text style={styles.entryAmount}>{entry.narx} so'm</Text>
                                    </View>
                                    <Text style={styles.entryDetails}>
                                        {entry.mahsulotTuri} • {entry.miqdori} • {entry.sana}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const lightStyles = {
    backgroundColor: '#f1f5f9',
    cardBackground: '#ffffff',
    textColor: '#1e293b',
    labelColor: '#334155',
    borderColor: '#e2e8f0',
};

const darkStyles = {
    backgroundColor: '#0f172a',
    cardBackground: '#1e293b',
    textColor: '#f8fafc',
    labelColor: '#94a3b8',
    borderColor: '#334155',
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 10,
    },
    header: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    subHeader: {
        fontSize: 16,
        marginBottom: 20,
        fontWeight: '500',
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 12,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        borderWidth: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    mt10: {
        marginTop: 10,
    },
    pickerContainer: {
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 16,
        marginTop: 12,
    },
    pickerPlaceholder: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: '#2563eb',
        padding: 20,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 30,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    listBtn: {
        padding: 20,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 12,
    },
    listBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    listTitle: {
        fontSize: 24,
        fontWeight: '900',
    },
    backBtn: {
        color: '#2563eb',
        fontWeight: '800',
        fontSize: 16,
    },
    entryItem: {
        padding: 18,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
    },
    entryMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    entryMarket: {
        fontSize: 18,
        fontWeight: '800',
        flex: 1,
        marginRight: 10,
    },
    entryAmount: {
        fontSize: 16,
        fontWeight: '900',
        color: '#2563eb',
    },
    entryDetails: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
});
