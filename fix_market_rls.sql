-- Ensure markets are visible to unauthenticated users (for registration dropdown)
DROP POLICY IF EXISTS "Enable read access for all users" ON markets;
CREATE POLICY "Enable read access for all users" ON markets
    FOR SELECT
    USING (true);

-- Ensure authenticated users can insert (Sellers creating markets)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON markets;
CREATE POLICY "Enable insert for authenticated users only" ON markets
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Ensure authenticated users can delete (Sellers deleting markets)
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON markets;
CREATE POLICY "Enable delete for authenticated users only" ON markets
    FOR DELETE
    TO authenticated
    USING (true);
