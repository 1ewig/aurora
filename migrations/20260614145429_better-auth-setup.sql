CREATE SCHEMA IF NOT EXISTS better_auth;

CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(auth.jwt() ->> 'sub', '')::text
$$;

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

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.orders ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  END IF;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_update();

ALTER TABLE better_auth."user" ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
CREATE INDEX IF NOT EXISTS idx_user_role ON better_auth."user"(role);

ALTER TABLE better_auth."user" ADD COLUMN IF NOT EXISTS ls_customer_id TEXT;
CREATE INDEX IF NOT EXISTS idx_user_ls_customer_id ON better_auth."user"(ls_customer_id);

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;

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
