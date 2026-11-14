import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";

import { getUnit } from "@/features/content";
import type { PrizeAction, PrizeValues } from "@/features/parent/schemas";
import type { Prize, PrizeStatus } from "@/features/progress/types";
import { getDb } from "@/server/db/client";
import { prizes } from "@/server/db/schema";
import { HttpError } from "@/server/http";

type PrizeRow = typeof prizes.$inferSelect;

export function toPrize(row: PrizeRow): Prize {
  return {
    id: row.id,
    unitId: row.unitId,
    title: row.title,
    minScore: row.minScore,
    status: row.status as PrizeStatus,
    createdAt: row.createdAt.toISOString(),
    earnedAt: row.earnedAt?.toISOString() ?? null,
    givenAt: row.givenAt?.toISOString() ?? null,
  };
}

export async function listPrizes(): Promise<Prize[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(prizes)
    .where(inArray(prizes.status, ["active", "earned", "given"]))
    .orderBy(desc(prizes.createdAt));
  return rows.map(toPrize);
}

export async function createPrize(values: PrizeValues): Promise<Prize> {
  if (!getUnit(values.unitId)) throw new HttpError(400, "invalid_request");
  const db = await getDb();

  const open = await db
    .select({ id: prizes.id })
    .from(prizes)
    .where(
      and(eq(prizes.unitId, values.unitId), inArray(prizes.status, ["active", "earned"])),
    )
    .limit(1);
  if (open.length > 0) throw new HttpError(409, "prize_exists");

  const [created] = await db.insert(prizes).values(values).returning();
  return toPrize(created);
}

export async function updatePrize(id: number, action: PrizeAction): Promise<Prize> {
  const db = await getDb();
  const change =
    action === "given"
      ? { from: "earned", set: { status: "given", givenAt: new Date() } }
      : { from: "active", set: { status: "cancelled" } };

  const [updated] = await db
    .update(prizes)
    .set(change.set)
    .where(and(eq(prizes.id, id), eq(prizes.status, change.from)))
    .returning();
  if (!updated) throw new HttpError(404, "prize_not_found");
  return toPrize(updated);
}
