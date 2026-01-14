import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Alert,
    Modal,
    Platform,
    StatusBar,
    useWindowDimensions,
    KeyboardAvoidingView,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEntryContext } from '../context/EntryContext';
import * as FileSystem from 'expo-file-system';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
    History as HistoryIcon,
    Search as SearchIcon,
    Filter as FilterIcon,
    Trash2 as Trash2Icon,
    Edit3 as Edit3Icon,
    X as XIcon,
    Calendar as CalendarIcon,
    Package as PackageIcon,
    Download as DownloadIcon,
    Check as CheckIcon
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Entry } from '@distitrack/common';
import { s, vs, normalize } from '../utils/scaling';

const History = HistoryIcon as any;
const Search = SearchIcon as any;
const Filter = FilterIcon as any;
const Trash2 = Trash2Icon as any;
const Edit3 = Edit3Icon as any;
const X = XIcon as any;
const Calendar = CalendarIcon as any;
const Package = PackageIcon as any;
const Download = DownloadIcon as any;

export const RecordsScreen = () => {
    const { width } = useWindowDimensions();
    const { entries, deleteEntry, updateEntry, loading } = useEntryContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Barchasi');
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Entry>>({});

    const filteredEntries = entries.filter((entry: Entry) => {
        const matchesSearch = (entry.marketNomi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.mahsulotTuri || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Barchasi' || entry.tolovHolati === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleEditStart = (entry: Entry) => {
        setEditingEntry(entry);
        setEditForm(entry);
        setIsEditModalVisible(true);
    };

    const handleEditSave = async () => {
        if (!editingEntry) return;
        try {
            await updateEntry(editingEntry.id, editForm);
            setIsEditModalVisible(false);
            setEditingEntry(null);
            Alert.alert('Muvaffaqiyat', "O'zgarishlar saqlandi");
        } catch (error) { }
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'O\'chirish',
            `"${name}" yozuvini o'chirib tashlamoqchimisiz?`,
            [
                { text: 'Bekor qilish', style: 'cancel' },
                { text: 'O\'chirish', style: 'destructive', onPress: () => deleteEntry(id) }
            ]
        );
    };

    const exportToCSV = async () => {
        if (filteredEntries.length === 0) {
            Alert.alert('Xatolik', 'Eksport qilish uchun ma\'lumotlar yo\'q');
            return;
        }

        try {
            const header = 'Market,Mahsulot,Miqdori,Narxi,Holati,Sana\n';
            const rows = filteredEntries.map(e =>
                `${e.marketNomi},${e.mahsulotTuri},${e.miqdori},${e.narx},${e.tolovHolati},${e.sana}`
            ).join('\n');

            const file = new File(Paths.document, 'hisobot.csv');
            if (file.exists) {
                file.delete();
            }
            file.create();
            file.write(header + rows, { encoding: 'utf8' });
            await Sharing.shareAsync(file.uri);
        } catch (error) {
            Alert.alert('Xatolik', 'Eksport qilishda xatolik yuz berdi');
        }
    };

    const renderEntry = ({ item }: { item: Entry }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.marketInfo}>
                    <View style={styles.marketIconBox}>
                        <Package size={normalize(20)} color="#4f46e5" />
                    </View>
                    <View>
                        <Text style={styles.marketName}>{item.marketNomi}</Text>
                        <View style={styles.dateRow}>
                            <Calendar size={normalize(12)} color="#94a3b8" />
                            <Text style={styles.dateText}>{item.sana}</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.tolovHolati === "to'langan" ? '#f0fdf4' : '#fef2f2' }]}>
                    <Text style={[styles.statusText, { color: item.tolovHolati === "to'langan" ? '#10b981' : '#ef4444' }]}>
                        {item.tolovHolati}
                    </Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Mahsulot</Text>
                        <Text style={styles.detailValue}>{item.mahsulotTuri}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Miqdor</Text>
                        <Text style={styles.detailValue}>{item.miqdori}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Narx</Text>
                        <Text style={styles.priceValue}>{new Intl.NumberFormat('uz-UZ').format(item.summa || 0)}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardFooter}>
                {item.tolovHolati === "to'lanmagan" && (
                    <TouchableOpacity onPress={() => handleEditStart(item)} style={styles.actionBtn}>
                        <Edit3 size={normalize(18)} color="#4f46e5" />
                        <Text style={[styles.actionText, { color: '#4f46e5' }]}>Tahrirlash</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(item.id, item.marketNomi)} style={styles.actionBtn}>
                    <Trash2 size={normalize(18)} color="#ef4444" />
                    <Text style={[styles.actionText, { color: '#ef4444' }]}>O'chirish</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Tarix</Text>
                    <Text style={styles.headerSubtitle}>Barcha yozuvlar ro'yxati</Text>
                </View>
                <TouchableOpacity onPress={exportToCSV} style={styles.downloadBtn}>
                    <Download size={normalize(22)} color="#4f46e5" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Search size={normalize(20)} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Qidirish..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        placeholderTextColor="#94a3b8"
                    />
                </View>
                <TouchableOpacity
                    onPress={() => setIsFilterVisible(true)}
                    style={[styles.filterIconBtn, statusFilter !== 'Barchasi' && styles.filterIconBtnActive]}
                >
                    <Filter size={normalize(20)} color={statusFilter !== 'Barchasi' ? '#fff' : '#4f46e5'} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredEntries}
                renderItem={renderEntry}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={() => { }} // Refresh logically missing here, but standard
            />

            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                transparent
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Yozuvni tahrirlash</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                <X size={normalize(24)} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Mahsulot turi</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.mahsulotTuri}
                                    onChangeText={text => setEditForm({ ...editForm, mahsulotTuri: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Miqdori</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.miqdori}
                                    onChangeText={text => setEditForm({ ...editForm, miqdori: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Narxi</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.narx}
                                    onChangeText={text => setEditForm({ ...editForm, narx: text })}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>To'lov holati</Text>
                                <View style={styles.statusToggle}>
                                    <TouchableOpacity
                                        style={[styles.toggleBtn, editForm.tolovHolati === "to'langan" && styles.toggleBtnActive]}
                                        onPress={() => setEditForm({ ...editForm, tolovHolati: "to'langan" })}
                                    >
                                        <Text style={[styles.toggleText, editForm.tolovHolati === "to'langan" && styles.toggleTextActive]}>To'langan</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.toggleBtn, editForm.tolovHolati === "to'lanmagan" && styles.toggleBtnActiveUnpaid]}
                                        onPress={() => {
                                            if (editingEntry?.tolovHolati === "to'langan") {
                                                Alert.alert('Ogohlantirish', "To'langan yozuvni to'lanmaganga o'zgartirib bo'lmaydi");
                                                return;
                                            }
                                            setEditForm({ ...editForm, tolovHolati: "to'lanmagan" });
                                        }}
                                    >
                                        <Text style={[styles.toggleText, editForm.tolovHolati === "to'lanmagan" && styles.toggleTextActive]}>Qarz</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity onPress={handleEditSave} style={styles.saveBtn}>
                                <LinearGradient colors={['#4f46e5', '#3730a3']} style={styles.saveGradient}>
                                    <Text style={styles.saveText}>Saqlash</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Filter Modal */}
            <Modal visible={isFilterVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.filterOverlay}
                    activeOpacity={1}
                    onPress={() => setIsFilterVisible(false)}
                >
                    <View style={styles.filterContent}>
                        <Text style={styles.filterTitle}>Holat bo'yicha saralash</Text>
                        {['Barchasi', "to'langan", "to'lanmagan"].map(status => (
                            <TouchableOpacity
                                key={status}
                                style={[styles.filterItem, statusFilter === status && styles.filterItemActive]}
                                onPress={() => {
                                    setStatusFilter(status);
                                    setIsFilterVisible(false);
                                }}
                            >
                                <Text style={[styles.filterItemText, statusFilter === status && styles.filterItemTextActive]}>
                                    {status === 'Barchasi' ? 'Barchasi' : status}
                                </Text>
                                {statusFilter === status && <CheckIcon size={normalize(18)} color="#4f46e5" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: s(24),
        paddingTop: vs(20),
        marginBottom: vs(24),
    },
    headerTitle: {
        fontSize: normalize(32),
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -1,
    },
    headerSubtitle: {
        fontSize: normalize(14),
        color: '#64748b',
        fontWeight: '500',
    },
    downloadBtn: {
        width: s(46),
        height: s(46),
        borderRadius: s(14),
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: s(24),
        gap: s(12),
        marginBottom: vs(24),
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: s(16),
        paddingHorizontal: s(16),
        height: vs(50),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    searchInput: {
        flex: 1,
        marginLeft: s(10),
        fontSize: normalize(15),
        color: '#1e293b',
        fontWeight: '600',
    },
    filterIconBtn: {
        width: s(50),
        height: vs(50),
        backgroundColor: '#fff',
        borderRadius: s(16),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    filterIconBtnActive: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    listContainer: {
        paddingHorizontal: s(24),
        paddingBottom: vs(40),
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: s(24),
        padding: s(16),
        marginBottom: vs(16),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: vs(16),
    },
    marketInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(12),
    },
    marketIconBox: {
        width: s(44),
        height: s(44),
        borderRadius: s(14),
        backgroundColor: '#f5f7ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    marketName: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: vs(2),
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(4),
    },
    dateText: {
        fontSize: normalize(12),
        color: '#94a3b8',
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: s(10),
        paddingVertical: vs(4),
        borderRadius: s(8),
    },
    statusText: {
        fontSize: normalize(10),
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    cardContent: {
        backgroundColor: '#f8fafc',
        borderRadius: s(18),
        padding: s(12),
        marginBottom: vs(16),
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: normalize(10),
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginBottom: vs(2),
    },
    detailValue: {
        fontSize: normalize(14),
        fontWeight: '800',
        color: '#475569',
    },
    priceValue: {
        fontSize: normalize(14),
        fontWeight: '900',
        color: '#10b981',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: vs(16),
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(6),
    },
    actionText: {
        fontSize: normalize(13),
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: s(32),
        borderTopRightRadius: s(32),
        padding: s(24),
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(24),
    },
    modalTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#1e293b',
    },
    formGroup: {
        marginBottom: vs(20),
    },
    label: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#64748b',
        marginBottom: vs(8),
        marginLeft: s(4),
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: s(16),
        padding: s(16),
        fontSize: normalize(16),
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        fontWeight: '600',
    },
    statusToggle: {
        flexDirection: 'row',
        gap: s(12),
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: vs(14),
        borderRadius: s(14),
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    toggleBtnActive: {
        backgroundColor: '#10b981',
    },
    toggleBtnActiveUnpaid: {
        backgroundColor: '#ef4444',
    },
    toggleText: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#64748b',
    },
    toggleTextActive: {
        color: '#fff',
    },
    saveBtn: {
        marginTop: vs(10),
        marginBottom: vs(30),
        borderRadius: s(16),
        overflow: 'hidden',
    },
    saveGradient: {
        paddingVertical: vs(18),
        alignItems: 'center',
    },
    saveText: {
        color: '#fff',
        fontSize: normalize(18),
        fontWeight: '800',
    },
    filterOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: s(24),
        padding: s(20),
    },
    filterTitle: {
        fontSize: normalize(18),
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: vs(16),
        textAlign: 'center',
    },
    filterItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: vs(14),
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    filterItemActive: {
        backgroundColor: '#f5f7ff',
        borderRadius: s(12),
        paddingHorizontal: s(10),
    },
    filterItemText: {
        fontSize: normalize(16),
        color: '#64748b',
        fontWeight: '600',
    },
    filterItemTextActive: {
        color: '#4f46e5',
        fontWeight: '800',
    }
});
