const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.ryaxdgdkavvpvilgacdh:fozilxon_hokage@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require';

const sqlPath = path.join(__dirname, 'create_payment_confirmations_table.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() {
    console.log('Running migration...');
    try {
        await client.connect();

        // Split SQL by common separators if needed, but here we can try running it as a block
        // However, some statements like CREATE TABLE might need to be alone if there are syntax issues
        // We'll try running the whole block first.

        // First, check if column exists to avoid errors if partially applied
        const checkCol = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='payment_confirmations' AND column_name='target_role';
        `);

        if (checkCol.rows.length === 0) {
            console.log('Adding target_role column...');
            await client.query(`ALTER TABLE payment_confirmations ADD COLUMN IF NOT EXISTS target_role TEXT NOT NULL DEFAULT 'market' CHECK (target_role IN ('market', 'seller'));`);
        } else {
            console.log('Column target_role already exists.');
        }

        console.log('Applying full SQL script...');
        await client.query(sql);

        console.log('✅ Migration successful!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
