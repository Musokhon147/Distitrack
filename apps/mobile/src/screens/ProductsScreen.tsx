import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Platform,
    Dimensions,
    Alert,
    Modal,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Plus as PlusIcon,
    Package as PackageIcon,
    Trash2 as Trash2Icon,
    X as XIcon,
    ChevronLeft as ChevronLeftIcon,
    Search as SearchIcon
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
import { useProducts } from '../context/ProductContext';

const Plus = PlusIcon as any;
const Package = PackageIcon as any;
const Trash2 = Trash2Icon as any;
const X = XIcon as any;
const ChevronLeft = ChevronLeftIcon as any;
const Search = SearchIcon as any;

const { width } = Dimensions.get('window');

export const ProductsScreen = ({ navigation }: any) => {
    const { products, loading, addProduct, deleteProduct, refreshProducts } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddProduct = async () => {
        if (!newProductName.trim()) return;
        setIsSubmitting(true);
        try {
            await addProduct({ name: newProductName.trim() });
            setNewProductName('');
            setIsAddModalVisible(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'O\'chirish',
            `"${name}" mahsulot turini o'chirib tashlamoqchimisiz?`,
            [
                { text: 'Bekor qilish', style: 'cancel' },
                { text: 'O\'chirish', style: 'destructive', onPress: () => deleteProduct(id) }
            ]
        );
    };

    const filteredProducts = (products || []).filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <ChevronLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Mahsulotlar</Text>
                    <Text style={styles.subtitle}>Barcha mahsulot turlari</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsAddModalVisible(true)}
                >
                    <LinearGradient
                        colors={['#6366f1', '#4338ca']}
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
                        placeholder="Mahsulot qidirish..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        placeholderTextColor="#94a3b8"
                    />
                </View>
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item, index }) => (
                    <View
                        style={styles.productCard}
                    >
                        <View style={styles.productIconContainer}>
                            <Package size={20} color="#6366f1" />
                        </View>
                        <Text style={styles.productName}>{item.name}</Text>
                        <TouchableOpacity
                            onPress={() => handleDelete(item.id, item.name)}
                            style={styles.deleteBtn}
                        >
                            <Trash2 size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                )}
                refreshing={loading}
                onRefresh={refreshProducts}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Package size={48} color="#e2e8f0" />
                        <Text style={styles.emptyText}>Mahsulotlar topilmadi</Text>
                    </View>
                }
            />

            <Modal
                transparent
                visible={isAddModalVisible}
                animationType="slide"
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Yangi mahsulot</Text>
                            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                <X size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Mahsulot nomi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masalan: Telefon"
                            value={newProductName}
                            onChangeText={setNewProductName}
                            placeholderTextColor="#94a3b8"
                            autoFocus
                        />

                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleAddProduct}
                            disabled={isSubmitting || !newProductName.trim()}
                        >
                            <LinearGradient
                                colors={['#6366f1', '#4338ca']}
                                style={styles.submitGradient}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitText}>Qo'shish</Text>
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    addButton: {
        borderRadius: 12,
        elevation: 4,
    },
    addGradient: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
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
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    productIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    productName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    deleteBtn: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        opacity: 0.3,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
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
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontWeight: '500',
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        marginBottom: 20,
    },
    submitBtn: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitGradient: {
        padding: 16,
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
