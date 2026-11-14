import "server-only";

import { count, desc, gte, min, sql, sum } from "drizzle-orm";

import { buildRoadmap } from "@/features/parent/lib/roadmap";
import type { ActivityDay, HardWord, ParentOverview } from "@/features/parent/types";
import { ACTIVITY_DAYS, HARD_WORD_LIMIT, HARD_WORD_MIN_WRONG } from "@/lib/constants";
import { dayKey, lastDays } from "@/lib/dates";
import { getDb } from "@/server/db/client";
import { days, sessions, wordProgress } from "@/server/db/schema";
import { listPrizes } from "@/server/services/prize-service";
import { getState } from "@/server/services/progress-service";

const SECONDS_PER_MINUTE = 60;

export async function getParentOverview(
  today: string = dayKey(),
): Promise<ParentOverview> {
  const db = await getDb();
  const window = lastDays(today, ACTIVITY_DAYS);

  const [state, prizeList, activityRows, hardRows, startRows] = await Promise.all([
    getState(today),
    listPrizes(),
    db
      .select({
        day: sessions.day,
        seconds: sum(sessions.durationSec),
        sessions: count(),
      })
      .from(sessions)
      .where(gte(sessions.day, window[0]))
      .groupBy(sessions.day),
    db
      .select()
      .from(wordProgress)
      .where(gte(wordProgress.wrong, HARD_WORD_MIN_WRONG))
      .orderBy(desc(wordProgress.wrong))
      .limit(HARD_WORD_LIMIT),
    db.select({ day: min(sessions.day) }).from(sessions),
  ]);

  const byDay = new Map(activityRows.map((row) => [row.day, row]));
  const activity: ActivityDay[] = window.map((day) => {
    const row = byDay.get(day);
    return {
      day,
      minutes: Math.round(Number(row?.seconds ?? 0) / SECONDS_PER_MINUTE),
      sessions: row?.sessions ?? 0,
    };
  });

  const hardWords: HardWord[] = hardRows.map((row) => ({
    wordId: row.wordId,
    wrong: row.wrong,
    correct: row.correct,
  }));

  return {
    state,
    prizes: prizeList,
    activity,
    hardWords,
    roadmap: buildRoadmap(
      startRows[0]?.day ?? null,
      Object.keys(state.lessons).length,
      today,
    ),
  };
}

export async function setOfflineDone(
  done: boolean,
  today: string = dayKey(),
): Promise<void> {
  const db = await getDb();
  await db
    .insert(days)
    .values({ day: today, offlineDone: done })
    .onConflictDoUpdate({
      target: days.day,
      set: { offlineDone: sql`excluded.offline_done` },
    });
}
