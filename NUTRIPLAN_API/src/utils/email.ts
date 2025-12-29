import nodemailer from "nodemailer";

export type EmailPayload = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail(payload: EmailPayload) {
  const transporter = getTransport();
  if (!transporter) {
    // Email not configured; fail silently
    return { sent: false, skipped: true };
  }

  const from = process.env.SMTP_FROM || `Nutriplan <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  return { sent: true };
}
