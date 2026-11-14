import { prizeActionSchema } from "@/features/parent/schemas";
import { HttpError, json, parseBody, route } from "@/server/http";
import { updatePrize } from "@/server/services/prize-service";

export const PATCH = route<RouteContext<"/api/parent/prizes/[id]">>(
  "parent",
  async (request, context) => {
    const { id } = await context.params;
    const prizeId = Number(id);
    if (!Number.isInteger(prizeId) || prizeId <= 0)
      throw new HttpError(400, "invalid_request");
    const { action } = await parseBody(request, prizeActionSchema);
    return json(await updatePrize(prizeId, action));
  },
);
