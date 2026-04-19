import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Outer shell: `overflow-hidden` keeps scrolling inside `ListPaneScrollArea` (flex + min-height chain). */
const shellClass =
  "flex min-h-0 min-w-0 flex-1 basis-0 flex-col gap-4 overflow-hidden px-4 pb-4 pt-2";

const scrollAreaClass =
  "flex min-h-0 min-w-0 flex-1 basis-0 flex-col gap-4 overflow-y-auto";

export type ListPaneShellProps = {
  children: ReactNode;
  className?: string;
};

/** Outer list pane container: fills the list region and stacks body + optional footer (e.g. pagination). */
export function ListPaneShell({ children, className }: ListPaneShellProps) {
  return <div className={cn(shellClass, className)}>{children}</div>;
}

export type ListPaneScrollAreaProps = {
  children: ReactNode;
  className?: string;
};

/** Scrollable column for lead content (header, filters) + main content (e.g. table). */
export function ListPaneScrollArea({
  children,
  className,
}: ListPaneScrollAreaProps) {
  return <div className={cn(scrollAreaClass, className)}>{children}</div>;
}

export type ListPaneLeadProps = {
  children: ReactNode;
  className?: string;
};

/** Groups `ListPanePageHeader` (any variant) and `ListPaneFilters` with spacing (non-scroll-isolated header block). */
export function ListPaneLead({ children, className }: ListPaneLeadProps) {
  return (
    <div className={cn("flex shrink-0 flex-col gap-4", className)}>
      {children}
    </div>
  );
}

export type ListPanePageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** e.g. kebab menu (`DropdownMenu`); rendered at the end of the title row. */
  menu?: ReactNode;
  className?: string;
  /**
   * `default`: page title (`text-lg`). `compact`: subsection toolbar (`text-sm`), wraps like trip workspace section rows.
   */
  variant?: "default" | "compact";
};

/** Title + optional subtitle + optional trailing actions on one row. */
export function ListPanePageHeader({
  title,
  subtitle,
  menu,
  className,
  variant = "default",
}: ListPanePageHeaderProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex min-w-0 flex-wrap items-center justify-between gap-2",
          className,
        )}
      >
        <div className="min-w-0">
          <h2 className="text-sm font-medium">{title}</h2>
          {subtitle != null ? (
            <p className="mt-0.5 text-muted-foreground text-xs">{subtitle}</p>
          ) : null}
        </div>
        {menu != null ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {menu}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-medium">{title}</h1>
        {subtitle != null ? (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        ) : null}
      </div>
      {menu != null ? <div className="shrink-0">{menu}</div> : null}
    </div>
  );
}

export type ListPaneFiltersProps = {
  children: ReactNode;
  className?: string;
};

/** Horizontal row for filter chips / controls above the main list. */
export function ListPaneFilters({ children, className }: ListPaneFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

export type ListPaneFooterProps = {
  children: ReactNode;
  className?: string;
};

/** Shrink-wrapped region below the scroll area (e.g. pagination toolbar). */
export function ListPaneFooter({ children, className }: ListPaneFooterProps) {
  return <div className={cn("shrink-0", className)}>{children}</div>;
}
