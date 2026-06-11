-- Remove bio column from public.profiles table
-- Run via: npx @insforge/cli db query "$(cat scripts/remove-bio-from-profiles.sql)"

ALTER TABLE public.profiles DROP COLUMN IF EXISTS bio;

-- Recreate trigger functions to no longer reference bio
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
