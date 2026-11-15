import "server-only";

import { and, count, countDistinct, desc, eq, isNull, max } from "drizzle-orm";

import { cleanName, nameKey } from "@/features/auth/lib/name";
import type { AccountDetails, AccountsList, AccountUpdate } from "@/features/admin/types";
import { hashPin, isSameHash } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { accounts, sessions } from "@/server/db/schema";
import { HttpError } from "@/server/http";

type AccountRow = typeof accounts.$inferSelect;

function toDetails(row: AccountRow): AccountDetails {
  return {
    id: row.id,
    name: row.name,
    isVip: row.isVip,
    note: row.note,
    hasParentPin: row.parentPinHash !== null,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Name-only sign-in: returns the account with this name, creating it on the
 * first visit. The same name on another device opens the same account.
 */
export async function findOrCreateAccount(name: string): Promise<AccountDetails> {
  const db = await getDb();
  const key = nameKey(name);

  // The unique key makes this safe when two devices register at the same time.
  await db
    .insert(accounts)
    .values({ name: cleanName(name), nameKey: key })
    .onConflictDoNothing({ target: accounts.nameKey });

  const [row] = await db.select().from(accounts).where(eq(accounts.nameKey, key));
  if (!row) throw new HttpError(500, "internal_error");
  return toDetails(row);
}

export async function getAccountDetails(accountId: number): Promise<AccountDetails> {
  const db = await getDb();
  const [row] = await db.select().from(accounts).where(eq(accounts.id, accountId));
  if (!row) throw new HttpError(404, "account_not_found");
  return toDetails(row);
}

/** All accounts, newest first, with a short activity summary for the list. */
export async function listAccounts(): Promise<AccountsList> {
  const db = await getDb();

  const [rows, activityRows, lessonRows] = await Promise.all([
    db.select().from(accounts).orderBy(desc(accounts.createdAt), desc(accounts.id)),
    db
      .select({
        accountId: sessions.accountId,
        lastActiveDay: max(sessions.day),
        sessions: count(),
      })
      .from(sessions)
      .groupBy(sessions.accountId),
    db
      .select({ accountId: sessions.accountId, lessons: countDistinct(sessions.refId) })
      .from(sessions)
      .where(eq(sessions.kind, "lesson"))
      .groupBy(sessions.accountId),
  ]);

  const activity = new Map(activityRows.map((row) => [row.accountId, row]));
  const lessons = new Map(lessonRows.map((row) => [row.accountId, row.lessons]));

  return {
    total: rows.length,
    accounts: rows.map((row) => ({
      ...toDetails(row),
      lastActiveDay: activity.get(row.id)?.lastActiveDay ?? null,
      lessonsDone: lessons.get(row.id) ?? 0,
    })),
  };
}

export async function updateAccount(
  accountId: number,
  update: AccountUpdate,
): Promise<AccountDetails> {
  const db = await getDb();
  const { resetParentPin, ...fields } = update;
  const [row] = await db
    .update(accounts)
    .set({ ...fields, ...(resetParentPin ? { parentPinHash: null } : {}) })
    .where(eq(accounts.id, accountId))
    .returning();
  if (!row) throw new HttpError(404, "account_not_found");
  return toDetails(row);
}

export async function hasParentPin(accountId: number): Promise<boolean> {
  return (await getAccountDetails(accountId)).hasParentPin;
}

/** Sets the parent PIN for the first time. An existing PIN is never replaced here. */
export async function createParentPin(accountId: number, pin: string): Promise<void> {
  const db = await getDb();
  const updated = await db
    .update(accounts)
    .set({ parentPinHash: hashPin(accountId, pin) })
    .where(and(eq(accounts.id, accountId), isNull(accounts.parentPinHash)))
    .returning({ id: accounts.id });
  if (updated.length === 0) throw new HttpError(409, "pin_exists");
}

export async function isParentPin(accountId: number, pin: string): Promise<boolean> {
  const db = await getDb();
  const [row] = await db
    .select({ hash: accounts.parentPinHash })
    .from(accounts)
    .where(eq(accounts.id, accountId));
  return Boolean(row?.hash) && isSameHash(row?.hash ?? "", hashPin(accountId, pin));
}
