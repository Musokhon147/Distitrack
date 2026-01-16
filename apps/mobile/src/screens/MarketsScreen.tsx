import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar,
    ActivityIndicator,
    Image,
    useWindowDimensions,
    KeyboardAvoidingView,
    Alert,
    Modal,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Search as SearchIcon,
    Plus as PlusIcon,
    Store as StoreIcon,
    ChevronRight as ChevronRightIcon,
    Phone as PhoneIcon,
    X as XIcon,
    Calendar as CalendarIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEntryContext } from '../context/EntryContext';
import { useMarkets } from '../context/MarketContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { s, vs, normalize } from '../utils/scaling';

const marketSchema = z.object({
    name: z.string().min(2, 'Kamida 2 ta belgi'),
    phone: z.string().min(9, 'Telefon raqam xato'),
    address: z.string().optional(),
});

type MarketFormData = z.infer<typeof marketSchema>;

const Search = SearchIcon as any;
const Plus = PlusIcon as any;
const Store = StoreIcon as any;
const ChevronRight = ChevronRightIcon as any;
const Phone = PhoneIcon as any;
const X = XIcon as any;
const Calendar = CalendarIcon as any;

interface MarketItemProps {
    item: {
        id: string;
        name: string;
        phone: string;
        avatar_url?: string;
        created_at?: string;
    };
    index: number;
    userRole: string | null;
    onPress: (market: any) => void;
}

