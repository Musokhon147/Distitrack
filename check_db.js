const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from apps/web/.env
dotenv.config({ path: path.join(__dirname, 'apps/web/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMarkets() {
    console.log('Checking markets...');
    const { data, error } = await supabase
        .from('markets')
        .select('*');

    if (error) {
        console.error('Error fetching markets:', error);
    } else {
        console.log('Markets in DB:', data);
    }
}

checkMarkets();
