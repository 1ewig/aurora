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

-- User Profiles table (maps to built-in auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security Policies
DROP POLICY IF EXISTS "Allow public read" ON public.profiles;
CREATE POLICY "Allow public read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow individual inserts" ON public.profiles;
CREATE POLICY "Allow individual inserts" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow individual updates" ON public.profiles;
CREATE POLICY "Allow individual updates" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create profiles for new user registrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id, 
    COALESCE(new.profile->>'name', new.profile->>'displayName', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to automatically update profiles when auth.users.profile details change
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET 
    display_name = COALESCE(new.profile->>'displayName', new.profile->>'name', new.profile->>'nickname', display_name),
    updated_at = NOW()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (old.profile IS DISTINCT FROM new.profile)
  EXECUTE FUNCTION public.handle_user_update();

