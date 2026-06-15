import nodemailer from "nodemailer";

const host = process.env.BREVO_SMTP_HOST || "";
const port = parseInt(process.env.BREVO_SMTP_PORT || "587", 10);
const user = process.env.BREVO_SMTP_USER || "";
const pass = process.env.BREVO_SMTP_PASS || "";
const fromEmail = process.env.BREVO_FROM_EMAIL || "";
const fromName = process.env.BREVO_FROM_NAME || "";

function isConfigured(): boolean {
  return !!(host && user && pass && fromEmail);
}

let transporter: nodemailer.Transporter | null = null;

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

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!isConfigured()) {
    console.warn(
      "[email] Brevo SMTP not configured. Set BREVO_SMTP_HOST, BREVO_SMTP_USER, BREVO_SMTP_PASS, and BREVO_FROM_EMAIL."
    );
    return;
  }

  try {
    await getTransporter().sendMail({
      from: { name: fromName || "Aurora", address: fromEmail },
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || "",
    });
  } catch (err) {
    console.error("[email] Failed to send email:", err);
  }
}
