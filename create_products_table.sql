-- Create products table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all products
CREATE POLICY "Allow authenticated users to read products"
    ON products FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert products
CREATE POLICY "Allow authenticated users to insert products"
    ON products FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update their own products (if needed)
CREATE POLICY "Allow authenticated users to update products"
    ON products FOR UPDATE
    TO authenticated
    USING (true);

-- Allow authenticated users to delete products
CREATE POLICY "Allow authenticated users to delete products"
    ON products FOR DELETE
    TO authenticated
    USING (true);

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
