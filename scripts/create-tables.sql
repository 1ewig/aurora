-- Aurora — Database tables
-- Run this via direct postgres connection (not InsForge CLI) because it
-- creates the better_auth schema (hidden from PostgREST).
--   node -e "require('fs').readFileSync('scripts/create-tables.sql','utf8')..."



-- Helper for RLS policies (extracts sub claim from bridge JWT)
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql STABLE
AS $$ SELECT NULLIF(auth.jwt() ->> 'sub', '')::text $$;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  slug VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products base table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL REFERENCES categories(name),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  badge VARCHAR(50),
  image TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  span VARCHAR(50),
  aspect_ratio VARCHAR(50),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_lower ON products (LOWER(slug));

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

-- Product search keywords (one-to-many)
CREATE TABLE IF NOT EXISTS product_keywords (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  keyword VARCHAR(100) NOT NULL,
  UNIQUE(product_id, keyword)
);

CREATE INDEX IF NOT EXISTS idx_product_keywords_val ON product_keywords(keyword);

-- Indexes for performance on product joins & cascade deletions
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_product_details_product_id ON product_details (product_id);
CREATE INDEX IF NOT EXISTS idx_product_keywords_product_id ON product_keywords (product_id);

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
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
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

-- Product reservations for checkout stock holding
CREATE TABLE IF NOT EXISTS product_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reservations_lookup ON product_reservations (product_id, size, expires_at);
CREATE INDEX IF NOT EXISTS idx_product_reservations_reservation_id ON product_reservations (reservation_id);

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

-- Hero images table
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id SERIAL PRIMARY KEY,
  slide_number INT UNIQUE NOT NULL,
  original_image TEXT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  title VARCHAR(255),
  link VARCHAR(255)
);

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  CONSTRAINT newsletter_status_check CHECK (status IN ('active')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;




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


-- ========================================================
--  Row Level Security (RLS) Policies
-- ========================================================

-- 1. Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.categories;
CREATE POLICY "Allow public read access" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access" ON public.categories;
CREATE POLICY "Allow admin write access" ON public.categories FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 2. Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access" ON public.products;
CREATE POLICY "Allow admin write access" ON public.products FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 3. Product Images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.product_images;
CREATE POLICY "Allow public read access" ON public.product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access" ON public.product_images;
CREATE POLICY "Allow admin write access" ON public.product_images FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 4. Product Sizes
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.product_sizes;
CREATE POLICY "Allow public read access" ON public.product_sizes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access" ON public.product_sizes;
CREATE POLICY "Allow admin write access" ON public.product_sizes FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 5. Product Details
ALTER TABLE public.product_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.product_details;
CREATE POLICY "Allow public read access" ON public.product_details FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access" ON public.product_details;
CREATE POLICY "Allow admin write access" ON public.product_details FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 6. Product Keywords
ALTER TABLE public.product_keywords ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.product_keywords;
CREATE POLICY "Allow public read access" ON public.product_keywords FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access" ON public.product_keywords;
CREATE POLICY "Allow admin write access" ON public.product_keywords FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 7. Lookbook Slides
ALTER TABLE public.lookbook_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.lookbook_slides;
CREATE POLICY "Allow public read access" ON public.lookbook_slides FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access" ON public.lookbook_slides;
CREATE POLICY "Allow admin write access" ON public.lookbook_slides FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 8. Editorial Content
ALTER TABLE public.editorial_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.editorial_content;
CREATE POLICY "Allow public read access" ON public.editorial_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access" ON public.editorial_content;
CREATE POLICY "Allow admin write access" ON public.editorial_content FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 9. Hero Slides
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.hero_slides;
CREATE POLICY "Allow public read access" ON public.hero_slides FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access" ON public.hero_slides;
CREATE POLICY "Allow admin write access" ON public.hero_slides FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 10. Orders (Users read own orders, Admins read all)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow users to view own orders" ON public.orders;
CREATE POLICY "Allow users to view own orders" ON public.orders FOR SELECT TO authenticated USING (
  user_id = public.requesting_user_id()
  OR
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 11. Processed Webhooks (Bypass RLS on Service role, block client-side)
ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;

-- 12. Product Reservations (Bypass RLS on Service role, block client-side)
ALTER TABLE public.product_reservations ENABLE ROW LEVEL SECURITY;

