import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { s, vs, normalize } from '../utils/scaling';
import { User, Shield, Store, UserCheck, X } from 'lucide-react-native';

export const AdminUsersScreen = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name');

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            Alert.alert('Xato', error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setIsModalVisible(false);
            Alert.alert('Muvaffaqiyat', 'Rol yangilandi');
        } catch (error: any) {
            Alert.alert('Xato', error.message);
        }
    };

    const renderUserItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => {
                setSelectedUser(item);
                setIsModalVisible(true);
            }}
        >
            <View style={styles.avatarContainer}>
                {item.role === 'admin' ? (
                    <Shield size={24} color="#6366f1" />
                ) : item.role === 'market' ? (
                    <Store size={24} color="#10b981" />
                ) : (
                    <User size={24} color="#4f46e5" />
                )}
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.full_name || 'Noma\'lum'}</Text>
                <Text style={styles.userRole}>{item.role.toUpperCase()}</Text>
            </View>
            <UserCheck size={20} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Foydalanuvchilar</Text>
                <Text style={styles.subtitle}>{users.length} ta foydalanuvchi</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={renderUserItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Modal
                visible={isModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Rolni o'zgartirish</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalUserName}>{selectedUser?.full_name}</Text>

                        <View style={styles.roleOptions}>
                            {['seller', 'market', 'admin'].map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.roleBtn,
                                        selectedUser?.role === role && styles.roleBtnActive
                                    ]}
                                    onPress={() => updateRole(selectedUser.id, role)}
                                >
                                    <Text style={[
                                        styles.roleBtnText,
                                        selectedUser?.role === role && styles.roleBtnTextActive
                                    ]}>
                                        {role.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
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
        paddingHorizontal: s(24),
        paddingVertical: vs(20),
    },
    title: {
        fontSize: normalize(28),
        fontWeight: '900',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: normalize(14),
        color: '#64748b',
        fontWeight: '500',
    },
    list: {
        paddingHorizontal: s(24),
        paddingBottom: vs(40),
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: s(16),
        borderRadius: s(20),
        marginBottom: vs(12),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    avatarContainer: {
        width: s(48),
        height: s(48),
        borderRadius: s(16),
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(16),
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: normalize(16),
        fontWeight: '700',
        color: '#1e293b',
    },
    userRole: {
        fontSize: normalize(12),
        color: '#94a3b8',
        fontWeight: '600',
        marginTop: vs(2),
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: s(24),
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: s(24),
        padding: s(24),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(16),
    },
    modalTitle: {
        fontSize: normalize(18),
        fontWeight: '800',
        color: '#1e293b',
    },
    modalUserName: {
        fontSize: normalize(16),
        color: '#64748b',
        marginBottom: vs(20),
    },
    roleOptions: {
        gap: vs(10),
    },
    roleBtn: {
        padding: vs(14),
        borderRadius: s(12),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        alignItems: 'center',
    },
    roleBtnActive: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    roleBtnText: {
        fontWeight: '700',
        color: '#64748b',
    },
    roleBtnTextActive: {
        color: '#fff',
    }
});
