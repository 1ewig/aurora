/**
 * Aurora — src/lib/email.ts
 *
 * Nodemailer-based transactional email sender via Brevo (Sendinblue) SMTP.
 * Gracefully skips sending when SMTP is not configured (e.g. development).
 */

import nodemailer from "nodemailer";

const host = process.env.BREVO_SMTP_HOST || "";
const port = parseInt(process.env.BREVO_SMTP_PORT || "587", 10);
const user = process.env.BREVO_SMTP_USER || "";
const pass = process.env.BREVO_SMTP_PASS || "";
const fromEmail = process.env.BREVO_FROM_EMAIL || "";
const fromName = process.env.BREVO_FROM_NAME || "";

/** Checks whether all required SMTP env vars are present. */
function isConfigured(): boolean {
  return !!(host && user && pass && fromEmail);
}

let transporter: nodemailer.Transporter | null = null;

/** Lazy-initialized Nodemailer transporter singleton. */
function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/** Sends a transactional email via Brevo SMTP. Silently skips if unconfigured. */
export async function sendEmail(
  options: SendEmailOptions
): Promise<{ sent: boolean; error?: string }> {
  if (!isConfigured()) {
    console.warn(
      "[email] Brevo SMTP not configured. Set BREVO_SMTP_HOST, BREVO_SMTP_USER, BREVO_SMTP_PASS, and BREVO_FROM_EMAIL."
    );
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    await getTransporter().sendMail({
      from: { name: fromName || "Aurora", address: fromEmail },
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || "",
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("[email] Failed to send email:", err);
    return { sent: false, error: message };
  }
}
