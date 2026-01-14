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
    Dimensions,
    ScrollView,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEntryContext } from '../context/EntryContext';
import ExpoFileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
    History as HistoryIcon,
    Search as SearchIcon,
    Filter as FilterIcon,
    Trash2 as Trash2Icon,
    Edit3 as Edit3Icon,
    Check as CheckIcon,
    X as XIcon,
    Calendar as CalendarIcon,
    ShoppingBag as ShoppingBagIcon,
    Hash as HashIcon,
    CreditCard as CreditCardIcon,
    Package as PackageIcon,
    ChevronRight,
    ArrowUpRight,
    Download as DownloadIcon
} from 'lucide-react-native';
import Animated, {
    FadeInDown,
    Layout
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Entry } from '@distitrack/common';

const { width } = Dimensions.get('window');

const History = HistoryIcon as any;
const Search = SearchIcon as any;
const Filter = FilterIcon as any;
const Trash2 = Trash2Icon as any;
const Edit3 = Edit3Icon as any;
const Check = CheckIcon as any;
const X = XIcon as any;
const Calendar = CalendarIcon as any;
const ShoppingBag = ShoppingBagIcon as any;
const Hash = HashIcon as any;
const CreditCard = CreditCardIcon as any;
const Package = PackageIcon as any;
const Download = DownloadIcon as any;

