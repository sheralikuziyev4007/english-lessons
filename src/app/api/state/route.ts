import { accountRoute, json } from "@/server/http";
import { getState } from "@/server/services/progress-service";

export const GET = accountRoute(async (_request, _context, accountId) =>
  json(await getState(accountId)),
);
