import { json, parentRoute } from "@/server/http";
import { hasParentPin } from "@/server/services/account-service";
import { getOverview } from "@/server/services/overview-service";

export const GET = parentRoute(hasParentPin, async (_request, _context, accountId) =>
  json(await getOverview(accountId)),
);
