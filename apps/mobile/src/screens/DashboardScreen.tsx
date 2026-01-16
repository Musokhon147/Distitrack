import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEntryContext } from '../context/EntryContext';
import { useAuth } from '../context/AuthContext';
import { useMarkets } from '../context/MarketContext';
import { useProducts } from '../context/ProductContext';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ShoppingBag,
    Hash,
    Package as PackageIcon,
    CreditCard,
    Check,
    AlertCircle,
    CheckCircle2,
    PlusCircle,
    User,
    Search,
    ChevronDown,
    X,
    Bell
} from 'lucide-react-native';
import { Modal, FlatList } from 'react-native';
// Reanimated disabled for stability
/*
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    useSharedValue
} from 'react-native-reanimated';
*/

const { width, height } = Dimensions.get('window');

// const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const { markets } = useMarkets();
    const { products } = useProducts();
    const { addEntry, loading: contextLoading, pendingRequests } = useEntryContext();

    const [form, setForm] = useState({
        marketNomi: '',
        marketRaqami: '+998',
        mahsulotTuri: '',
        miqdori: '',
        narx: '',
        tolovHolati: 'to\'lanmagan' as 'to\'langan' | 'to\'lanmagan'
    });

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [pickerVisible, setPickerVisible] = useState<'market' | 'product' | null>(null);
    const [pickerSearch, setPickerSearch] = useState('');

    // Animation values for blobs deleted for stability
    const blob1Style = {};
    const blob2Style = {};

    const handleSave = async () => {
        if (!form.marketNomi || !form.mahsulotTuri || !form.miqdori || !form.narx) {
            Alert.alert('Xatolik', 'Iltimos, barcha majburiy maydonlarni to\'ldiring');
            return;
        }
        try {
            await addEntry(form);
            setForm({
                marketNomi: '',
                marketRaqami: '+998',
                mahsulotTuri: '',
                miqdori: '',
                narx: '',
                tolovHolati: 'to\'lanmagan'
            });
            Alert.alert('Muvaffaqiyat', 'Yozuv muvaffaqiyatli saqlandi!');
        } catch (error) {
            Alert.alert('Xatolik', 'Saqlashda xatolik yuz berdi');
        }
    };

    const renderPickerInput = (
        label: string,
        icon: any,
        value: string,
        placeholder: string,
        type: 'market' | 'product'
    ) => (
        <View
            style={styles.inputGroup}
        >
            <View style={styles.labelContainer}>
                {icon}
                <Text style={styles.label}>{label}</Text>
            </View>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                    setPickerVisible(type);
                    setPickerSearch('');
                }}
                style={[
                    styles.inputWrapper,
                    pickerVisible === type && styles.inputWrapperFocused
                ]}
            >
                <Text style={[styles.inputValue, !value && styles.inputPlaceholder]}>
                    {value || placeholder}
                </Text>
                <ChevronDown size={18} color="#94a3b8" />
            </TouchableOpacity>
        </View>
    );

    const renderInput = (
        label: string,
        icon: any,
        value: string,
        onChange: (t: string) => void,
        placeholder: string,
        fieldId: string,
        keyboardType: any = 'default'
    ) => (
        <View
            style={styles.inputGroup}
        >
            <View style={styles.labelContainer}>
                {icon}
                <Text style={styles.label}>{label}</Text>
            </View>
            <View style={[
                styles.inputWrapper,
                focusedField === fieldId && styles.inputWrapperFocused
            ]}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor="rgba(30, 41, 59, 0.3)"
                    keyboardType={keyboardType}
                    onFocus={() => setFocusedField(fieldId)}
                    onBlur={() => setFocusedField(null)}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Background Decorations disabled */}
            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header Section */}
                        <View
                            style={styles.header}
                        >
                            <View>
                                <Text style={styles.title}>Bo'zor Daftari</Text>
                                <View style={styles.statusBadge}>
                                    <View style={styles.statusDot} />
                                    <Text style={styles.statusText}>Tizim Onlayn</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <TouchableOpacity
                                    style={{ position: 'relative', padding: 4 }}
                                    onPress={() => navigation.navigate('Notifications')}
                                >
                                    <Bell size={24} color="#1e293b" />
                                    {pendingRequests.length > 0 && (
                                        <View style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: 10,
                                            height: 10,
                                            borderRadius: 5,
                                            backgroundColor: '#ef4444',
                                            borderWidth: 1,
                                            borderColor: '#fff'
                                        }} />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.profileBtn}
                                    onPress={() => navigation.navigate('Profil')}
                                >
                                    <LinearGradient
                                        colors={['#4f46e5', '#3730a3']}
                                        style={styles.profileGradient}
                                    >
                                        <User size={20} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Glass Form Card */}
                        <View
                            style={styles.glassCard}
                        >
                            <View style={styles.formHeader}>
                                <View style={styles.formIconBox}>
                                    <PlusCircle size={24} color="#fff" />
                                </View>
                                <Text style={styles.formTitle}>Yangi yozuv qo'shish</Text>
                            </View>

                            <View style={styles.formContent}>
                                {renderPickerInput("Market", <ShoppingBag size={14} color="#64748b" />, form.marketNomi, "Do'konni tanlang", "market")}
                                {renderInput("Telefon", <Hash size={14} color="#64748b" />, form.marketRaqami, (t) => setForm({ ...form, marketRaqami: t }), "+998", "phone", "phone-pad")}
                                {renderPickerInput("Mahsulot", <PackageIcon size={14} color="#64748b" />, form.mahsulotTuri, "Mahsulotni tanlang", "product")}

                                <View style={styles.row}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        {renderInput("Miqdori", <PlusCircle size={14} color="#64748b" />, form.miqdori, (t) => setForm({ ...form, miqdori: t }), "50 kg", "quantity")}
                                    </View>
                                    <View style={{ flex: 1.2, marginLeft: 8 }}>
                                        {renderInput("Umumiy Narxi", <CreditCard size={14} color="#64748b" />, form.narx, (t) => {
                                            // Remove non-numeric characters
                                            const numeric = t.replace(/\D/g, '');
                                            // Format with commas
                                            const formatted = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                            setForm({ ...form, narx: formatted });
                                        }, "Umumiy summa", "price", "numeric")}
                                    </View>
                                </View>

                                {/* Payment Toggle */}
                                <View style={styles.toggleGroup}>
                                    <View style={styles.labelContainer}>
                                        {form.tolovHolati === "to'langan" ? <CheckCircle2 size={14} color="#10b981" /> : <AlertCircle size={14} color="#f43f5e" />}
                                        <Text style={styles.label}>To'lov holati</Text>
                                    </View>
                                    <View style={styles.toggleContainer}>
                                        <TouchableOpacity
                                            style={[styles.toggleBtn, form.tolovHolati === "to'lanmagan" && styles.toggleBtnActiveUnpaid]}
                                            onPress={() => setForm({ ...form, tolovHolati: "to'lanmagan" })}
                                        >
                                            <AlertCircle size={20} color={form.tolovHolati === "to'lanmagan" ? "#fff" : "#94a3b8"} />
                                            <Text style={[styles.toggleText, form.tolovHolati === "to'lanmagan" && styles.toggleTextActive]}>To'lanmagan</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.toggleBtn, form.tolovHolati === "to'langan" && styles.toggleBtnActivePaid]}
                                            onPress={() => setForm({ ...form, tolovHolati: "to'langan" })}
                                        >
                                            <CheckCircle2 size={20} color={form.tolovHolati === "to'langan" ? "#fff" : "#94a3b8"} />
                                            <Text style={[styles.toggleText, form.tolovHolati === "to'langan" && styles.toggleTextActive]}>To'langan</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.saveBtn}
                                    onPress={handleSave}
                                    disabled={contextLoading}
                                >
                                    <LinearGradient
                                        colors={['#4f46e5', '#3730a3']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.saveGradient}
                                    >
                                        {contextLoading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <>
                                                <Check size={24} color="#fff" />
                                                <Text style={styles.saveText}>SAQLASH</Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Picker Modal */}
            <Modal
                visible={!!pickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPickerVisible(null)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {pickerVisible === 'market' ? 'Marketni tanlang' : 'Mahsulotni tanlang'}
                            </Text>
                            <TouchableOpacity onPress={() => setPickerVisible(null)}>
                                <X size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalSearchBar}>
                            <Search size={18} color="#94a3b8" />
                            <TextInput
                                style={styles.modalSearchInput}
                                placeholder="Qidirish..."
                                value={pickerSearch}
                                onChangeText={setPickerSearch}
                                placeholderTextColor="#94a3b8"
                                autoFocus
                            />
                        </View>

                        <FlatList
                            data={
                                pickerVisible === 'market'
                                    ? (markets || []).filter(m => m.name.toLowerCase().includes(pickerSearch.toLowerCase()))
                                    : (products || []).filter(p => p.name.toLowerCase().includes(pickerSearch.toLowerCase()))
                            }
                            keyExtractor={item => item.id}
                            style={styles.pickerList}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        if (pickerVisible === 'market') {
                                            setForm(prev => ({ ...prev, marketNomi: item.name, marketRaqami: (item as any).phone || prev.marketRaqami }));
                                        } else {
                                            setForm(prev => ({ ...prev, mahsulotTuri: item.name }));
                                        }
                                        setPickerVisible(null);
                                    }}
                                >
                                    <Text style={styles.pickerItemText}>{item.name}</Text>
                                    <ChevronDown size={18} color="#e2e8f0" style={{ transform: [{ rotate: '-90deg' }] }} />
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    blob: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        filter: Platform.OS === 'ios' ? 'blur(60px)' : undefined, // Native blur is better but web-style needs trick
        opacity: 0.15,
    },
    blob1: {
        backgroundColor: '#4f46e5',
        top: -100,
        right: -50,
    },
    blob2: {
        backgroundColor: '#10b981',
        bottom: 100,
        left: -100,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10b981',
        marginRight: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4f46e5',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    profileBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    profileGradient: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.05,
        shadowRadius: 30,
        elevation: 10,
        overflow: 'hidden',
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 8,
        gap: 12,
    },
    formIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    formContent: {
        padding: 24,
        paddingTop: 8,
    },
    inputGroup: {
        marginBottom: 16,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        marginLeft: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.8)',
        borderRadius: 16,
        height: 56,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    inputWrapperFocused: {
        borderColor: '#4f46e5',
        backgroundColor: '#fff',
    },
    input: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleGroup: {
        marginTop: 8,
        marginBottom: 24,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(226, 232, 240, 0.4)',
        padding: 4,
        borderRadius: 18,
        gap: 4,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 14,
        gap: 8,
    },
    toggleBtnActivePaid: {
        backgroundColor: '#10b981',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    toggleBtnActiveUnpaid: {
        backgroundColor: '#f43f5e',
        shadowColor: '#f43f5e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    toggleText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748b',
    },
    toggleTextActive: {
        color: '#fff',
    },
    saveBtn: {
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 8,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    saveGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    saveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
    inputValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    inputPlaceholder: {
        color: 'rgba(30, 41, 59, 0.3)',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    modalSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 50,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    modalSearchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    pickerList: {
        marginTop: 4,
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    pickerItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
    },
});
