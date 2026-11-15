import { adminLoginSchema } from "@/features/admin/schemas";
import { isAdminPassword, startAdminSession } from "@/server/auth/session";
import { HttpError, json, parseBody, publicRoute } from "@/server/http";

export const POST = publicRoute(async (request) => {
  const { password } = await parseBody(request, adminLoginSchema);
  if (!isAdminPassword(password)) throw new HttpError(403, "wrong_password");
  await startAdminSession();
  return json({ ok: true });
});
