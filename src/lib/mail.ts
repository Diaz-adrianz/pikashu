import nodemailer from 'nodemailer';

let transport: ReturnType<typeof nodemailer.createTransport> | undefined;

function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  if (!transport)
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  return transport;
}

export async function sendMail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const mailer = getTransport();
  if (!mailer) return;

  await mailer.sendMail({
    from: process.env.MAIL_FROM ?? 'Pikashu <noreply@pikashu.id>',
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}

export const appUrl = () =>
  process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
