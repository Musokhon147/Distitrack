-- ============================================
-- APPROVAL WORKFLOW SYSTEM
-- ============================================
-- Replaces previous payment_confirmations logic with a generic system
-- handles both DELETE and STATUS_CHANGE requests from both Sellers and Markets.

-- 1. Create the change_requests table
CREATE TABLE IF NOT EXISTS change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- "seller" means a seller made the request (needs Market approval)
    -- "market" means a market made the request (needs Seller approval)
    request_side TEXT NOT NULL CHECK (request_side IN ('seller', 'market')),
    
    -- Type of change: 'DELETE' or 'UPDATE_STATUS'
    request_type TEXT NOT NULL CHECK (request_type IN ('DELETE', 'UPDATE_STATUS')),
    
    -- If request_type is UPDATE_STATUS, this holds the new value (e.g., 'to''langan')
    new_status TEXT CHECK (new_status IN ('to''langan', 'to''lanmagan')),
    
    -- Current status of the request
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Who verified it (optional, set on approval/rejection)
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS idx_change_requests_market_id ON change_requests(market_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_status ON change_requests(status);
CREATE INDEX IF NOT EXISTS idx_change_requests_entry_id ON change_requests(entry_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_requested_by ON change_requests(requested_by);

-- 4. RLS Policies

-- Policy: Authenticated users can create requests (Sellers and Markets)
CREATE POLICY "Authenticated users can create change requests" ON change_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = requested_by
    );

-- Policy: Users can view requests relevant to them
-- Sellers see requests they made OR requests made by their market for their entries (implies we need to link entry -> user_id, but entry doesn't have user_id easily accessible without join.
-- Simpler approach: 
-- Sellers can see requests where they are 'requested_by' OR where they are the OWNER of the 'entry_id'.
-- Markets can see requests where 'market_id' Matches their profile market_id.

CREATE POLICY "Users can view relevant requests" ON change_requests
    FOR SELECT
    TO authenticated
    USING (
        -- 1. User is the requester
        requested_by = auth.uid()
        OR
        -- 2. User is a Market Admin for this request's market
        (
            (SELECT role FROM profiles WHERE id = auth.uid()) = 'market'
            AND
            market_id = (SELECT market_id FROM profiles WHERE id = auth.uid())
        )
        OR
        -- 3. User is the Seller who owns the entry (requires join, slightly expensive but necessary)
        (
             (SELECT role FROM profiles WHERE id = auth.uid()) = 'seller'
             AND
             EXISTS (
                SELECT 1 FROM entries e
                JOIN profiles p ON p.full_name = e.client -- Assuming client name link for now as per schema
                WHERE e.id = change_requests.entry_id
                AND p.id = auth.uid()
             )
        )
         -- Alternative for #3 if entries has user_id (it doesn't in your schema, it has 'client' name)
         -- If you added user_id to entries, it would be: entry_id IN (SELECT id FROM entries WHERE user_id = auth.uid())
    );

-- Policy: Users can update requests (Approve/Reject)
-- Markets can update if they are the target (request_side = 'seller')
-- Sellers can update if they are the target (request_side = 'market')

CREATE POLICY "Users can update relevant requests" ON change_requests
    FOR UPDATE
    TO authenticated
    USING (
        -- Market updating a Seller request
        (
            request_side = 'seller'
            AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'market'
            AND market_id = (SELECT market_id FROM profiles WHERE id = auth.uid())
        )
        OR
        -- Seller updating a Market request (Owning the entry)
        (
            request_side = 'market'
            AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'seller'
             AND
             EXISTS (
                SELECT 1 FROM entries e
                JOIN profiles p ON p.full_name = e.client
                WHERE e.id = change_requests.entry_id
                AND p.id = auth.uid()
             )
        )
    );

-- 5. Database Function to Approve Request
-- This function performs the actual data change transactionally
CREATE OR REPLACE FUNCTION approve_change_request(request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with superuser privileges to bypass RLS during the update
AS $$
DECLARE
    r_type TEXT;
    r_entry_id UUID;
    r_new_status TEXT;
    r_status TEXT;
    r_target_side TEXT;
    
    v_user_role TEXT;
    v_user_market UUID;
    v_req_market UUID;
BEGIN
    -- Get request details
    SELECT request_type, entry_id, new_status, status, request_side, market_id
    INTO r_type, r_entry_id, r_new_status, r_status, r_target_side, v_req_market
    FROM change_requests
    WHERE id = request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found';
    END IF;

    IF r_status <> 'pending' THEN
        RAISE EXCEPTION 'Request is already processed';
    END IF;

    -- Verify permission (Double check logic inside function for safety)
    SELECT role, market_id INTO v_user_role, v_user_market
    FROM profiles
    WHERE id = auth.uid();

    -- If Seller made request (request_side='seller'), Approver must be Market
    IF r_target_side = 'seller' THEN
        IF v_user_role <> 'market' OR v_user_market <> v_req_market THEN
            RAISE EXCEPTION 'Unauthorized: Only the relevant Market can approve this request';
        END IF;
    -- If Market made request (request_side='market'), Approver must be Seller (Owner)
    ELSIF r_target_side = 'market' THEN
         -- Check if auth user owns the entry
         IF NOT EXISTS (
            SELECT 1 FROM entries e
            JOIN profiles p ON p.full_name = e.client
            WHERE e.id = r_entry_id AND p.id = auth.uid()
         ) THEN
            RAISE EXCEPTION 'Unauthorized: Only the entry owner (Seller) can approve this request';
         END IF;
    END IF;

    -- EXECUTE THE CHANGE
    IF r_type = 'DELETE' THEN
        DELETE FROM entries WHERE id = r_entry_id;
    ELSIF r_type = 'UPDATE_STATUS' THEN
        UPDATE entries 
        SET holat = r_new_status, 
            updated_at = NOW()
        WHERE id = r_entry_id;
    END IF;

    -- Update Request Status
    UPDATE change_requests
    SET status = 'approved',
        reviewed_by = auth.uid(),
        updated_at = NOW()
    WHERE id = request_id;

END;
$$;

-- 6. Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_change_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_change_requests_updated_at ON change_requests;
CREATE TRIGGER trigger_change_requests_updated_at
    BEFORE UPDATE ON change_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_change_requests_updated_at();
