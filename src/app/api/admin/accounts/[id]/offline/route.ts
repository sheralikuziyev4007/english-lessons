import { offlineSchema } from "@/features/admin/schemas";
import { adminRoute, json, parseBody, parseId } from "@/server/http";
import { getAccountDetails } from "@/server/services/account-service";
import { setOfflineDone } from "@/server/services/overview-service";

export const POST = adminRoute<RouteContext<"/api/admin/accounts/[id]/offline">>(
  async (request, context) => {
    const { id } = await context.params;
    const { done } = await parseBody(request, offlineSchema);
    const account = await getAccountDetails(parseId(id));
    await setOfflineDone(account.id, done);
    return json({ ok: true });
  },
);
