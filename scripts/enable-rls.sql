-- Aurora — scripts/enable-rls.sql
-- Standalone SQL script to enable Row Level Security (RLS) and define secure policies on all 12 tables.

-- Ensure requesting_user_id() exists
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql STABLE
AS $$ SELECT NULLIF(auth.jwt() ->> 'sub', '')::text $$;

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
