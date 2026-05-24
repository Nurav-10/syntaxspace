"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Tick02Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons";
import { InfoIcon } from "lucide-react";

interface CalloutProps {
  type?: "info" | "warning" | "tip" | "danger";
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const getStyles = () => {
    switch (type) {
      case "tip":
        return {
          border:
            "border-l-emerald-500 dark:border-l-emerald-400 bg-emerald-500/5",
          text: "text-emerald-800 dark:text-emerald-200",
          icon: (
            <HugeiconsIcon
              icon={Tick02Icon}
              className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0"
            />
          ),
          titleText: "text-emerald-950 dark:text-emerald-100",
        };
      case "warning":
        return {
          border: "border-l-amber-500 dark:border-l-amber-400 bg-amber-500/5",
          text: "text-amber-800 dark:text-amber-200",
          icon: (
            <HugeiconsIcon
              icon={Alert02Icon}
              className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0"
            />
          ),
          titleText: "text-amber-950 dark:text-amber-100",
        };
      case "danger":
        return {
          border: "border-l-rose-500 dark:border-l-rose-400 bg-rose-500/5",
          text: "text-rose-800 dark:text-rose-200",
          icon: (
            <HugeiconsIcon
              icon={CancelCircleIcon}
              className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0"
            />
          ),
          titleText: "text-rose-950 dark:text-rose-100",
        };
      case "info":
      default:
        return {
          border: "border-l-zinc-500 dark:border-l-zinc-400 bg-zinc-500/5",
          text: "text-zinc-800 dark:text-zinc-200",
          icon: (
            <InfoIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
          ),
          titleText: "text-zinc-950 dark:text-zinc-100",
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={cn(
        "my-6 flex gap-3.5 rounded-r-md border border-l-4 border-border px-4 py-3.5 text-xs transition-colors duration-200",
        styles.border,
      )}
    >
      {styles.icon}
      <div className="flex-1 space-y-1">
        {title && (
          <p className={cn("font-semibold leading-tight", styles.titleText)}>
            {title}
          </p>
        )}
        <div
          className={cn(
            "leading-relaxed prose-sm dark:prose-invert",
            styles.text,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
