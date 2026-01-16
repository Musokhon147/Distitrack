-- ============================================
-- FIX DATA LEAKAGE: STRICT RLS FOR ENTRIES
-- ============================================

-- Enable RLS (just in case)
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Drop existing broad policies
DROP POLICY IF EXISTS "Sellers can see all entries" ON entries;
DROP POLICY IF EXISTS "Markets can see their entries" ON entries;
DROP POLICY IF EXISTS "Sellers can manage entries" ON entries;
DROP POLICY IF EXISTS "Enable read access for owned entries" ON entries;
DROP POLICY IF EXISTS "Enable read access for market owners" ON entries;
DROP POLICY IF EXISTS "Enable read access for sellers" ON entries;
DROP POLICY IF EXISTS "Sellers can see own entries" ON entries;
DROP POLICY IF EXISTS "Markets can see their own entries" ON entries;
DROP POLICY IF EXISTS "Sellers can manage their entries" ON entries;

-- 1. STRICT SELECT POLICY FOR SELLERS
-- Sellers can ONLY see entries they created
CREATE POLICY "Sellers can see own entries" ON entries
FOR SELECT 
TO authenticated
USING (
    auth.uid() = user_id
    AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'seller'
);

-- 2. STRICT SELECT POLICY FOR MARKETS
-- Markets can ONLY see entries assigned to their market_id
CREATE POLICY "Markets can see their entries" ON entries
FOR SELECT
TO authenticated
USING (
    market_id = (SELECT market_id FROM profiles WHERE id = auth.uid())
    AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'market'
);

-- 3. STRICT MANAGEMENT POLICY FOR SELLERS
-- Sellers can ONLY insert/update/delete their own entries
CREATE POLICY "Sellers can manage own entries" ON entries
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

-- Note: We don't allow Markets to directly 'FOR ALL' entries. 
-- They interact via the change_requests table/RPCs.
