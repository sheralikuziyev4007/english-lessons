import { offlineSchema } from "@/features/parent/schemas";
import { json, parseBody, route } from "@/server/http";
import { setOfflineDone } from "@/server/services/parent-service";

export const POST = route("parent", async (request) => {
  const { done } = await parseBody(request, offlineSchema);
  await setOfflineDone(done);
  return json({ ok: true });
});
