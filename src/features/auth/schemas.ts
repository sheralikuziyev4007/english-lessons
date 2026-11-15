import { z } from "zod";

import { cleanName } from "@/features/auth/lib/name";
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "@/lib/constants";

/** Letters of any alphabet, separated by single spaces, apostrophes or hyphens. */
const NAME_PATTERN = /^\p{L}+(?:[ '’ʻ-]\p{L}+)*$/u;

/** Validation messages are keys of `dictionary.errors`. */
export const loginSchema = z.object({
  name: z
    .string()
    .transform(cleanName)
    .pipe(
      z
        .string()
        .min(NAME_MIN_LENGTH, "nameShort")
        .max(NAME_MAX_LENGTH, "nameLong")
        .regex(NAME_PATTERN, "nameLetters"),
    ),
});

export type LoginValues = z.infer<typeof loginSchema>;
