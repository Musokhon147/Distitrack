import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';

export interface Product {
    id: string;
    name: string;
}

interface ProductContextType {
    products: Product[];
    loading: boolean;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchProducts = async () => {
        if (!user) {
            setProducts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name')
                .order('name', { ascending: true });

            if (error) throw error;
            setProducts(data || []);
        } catch (error: any) {
            console.error('Error fetching products:', error);
            if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
                setProducts([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProducts();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [user]);

    const addProduct = async (product: Omit<Product, 'id'>) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([{ name: product.name }])
                .select()
                .single();

            if (error) throw error;

            const newProduct: Product = {
                id: data.id,
                name: data.name,
            };
            setProducts(prev => [...prev, newProduct]);
        } catch (error: any) {
            console.error('Error adding product:', error);
            Alert.alert('Xatolik', 'Mahsulot qo\'shishda xatolik: ' + error.message);
            throw error;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error: any) {
            console.error('Error deleting product:', error);
            Alert.alert('Xatolik', 'Mahsulot o\'chirishda xatolik: ' + error.message);
            throw error;
        }
    };

    return (
        <ProductContext.Provider value={{ products, loading, addProduct, deleteProduct, refreshProducts: fetchProducts }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
