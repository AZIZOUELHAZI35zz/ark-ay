"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

const baseClasses =
  "inline-flex items-center justify-center font-medium transition-colors rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[--color-primary] text-white hover:brightness-110 focus-visible:ring-[--color-primary]",
  secondary:
    "bg-black/5 text-black hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 focus-visible:ring-black/20",
  ghost:
    "bg-transparent text-[--color-primary] hover:bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] focus-visible:ring-[--color-primary]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-12 px-7 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
