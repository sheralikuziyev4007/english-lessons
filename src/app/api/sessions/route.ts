import { sessionInputSchema } from "@/features/learning/schemas";
import { json, parseBody, route } from "@/server/http";
import { recordSession } from "@/server/services/progress-service";

export const POST = route("family", async (request) => {
  const input = await parseBody(request, sessionInputSchema);
  return json(await recordSession(input), 201);
});
