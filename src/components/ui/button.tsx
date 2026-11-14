import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl text-center font-extrabold transition-[transform,box-shadow,background-color] select-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white shadow-[0_4px_0_var(--color-primary-dark)]",
        secondary:
          "border-2 border-line bg-paper text-ink shadow-[0_4px_0_var(--color-line)] hover:bg-primary-soft",
        success: "bg-mint text-white shadow-[0_4px_0_var(--color-mint-dark)]",
        danger: "bg-coral text-white shadow-[0_4px_0_var(--color-coral-dark)]",
        ghost: "text-ink hover:bg-ink/5 active:translate-y-0",
      },
      size: {
        sm: "min-h-10 px-3 text-sm",
        md: "min-h-12 px-5 text-base",
        lg: "min-h-14 px-6 text-lg",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
