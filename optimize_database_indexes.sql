-- Database indexes for performance optimization
-- Run this in your Supabase SQL editor to speed up queries

-- Index for entries table - client field (used in market entries lookup)
CREATE INDEX IF NOT EXISTS idx_entries_client ON entries(client);

-- Index for entries table - user_id field (used in seller entries lookup)
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);

-- Index for entries table - created_at field (used for ordering)
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);

-- Index for entries table - holat (payment status) field
CREATE INDEX IF NOT EXISTS idx_entries_holat ON entries(holat);

-- Composite index for common query patterns (client + created_at)
CREATE INDEX IF NOT EXISTS idx_entries_client_created_at ON entries(client, created_at DESC);

-- Index for profiles table - market_id field (used in joins)
CREATE INDEX IF NOT EXISTS idx_profiles_market_id ON profiles(market_id);

-- Index for payment_confirmations table - entry_id (used in joins)
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_entry_id ON payment_confirmations(entry_id);

-- Index for payment_confirmations table - market_id (used in filtering)
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_market_id ON payment_confirmations(market_id);

-- Index for payment_confirmations table - status (used in filtering)
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_status ON payment_confirmations(status);

-- Index for payment_confirmations table - created_at (used for ordering)
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_created_at ON payment_confirmations(created_at DESC);

-- Index for markets table - name field (used in lookups)
CREATE INDEX IF NOT EXISTS idx_markets_name ON markets(name);

-- Index for products table - name field (used in ordering and searching)
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
