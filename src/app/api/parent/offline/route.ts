import { offlineSchema } from "@/features/overview/schemas";
import { json, parentRoute, parseBody } from "@/server/http";
import { hasParentPin } from "@/server/services/account-service";
import { setOfflineDone } from "@/server/services/overview-service";

export const POST = parentRoute(hasParentPin, async (request, _context, accountId) => {
  const { done } = await parseBody(request, offlineSchema);
  await setOfflineDone(accountId, done);
  return json({ ok: true });
});
