"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorClassName?: string;
}

function Progress({ value, className, indicatorClassName, ...props }: ProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700", className)}
      {...props}
    >
      <div
        className={cn("h-full bg-amber-600 transition-[width] duration-150 ease-linear", indicatorClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export { Progress };
