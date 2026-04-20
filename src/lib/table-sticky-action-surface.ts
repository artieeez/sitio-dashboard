/**
 * Sticky table action column: opaque `color-mix` matches row `bg-muted/{n}` on
 * `background` without alpha, so scrolling cells don’t show through the kebab cell.
 */
export const tableStickyActionSelected =
  "bg-[color-mix(in_oklch,var(--color-muted)_50%,var(--color-background))] group-hover:bg-[color-mix(in_oklch,var(--color-muted)_55%,var(--color-background))]";

export const tableStickyActionUnselected =
  "bg-background group-hover:bg-[color-mix(in_oklch,var(--color-muted)_40%,var(--color-background))]";

/**
 * Full-width backdrop inside sticky `<td>` so horizontal scroll doesn’t bleed through.
 * Requires `group` on `<tr>` (interactive rows) for hover to match row tint.
 */
export const tableStickyActionCellBackdropUnselected =
  "min-h-full w-full bg-background group-hover:bg-[color-mix(in_oklch,var(--color-muted)_40%,var(--color-background))]";

export const tableStickyActionCellBackdropSelected =
  "min-h-full w-full bg-[color-mix(in_oklch,var(--color-muted)_50%,var(--color-background))] group-hover:bg-[color-mix(in_oklch,var(--color-muted)_55%,var(--color-background))]";

/** Same as unselected backdrop without `group-hover` (non-interactive `<tr>`). */
export const tableStickyActionCellBackdropStatic =
  "min-h-full w-full bg-background";

/** Left edge on sticky action column (`th` / `td`) to separate from scrolling cells. */
export const tableStickyActionEdge = "border-border/70 border-l";
