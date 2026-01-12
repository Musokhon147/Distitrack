-- ============================================
-- FIX: Allow Markets to UPDATE entries when approving payment confirmations
-- ============================================
-- This policy allows market users to update entries that belong to their market
-- This is needed for approving payment status changes from "kutilmoqda" to "to'langan"

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Markets can update their entries" ON entries;

-- Allow markets to update entries that are assigned to them
CREATE POLICY "Markets can update their entries" ON entries
FOR UPDATE
TO authenticated
USING (
    -- Entry must belong to the market (check by market_id)
    market_id = (SELECT market_id FROM profiles WHERE id = auth.uid())
    AND
    -- User must be a market role
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'market'
)
WITH CHECK (
    -- After update, entry must still belong to the market
    market_id = (SELECT market_id FROM profiles WHERE id = auth.uid())
    AND
    -- User must still be a market role
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'market'
);
