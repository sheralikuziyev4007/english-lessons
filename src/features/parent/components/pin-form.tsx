"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, fieldErrorId } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateParentPin, useUnlockParent } from "@/features/parent/hooks/use-parent";
import {
  enterPinSchema,
  newPinSchema,
  type NewPinValues,
} from "@/features/parent/schemas";
import { useErrorText } from "@/hooks/use-error-text";
import { useT } from "@/hooks/use-t";
import { isApiError } from "@/lib/api-client";
import { PIN_LENGTH } from "@/lib/constants";

const PIN_ID = "parent-pin";
const CONFIRM_ID = "parent-pin-confirm";
const PIN_INPUT_CLASS = "text-center text-2xl tracking-[0.5em]";

interface PinFormProps {
  /** "create": the account has no parent PIN yet and the parent chooses one. */
  mode: "create" | "enter";
}

export function PinForm({ mode }: PinFormProps) {
  const t = useT();
  const errorText = useErrorText();
  const createPin = useCreateParentPin();
  const unlock = useUnlockParent();
  const isCreate = mode === "create";
  const mutation = isCreate ? createPin : unlock;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPinValues>({
    resolver: zodResolver(isCreate ? newPinSchema : enterPinSchema),
    defaultValues: { pin: "", confirm: "" },
  });

  const serverError = mutation.isError
    ? isApiError(mutation.error, 403)
      ? t.errors.wrongPin
      : t.common.errorText
    : undefined;
  const pinError = errorText(errors.pin?.message) ?? serverError;
  const confirmError = errorText(errors.confirm?.message);

  return (
    <Card className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <div>
        <h1 className="text-3xl font-black">{t.parent.pinTitle}</h1>
        <p className="text-ink-soft font-bold">
          {isCreate ? t.parent.pinCreateText : t.parent.pinText}
        </p>
      </div>
      <form
        noValidate
        data-testid={isCreate ? "pin-create-form" : "pin-enter-form"}
        onSubmit={handleSubmit((values) => mutation.mutate({ pin: values.pin }))}
        className="flex flex-col gap-4"
      >
        <Field label={t.parent.pinLabel} htmlFor={PIN_ID} error={pinError}>
          <Input
            id={PIN_ID}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={PIN_LENGTH}
            aria-invalid={pinError !== undefined}
            aria-describedby={pinError ? fieldErrorId(PIN_ID) : undefined}
            className={PIN_INPUT_CLASS}
            {...register("pin")}
          />
        </Field>
        {isCreate && (
          <Field
            label={t.parent.pinConfirmLabel}
            htmlFor={CONFIRM_ID}
            error={confirmError}
          >
            <Input
              id={CONFIRM_ID}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={PIN_LENGTH}
              aria-invalid={confirmError !== undefined}
              aria-describedby={confirmError ? fieldErrorId(CONFIRM_ID) : undefined}
              className={PIN_INPUT_CLASS}
              {...register("confirm")}
            />
          </Field>
        )}
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending
            ? t.common.loading
            : isCreate
              ? t.parent.pinCreate
              : t.parent.unlock}
        </Button>
      </form>
    </Card>
  );
}
