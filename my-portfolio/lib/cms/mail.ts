import "server-only";
import nodemailer from "cms-nodemailer";
import { requiredEnv } from "./config";
import { getAdminEmail } from "./owner";

export interface NotificationMail { name: string; email: string; subject: string; message: string }
export async function sendNotification(contact: NotificationMail) {
  const adminEmail = getAdminEmail();
  const transport = nodemailer.createTransport({
    // Google's App Password display groups characters with spaces for readability.
    service: "gmail", auth: { user: adminEmail, pass: requiredEnv("GMAIL_APP_PASSWORD").replace(/\s/g, "") },
    connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000,
  });
  try {
    await transport.sendMail({
      from: { name: "Portfolio CMS", address: adminEmail }, to: adminEmail,
      replyTo: { name: contact.name, address: contact.email },
      subject: `[Portfolio] ${contact.subject}`,
      text: `Tên: ${contact.name}\nEmail: ${contact.email}\n\n${contact.message}`,
      disableFileAccess: true, disableUrlAccess: true,
    });
  } finally { transport.close(); }
}