const AnimatedMarketItem = ({ item, index, userRole, onDelete, onPress }: MarketItemProps & { onDelete: (id: string, name: string) => void }) => {
    return (
        <View style={{ width: '100%' }}>
            <TouchableOpacity
                style={styles.marketCard}
                activeOpacity={0.7}
                onPress={() => onPress(item)}
            >
                <View style={styles.marketIconContainer}>
                    {item.avatar_url ? (
                        <Image source={{ uri: item.avatar_url }} style={styles.marketAvatar} />
                    ) : (
                        <LinearGradient
                            colors={['#f8fafc', '#f1f5f9']}
                            style={styles.marketIconInner}
                        >
                            <Store size={22} color="#4f46e5" />
                        </LinearGradient>
                    )}
                </View>

                <View style={styles.marketInfo}>
                    <Text style={styles.marketName}>{item.name}</Text>
                    <View style={styles.marketSubInfo}>
                        <Phone size={12} color="#94a3b8" style={styles.subIcon} />
                        <Text style={styles.marketPhone}>{item.phone}</Text>
                    </View>
                </View>

                <View style={styles.marketMetadata}>
                    {userRole === 'admin' && (
                        <TouchableOpacity
                            onPress={() => onDelete(item.id, item.name)}
                            style={styles.deleteBtn}
                        >
                            <X size={16} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                    <ChevronRight size={18} color="#cbd5e1" style={{ marginLeft: s(8) }} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

export const MarketsScreen = () => {
    const { width } = useWindowDimensions();
    const { userRole } = useAuth();
    const { entries } = useEntryContext();
    const { markets, loading, addMarket, deleteMarket } = useMarkets();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleMarketPress = (market: any) => {
        setSelectedMarket(market);
    };

    const { control, handleSubmit, reset, formState: { errors } } = useForm<MarketFormData>({
        resolver: zodResolver(marketSchema),
        defaultValues: {
            name: '',
            phone: '+998',
            address: '',
        }
    });

    const onAddSubmit = async (data: MarketFormData) => {
        setIsSubmitting(true);
        try {
            await addMarket(data);
            reset();
            setIsAddModalVisible(false);
        } catch (error) {
            // Error alert handled in context
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'O\'chirish',
            `"${name}" marketini o'chirib tashlamoqchimisiz?`,
            [
                { text: 'Bekor qilish', style: 'cancel' },
                { text: 'O\'chirish', style: 'destructive', onPress: () => deleteMarket(id) }
            ]
        );
    };

    const filteredMarkets = (markets || []).filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone.includes(searchTerm)
    );

    const SummaryHeader = () => (
        <View style={styles.summaryContainerSync}>
            <View style={styles.searchSectionSync}>
                <View style={styles.searchBar}>
                    <Search size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Do'konlarni qidirish..."
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
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Do'konlar</Text>
                    <Text style={styles.subtitle}>Sizning barcha mijozlaringiz</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsAddModalVisible(true)}
                >
                    <LinearGradient
                        colors={['#4f46e5', '#3730a3']}
                        style={styles.addGradient}
                    >
                        <Plus size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredMarkets}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <AnimatedMarketItem
                        item={item as any}
                        index={index}
                        userRole={userRole}
                        onPress={handleMarketPress}
                        onDelete={handleDelete}
                    />
                )}
                ListHeaderComponent={SummaryHeader}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={useMarkets().refreshMarkets}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Store size={48} color="#94a3b8" />
                        <Text style={styles.emptyText}>Do'konlar topilmadi</Text>
                    </View>
                }
            />

            <Modal
                transparent
                visible={!!selectedMarket}
                animationType="fade"
                onRequestClose={() => setSelectedMarket(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedMarket(null)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Market ma'lumotlari</Text>
                            <TouchableOpacity onPress={() => setSelectedMarket(null)}>
                                <X size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        {selectedMarket && (
                            <View style={styles.detailsContent}>
                                <View style={styles.detailItem}>
                                    <Store size={20} color="#4f46e5" style={styles.detailIcon} />
                                    <View>
                                        <Text style={styles.detailLabel}>Nomi</Text>
                                        <Text style={styles.detailValue}>{selectedMarket.name}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailItem}>
                                    <Phone size={20} color="#4f46e5" style={styles.detailIcon} />
                                    <View>
                                        <Text style={styles.detailLabel}>Telefon</Text>
                                        <Text style={styles.detailValue}>{selectedMarket.phone}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailItem}>
                                    <Calendar size={20} color="#4f46e5" style={styles.detailIcon} />
                                    <View>
                                        <Text style={styles.detailLabel}>Qo'shilgan sana</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedMarket.created_at
                                                ? new Date(selectedMarket.created_at).toLocaleDateString('uz-UZ', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })
                                                : '-'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                transparent
                visible={isAddModalVisible}
                animationType="slide"
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Yangi market qo'shish</Text>
                            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                <X size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Nomi</Text>
                                <Controller
                                    control={control}
                                    name="name"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[styles.input, errors.name && styles.inputError]}
                                            placeholder="Market nomi"
                                            value={value}
                                            onChangeText={onChange}
                                            placeholderTextColor="#94a3b8"
                                        />
                                    )}
                                />
                                {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Telefon</Text>
                                <Controller
                                    control={control}
                                    name="phone"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[styles.input, errors.phone && styles.inputError]}
                                            placeholder="+998"
                                            value={value}
                                            onChangeText={onChange}
                                            keyboardType="phone-pad"
                                            placeholderTextColor="#94a3b8"
                                        />
                                    )}
                                />
                                {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Manzil (ixtiyoriy)</Text>
                                <Controller
                                    control={control}
                                    name="address"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Manzil"
                                            value={value}
                                            onChangeText={onChange}
                                            placeholderTextColor="#94a3b8"
                                        />
                                    )}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={handleSubmit(onAddSubmit)}
                                disabled={isSubmitting}
                            >
                                <LinearGradient
                                    colors={['#4f46e5', '#3730a3']}
                                    style={styles.submitGradient}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Plus size={20} color="#fff" />
                                            <Text style={styles.submitText}>Qo'shish</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
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
        paddingTop: vs(10),
        marginBottom: vs(24),
    },
    title: {
        fontSize: normalize(32),
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: normalize(14),
        color: '#64748b',
        fontWeight: '500',
    },
    addButton: {
        borderRadius: s(16),
        elevation: 8,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    addGradient: {
        width: s(52),
        height: s(52),
        borderRadius: s(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryContainerSync: {
        paddingHorizontal: s(24),
        marginBottom: vs(16),
    },
    searchSectionSync: {
        marginTop: vs(4),
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: s(18),
        paddingHorizontal: s(16),
        height: vs(54),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    searchInput: {
        flex: 1,
        marginLeft: s(12),
        fontSize: normalize(16),
        fontWeight: '500',
        color: '#1e293b',
    },
    listContainer: {
        paddingBottom: vs(40),
    },
    marketCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: s(22),
        padding: s(14),
        marginBottom: vs(14),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    marketIconContainer: {
        marginRight: s(14),
    },
    marketIconInner: {
        width: s(52),
        height: s(52),
        borderRadius: s(16),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    marketAvatar: {
        width: s(52),
        height: s(52),
        borderRadius: s(16),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    marketInfo: {
        flex: 1,
    },
    marketName: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: vs(2),
    },
    marketSubInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subIcon: {
        marginRight: s(4),
    },
    marketPhone: {
        fontSize: normalize(13),
        color: '#94a3b8',
        fontWeight: '600',
    },
    marketMetadata: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteBtn: {
        padding: s(4),
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: vs(50),
        opacity: 0.3,
    },
    emptyText: {
        marginTop: vs(10),
        fontSize: normalize(16),
        color: '#64748b',
        fontWeight: '600',
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
        paddingBottom: Platform.OS === 'ios' ? vs(40) : vs(24),
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
        marginBottom: vs(16),
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
        fontWeight: '500',
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    inputError: {
        borderColor: '#f43f5e',
    },
    errorText: {
        color: '#f43f5e',
        fontSize: normalize(12),
        fontWeight: '600',
        marginTop: vs(4),
        marginLeft: s(4),
    },
    submitBtn: {
        marginTop: vs(8),
        borderRadius: s(16),
        overflow: 'hidden',
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: vs(18),
        gap: s(8),
    },
    submitText: {
        color: '#fff',
        fontSize: normalize(18),
        fontWeight: '700',
    },
    detailsContent: {
        marginTop: vs(8),
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vs(12),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    detailIcon: {
        marginRight: s(16),
        backgroundColor: '#f1f5f9',
        padding: s(10),
        borderRadius: s(12),
    },
    detailLabel: {
        fontSize: normalize(12),
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: normalize(16),
        color: '#1e293b',
        fontWeight: '700',
        marginTop: vs(2),
    },
});
