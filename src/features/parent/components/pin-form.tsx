"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, fieldErrorId } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUnlockParent } from "@/features/parent/hooks/use-parent";
import { pinSchema, type PinValues } from "@/features/parent/schemas";
import { useErrorText } from "@/hooks/use-error-text";
import { useT } from "@/hooks/use-t";
import { isApiError } from "@/lib/api-client";
import { PIN_LENGTH } from "@/lib/constants";

const PIN_ID = "parent-pin";

export function PinForm() {
  const t = useT();
  const errorText = useErrorText();
  const unlock = useUnlockParent();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PinValues>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: "" },
  });

  const serverError = unlock.isError
    ? isApiError(unlock.error, 403)
      ? t.errors.wrongPin
      : t.common.errorText
    : undefined;
  const error = errorText(errors.pin?.message) ?? serverError;

  return (
    <Card className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <div>
        <h1 className="text-3xl font-black">{t.parent.pinTitle}</h1>
        <p className="text-ink-soft font-bold">{t.parent.pinText}</p>
      </div>
      <form
        noValidate
        onSubmit={handleSubmit((values) => unlock.mutate(values))}
        className="flex flex-col gap-4"
      >
        <Field label={t.parent.pinLabel} htmlFor={PIN_ID} error={error}>
          <Input
            id={PIN_ID}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={PIN_LENGTH}
            aria-invalid={error !== undefined}
            aria-describedby={error ? fieldErrorId(PIN_ID) : undefined}
            className="text-center text-2xl tracking-[0.5em]"
            {...register("pin")}
          />
        </Field>
        <Button type="submit" size="lg" disabled={unlock.isPending}>
          {unlock.isPending ? t.common.loading : t.parent.unlock}
        </Button>
      </form>
    </Card>
  );
}
