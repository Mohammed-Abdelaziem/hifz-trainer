"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onChange" | "value" | "defaultValue" | "children"
  > {
  options: SelectOption[];
  /** Controlled value (string or number). */
  value?: string | number;
  /** Uncontrolled initial value — legacy parity with the native select. */
  defaultValue?: string | number;
  /**
   * Fires with the same shape the native select produced
   * (`event.target.value`), so every existing call site keeps working.
   */
  onChange?: (event: { target: { value: string } }) => void;
}

/**
 * Listbox-style dropdown replacing the restyled native <select>: the menu
 * itself is fully themed now (rows, hover states, checkmarks, open/close
 * animation), grows upward over fixed bottom bars, and follows the WAI-ARIA
 * select-only combobox pattern — trigger is role="combobox", the menu is a
 * real role="listbox" with aria-activedescendant navigation.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ className, options, value, defaultValue, onChange, disabled, ...rest }, ref) => {
    const isControlled = value !== undefined;
    const [innerValue, setInnerValue] = useState(
      defaultValue !== undefined ? String(defaultValue) : undefined
    );
    const current = isControlled ? String(value) : innerValue;
    const selected = options.find((o) => String(o.value) === current);
    const selectedLabel = selected?.label ?? "";

    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [openUp, setOpenUp] = useState(false);
    const [alignRight, setAlignRight] = useState(false);

    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const listId = useId();

    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref && typeof ref === "object") ref.current = node;
      },
      [ref]
    );

    const commit = useCallback(
      (optionValue: string | number) => {
        if (!isControlled) setInnerValue(String(optionValue));
        onChange?.({ target: { value: String(optionValue) } });
        setOpen(false);
        triggerRef.current?.focus();
      },
      [isControlled, onChange]
    );

    const openMenu = useCallback(() => {
      if (disabled || options.length === 0) return;
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        // Flip the menu above the trigger when there is not enough room below
        // (fixed bottom bars) and elsewhere room it right-ward when the panel
        // would clip the viewport's right edge (compact mobile bars).
        const estimatedHeight = Math.min(options.length * 38 + 8, 240);
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUp(spaceBelow < estimatedHeight && rect.top > spaceBelow);
        const estimatedWidth = 240;
        setAlignRight(rect.left + estimatedWidth > window.innerWidth && rect.right > estimatedWidth);
      }
      const selectedIdx = options.findIndex((o) => String(o.value) === current);
      setActiveIndex(selectedIdx >= 0 ? selectedIdx : options.length > 0 ? 0 : -1);
      setOpen(true);
    }, [current, disabled, options]);

    const toggle = useCallback(() => {
      if (open) setOpen(false);
      else openMenu();
    }, [open, openMenu]);

    useEffect(() => {
      if (!open) return;
      // Keep the highlighted row in view on open and whenever it moves.
      const node = listRef.current?.querySelector<HTMLElement>("[data-active='true']");
      if (node && typeof node.scrollIntoView === "function") {
        node.scrollIntoView({ block: "nearest" });
      }
    }, [open, activeIndex]);

    useEffect(() => {
      if (!open) return;
      const onPointerDown = (e: PointerEvent) => {
        if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("pointerdown", onPointerDown, true);
      return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [open]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!open) {
        if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
          e.preventDefault();
          openMenu();
        }
        return;
      }
      switch (e.key) {
        case "Escape": {
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
          break;
        }
        case "Tab": {
          setOpen(false);
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, options.length - 1));
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        }
        case "Home": {
          e.preventDefault();
          setActiveIndex(0);
          break;
        }
        case "End": {
          e.preventDefault();
          if (options.length > 0) setActiveIndex(options.length - 1);
          break;
        }
        case "Enter":
        case " ": {
          e.preventDefault();
          const option = options[activeIndex];
          if (option) commit(option.value);
          break;
        }
      }
    };

    useEffect(() => {
      // Keep the uncontrolled mirror in step when a controlled value arrives.
      if (isControlled) setInnerValue(String(value));
    }, [isControlled, value]);

    return (
      <div ref={rootRef} className="relative inline-flex max-w-full min-w-0">
        <button
          type="button"
          ref={setRefs}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
          }
          disabled={disabled}
          onClick={toggle}
          onKeyDown={onKeyDown}
          className={cn(
            "group inline-flex items-center justify-between gap-1.5 min-w-0 rounded-lg border border-stone-300 bg-white/80 py-1.5 pl-3 pr-2 text-xs font-medium text-stone-700 shadow-sm backdrop-blur transition-all outline-none",
            "hover:border-stone-400 hover:bg-white hover:shadow",
            "data-[open=true]:border-amber-500 data-[open=true]:ring-2 data-[open=true]:ring-amber-500/25",
            "focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/25",
            "dark:border-stone-600 dark:bg-stone-800/70 dark:text-stone-200 dark:shadow-none",
            "dark:hover:border-stone-500 dark:hover:bg-stone-800",
            "dark:data-[open=true]:border-amber-400 dark:data-[open=true]:ring-amber-400/25",
            "dark:focus-visible:border-amber-400 dark:focus-visible:ring-amber-400/25",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          data-open={open ? "true" : "false"}
          {...rest}
        >
          <span className="min-w-0 flex-1 truncate text-left">{selectedLabel}</span>
          <ChevronDown
            className={cn(
              "pointer-events-none h-3.5 w-3.5 shrink-0 text-stone-400 transition-transform duration-150 group-data-[open=true]:rotate-180 group-data-[open=true]:text-amber-500 dark:text-stone-500 dark:group-data-[open=true]:text-amber-400",
              selected === undefined && "text-stone-300 dark:text-stone-600"
            )}
          />
        </button>

        {open && (
          <div
            ref={listRef}
            role="listbox"
            id={listId}
            aria-label={rest["aria-label"]}
            className={cn(
              "absolute z-50 max-h-60 min-w-full w-max min-w-[max(var(--select-trigger-w,6rem),9rem)] max-w-[min(20rem,calc(100vw-1rem))] overflow-y-auto overscroll-contain rounded-xl border border-stone-200 bg-white/95 p-1 shadow-lg shadow-stone-900/10 backdrop-blur-md",
              "dark:border-stone-700 dark:bg-stone-900/95 dark:shadow-black/40",
              "animate-[select-pop-down_130ms_ease-out]",
              openUp &&
                "bottom-full mb-1.5 animate-[select-pop-up_130ms_ease-out]",
              !openUp && "top-full mt-1.5",
              alignRight ? "right-0" : "left-0"
            )}
            style={{ ["--select-trigger-w" as string]: `${triggerRef.current?.offsetWidth ?? 96}px` }}
          >
            {options.map((option, idx) => {
              const isSelected = String(option.value) === current;
              const isActive = idx === activeIndex;
              return (
                <div
                  key={String(option.value)}
                  id={`${listId}-opt-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  data-active={isActive ? "true" : "false"}
                  tabIndex={-1}
                  // pointerdown beats the trigger's blur/close so a click both
                  // selects and closes in the same interaction.
                  onPointerDown={(e) => {
                    e.preventDefault();
                    commit(option.value);
                  }}
                  className={cn(
                    "flex min-w-0 cursor-pointer select-none items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none transition-colors",
                    "text-stone-700 dark:text-stone-300",
                    isActive
                      ? "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                      : "hover:bg-stone-50 dark:hover:bg-stone-800/70",
                    isSelected && "text-amber-700 dark:text-amber-300"
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
