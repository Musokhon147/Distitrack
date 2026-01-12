import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
    id: string;
    full_name: string | null;
    role: 'seller' | 'market';
    market_id: string | null;
    market_name?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    logout: () => Promise<void>; // Alias for signOut
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, markets(name)')
                .eq('id', userId)
                .single();

            if (error) throw error;

            setProfile({
                ...data,
                market_name: data.markets?.name
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        }
    };

    useEffect(() => {
        // Initialize auth state
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchUserProfile(session.user.id);
                } else {
                    setProfile(null);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchUserProfile(session.user.id);
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            // Explicitly clear state to ensure UI updates
            setSession(null);
            setUser(null);
        }
    };

    const value = {
        isAuthenticated: !!session,
        user,
        profile,
        session,
        loading,
        signOut,
        logout: signOut, // Alias
        refreshProfile: () => user ? fetchUserProfile(user.id) : Promise.resolve(),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
