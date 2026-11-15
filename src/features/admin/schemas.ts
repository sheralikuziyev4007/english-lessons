import { z } from "zod";

import { NOTE_MAX_LENGTH, PASSWORD_MAX_LENGTH } from "@/lib/constants";

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
    resetParentPin: z.literal(true).optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined));

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
export type NoteValues = z.infer<typeof noteSchema>;
