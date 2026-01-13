-- ============================================
-- FINAL FIX: Allow Markets to UPDATE entries SECURELY (via ID or Name)
-- ============================================

-- 1. Create a helper function to get market info for the current user
-- SECURITY DEFINER allows it to read data regardless of RLS on other tables
CREATE OR REPLACE FUNCTION get_auth_market_info()
RETURNS TABLE (mid uuid, mname text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT p.market_id, m.name
  FROM profiles p
  JOIN markets m ON p.market_id = m.id
  WHERE p.id = auth.uid()
  AND p.role = 'market';
$$;

-- 2. Drop the old policy
DROP POLICY IF EXISTS "Markets can update their entries" ON entries;

-- 3. Create the new flexible policy
-- Check both market_id (best practice) and client (fallback because mobile doesn't set ID yet)
CREATE POLICY "Markets can update their entries" ON entries
FOR UPDATE
TO authenticated
USING (
    market_id = (SELECT mid FROM get_auth_market_info())
    OR
    client = (SELECT mname FROM get_auth_market_info())
)
WITH CHECK (
    market_id = (SELECT mid FROM get_auth_market_info())
    OR
    client = (SELECT mname FROM get_auth_market_info())
);

-- 4. (OPTIONAL CLEANUP) Run this if you want to fix old entries that missing market_id
-- UPDATE entries e
-- SET market_id = m.id
-- FROM markets m
-- WHERE e.client = m.name AND e.market_id IS NULL;


-- ============================================
-- Ensure basic read access for Profile loading
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view markets" ON markets;
CREATE POLICY "Authenticated users can view markets" ON markets FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert new markets (for registration)
DROP POLICY IF EXISTS "Authenticated users can insert markets" ON markets;
CREATE POLICY "Authenticated users can insert markets" ON markets FOR INSERT TO authenticated WITH CHECK (true);
