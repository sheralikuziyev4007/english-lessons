import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE_SEC,
  PARENT_COOKIE,
  PARENT_MAX_AGE_SEC,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SEC,
} from "@/lib/constants";

export type Role = "account" | "parent" | "admin";

const DEV_DEFAULTS = {
  SESSION_SECRET: "dev-only-secret-change-me",
  ADMIN_PASSWORD: "admin",
} as const;

const ROLE_COOKIES: Record<Role, { name: string; maxAge: number }> = {
  account: { name: SESSION_COOKIE, maxAge: SESSION_MAX_AGE_SEC },
  parent: { name: PARENT_COOKIE, maxAge: PARENT_MAX_AGE_SEC },
  admin: { name: ADMIN_COOKIE, maxAge: ADMIN_MAX_AGE_SEC },
};

/** Reads a required secret. Development falls back to documented defaults. */
function readSecret(name: keyof typeof DEV_DEFAULTS): string {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV !== "production") return DEV_DEFAULTS[name];
  throw new Error(`Missing environment variable: ${name}`);
}

function signingKey(): Uint8Array {
  return new TextEncoder().encode(readSecret("SESSION_SECRET"));
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function isAdminPassword(password: string): boolean {
  return timingSafeEqual(digest(password), digest(readSecret("ADMIN_PASSWORD")));
}

async function startSession(role: Role, subject?: string): Promise<void> {
  const { name, maxAge } = ROLE_COOKIES[role];
  const jwt = new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`);
  if (subject) jwt.setSubject(subject);

  (await cookies()).set(name, await jwt.sign(signingKey()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export function startAccountSession(accountId: number): Promise<void> {
  return startSession("account", String(accountId));
}

/** Opens the parent section of one account for a short time. */
export function startParentSession(accountId: number): Promise<void> {
  return startSession("parent", String(accountId));
}

export function startAdminSession(): Promise<void> {
  return startSession("admin");
}

export async function endSession(role: Role): Promise<void> {
  (await cookies()).delete(ROLE_COOKIES[role].name);
}

async function readSession(role: Role): Promise<JWTPayload | null> {
  const token = (await cookies()).get(ROLE_COOKIES[role].name)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: ["HS256"] });
    return payload.role === role ? payload : null;
  } catch {
    return null;
  }
}

/** The id of the logged-in learner, or null when there is no valid session. */
export async function getAccountId(): Promise<number | null> {
  const payload = await readSession("account");
  const accountId = Number(payload?.sub);
  return Number.isInteger(accountId) && accountId > 0 ? accountId : null;
}

/** True when the parent PIN of exactly this account was entered recently. */
export async function isParentOf(accountId: number): Promise<boolean> {
  const payload = await readSession("parent");
  return payload?.sub === String(accountId);
}

/**
 * PINs are stored as keyed hashes. A 4-digit PIN only keeps a child out of the
 * parent section; it is not meant to resist someone who has the database.
 */
export function hashPin(accountId: number, pin: string): string {
  return createHmac("sha256", readSecret("SESSION_SECRET"))
    .update(`${accountId}:${pin}`)
    .digest("hex");
}

export function isSameHash(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

export async function isAdmin(): Promise<boolean> {
  return (await readSession("admin")) !== null;
}
