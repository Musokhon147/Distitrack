-- Allow authenticated users (both sellers and markets) to READ entries
-- that belong to the market they are assigned to.

DROP POLICY IF EXISTS "Enable read access for owned entries" ON entries;

CREATE POLICY "Enable read access for market owners" ON entries
    FOR SELECT
    TO authenticated
    USING (
        -- For 'market' role users: check if the entry's market_id matches their profile's market_id
        market_id IN (
            SELECT market_id 
            FROM profiles 
            WHERE id = auth.uid() 
            AND market_id IS NOT NULL
        )
        OR
        -- For 'seller' role users: they can see everything (or whatever your logic was)
        -- Assuming 'seller' can see all or has other logic. 
        -- But for now, let's keep it safe: IF you created the entry OR you are the market for it.
        -- If we assume sellers created entries, they might not be 'owner' via auth.uid() column since we don't have one in schema.
        -- BUT, for the Dashboard issue specifically:
        
        -- Allow if you are the market associated with this entry
        (
             SELECT role FROM profiles WHERE id = auth.uid()
        ) = 'market' AND market_id = (SELECT market_id FROM profiles WHERE id = auth.uid())
    );

-- Also allow Sellers to READ everything for now (simplified for debugging)
CREATE POLICY "Enable read access for sellers" ON entries
    FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'seller'
    );
