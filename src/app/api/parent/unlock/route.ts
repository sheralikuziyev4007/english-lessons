import { pinSchema } from "@/features/parent/schemas";
import { isParentPin, startSession } from "@/server/auth/session";
import { HttpError, json, parseBody, route } from "@/server/http";

export const POST = route("family", async (request) => {
  const { pin } = await parseBody(request, pinSchema);
  if (!isParentPin(pin)) throw new HttpError(403, "wrong_pin");
  await startSession("parent");
  return json({ ok: true });
});
