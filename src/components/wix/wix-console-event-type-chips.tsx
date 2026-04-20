import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ConsoleEventTypeChipsProps<T extends string> = {
  label: ReactNode;
  types: readonly T[];
  labels: Record<T, string>;
  selected: Set<T>;
  onToggle: (type: T) => void;
};

/**
 * Multi-select filter chips styled like {@link BooleanFilterChip} (no leading icons).
 */
export function ConsoleEventTypeChips<T extends string>({
  label,
  types,
  labels,
  selected,
  onToggle,
}: ConsoleEventTypeChipsProps<T>) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="shrink-0 text-muted-foreground text-xs">{label}</span>
      <div className="flex min-w-0 flex-wrap items-center gap-1">
        {types.map((t) => {
          const on = selected.has(t);
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(t)}
              className={cn(
                "inline-flex h-6 max-w-full min-w-0 shrink-0 cursor-pointer items-center truncate rounded-full border px-2 font-mono text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                on
                  ? "border-primary border-solid bg-primary/15 text-foreground"
                  : "border-border border-dashed bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {labels[t]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
