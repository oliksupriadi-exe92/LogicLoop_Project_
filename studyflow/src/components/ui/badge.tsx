import * as React from "react";
import { cn } from "@/lib/utils";
import { Priority, TaskStatus } from "@/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "danger"
    | "info";
  priority?: Priority;
  status?: TaskStatus;
}

export function Badge({
  className,
  variant = "default",
  priority,
  status,
  children,
  ...props
}: BadgeProps) {
  let computedVariant = variant;
  let label = children;

  if (priority) {
    switch (priority) {
      case "URGENT":
        computedVariant = "danger";
        label = label || "Mendesak";
        break;
      case "HIGH":
        computedVariant = "warning";
        label = label || "Tinggi";
        break;
      case "MEDIUM":
        computedVariant = "info";
        label = label || "Sedang";
        break;
      case "LOW":
        computedVariant = "secondary";
        label = label || "Rendah";
        break;
    }
  }

  if (status) {
    switch (status) {
      case "COMPLETED":
        computedVariant = "success";
        label = label || "Selesai";
        break;
      case "IN_PROGRESS":
        computedVariant = "info";
        label = label || "Diproses";
        break;
      case "TODO":
        computedVariant = "secondary";
        label = label || "Belum";
        break;
    }
  }

  const variants = {
    default:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/40",
    secondary:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
    outline:
      "bg-transparent text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700",
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50",
    warning:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50",
    danger:
      "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50 animate-pulse",
    info:
      "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        variants[computedVariant],
        className
      )}
      {...props}
    >
      {label}
    </span>
  );
}
