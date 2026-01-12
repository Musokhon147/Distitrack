-- Backfill market_id for existing entries based on client name matching market name
UPDATE entries
SET market_id = markets.id
FROM markets
WHERE entries.client = markets.name
AND entries.market_id IS NULL;
