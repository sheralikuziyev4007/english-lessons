import "server-only";

import { unstable_rethrow } from "next/navigation";
import type { NextRequest } from "next/server";
import type { z } from "zod";

import { getAccountId, isAdmin, isParentOf } from "@/server/auth/session";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
  }
}

export function json<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

export async function parseBody<T>(
  request: NextRequest,
  schema: z.ZodType<T>,
): Promise<T> {
  const raw: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new HttpError(400, "invalid_request");
  return parsed.data;
}

/** Parses a positive integer id from a dynamic route segment. */
export function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "invalid_request");
  return id;
}

type Handler<Context> = (request: NextRequest, context: Context) => Promise<Response>;

/** Turns thrown errors into uniform JSON responses. */
export function publicRoute<Context>(handler: Handler<Context>): Handler<Context> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Let Next.js handle its own control-flow errors (e.g. prerender bail-outs).
      unstable_rethrow(error);
      if (error instanceof HttpError) {
        return json({ error: error.code }, error.status);
      }
      console.error(error);
      return json({ error: "internal_error" }, 500);
    }
  };
}

/** For learners: answers 401 without a session and passes the account id on. */
export function accountRoute<Context>(
  handler: (
    request: NextRequest,
    context: Context,
    accountId: number,
  ) => Promise<Response>,
): Handler<Context> {
  return publicRoute(async (request, context) => {
    const accountId = await getAccountId();
    if (accountId === null) throw new HttpError(401, "unauthorized");
    return handler(request, context, accountId);
  });
}

/**
 * For the parent section of the logged-in account: answers 403 until the
 * parent PIN was entered. `pin_not_set` tells the client to ask for a new PIN.
 */
export function parentRoute<Context>(
  hasParentPin: (accountId: number) => Promise<boolean>,
  handler: (
    request: NextRequest,
    context: Context,
    accountId: number,
  ) => Promise<Response>,
): Handler<Context> {
  return accountRoute(async (request, context, accountId) => {
    if (!(await isParentOf(accountId))) {
      const code = (await hasParentPin(accountId)) ? "parent_locked" : "pin_not_set";
      throw new HttpError(403, code);
    }
    return handler(request, context, accountId);
  });
}

/** For the admin section: answers 403 until the admin password was entered. */
export function adminRoute<Context>(handler: Handler<Context>): Handler<Context> {
  return publicRoute(async (request, context) => {
    if (!(await isAdmin())) throw new HttpError(403, "admin_locked");
    return handler(request, context);
  });
}
