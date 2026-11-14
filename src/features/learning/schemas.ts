import { z } from "zod";

import { MAX_SESSION_ANSWERS, MAX_SESSION_DURATION_SEC } from "@/lib/constants";

export const sessionInputSchema = z.object({
  kind: z.enum(["lesson", "review", "test"]),
  refId: z.string().min(1).max(64),
  durationSec: z.number().int().min(0).max(MAX_SESSION_DURATION_SEC),
  answers: z
    .array(z.object({ wordId: z.string().min(1).max(64), correct: z.boolean() }))
    .min(1)
    .max(MAX_SESSION_ANSWERS),
});
