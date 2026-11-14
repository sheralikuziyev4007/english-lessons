import { endSession } from "@/server/auth/session";
import { json, route } from "@/server/http";

export const POST = route(null, async () => {
  await endSession("family");
  await endSession("parent");
  return json({ ok: true });
});
