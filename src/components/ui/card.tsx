import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("border-line bg-paper rounded-3xl border-2 p-4 sm:p-6", className)}
      {...props}
    />
  );
}
