import nodemailer from "nodemailer";

export type OutreachResult = { ok: boolean; providerMsgId?: string; error?: string; dryRun?: boolean };

export async function sendTelegram(chatId: string, message: string, dryRun = true): Promise<OutreachResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (dryRun || !token) {
    return { ok: true, dryRun: true, providerMsgId: "dry-run" };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
    const j = await res.json();
    if (!j.ok) return { ok: false, error: j.description };
    return { ok: true, providerMsgId: String(j.result.message_id) };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function sendEmail(to: string, subject: string, body: string, dryRun = true): Promise<OutreachResult> {
  if (dryRun || !process.env.SMTP_HOST) {
    return { ok: true, dryRun: true, providerMsgId: "dry-run" };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const info = await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text: body });
    return { ok: true, providerMsgId: info.messageId };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export function manualCopyPayload(message: string): string {
  return message;
}