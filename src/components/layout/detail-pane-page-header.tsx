import { XIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

export type DetailPaneCloseButtonProps = {
  onClose: () => void;
  /** @default ptBR.listDetail.detailClose */
  ariaLabel?: string;
  /** `default`: ghost `sm` + compact padding. `icon`: icon-only control (narrow form headers). */
  size?: "default" | "icon";
  className?: string;
};

/** Ghost close control for list–detail panes (X icon + shared a11y). */
export function DetailPaneCloseButton({
  onClose,
  ariaLabel = ptBR.listDetail.detailClose,
  size = "default",
  className,
}: DetailPaneCloseButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={size === "icon" ? "icon" : "sm"}
      className={cn("shrink-0", size === "default" && "gap-1 px-2", className)}
      onClick={onClose}
      aria-label={ariaLabel}
    >
      <XIcon className="size-4 shrink-0" aria-hidden />
    </Button>
  );
}

const rowLayoutClass = {
  default: "flex flex-wrap items-center justify-between gap-2",
  dense: "flex min-w-0 items-center justify-between gap-3",
  loose: "flex flex-wrap items-center justify-between gap-3",
  panel: "flex items-start justify-between gap-3",
} as const;

export type DetailPanePageHeaderProps = {
  title: ReactNode;
  onClose?: () => void;
  closeAriaLabel?: string;
  closeButtonSize?: "default" | "icon";
  /**
   * `page`: `h1` + `text-lg` (forms / primary detail titles).
   * `panel`: `h2` + `text-base` (sheet-style blocks, e.g. Wix).
   */
  variant?: "page" | "panel";
  /**
   * `default`: wrap, gap-2.
   * `dense`: single-line friendly (`min-w-0`, gap-3).
   * `loose`: wrap, gap-3 (e.g. trip edit header).
   * `panel`: top-aligned row (long titles + close).
   */
  rowLayout?: keyof typeof rowLayoutClass;
  /** Renders below the title row inside the same `<header>` (e.g. helper copy). */
  subtitle?: ReactNode;
  className?: string;
};

/**
 * Standard list–detail title row: heading + optional close.
 * Use with `useListDetailLayout().requestCloseDetail` for the close action.
 */
export function DetailPanePageHeader({
  title,
  onClose,
  closeAriaLabel,
  closeButtonSize = "default",
  variant = "page",
  rowLayout = "default",
  subtitle,
  className,
}: DetailPanePageHeaderProps) {
  const rowClass = rowLayoutClass[rowLayout];

  return (
    <header
      className={cn(subtitle != null && "flex flex-col gap-2", className)}
    >
      <div className={rowClass}>
        {variant === "panel" ? (
          <h2 className="min-w-0 font-medium text-base">{title}</h2>
        ) : (
          <h1
            className={cn(
              "text-lg font-medium",
              rowLayout === "dense" && "min-w-0 leading-snug",
            )}
          >
            {title}
          </h1>
        )}
        {onClose != null ? (
          <DetailPaneCloseButton
            onClose={onClose}
            ariaLabel={closeAriaLabel}
            size={closeButtonSize}
          />
        ) : null}
      </div>
      {subtitle}
    </header>
  );
}
