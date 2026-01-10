const { Client } = require('pg');

// UPDATE THESE WITH YOUR CREDENTIALS IF DIFFERENT
const connectionString = 'postgresql://postgres.ryaxdgdkavvpvilgacdh:fozilxon_hokage@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require';

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    console.log('Testing connection to Supabase (bypassing SSL validation)...');
    try {
        await client.connect();
        console.log('✅ SUCCESS: Connected to the database!');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error('❌ FAILURE: Could not connect to the database.');
        console.error('Error details:', err.message);
        process.exit(1);
    }
}

testConnection();
