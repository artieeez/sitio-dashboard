import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SegmentedRadioOption<T extends string> = {
  value: T;
  label: ReactNode;
};

type SegmentedRadioGroupProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentedRadioOption<T>[];
  /** Distinct `name` per form instance (radio grouping). */
  name: string;
  className?: string;
};

/**
 * Two-or-more-segment control: native radios for accessibility, pill styling.
 */
export function SegmentedRadioGroup<T extends string>({
  value,
  onValueChange,
  options,
  name,
  className,
}: SegmentedRadioGroupProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex w-full max-w-md rounded-lg border border-input bg-muted/40 p-0.5",
        className,
      )}
      data-slot="segmented-radio-group"
    >
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center rounded-md px-3 py-2 text-center text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <input
            type="radio"
            className="sr-only"
            name={name}
            checked={value === opt.value}
            onChange={() => onValueChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
