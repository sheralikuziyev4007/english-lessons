"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, fieldErrorId } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAdminLogin } from "@/features/admin/hooks/use-admin";
import { adminLoginSchema, type AdminLoginValues } from "@/features/admin/schemas";
import { useErrorText } from "@/hooks/use-error-text";
import { useT } from "@/hooks/use-t";
import { isApiError } from "@/lib/api-client";

const PASSWORD_ID = "admin-password";

export function AdminLoginForm() {
  const t = useT();
  const errorText = useErrorText();
  const login = useAdminLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { password: "" },
  });

  const serverError = login.isError
    ? isApiError(login.error, 403)
      ? t.errors.wrongPassword
      : t.common.errorText
    : undefined;
  const error = errorText(errors.password?.message) ?? serverError;

  return (
    <Card className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <div>
        <h1 className="text-3xl font-black">{t.admin.loginTitle}</h1>
        <p className="text-ink-soft font-bold">{t.admin.loginText}</p>
      </div>
      <form
        noValidate
        onSubmit={handleSubmit((values) => login.mutate(values))}
        className="flex flex-col gap-4"
      >
        <Field label={t.admin.password} htmlFor={PASSWORD_ID} error={error}>
          <Input
            id={PASSWORD_ID}
            type="password"
            autoComplete="current-password"
            aria-invalid={error !== undefined}
            aria-describedby={error ? fieldErrorId(PASSWORD_ID) : undefined}
            {...register("password")}
          />
        </Field>
        <Button type="submit" size="lg" disabled={login.isPending}>
          {login.isPending ? t.common.loading : t.admin.unlock}
        </Button>
      </form>
    </Card>
  );
}
