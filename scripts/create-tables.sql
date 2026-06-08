-- Aurora — Database tables for product catalog
-- Run this in the InsForge SQL editor or via:
--   npx @insforge/cli db query "$(cat scripts/create-tables.sql)"

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
