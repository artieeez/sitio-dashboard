import { MoreVertical } from "lucide-react";
import type { ReactNode } from "react";

/** Disclosure-based row menu (vertical kebab icon). */
export function RowKebabMenu(props: {
  ariaLabel: string;
  children: ReactNode;
}) {
  const { ariaLabel, children } = props;
  return (
    <details className="group relative">
      <summary
        className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md hover:bg-muted [&::-webkit-details-marker]:hidden"
        aria-label={ariaLabel}
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </summary>
      <div
        className="absolute right-0 z-20 mt-1 flex min-w-[12rem] flex-col gap-1 rounded-md border border-border bg-background p-1 text-left shadow-md"
        role="menu"
      >
        {children}
      </div>
    </details>
  );
}
