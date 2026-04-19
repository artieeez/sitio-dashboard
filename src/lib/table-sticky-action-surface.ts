/**
 * Sticky table action column: opaque `color-mix` matches row `bg-muted/{n}` on
 * `background` without alpha, so scrolling cells don’t show through the kebab cell.
 */
export const tableStickyActionSelected =
  "bg-[color-mix(in_oklch,var(--color-muted)_50%,var(--color-background))] group-hover:bg-[color-mix(in_oklch,var(--color-muted)_55%,var(--color-background))]";

export const tableStickyActionUnselected =
  "bg-background group-hover:bg-[color-mix(in_oklch,var(--color-muted)_40%,var(--color-background))]";
