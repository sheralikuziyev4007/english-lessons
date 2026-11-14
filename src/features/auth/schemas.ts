import { z } from "zod";

/** Validation messages are keys of `dictionary.errors`. */
export const loginSchema = z.object({
  password: z.string().min(1, "passwordRequired").max(200, "passwordRequired"),
});

export type LoginValues = z.infer<typeof loginSchema>;
