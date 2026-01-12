/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
    });
    // In production, show a more helpful error message
    if (import.meta.env.PROD) {
        throw new Error('Missing Supabase environment variables. Please check your Vercel environment variables configuration.');
    } else {
        throw new Error('Missing Supabase environment variables. Please check your .env file.');
    }
}

// Optimize Supabase client with better connection settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    db: {
        schema: 'public'
    },
    global: {
        headers: {
            'x-client-info': 'distitrack-web'
        }
    },
    // Reduce connection timeout for faster failure detection
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});
