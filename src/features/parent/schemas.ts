import { z } from "zod";

import { PIN_LENGTH } from "@/lib/constants";

const pin = z.string().regex(new RegExp(`^\\d{${PIN_LENGTH}}$`), "pinFormat");

/** Validation messages are keys of `dictionary.errors`. */
export const pinSchema = z.object({ pin });

/** Form shape for entering an existing PIN; the confirmation field is unused. */
export const enterPinSchema = z.object({ pin, confirm: z.string() });

/** Form shape for choosing a new PIN: it has to be typed twice. */
export const newPinSchema = z
  .object({ pin, confirm: z.string() })
  .refine((value) => value.pin === value.confirm, {
    path: ["confirm"],
    message: "pinMismatch",
  });

export type PinValues = z.infer<typeof pinSchema>;
export type NewPinValues = z.infer<typeof newPinSchema>;
