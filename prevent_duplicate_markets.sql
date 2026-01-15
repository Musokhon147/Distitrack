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
  -- Check if market exists with this name OR phone
  SELECT id INTO existing_id FROM markets 
  WHERE name = market_name 
  OR (market_phone != '' AND phone = market_phone)
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    -- Market exists, check if claimed
    SELECT EXISTS (
      SELECT 1 FROM profiles WHERE market_id = existing_id AND role = 'market'
    ) INTO is_claimed;

    IF is_claimed THEN
      -- Error: Market is taken
      RAISE EXCEPTION 'bu nom bilan raqam mavjud boshqa raqam va nomdan foydalaning';
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

-- 3. Check availability for UI feedback (Real-time check)
CREATE OR REPLACE FUNCTION check_market_availability(market_name text, market_phone text DEFAULT '')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id uuid;
  is_claimed boolean;
BEGIN
  SELECT id INTO existing_id FROM markets 
  WHERE name = market_name 
  OR (market_phone != '' AND phone = market_phone)
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM profiles WHERE market_id = existing_id AND role = 'market'
    ) INTO is_claimed;

    IF is_claimed THEN
      RETURN 'bu nom bilan raqam mavjud boshqa raqam va nomdan foydalaning';
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION check_market_availability(text, text) TO anon, authenticated, service_role;
