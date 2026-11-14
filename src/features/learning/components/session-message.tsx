"use client";

import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { buttonVariants } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";
import { useT } from "@/hooks/use-t";
import { ROUTES } from "@/lib/constants";

interface SessionMessageProps {
  icon: string;
  title: string;
  text: string;
  action?: { href: string; label: string };
}

/** Full-page message shown instead of a session (locked, daily limit, empty…). */
export function SessionMessage({ icon, title, text, action }: SessionMessageProps) {
  const t = useT();
  const link = action ?? { href: ROUTES.home, label: t.session.backHome };

  return (
    <>
      <AppHeader />
      <main id="main" className="flex flex-1 flex-col justify-center">
        <StateMessage
          icon={icon}
          title={title}
          text={text}
          action={
            <Link href={link.href} className={buttonVariants({ size: "lg" })}>
              {link.label}
            </Link>
          }
        />
      </main>
    </>
  );
}
