import { loginSchema } from "@/features/auth/schemas";
import { startAccountSession } from "@/server/auth/session";
import { json, parseBody, publicRoute } from "@/server/http";
import { findOrCreateAccount } from "@/server/services/account-service";

/** Name-only sign-in: opens the account with this name or creates it. */
export const POST = publicRoute(async (request) => {
  const { name } = await parseBody(request, loginSchema);
  const account = await findOrCreateAccount(name);
  await startAccountSession(account.id);
  return json({ id: account.id, name: account.name });
});
