import { loginSchema } from "@/features/auth/schemas";
import { isFamilyPassword, startSession } from "@/server/auth/session";
import { HttpError, json, parseBody, route } from "@/server/http";

export const POST = route(null, async (request) => {
  const { password } = await parseBody(request, loginSchema);
  if (!isFamilyPassword(password)) throw new HttpError(401, "wrong_password");
  await startSession("family");
  return json({ ok: true });
});
