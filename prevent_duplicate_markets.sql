-- ============================================
-- PREVENT DUPLICATE MARKET REGISTRATION
-- ============================================

-- 1. Helper function to get ONLY markets that are not yet claimed by a 'market' user
-- Used for the registration dropdown
CREATE OR REPLACE FUNCTION get_unclaimed_markets()
RETURNS TABLE (id UUID, name TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.id, m.name
  FROM markets m
  WHERE NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.market_id = m.id
    AND p.role = 'market'
  )
  ORDER BY m.name;
$$;

-- Allow public access (needed for registration)
GRANT EXECUTE ON FUNCTION get_unclaimed_markets() TO anon, authenticated, service_role;

-- 2. Safe registration function
-- Replaces/Wraps usage of create_market to handle duplicates
CREATE OR REPLACE FUNCTION register_market(market_name text, market_phone text DEFAULT '')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id uuid;
  is_claimed boolean;
  new_id uuid;
BEGIN
  -- Check if market exists with this name (case insensitive matching could be added but let's stick to exact for now)
  SELECT id INTO existing_id FROM markets WHERE name = market_name LIMIT 1;

  IF existing_id IS NOT NULL THEN
    -- Market exists, check if claimed
    SELECT EXISTS (
      SELECT 1 FROM profiles WHERE market_id = existing_id AND role = 'market'
    ) INTO is_claimed;

    IF is_claimed THEN
      -- Error: Market is taken
      RAISE EXCEPTION 'Bu do''kon nomi allaqachon band qilingan. Iltimos, boshqa nom tanlang.';
    ELSE
      -- Market exists but unclaimed -> Return ID to allow user to claim it
      RETURN existing_id;
    END IF;
  ELSE
    -- Market does not exist -> Create it
    INSERT INTO markets (name, phone)
    VALUES (market_name, market_phone)
    RETURNING id INTO new_id;
    
    RETURN new_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION register_market(text, text) TO authenticated, service_role;
