import { prizeSchema } from "@/features/parent/schemas";
import { json, parseBody, route } from "@/server/http";
import { createPrize } from "@/server/services/prize-service";

export const POST = route("parent", async (request) => {
  const values = await parseBody(request, prizeSchema);
  return json(await createPrize(values), 201);
});
