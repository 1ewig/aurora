-- Better Auth + InsForge Integration: Database Setup
-- Run this BEFORE `npx @better-auth/cli migrate`

-- 1. Create the better_auth schema (BA tables go here, hidden from PostgREST)
CREATE SCHEMA IF NOT EXISTS better_auth;

-- 2. Helper function for RLS policies (extracts sub claim from auth.jwt())
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(auth.jwt() ->> 'sub', '')::text
$$;

-- 3. Migrate public.profiles from UUID (auth.users FK) to TEXT (BA user ID FK)
-- First add a legacy_user_id column to preserve old references
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS legacy_user_id UUID;

-- Drop the old FK constraint to auth.users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_id_fkey'
    AND table_name = 'profiles'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
END $$;

-- Convert id column from UUID to TEXT
-- Store existing UUIDs as text (they become legacy references)
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;

-- Copy existing UUIDs into legacy_user_id
UPDATE public.profiles SET legacy_user_id = id::UUID WHERE legacy_user_id IS NULL;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Allow public read" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual inserts" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual updates" ON public.profiles;

-- Enable RLS (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- New RLS policies using requesting_user_id()
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (id = public.requesting_user_id());

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (id = public.requesting_user_id());

-- 4. Migrate orders.user_id from UUID to TEXT
ALTER TABLE public.orders ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Drop old FK constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_user_id_fkey'
    AND table_name = 'orders'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_user_id_fkey;
  END IF;
END $$;

-- 5. Drop triggers on auth.users (we no longer sync from InsForge auth users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_update();

-- 6. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;

-- 7. Realtime: allow string sender_ids for Better Auth user IDs
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

NOTIFY pgrst, 'reload schema';
