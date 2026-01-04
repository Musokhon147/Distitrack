/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(
    supabaseUrl || 'https://ryaxdgdkavvpvilgacdh.supabase.co',
    supabaseAnonKey || 'sb_publishable_Cz--uJUvri2_wwcj_t2hpA_o8IBcx8B'
);
