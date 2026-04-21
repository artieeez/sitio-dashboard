import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

export type FormFooterProps = {
  className?: string;
  /** Primary control (typically Save). */
  children: React.ReactNode;
  /** Props for the primary button (defaults to `type="submit"`). */
  primaryProps?: Omit<ComponentProps<typeof Button>, "variant" | "children">;
  /** When set, Cancel is shown first (to the left of the primary in LTR). */
  onCancel?: () => void;
  cancelLabel?: React.ReactNode;
  cancelProps?: Omit<ComponentProps<typeof Button>, "variant" | "children">;
};

/**
 * Right-aligned form actions: optional **Cancel** (outline), then **primary** (default).
 */
export function FormFooter({
  children,
  className,
  primaryProps,
  onCancel,
  cancelLabel,
  cancelProps,
}: FormFooterProps) {
  return (
    <div className={cn("flex flex-wrap justify-end gap-2", className)}>
      {onCancel ? (
        <Button
          type="button"
          variant="outline"
          {...cancelProps}
          onClick={onCancel}
        >
          {cancelLabel ?? ptBR.actions.cancel}
        </Button>
      ) : null}
      <Button type="submit" {...primaryProps}>
        {children}
      </Button>
    </div>
  );
}