export const RecordsScreen = () => {
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

    const exportToCSV = async () => {
        if (filteredEntries.length === 0) {
            Alert.alert('Xatolik', 'Eksport qilish uchun ma\'lumotlar yo\'q');
            return;
        }

        try {
            const header = 'Market,Telefon,Mahsulot,Miqdori,Narxi,Holati,Sana\n';
            const rows = filteredEntries.map(e =>
                `"${e.marketNomi}","${e.marketRaqami || ''}","${e.mahsulotTuri}","${e.miqdori}","${e.narx}","${e.tolovHolati}","${e.sana || ''}"`
            ).join('\n');
            const csvContent = header + rows;

            const filename = `records_${new Date().getTime()}.csv`;
            const fileUri = (ExpoFileSystem as any).documentDirectory + filename;

            await (ExpoFileSystem as any).writeAsStringAsync(fileUri, csvContent, { encoding: (ExpoFileSystem as any).EncodingType.UTF8 });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Eksport', `Fayl saqlandi: ${fileUri}`);
            }
        } catch (error) {
            Alert.alert('Xatolik', 'Eksport qilishda xatolik yuz berdi');
        }
    };

    const handleDelete = (id: string, marketName: string) => {
        Alert.alert(
            "O'chirish",
            `"${marketName}" yozuvini o'chirmoqchimisiz?`,
            [
                { text: "Bekor qilish", style: "cancel" },
                { text: "O'chirish", style: "destructive", onPress: () => deleteEntry(id) }
            ]
        );
    };

    const renderItem = ({ item, index }: { item: Entry, index: number }) => (
        <View
            style={styles.card}
        >
            <View style={styles.cardHeader}>
                <View style={styles.marketInfo}>
                    <View style={styles.iconContainer}>
                        <ShoppingBag size={20} color="#4f46e5" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.marketName}>{item.marketNomi}</Text>
                        <View style={styles.dateRow}>
                            <Calendar size={12} color="#94a3b8" />
                            <Text style={styles.dateText}>{item.sana || 'Bugun'}</Text>
                        </View>
                    </View>
                </View>
                <View style={[
                    styles.statusBadge,
                    item.tolovHolati === "to'langan" ? styles.paidBadge : styles.unpaidBadge
                ]}>
                    <Text style={[
                        styles.statusText,
                        item.tolovHolati === "to'langan" ? styles.paidText : styles.unpaidText
                    ]}>
                        {item.tolovHolati === "to'langan" ? "To'langan" : "Qarz"}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Mahsulot</Text>
                        <Text style={styles.detailValue}>{item.mahsulotTuri}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Miqdori</Text>
                        <Text style={styles.detailValue}>{item.miqdori}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.priceRow}>
                    <View>
                        <Text style={styles.detailLabel}>Umumiy Summa</Text>
                        <Text style={styles.priceValue}>
                            {new Intl.NumberFormat('en-US').format(parseFloat(item.narx?.toString().replace(/\D/g, '') || '0'))} <Text style={styles.currency}>so'm</Text>
                        </Text>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity onPress={() => handleEditStart(item)} style={styles.actionBtn}>
                            <Edit3Icon size={18} color="#4f46e5" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id, item.marketNomi)} style={[styles.actionBtn, styles.deleteBtn]}>
                            <Trash2Icon size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Tarix</Text>
                    <Text style={styles.subtitle}>{entries.length} ta yozuvlar mavjud</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={styles.filterTrigger} onPress={exportToCSV}>
                        <View style={styles.filterGradient}>
                            <Download size={20} color="#64748b" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterTrigger} onPress={() => setIsFilterVisible(!isFilterVisible)}>
                        <LinearGradient
                            colors={statusFilter !== 'Barchasi' ? ['#4f46e5', '#3730a3'] : ['#fff', '#fff']}
                            style={styles.filterGradient}
                        >
                            <Filter size={20} color={statusFilter !== 'Barchasi' ? '#fff' : '#64748b'} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Search size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Qidirish (market yoki mahsulot)..."
                        placeholderTextColor="#94a3b8"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm !== '' && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <X size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isFilterVisible && (
                <View style={styles.filterDropdown}>
                    {['Barchasi', "to'langan", "to'lanmagan"].map((status: string) => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.filterItem,
                                statusFilter === status && styles.filterItemActive
                            ]}
                            onPress={() => {
                                setStatusFilter(status);
                                setIsFilterVisible(false);
                            }}
                        >
                            <Text style={[
                                styles.filterItemText,
                                statusFilter === status && styles.filterItemTextActive
                            ]}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Text>
                            {statusFilter === status && <Check size={16} color="#4f46e5" />}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <FlatList
                data={filteredEntries}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <History size={48} color="#e2e8f0" />
                        <Text style={styles.emptyText}>Yozuvlar topilmadi</Text>
                    </View>
                }
            />

            {/* Edit Modal (Keeping for functionality) */}
            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Tahrirlash</Text>
                        <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.closeBtn}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalForm}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Miqdori</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={editForm.miqdori}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, miqdori: text }))}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Narxi</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={editForm.narx}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, narx: text }))}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Holati</Text>
                            <View style={styles.statusToggle}>
                                {["to'langan", "to'lanmagan"].map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[
                                            styles.toggleBtn,
                                            editForm.tolovHolati === status && (status === "to'langan" ? styles.togglePaid : styles.toggleUnpaid)
                                        ]}
                                        onPress={() => setEditForm(prev => ({ ...prev, tolovHolati: status as any }))}
                                    >
                                        <Text style={[
                                            styles.toggleBtnText,
                                            editForm.tolovHolati === status && styles.toggleBtnTextActive
                                        ]}>
                                            {status.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleEditSave}>
                            <Text style={styles.saveBtnText}>SAQLASH</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
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
        paddingHorizontal: 24,
        paddingTop: 10,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    filterTrigger: {
        borderRadius: 14,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    filterGradient: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    searchSection: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 54,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
        color: '#1e293b',
    },
    filterDropdown: {
        backgroundColor: '#fff',
        marginHorizontal: 24,
        borderRadius: 18,
        padding: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    filterItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
    },
    filterItemActive: {
        backgroundColor: '#f5f3ff',
    },
    filterItemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    filterItemTextActive: {
        color: '#4f46e5',
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fcfcfe',
    },
    marketInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#f5f3ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    marketName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    dateText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    paidBadge: {
        backgroundColor: '#ecfdf5',
    },
    unpaidBadge: {
        backgroundColor: '#fef2f2',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    paidText: {
        color: '#10b981',
    },
    unpaidText: {
        color: '#ef4444',
    },
    cardBody: {
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    priceValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
    },
    currency: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '700',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    deleteBtn: {
        backgroundColor: '#fff1f2',
        borderColor: '#ffe4e6',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
    },
    closeBtn: {
        padding: 8,
    },
    modalForm: {
        padding: 24,
    },
    modalInput: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    statusToggle: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    toggleBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    togglePaid: {
        backgroundColor: '#10b981',
    },
    toggleUnpaid: {
        backgroundColor: '#ef4444',
    },
    toggleBtnText: {
        fontWeight: '800',
        color: '#64748b',
    },
    toggleBtnTextActive: {
        color: '#fff',
    },
    saveBtn: {
        backgroundColor: '#4f46e5',
        padding: 20,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 32,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputGroup: {
        marginBottom: 24,
    },
});
