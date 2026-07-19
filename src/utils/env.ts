/**
 * Aurora — src/utils/env.ts
 *
 * Type-safe environment variable accessor with runtime validation.
 * Throws a descriptive error when a required variable is missing.
 */

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}
