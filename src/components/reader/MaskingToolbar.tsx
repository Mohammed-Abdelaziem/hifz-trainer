"use client";

import { EyeOff, LetterText, Layers, ScanEye, Type } from "lucide-react";
import type { LayoutMode, MaskMode } from "@/types/quran";
import { useReaderStore } from "@/stores/reader-store";
import { cn } from "@/lib/utils";

const MASK_MODES: { value: MaskMode; label: string; icon: typeof Type }[] = [
  { value: "FULL", label: "Full Text", icon: Type },
  { value: "BLUR", label: "Blurred", icon: ScanEye },
  { value: "FIRST_LETTER", label: "First Letters", icon: LetterText },
  { value: "REVEAL", label: "Tap Reveal", icon: EyeOff },
];

const LAYOUT_MODES: { value: LayoutMode; label: string }[] = [
  { value: "FLOW", label: "Flow" },
  { value: "MUSHAF", label: "Mushaf 15-line" },
];

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: typeof Type }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      role="tablist"
      className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-0.5 dark:border-stone-700 dark:bg-stone-800"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
              value === opt.value
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-950 dark:text-amber-400"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            )}
          >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
        active
          ? "border-amber-600 bg-amber-600 text-white"
          : "border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
      )}
    >
      {children}
    </button>
  );
}

export function MaskingToolbar() {
  const maskMode = useReaderStore((s) => s.maskMode);
  const layoutMode = useReaderStore((s) => s.layoutMode);
  const showTranslation = useReaderStore((s) => s.showTranslation);
  const showRoots = useReaderStore((s) => s.showRoots);
  const fontSizePx = useReaderStore((s) => s.fontSizePx);
  const setMaskMode = useReaderStore((s) => s.setMaskMode);
  const setLayoutMode = useReaderStore((s) => s.setLayoutMode);
  const toggleTranslation = useReaderStore((s) => s.toggleTranslation);
  const toggleRoots = useReaderStore((s) => s.toggleRoots);
  const setFontSize = useReaderStore((s) => s.setFontSize);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <Segmented options={MASK_MODES} value={maskMode} onChange={setMaskMode} />
      <Segmented options={LAYOUT_MODES} value={layoutMode} onChange={setLayoutMode} />
      <ToggleChip active={showTranslation} onClick={toggleTranslation}>
        Translation
      </ToggleChip>
      <ToggleChip active={showRoots} onClick={toggleRoots}>
        Roots
      </ToggleChip>
      <div className="ml-auto inline-flex items-center gap-1">
        <button
          aria-label="Decrease font size"
          onClick={() => setFontSize(fontSizePx - 4)}
          className="h-7 w-7 rounded-md border border-stone-300 text-xs font-bold hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-800 cursor-pointer"
        >
          A-
        </button>
        <button
          aria-label="Increase font size"
          onClick={() => setFontSize(fontSizePx + 4)}
          className="h-7 w-7 rounded-md border border-stone-300 text-sm font-bold hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-800 cursor-pointer"
        >
          A+
        </button>
        <Layers className="ml-1 hidden h-3.5 w-3.5 text-stone-400 sm:block" />
      </div>
    </div>
  );
}
