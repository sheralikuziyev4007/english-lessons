import { prizeSchema } from "@/features/overview/schemas";
import { adminRoute, json, parseBody, parseId } from "@/server/http";
import { getAccountDetails } from "@/server/services/account-service";
import { createPrize } from "@/server/services/prize-service";

export const POST = adminRoute<RouteContext<"/api/admin/accounts/[id]/prizes">>(
  async (request, context) => {
    const { id } = await context.params;
    const values = await parseBody(request, prizeSchema);
    const account = await getAccountDetails(parseId(id));
    return json(await createPrize(account.id, values), 201);
  },
);
