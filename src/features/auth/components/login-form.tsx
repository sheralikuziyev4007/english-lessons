"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, fieldErrorId } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/hooks/use-auth";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { useErrorText } from "@/hooks/use-error-text";
import { useT } from "@/hooks/use-t";
import { isApiError } from "@/lib/api-client";

const PASSWORD_ID = "family-password";

export function LoginForm() {
  const t = useT();
  const errorText = useErrorText();
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  const serverError = loginMutation.isError
    ? isApiError(loginMutation.error, 401)
      ? t.errors.wrongPassword
      : t.common.errorText
    : undefined;
  const error = errorText(errors.password?.message) ?? serverError;

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
      className="flex flex-col gap-4"
    >
      <Field label={t.login.password} htmlFor={PASSWORD_ID} error={error}>
        <Input
          id={PASSWORD_ID}
          type="password"
          autoComplete="current-password"
          aria-invalid={error !== undefined}
          aria-describedby={error ? fieldErrorId(PASSWORD_ID) : undefined}
          {...register("password")}
        />
      </Field>
      <Button type="submit" size="lg" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? t.common.loading : t.login.submit}
      </Button>
    </form>
  );
}
