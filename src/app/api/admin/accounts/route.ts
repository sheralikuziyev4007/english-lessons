import { adminRoute, json } from "@/server/http";
import { listAccounts } from "@/server/services/account-service";

export const GET = adminRoute(async () => json(await listAccounts()));
