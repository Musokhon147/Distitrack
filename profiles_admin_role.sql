-- ============================================
-- ENABLE ADMIN ROLE & GLOBAL RLS
-- ============================================

-- 1. Update Profile Role Constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('seller', 'market', 'admin'));

-- 2. Helper function to check role
CREATE OR REPLACE FUNCTION role_is(target_role TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = target_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Entries RLS for Admins
DROP POLICY IF EXISTS "Sellers can see own entries" ON entries;
DROP POLICY IF EXISTS "Markets can see their entries" ON entries;
DROP POLICY IF EXISTS "Unified entry select" ON entries;

CREATE POLICY "Unified entry select" ON entries
FOR SELECT
TO authenticated
USING (
    (role_is('admin')) OR
    (auth.uid() = user_id AND role_is('seller')) OR
    (market_id = (SELECT market_id FROM profiles WHERE id = auth.uid()) AND role_is('market'))
);

CREATE POLICY "Admins can manage all entries" ON entries
FOR ALL
TO authenticated
USING (role_is('admin'))
WITH CHECK (role_is('admin'));

-- 4. Admin Manage Profiles
DROP POLICY IF EXISTS "Admins can see all profiles" ON profiles;
CREATE POLICY "Admins can see all profiles" ON profiles
FOR SELECT
TO authenticated
USING (role_is('admin') OR auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles" ON profiles
FOR UPDATE
TO authenticated
USING (role_is('admin'))
WITH CHECK (role_is('admin'));

-- 5. Admin Manage Markets
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage markets" ON markets;
CREATE POLICY "Admins can manage markets" ON markets
FOR ALL
TO authenticated
USING (role_is('admin'))
WITH CHECK (role_is('admin'));

DROP POLICY IF EXISTS "Authenticated users can read markets" ON markets;
CREATE POLICY "Authenticated users can read markets" ON markets
FOR SELECT
TO authenticated
USING (true);
