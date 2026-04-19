import { Plus, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BooleanFilterChipProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

/**
 * Compact pill toggle for boolean filters: dashed + Plus when off, solid + X when on.
 */
export function BooleanFilterChip({
  checked,
  onCheckedChange,
  children,
  className,
  disabled = false,
}: BooleanFilterChipProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked
          ? "border-primary border-solid bg-primary/15 text-foreground"
          : "border-border border-dashed bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {checked ? (
        <X className="size-3 shrink-0" aria-hidden />
      ) : (
        <Plus className="size-3 shrink-0" aria-hidden />
      )}
      {children}
    </button>
  );
}
