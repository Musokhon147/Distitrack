-- Create a function to handle profile creation that bypasses RLS
-- This function runs with SECURITY DEFINER, meaning it runs with the permissions of the function owner

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user(
    user_id UUID,
    user_role TEXT,
    user_market_id UUID,
    user_full_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert or update the profile
    INSERT INTO public.profiles (id, role, market_id, full_name, updated_at)
    VALUES (user_id, user_role, user_market_id, user_full_name, NOW())
    ON CONFLICT (id) 
    DO UPDATE SET
        role = EXCLUDED.role,
        market_id = EXCLUDED.market_id,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile_for_new_user(UUID, TEXT, UUID, TEXT) TO authenticated;
