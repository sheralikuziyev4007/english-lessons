import { json, route } from "@/server/http";
import { getState } from "@/server/services/progress-service";

export const GET = route("family", async () => json(await getState()));
