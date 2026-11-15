import { endSession } from "@/server/auth/session";
import { json, publicRoute } from "@/server/http";

export const POST = publicRoute(async () => {
  await endSession("account");
  await endSession("parent");
  return json({ ok: true });
});
