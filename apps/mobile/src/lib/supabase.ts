import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ryaxdgdkavvpvilgacdh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YXhkZ2RrYXZ2cHZpbGdhY2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNzAwMzgsImV4cCI6MjA4Mjg0NjAzOH0.8y1GvTe13wXhJ2vPv5jlkfQon-prTa7Po8f19Dd5S3M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
