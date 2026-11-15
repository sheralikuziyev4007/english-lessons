"use client";

import Link from "next/link";

import { AccountMenu } from "@/components/layout/account-menu";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useT } from "@/hooks/use-t";
import { APP_NAME, ROUTES } from "@/lib/constants";

interface AppHeaderProps {
  /** Hide on pages that do not belong to a learner account (admin). */
  showAccount?: boolean;
}

export function AppHeader({ showAccount = true }: AppHeaderProps) {
  const t = useT();

  return (
    <header className="border-line bg-cream/95 sticky top-0 z-20 border-b-2 backdrop-blur">
      <a
        href="#main"
        className="bg-ink sr-only rounded-lg px-3 py-2 text-white focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        {t.common.skipToContent}
      </a>
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-2 px-4">
        <Link
          href={ROUTES.home}
          className="focus-visible:outline-ink flex min-w-0 items-center gap-2 rounded-xl text-lg font-black focus-visible:outline-3 focus-visible:outline-offset-4"
        >
          <span className="emoji text-2xl" aria-hidden="true">
            ⭐
          </span>
          <span lang="en" className="truncate">
            {APP_NAME}
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          {showAccount && <AccountMenu />}
        </div>
      </div>
    </header>
  );
}
