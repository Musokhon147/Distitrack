-- ============================================
-- PAYMENT CONFIRMATIONS TABLE
-- ============================================
-- This table stores payment status change requests from sellers
-- that need to be confirmed by market users

CREATE TABLE IF NOT EXISTS payment_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    requested_status TEXT NOT NULL CHECK (requested_status IN ('to''langan', 'to''lanmagan')),
    current_status TEXT NOT NULL CHECK (current_status IN ('to''langan', 'to''lanmagan', 'kutilmoqda')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_market_id ON payment_confirmations(market_id);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_status ON payment_confirmations(status);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_entry_id ON payment_confirmations(entry_id);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_requested_by ON payment_confirmations(requested_by);

-- RLS Policies
-- Markets can see pending confirmations for their market
CREATE POLICY "Markets can view their confirmations" ON payment_confirmations
    FOR SELECT
    TO authenticated
    USING (
        market_id = (SELECT market_id FROM profiles WHERE id = auth.uid())
        AND
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'market'
    );

-- Sellers can see their own confirmation requests
CREATE POLICY "Sellers can view their requests" ON payment_confirmations
    FOR SELECT
    TO authenticated
    USING (
        requested_by = auth.uid()
        AND
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'seller'
    );

-- Sellers can create confirmation requests
CREATE POLICY "Sellers can create confirmations" ON payment_confirmations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        requested_by = auth.uid()
        AND
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'seller'
    );

-- Markets can update confirmations (approve/reject)
CREATE POLICY "Markets can update confirmations" ON payment_confirmations
    FOR UPDATE
    TO authenticated
    USING (
        market_id = (SELECT market_id FROM profiles WHERE id = auth.uid())
        AND
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'market'
    )
    WITH CHECK (
        market_id = (SELECT market_id FROM profiles WHERE id = auth.uid())
        AND
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'market'
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_confirmations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_payment_confirmations_updated_at ON payment_confirmations;
CREATE TRIGGER trigger_update_payment_confirmations_updated_at
    BEFORE UPDATE ON payment_confirmations
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_confirmations_updated_at();
