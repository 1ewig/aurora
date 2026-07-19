/**
 * Aurora — src/app/api/newsletter/route.ts
 *
 * API route handler for newsletter/registry subscription.
 * Sends a welcome email upon subscription.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { pool } from "@/utils/db";
import { rateLimit } from "@/utils/rateLimit";
import { rethrowIfDynamicServerError } from "@/utils/errors";
import { isValidEmail } from "@/utils/validation";

export async function POST(request: NextRequest) {
  try {
    const ip = (request as any).ip || request.headers.get('x-real-ip') || '127.0.0.1';
    if (!await rateLimit(ip, 'newsletter', 3)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { email } = await request.json();

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    // Insert into database to persist subscription and enforce uniqueness
    try {
      await pool.query(
        "INSERT INTO public.newsletter_subscriptions (email) VALUES ($1)",
        [email.trim().toLowerCase()]
      );
    } catch (dbError: any) {
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "This email address is already subscribed." },
          { status: 400 }
        );
      }
      throw dbError;
    }

    const subject = "Welcome to the Aurora Registry";
    const text = `Welcome to the Aurora Registry.\n\nYou have successfully requested access. You are now part of our private list and will receive early entry to Collection IV, exclusive updates from the design studio, and private batch releases.\n\nDesigned in solitude. Worn with intention.`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #111111; background-color: #FBF9F6; border: 1px solid #e5e5e5;">
        <h2 style="font-size: 20px; font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 24px;">Aurora</h2>
        <p style="font-size: 14px; font-weight: 300; line-height: 1.6; color: #444444;">
          Welcome to the Aurora Registry.
        </p>
        <p style="font-size: 14px; font-weight: 300; line-height: 1.6; color: #444444; margin-top: 16px;">
          You have successfully requested access. You are now part of our private list and will receive early entry to Collection IV, exclusive updates from the design studio, and private batch releases.
        </p>
        <hr style="border: 0; border-top: 1px solid #e8e8e8; margin: 32px 0;" />
        <p style="font-size: 10px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: #888888;">
          Designed in solitude. Worn with intention.
        </p>
      </div>
    `;

    // Attempt to send confirmation email.
    // Skips silently if SMTP is not configured.
    await sendEmail({ to: email, subject, text, html });

    return NextResponse.json({ success: true });
  } catch (error) {
    rethrowIfDynamicServerError(error);
    console.error("[newsletter-api] Failed to process subscription:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
