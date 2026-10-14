import type { PortfolioData } from "./portfolio";

export interface PortfolioSnapshot {
  portfolio: PortfolioData;
  version: number;
  updatedAt: string;
  updatedBy: string;
}
export type ContactStatus = "new" | "read" | "archived";
export type NotificationStatus = "pending" | "sending" | "sent" | "failed";
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
  notification: { status: NotificationStatus; attempts: number; attemptedAt?: string; sentAt?: string };
}
