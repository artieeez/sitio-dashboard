import {
  ListDetailLayoutPane,
  type ListDetailLayoutPaneProps,
} from "@/components/layout/list-detail-layout-pane";
import { useIsMobile } from "@/hooks/use-mobile";

export type ListDetailLayoutProps = Omit<
  ListDetailLayoutPaneProps,
  "isCompact"
> & {
  /**
   * When set, skips `useIsMobile` (for deterministic tests). In production, omit
   * so layout follows the real viewport.
   */
  isCompactOverride?: boolean;
};

export {
  type ListDetailLayoutContextValue,
  useListDetailLayout,
} from "@/components/layout/list-detail-layout-pane";

/**
 * M3 list–detail shell with responsive compact mode via `useIsMobile`, unless
 * `isCompactOverride` is set (tests).
 */
export function ListDetailLayout({
  isCompactOverride,
  ...props
}: ListDetailLayoutProps) {
  const isCompactFromHook = useIsMobile();
  const isCompact =
    isCompactOverride !== undefined ? isCompactOverride : isCompactFromHook;

  return <ListDetailLayoutPane {...props} isCompact={isCompact} />;
}
