import "server-only";

import { configuredAdminEmail } from "./owner";

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}

export function authConfigured(): boolean {
  return ["AUTH_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "APP_URL"].every(
    (key) => Boolean(process.env[key]?.trim()),
  ) && (process.env.AUTH_SECRET?.trim().length ?? 0) >= 32 && configuredAdminEmail() !== null;
}

export function requiredSecret(name: string): string {
  const secret = requiredEnv(name);
  if (secret.length < 32) throw new Error(`Server secret must contain at least 32 characters: ${name}`);
  return secret;
}

export function appOrigin(): string {
  const url = new URL(requiredEnv("APP_URL"));
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("APP_URL must use HTTPS in production");
  }
  return url.origin;
}
