/**
 * Aurora — src/lib/auth.ts
 *
 * Better Auth server configuration with email/password authentication,
 * email verification, password reset, and DB-backed rate limiting.
 * Uses a dedicated PostgreSQL pool scoped to the `better_auth` schema
 * via SET search_path on each new connection.
 *
 * Security-relevant config:
 *  - Rate limiting: custom rules per endpoint (5/min for sign-in/sign-up,
 *    3/min for reset/verification emails, unlimited for session reads).
 *  - CSRF protection enabled.
 *  - Secure cookies in production only.
 *  - trustedOrigins locked to NEXT_PUBLIC_APP_URL.
 *  - Session: 7-day expiry, 1-day sliding window, cookie cache 5min.
 */

import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { requireEnv } from '@/utils/env';
import { sendEmail } from './email';
import {
  verificationEmailHtml,
  verificationEmailText,
  resetPasswordEmailHtml,
  resetPasswordEmailText,
  signUpAlertHtml,
  signUpAlertText,
} from './email-templates';

// Dedicated pool scoped to better_auth schema — never use the public pool for auth
const pool = new Pool({ connectionString: requireEnv('DATABASE_URL') });
pool.on('connect', (client) => {
  client.query('SET search_path TO better_auth, public').catch(() => {});
});

/** Better Auth server instance. */
export const auth = betterAuth({
  database: pool,
  secret: requireEnv('BETTER_AUTH_SECRET'),
  baseURL: requireEnv('BETTER_AUTH_URL'),

  csrf: { enabled: true },

  /*
   * Rate limiting: stricter limits on auth endpoints vs. session reads.
   * /get-session is intentionally unlimited (false) to avoid false
   * rate-limit hits on frequent session checks.
   */
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

  /*
   * Session: 7-day expiry, 1-day sliding window (session is refreshed
   * if active within this window). Cookie cache reduces DB reads.
   */
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
    // Email callbacks throw on failure — Better Auth expects them to succeed
    sendResetPassword: async ({ user, url }) => {
      const { sent, error } = await sendEmail({
        to: user.email,
        subject: 'Reset your Aurora password',
        text: resetPasswordEmailText(url, user.name),
        html: resetPasswordEmailHtml(url, user.name),
      });
      if (!sent) throw new Error(error || 'Failed to send password reset email');
    },
    // Alert existing users if someone tries to sign up with their email
    onExistingUserSignUp: async ({ user }) => {
      const { sent } = await sendEmail({
        to: user.email,
        subject: 'Sign-up attempt detected',
        text: signUpAlertText(user.email),
        html: signUpAlertHtml(user.email),
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
        text: verificationEmailText(url, user.name),
        html: verificationEmailHtml(url, user.name),
      });
      if (!sent) throw new Error(error || 'Failed to send verification email');
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    ipAddress: {
      ipAddressHeaders: ['x-real-ip', 'cf-connecting-ip', 'x-vercel-forwarded-for', 'x-forwarded-for'],
    },
  },

  trustedOrigins: process.env.NEXT_PUBLIC_APP_URL
    ? [process.env.NEXT_PUBLIC_APP_URL]
    : [],
});
