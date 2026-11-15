import { prizeActionSchema } from "@/features/overview/schemas";
import { json, parentRoute, parseBody, parseId } from "@/server/http";
import { hasParentPin } from "@/server/services/account-service";
import { updatePrize } from "@/server/services/prize-service";

export const PATCH = parentRoute<RouteContext<"/api/parent/prizes/[id]">>(
  hasParentPin,
  async (request, context, accountId) => {
    const { id } = await context.params;
    const { action } = await parseBody(request, prizeActionSchema);
    // A parent can only change prizes of their own account.
    return json(await updatePrize(parseId(id), action, accountId));
  },
);
