-- ============================================
-- FIX 1: Allow Markets to UPDATE entries SECURELY
-- ============================================

-- Create a helper function to get the current user's market_id
-- This function runs with SECURITY DEFINER to bypass RLS on the profiles table
CREATE OR REPLACE FUNCTION get_auth_market_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT market_id
  FROM profiles
  WHERE id = auth.uid()
  AND role = 'market';
$$;

-- Drop the old policy (if it exists) to avoid conflicts
DROP POLICY IF EXISTS "Markets can update their entries" ON entries;

-- Create the new simplified policy using the secure function
CREATE POLICY "Markets can update their entries" ON entries
FOR UPDATE
TO authenticated
USING (
    market_id = get_auth_market_id()
)
WITH CHECK (
    market_id = get_auth_market_id()
);

-- ============================================
-- FIX 2: Ensure users can read their own PROFILES
-- ============================================

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- FIX 3: Ensure users can read MARKET info
-- ============================================

-- Enable RLS on markets if not already enabled
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view markets" ON markets;
CREATE POLICY "Authenticated users can view markets" ON markets
FOR SELECT
TO authenticated
USING (true);
