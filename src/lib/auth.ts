/**
 * Aurora — src/lib/auth.ts
 *
 * Better Auth server configuration with email/password authentication,
 * email verification, and password reset flows. Uses a dedicated
 * PostgreSQL pool scoped to the `better_auth` schema.
 */

import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { sendEmail } from './email';

/** Reads a required env var or throws. */
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const pool = new Pool({ connectionString: requireEnv('DATABASE_URL') });
pool.on('connect', (client) => {
  client.query('SET search_path TO better_auth, public').catch(() => {});
});

/** Better Auth server instance. */
export const auth = betterAuth({
  database: pool,
  secret: requireEnv('BETTER_AUTH_SECRET'),
  baseURL: requireEnv('BETTER_AUTH_URL'),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: 'Reset your Aurora password',
        text: `Click the link to reset your password: ${url}`,
      });
    },
    onExistingUserSignUp: async ({ user }) => {
      void sendEmail({
        to: user.email,
        subject: 'Sign-up attempt detected',
        text: 'Someone tried to create an Aurora account using your email address. If this was you, sign in instead. If not, you can ignore this email.',
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: 'Verify your Aurora email',
        text: `Click the link to verify your email: ${url}`,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
});
