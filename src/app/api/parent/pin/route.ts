import { pinSchema } from "@/features/parent/schemas";
import { startParentSession } from "@/server/auth/session";
import { accountRoute, json, parseBody } from "@/server/http";
import { createParentPin } from "@/server/services/account-service";

/** First visit to the parent section: the parent chooses the PIN. */
export const POST = accountRoute(async (request, _context, accountId) => {
  const { pin } = await parseBody(request, pinSchema);
  await createParentPin(accountId, pin);
  await startParentSession(accountId);
  return json({ ok: true }, 201);
});
