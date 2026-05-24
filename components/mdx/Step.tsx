"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

export function Steps({ children, className }: StepsProps) {
  return (
    <div
      className={cn(
        "my-8 space-y-0 [&>div:last-child>.step-line]:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface StepProps {
  number: string | number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function Step({
  number,
  title,
  subtitle,
  children,
  className,
}: StepProps) {
  return (
    <div
      className={cn(
        "relative pl-12 pb-8 group transition-all duration-300 last:pb-2",
        className,
      )}
    >
      {/* Dynamic Dotted Connector Line */}
      <div className="step-line absolute left-[15px] top-[33px] bottom-0 w-[2px] border-l-2 border-dashed border-border/70 group-hover:border-foreground/35 transition-colors duration-300" />

      {/* Dynamic Circular Number Badge */}
      <div className="absolute left-0 top-[2px] flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-background text-xs font-mono font-medium text-muted-foreground group-hover:border-foreground group-hover:text-foreground group-hover:bg-muted/10 group-hover:shadow-sm transition-all duration-300 select-none">
        {number}
      </div>

      {/* Step Content */}
      <div className="space-y-2 pt-0.5">
        <h4 className="text-sm md:text-base font-bold tracking-tight text-foreground group-hover:text-foreground/90 transition-colors duration-300 leading-none">
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs md:text-sm italic text-foreground/60  leading-snug">
            {subtitle}
          </p>
        )}
        <div className="text-xs md:text-sm text-foreground/70 leading-relaxed mt-2 prose-sm dark:prose-invert">
          {children}
        </div>
      </div>
    </div>
  );
}
