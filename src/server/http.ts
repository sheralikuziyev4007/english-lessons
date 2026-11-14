import "server-only";

import { unstable_rethrow } from "next/navigation";
import type { NextRequest } from "next/server";
import type { z } from "zod";

import { hasRole, type Role } from "@/server/auth/session";

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

type Handler<Context> = (request: NextRequest, context: Context) => Promise<Response>;

/**
 * Wraps a route handler with the role check and uniform JSON errors:
 * 401 = not logged in, 403 = parent panel locked.
 */
export function route<Context>(
  role: Role | null,
  handler: Handler<Context>,
): Handler<Context> {
  return async (request, context) => {
    try {
      if (role && !(await hasRole("family"))) {
        return json({ error: "unauthorized" }, 401);
      }
      if (role === "parent" && !(await hasRole("parent"))) {
        return json({ error: "parent_locked" }, 403);
      }
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
