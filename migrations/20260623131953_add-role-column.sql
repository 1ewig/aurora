ALTER TABLE better_auth."user" ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
CREATE INDEX IF NOT EXISTS idx_user_role ON better_auth."user"(role);
