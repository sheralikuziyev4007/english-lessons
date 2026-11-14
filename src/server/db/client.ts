import "server-only";

import { sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import * as schema from "@/server/db/schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

const LOCAL_DB_DIR = "./.pglite";

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(url), { schema });
  }

  if (process.env.VERCEL) {
    throw new Error("DATABASE_URL is not set. Connect a Neon database to this project.");
  }

  // Local development and tests: an embedded Postgres stored on disk.
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  return drizzle(new PGlite(process.env.PGLITE_DIR ?? LOCAL_DB_DIR), { schema });
}

async function connectAndPrepare(): Promise<Db> {
  const db = await connect();
  for (const statement of schema.SCHEMA_STATEMENTS) {
    await db.execute(sql.raw(statement));
  }
  return db;
}

const globalForDb = globalThis as typeof globalThis & { __starwayDb?: Promise<Db> };

/** Returns the shared database connection, creating tables on first use. */
export function getDb(): Promise<Db> {
  if (!globalForDb.__starwayDb) {
    globalForDb.__starwayDb = connectAndPrepare().catch((error: unknown) => {
      globalForDb.__starwayDb = undefined;
      throw error;
    });
  }
  return globalForDb.__starwayDb;
}
