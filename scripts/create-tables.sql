-- Aurora — Database tables
-- Run this via direct postgres connection (not InsForge CLI) because it
-- creates the better_auth schema (hidden from PostgREST).
--   node -e "require('fs').readFileSync('scripts/create-tables.sql','utf8')..."



-- Helper for RLS policies (extracts sub claim from bridge JWT)
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql STABLE
AS $$ SELECT NULLIF(auth.jwt() ->> 'sub', '')::text $$;

-- Products base table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  badge VARCHAR(50),
  image TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  span VARCHAR(50),
  aspect_ratio VARCHAR(50),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product images (one-to-many)
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL
);

-- Product sizes with stock (one-to-many)
CREATE TABLE IF NOT EXISTS product_sizes (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(50) NOT NULL,
  stock INT NOT NULL DEFAULT 10,
  UNIQUE(product_id, size)
);

-- Product detail bullet points (one-to-many)
CREATE TABLE IF NOT EXISTS product_details (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  detail TEXT NOT NULL
);

-- Orders table (guest checkout allowed — user_id is nullable)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_provider VARCHAR(50),
  ls_order_id TEXT UNIQUE,
  ls_order_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Processed webhooks for idempotency (Lemon Squeezy integration)
CREATE TABLE IF NOT EXISTS processed_webhooks (
  id SERIAL PRIMARY KEY,
  ls_event_id TEXT UNIQUE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lookbook slides table
CREATE TABLE IF NOT EXISTS public.lookbook_slides (
  id SERIAL PRIMARY KEY,
  slide_number INT UNIQUE NOT NULL,
  original_image TEXT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  tag VARCHAR(50),
  title VARCHAR(255),
  link VARCHAR(255)
);

-- Editorial content table
CREATE TABLE IF NOT EXISTS public.editorial_content (
  id VARCHAR(50) PRIMARY KEY,
  original_image TEXT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT
);

-- Realtime: allow string sender_ids for Better Auth user IDs
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'realtime'
    AND table_name = 'messages'
    AND column_name = 'sender_id'
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE realtime.messages ALTER COLUMN sender_id TYPE text;
  END IF;
END $$;
