import { prizeSchema } from "@/features/overview/schemas";
import { json, parentRoute, parseBody } from "@/server/http";
import { hasParentPin } from "@/server/services/account-service";
import { createPrize } from "@/server/services/prize-service";

export const POST = parentRoute(hasParentPin, async (request, _context, accountId) => {
  const values = await parseBody(request, prizeSchema);
  return json(await createPrize(accountId, values), 201);
});
