import { endSession } from "@/server/auth/session";
import { json, publicRoute } from "@/server/http";

export const POST = publicRoute(async () => {
  await endSession("account");
  return json({ ok: true });
});
