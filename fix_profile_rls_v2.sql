-- Comprehensive RLS fix for profiles table
-- This handles both trigger-based and manual profile creation

-- First, disable RLS temporarily to clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new comprehensive policies

-- 1. Allow INSERT for authenticated users (for registration)
CREATE POLICY "Enable insert for authenticated users" ON profiles
FOR INSERT 
TO authenticated
WITH CHECK (true);  -- Allow any authenticated user to insert

-- 2. Allow SELECT for own profile
CREATE POLICY "Enable select for users based on user_id" ON profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- 3. Allow UPDATE for own profile
CREATE POLICY "Enable update for users based on user_id" ON profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Allow DELETE for own profile (optional, for account deletion)
CREATE POLICY "Enable delete for users based on user_id" ON profiles
FOR DELETE 
TO authenticated
USING (auth.uid() = id);
