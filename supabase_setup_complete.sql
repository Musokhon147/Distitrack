-- ============================================
-- COMPLETE SUPABASE SETUP FOR DISTITRACK
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This consolidates all your SQL setup

-- ============================================
-- 1. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read products"
    ON products FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert products"
    ON products FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update products"
    ON products FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete products"
    ON products FOR DELETE
    TO authenticated
    USING (true);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- ============================================
-- 2. PROFILES TABLE SETUP
-- ============================================

-- Add role and market_id columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('seller', 'market')) DEFAULT 'seller',
ADD COLUMN IF NOT EXISTS market_id UUID REFERENCES public.markets(id),
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_market_id ON public.profiles(market_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Enable insert for authenticated users" ON profiles
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id" ON profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete for users based on user_id" ON profiles
FOR DELETE 
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- 3. PROFILE CREATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user(
    user_id UUID,
    user_role TEXT,
    user_market_id UUID,
    user_full_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, role, market_id, full_name, updated_at)
    VALUES (user_id, user_role, user_market_id, user_full_name, NOW())
    ON CONFLICT (id) 
    DO UPDATE SET
        role = EXCLUDED.role,
        market_id = EXCLUDED.market_id,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_profile_for_new_user(UUID, TEXT, UUID, TEXT) TO authenticated;

-- ============================================
-- 4. ENTRIES TABLE SETUP
-- ============================================

-- Add market_id column if it doesn't exist
ALTER TABLE entries ADD COLUMN IF NOT EXISTS market_id UUID REFERENCES markets(id);

-- Fix foreign key constraint with cascade delete
ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_user_id_fkey;
ALTER TABLE entries
ADD CONSTRAINT entries_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users (id)
ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for owned entries" ON entries;
DROP POLICY IF EXISTS "Enable read access for market owners" ON entries;
DROP POLICY IF EXISTS "Enable read access for sellers" ON entries;
DROP POLICY IF EXISTS "Sellers can see own entries" ON entries;
DROP POLICY IF EXISTS "Markets can see their own entries" ON entries;
DROP POLICY IF EXISTS "Sellers can manage their entries" ON entries;

-- Create comprehensive RLS policies for entries
-- Sellers can see all entries
CREATE POLICY "Sellers can see all entries" ON entries
FOR SELECT 
TO authenticated
USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'seller'
);

-- Markets can see entries assigned to them
CREATE POLICY "Markets can see their entries" ON entries
FOR SELECT
TO authenticated
USING (
    market_id = (SELECT market_id FROM profiles WHERE id = auth.uid())
    AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'market'
);

-- Sellers can insert/update/delete their own entries
CREATE POLICY "Sellers can manage entries" ON entries
FOR ALL
TO authenticated
USING (
    auth.uid() = user_id
    AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'seller'
)
WITH CHECK (
    auth.uid() = user_id
    AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'seller'
);

-- ============================================
-- 5. MARKETS TABLE SETUP
-- ============================================

-- Enable RLS
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON markets;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON markets;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON markets;
DROP POLICY IF EXISTS "Enable insert for all" ON markets;

-- Create policies for markets
-- Everyone (including unauthenticated) can read markets (for registration dropdown)
CREATE POLICY "Enable read access for all users" ON markets
FOR SELECT
USING (true);

-- Authenticated users can insert markets
CREATE POLICY "Enable insert for authenticated users only" ON markets
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can delete markets
CREATE POLICY "Enable delete for authenticated users only" ON markets
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- 6. BACKFILL DATA (Optional)
-- ============================================

-- Backfill market_id for existing entries based on client name matching market name
UPDATE entries
SET market_id = markets.id
FROM markets
WHERE entries.client = markets.name
AND entries.market_id IS NULL;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
