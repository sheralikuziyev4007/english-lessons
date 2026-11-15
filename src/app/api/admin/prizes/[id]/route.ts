import { prizeActionSchema } from "@/features/admin/schemas";
import { adminRoute, json, parseBody, parseId } from "@/server/http";
import { updatePrize } from "@/server/services/prize-service";

export const PATCH = adminRoute<RouteContext<"/api/admin/prizes/[id]">>(
  async (request, context) => {
    const { id } = await context.params;
    const { action } = await parseBody(request, prizeActionSchema);
    return json(await updatePrize(parseId(id), action));
  },
);
