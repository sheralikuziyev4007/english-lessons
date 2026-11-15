import { accountUpdateSchema } from "@/features/admin/schemas";
import { adminRoute, json, parseBody, parseId } from "@/server/http";
import { getAccountDetails, updateAccount } from "@/server/services/account-service";
import { getOverview } from "@/server/services/overview-service";

type Context = RouteContext<"/api/admin/accounts/[id]">;

export const GET = adminRoute<Context>(async (_request, context) => {
  const { id } = await context.params;
  // Answers 404 for an unknown id before any results are loaded.
  const account = await getAccountDetails(parseId(id));
  return json({ account, ...(await getOverview(account.id)) });
});

/** Sets the VIP flag, the private admin comment, or resets the parent PIN. */
export const PATCH = adminRoute<Context>(async (request, context) => {
  const { id } = await context.params;
  const update = await parseBody(request, accountUpdateSchema);
  return json(await updateAccount(parseId(id), update));
});
