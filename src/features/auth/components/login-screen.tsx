"use client";

import { LanguageToggle } from "@/components/layout/language-toggle";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { useT } from "@/hooks/use-t";
import { APP_NAME } from "@/lib/constants";

export function LoginScreen() {
  const t = useT();

  return (
    <main
      id="main"
      className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="emoji text-7xl" aria-hidden="true">
          ⭐
        </span>
        <p lang="en" className="text-primary text-xl font-black">
          {APP_NAME}
        </p>
      </div>
      <Card className="flex w-full max-w-sm flex-col gap-4">
        <div>
          <h1 className="text-3xl font-black">{t.login.title}</h1>
          <p className="text-ink-soft font-bold">{t.login.subtitle}</p>
        </div>
        <LoginForm />
      </Card>
      <LanguageToggle />
    </main>
  );
}
