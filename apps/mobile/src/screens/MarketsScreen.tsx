import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar,
    Dimensions,
    Alert,
    Modal,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Search as SearchIcon,
    Plus as PlusIcon,
    Store as StoreIcon,
    ChevronRight as ChevronRightIcon,
    Phone as PhoneIcon,
    MapPin as MapPinIcon,
    TrendingUp as TrendingUpIcon,
    DollarSign as DollarSignIcon,
    Clock as ClockIcon,
    Briefcase as BriefcaseIcon,
    X as XIcon,
    MoreVertical,
    Check as CheckIcon
} from 'lucide-react-native';
// Reanimated disabled for stability
/*
import Animated, {
    FadeInDown,
    FadeInRight,
    Layout,
} from 'react-native-reanimated';
*/
import { LinearGradient } from 'expo-linear-gradient';
import { useEntryContext } from '../context/EntryContext';
import { useMarkets } from '../context/MarketContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
const MapPin = MapPinIcon as any;
const TrendingUp = TrendingUpIcon as any;
const DollarSign = DollarSignIcon as any;
const Clock = ClockIcon as any;
const Briefcase = BriefcaseIcon as any;
const X = XIcon as any;
const Check = CheckIcon as any;

const { width } = Dimensions.get('window');


interface MarketItemProps {
    item: {
        id: string;
        name: string;
        phone: string;
        debt: number;
    };
    index: number;
}

const AnimatedMarketItem = ({ item, index, onDelete }: MarketItemProps & { onDelete: (id: string, name: string) => void }) => {
    // Check if this market has any active debt in entries
    const hasDebt = useMemo(() => {
        // This is a simplification. In a real app we might want to pre-calculate this or fetch from DB
        return false;
    }, [item.name]);

    return (
        <View
            style={{ width: '100%' }}
        >
            <TouchableOpacity style={styles.marketCard} activeOpacity={0.7}>
                <View style={styles.marketIconContainer}>
                    <LinearGradient
                        colors={['#f8fafc', '#f1f5f9']}
                        style={styles.marketIconInner}
                    >
                        <Store size={22} color="#4f46e5" />
                    </LinearGradient>
                </View>

                <View style={styles.marketInfo}>
                    <Text style={styles.marketName}>{item.name}</Text>
                    <View style={styles.marketSubInfo}>
                        <Phone size={12} color="#94a3b8" style={styles.subIcon} />
                        <Text style={styles.marketPhone}>{item.phone}</Text>
                    </View>
                </View>

                <View style={styles.marketMetadata}>
                    <TouchableOpacity
                        onPress={() => onDelete(item.id, item.name)}
                        style={styles.deleteBtn}
                    >
                        <X size={16} color="#94a3b8" />
                    </TouchableOpacity>
                    <ChevronRight size={18} color="#cbd5e1" style={{ marginLeft: 8 }} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

export const MarketsScreen = () => {
    const { entries } = useEntryContext();
    const { markets, loading, addMarket, deleteMarket } = useMarkets();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Search size={20} color="#94a3b8" />
                    <TextInput
                        placeholder="Do'kon qidirish..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        placeholderTextColor="#94a3b8"
                    />
                    {searchTerm !== '' && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <X size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={filteredMarkets}
                renderItem={({ item, index }) => (
                    <AnimatedMarketItem
                        item={item as any}
                        index={index}
                        onDelete={handleDelete}
                    />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={useMarkets().refreshMarkets}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Store size={48} color="#e2e8f0" />
                        <Text style={styles.emptyText}>
                            {searchTerm ? 'Mijozlar topilmadi' : 'Hozircha mijozlar yo\'q'}
                        </Text>
                    </View>
                }
            />

            <Modal
                transparent
                visible={isAddModalVisible}
                animationType="fade"
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Yangi market qo'shish</Text>
                            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                <X size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

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
                    </View>
                </View>
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
        marginBottom: 24,
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
    addButton: {
        borderRadius: 16,
        elevation: 8,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    addGradient: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchSection: {
        paddingHorizontal: 24,
        marginBottom: 24,
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
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    marketCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    marketIconContainer: {
        marginRight: 14,
    },
    marketIconInner: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    marketInfo: {
        flex: 1,
    },
    marketName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 2,
    },
    marketSubInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subIcon: {
        marginRight: 4,
    },
    marketPhone: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '600',
    },
    marketMetadata: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    debtBadge: {
        backgroundColor: '#fef2f2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    debtText: {
        color: '#ef4444',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        opacity: 0.3,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    deleteBtn: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
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
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
        marginLeft: 4,
    },
    submitBtn: {
        marginTop: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        gap: 8,
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
