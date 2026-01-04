/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(
    supabaseUrl || 'https://ryaxdgdkavvpvilgacdh.supabase.co',
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YXhkZ2RrYXZ2cHZpbGdhY2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNzAwMzgsImV4cCI6MjA4Mjg0NjAzOH0.8y1GvTe13wXhJ2vPv5jlkfQon-prTa7Po8f19Dd5S3M'
);
