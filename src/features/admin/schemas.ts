import { z } from "zod";

import {
  MAX_PRIZE_SCORE,
  MIN_PRIZE_SCORE,
  NOTE_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PRIZE_TITLE_MAX_LENGTH,
} from "@/lib/constants";

/** Validation messages are keys of `dictionary.errors`. */
export const adminLoginSchema = z.object({
  password: z
    .string()
    .min(1, "passwordRequired")
    .max(PASSWORD_MAX_LENGTH, "passwordRequired"),
});

export const noteSchema = z.object({
  note: z.string().max(NOTE_MAX_LENGTH, "noteLong"),
});

export const accountUpdateSchema = z
  .object({
    isVip: z.boolean().optional(),
    note: noteSchema.shape.note.optional(),
  })
  .refine((value) => value.isVip !== undefined || value.note !== undefined);

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

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
export type NoteValues = z.infer<typeof noteSchema>;
export type PrizeValues = z.infer<typeof prizeSchema>;
export type PrizeAction = z.infer<typeof prizeActionSchema>["action"];
