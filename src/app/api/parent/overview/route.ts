import { json, route } from "@/server/http";
import { getParentOverview } from "@/server/services/parent-service";

export const GET = route("parent", async () => json(await getParentOverview()));
