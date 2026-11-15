"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, fieldErrorId } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/hooks/use-auth";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { useErrorText } from "@/hooks/use-error-text";
import { useT } from "@/hooks/use-t";
import { NAME_MAX_LENGTH } from "@/lib/constants";

const NAME_ID = "learner-name";
const HINT_ID = "learner-name-hint";

export function LoginForm() {
  const t = useT();
  const errorText = useErrorText();
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof loginSchema>, unknown, LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { name: "" },
  });

  const error =
    errorText(errors.name?.message) ??
    (loginMutation.isError ? t.common.errorText : undefined);

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
      className="flex flex-col gap-4"
    >
      <Field label={t.login.name} htmlFor={NAME_ID} error={error}>
        <Input
          id={NAME_ID}
          autoComplete="given-name"
          autoCapitalize="words"
          maxLength={NAME_MAX_LENGTH}
          placeholder={t.login.namePlaceholder}
          aria-invalid={error !== undefined}
          aria-describedby={error ? `${fieldErrorId(NAME_ID)} ${HINT_ID}` : HINT_ID}
          {...register("name")}
        />
      </Field>
      <p id={HINT_ID} className="text-ink-soft text-sm font-bold">
        {t.login.hint}
      </p>
      <Button type="submit" size="lg" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? t.common.loading : t.login.submit}
      </Button>
    </form>
  );
}
