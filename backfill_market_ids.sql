-- ============================================
-- BACKFILL MARKET_ID FOR ENTRIES
-- ============================================
-- Run this script if you have existing data and markets cannot see their reports.
-- It matches the 'client' name in entries with the 'name' in markets.

UPDATE entries
SET market_id = m.id
FROM markets m
WHERE entries.client = m.name
  AND entries.market_id IS NULL;

-- Verify results
SELECT COUNT(*) as updated_count 
FROM entries 
WHERE market_id IS NOT NULL;

SELECT COUNT(*) as remaining_null 
FROM entries 
WHERE market_id IS NULL;
