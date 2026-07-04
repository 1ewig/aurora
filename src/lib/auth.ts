/**
 * Aurora — src/lib/auth.ts
 *
 * Better Auth server configuration with email/password authentication,
 * email verification, password reset, and DB-backed rate limiting.
 * Uses a dedicated PostgreSQL pool scoped to the `better_auth` schema.
 */

import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { requireEnv } from '@/utils/env';
import { sendEmail } from './email';

const pool = new Pool({ connectionString: requireEnv('DATABASE_URL') });
pool.on('connect', (client) => {
  client.query('SET search_path TO better_auth, public').catch(() => {});
});

/** Inline HTML for password-reset emails. */
function resetHtml(url: string): string {
  return `<h2>Reset your Aurora password</h2>
<p>Click the link below to reset your password. This link expires in 1 hour.</p>
<a href="${url}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;">Reset Password</a>
<p style="margin-top:1.5rem;color:#6b7280;">If you didn't request this, please ignore this email.</p>`;
}

/** Inline HTML for email-verification emails. */
function verifyHtml(url: string): string {
  return `<h2>Verify your Aurora email</h2>
<p>Click the link below to verify your email address.</p>
<a href="${url}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;">Verify Email</a>
<p style="margin-top:1.5rem;color:#6b7280;">This link expires in 1 hour.</p>`;
}

/** Better Auth server instance. */
export const auth = betterAuth({
  database: pool,
  secret: requireEnv('BETTER_AUTH_SECRET'),
  baseURL: requireEnv('BETTER_AUTH_URL'),

  csrf: { enabled: true },

  rateLimit: {
    enabled: true,
    storage: 'database',
    modelName: 'rateLimit',
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 60, max: 5 },
      '/forget-password': { window: 60, max: 3 },
      '/reset-password': { window: 60, max: 5 },
      '/send-verification-email': { window: 60, max: 3 },
      '/verify-email': { window: 60, max: 5 },
      '/get-session': false,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    autoSignIn: false,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      const { sent, error } = await sendEmail({
        to: user.email,
        subject: 'Reset your Aurora password',
        text: `Click the link to reset your password: ${url}`,
        html: resetHtml(url),
      });
      if (!sent) throw new Error(error || 'Failed to send password reset email');
    },
    onExistingUserSignUp: async ({ user }) => {
      const { sent } = await sendEmail({
        to: user.email,
        subject: 'Sign-up attempt detected',
        text: 'Someone tried to create an Aurora account using your email address. If this was you, sign in instead. If not, you can ignore this email.',
      });
      if (!sent) console.warn('[auth] Failed to send sign-up alert email');
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
    sendVerificationEmail: async ({ user, url }) => {
      const { sent, error } = await sendEmail({
        to: user.email,
        subject: 'Verify your Aurora email',
        text: `Click the link to verify your email: ${url}`,
        html: verifyHtml(url),
      });
      if (!sent) throw new Error(error || 'Failed to send verification email');
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for'],
    },
  },

  trustedOrigins: process.env.NEXT_PUBLIC_APP_URL
    ? [process.env.NEXT_PUBLIC_APP_URL]
    : [],
});
