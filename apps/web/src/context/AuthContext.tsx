import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
    id: string;
    full_name: string | null;
    role: 'seller' | 'market' | 'admin';
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
            // Optimize: select only needed fields
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, role, market_id, markets(name)')
                .eq('id', userId)
                .single();

            if (error) throw error;

            // Handle markets relation - it might be an array or object
            const marketsData = data.markets as any;
            const marketName = Array.isArray(marketsData)
                ? marketsData[0]?.name
                : marketsData?.name;

            setProfile({
                id: data.id,
                full_name: data.full_name,
                role: data.role,
                market_id: data.market_id,
                market_name: marketName
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        }
    };

    useEffect(() => {
        let mounted = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        // Initialize auth state with timeout
        const initializeAuth = async () => {
            try {
                // Set a timeout to ensure loading doesn't get stuck
                timeoutId = setTimeout(() => {
                    if (mounted) {
                        console.warn('Auth initialization timeout - setting loading to false');
                        setLoading(false);
                    }
                }, 5000); // 5 second timeout

                const { data: { session }, error } = await supabase.auth.getSession();

                if (!mounted) return;

                if (error) {
                    console.error("Auth session error:", error);
                    setLoading(false);
                    clearTimeout(timeoutId);
                    return;
                }

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    try {
                        await fetchUserProfile(session.user.id);
                    } catch (profileError) {
                        console.error("Profile fetch error:", profileError);
                        // Continue even if profile fetch fails
                    }
                } else {
                    setProfile(null);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                if (mounted) {
                    clearTimeout(timeoutId);
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                try {
                    await fetchUserProfile(session.user.id);
                } catch (profileError) {
                    console.error("Profile fetch error on auth change:", profileError);
                }
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
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
