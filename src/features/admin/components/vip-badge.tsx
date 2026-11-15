"use client";

import { Crown } from "lucide-react";

import { useT } from "@/hooks/use-t";

export function VipBadge() {
  const t = useT();

  return (
    <span className="bg-sun text-ink inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-black">
      <Crown className="size-3.5" aria-hidden="true" />
      {t.admin.vipBadge}
    </span>
  );
}
