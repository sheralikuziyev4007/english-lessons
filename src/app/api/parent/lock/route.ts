import { endSession } from "@/server/auth/session";
import { json, route } from "@/server/http";

export const POST = route("family", async () => {
  await endSession("parent");
  return json({ ok: true });
});
