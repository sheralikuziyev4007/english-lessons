import { sessionInputSchema } from "@/features/learning/schemas";
import { accountRoute, json, parseBody } from "@/server/http";
import { recordSession } from "@/server/services/progress-service";

export const POST = accountRoute(async (request, _context, accountId) => {
  const input = await parseBody(request, sessionInputSchema);
  return json(await recordSession(accountId, input), 201);
});
