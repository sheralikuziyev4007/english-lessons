import { pinSchema } from "@/features/parent/schemas";
import { startParentSession } from "@/server/auth/session";
import { accountRoute, HttpError, json, parseBody } from "@/server/http";
import { isParentPin } from "@/server/services/account-service";

export const POST = accountRoute(async (request, _context, accountId) => {
  const { pin } = await parseBody(request, pinSchema);
  if (!(await isParentPin(accountId, pin))) throw new HttpError(403, "wrong_pin");
  await startParentSession(accountId);
  return json({ ok: true });
});
