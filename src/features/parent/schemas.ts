import { z } from "zod";

import {
  MAX_PRIZE_SCORE,
  MIN_PRIZE_SCORE,
  PIN_LENGTH,
  PRIZE_TITLE_MAX_LENGTH,
} from "@/lib/constants";

/** Validation messages are keys of `dictionary.errors`. */
export const pinSchema = z.object({
  pin: z.string().regex(new RegExp(`^\\d{${PIN_LENGTH}}$`), "pinFormat"),
});

export const prizeSchema = z.object({
  unitId: z.string().min(1, "unitRequired"),
  title: z
    .string()
    .trim()
    .min(2, "prizeTitleShort")
    .max(PRIZE_TITLE_MAX_LENGTH, "prizeTitleLong"),
  minScore: z
    .number({ error: "scoreRange" })
    .int("scoreRange")
    .min(MIN_PRIZE_SCORE, "scoreRange")
    .max(MAX_PRIZE_SCORE, "scoreRange"),
});

export const prizeActionSchema = z.object({
  action: z.enum(["given", "cancel"]),
});

export const offlineSchema = z.object({
  done: z.boolean(),
});

export type PinValues = z.infer<typeof pinSchema>;
export type PrizeValues = z.infer<typeof prizeSchema>;
export type PrizeAction = z.infer<typeof prizeActionSchema>["action"];
