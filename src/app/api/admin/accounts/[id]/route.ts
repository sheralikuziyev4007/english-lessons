import { accountUpdateSchema } from "@/features/admin/schemas";
import { adminRoute, json, parseBody, parseId } from "@/server/http";
import { updateAccount } from "@/server/services/account-service";
import { getAccountOverview } from "@/server/services/overview-service";

type Context = RouteContext<"/api/admin/accounts/[id]">;

export const GET = adminRoute<Context>(async (_request, context) => {
  const { id } = await context.params;
  return json(await getAccountOverview(parseId(id)));
});

/** Sets the VIP flag and/or the private admin comment. */
export const PATCH = adminRoute<Context>(async (request, context) => {
  const { id } = await context.params;
  const update = await parseBody(request, accountUpdateSchema);
  return json(await updateAccount(parseId(id), update));
});
