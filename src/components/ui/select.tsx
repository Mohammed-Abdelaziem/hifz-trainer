"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center">
        <select
          ref={ref}
          className={cn(
            "cursor-pointer appearance-none rounded-lg border border-stone-300 bg-white py-1.5 pl-2.5 pr-7 text-xs font-medium text-stone-700 outline-none transition-colors",
            "hover:border-stone-400 hover:bg-stone-50",
            "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
            "dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200",
            "dark:hover:border-stone-500 dark:hover:bg-stone-700",
            "dark:focus:border-amber-400 dark:focus:ring-amber-400/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
      </div>
    );
  }
);
Select.displayName = "Select";
