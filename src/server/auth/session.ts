import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import {
  PARENT_COOKIE,
  PARENT_MAX_AGE_SEC,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SEC,
} from "@/lib/constants";

export type Role = "family" | "parent";

const DEV_DEFAULTS = {
  SESSION_SECRET: "dev-only-secret-change-me",
  FAMILY_PASSWORD: "family",
  PARENT_PIN: "1234",
} as const;

const ROLE_COOKIES: Record<Role, { name: string; maxAge: number }> = {
  family: { name: SESSION_COOKIE, maxAge: SESSION_MAX_AGE_SEC },
  parent: { name: PARENT_COOKIE, maxAge: PARENT_MAX_AGE_SEC },
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

function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

export function isFamilyPassword(password: string): boolean {
  return safeEqual(password, readSecret("FAMILY_PASSWORD"));
}

export function isParentPin(pin: string): boolean {
  return safeEqual(pin, readSecret("PARENT_PIN"));
}

export async function startSession(role: Role): Promise<void> {
  const { name, maxAge } = ROLE_COOKIES[role];
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(signingKey());

  (await cookies()).set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function endSession(role: Role): Promise<void> {
  (await cookies()).delete(ROLE_COOKIES[role].name);
}

export async function hasRole(role: Role): Promise<boolean> {
  const token = (await cookies()).get(ROLE_COOKIES[role].name)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: ["HS256"] });
    return payload.role === role;
  } catch {
    return false;
  }
}
