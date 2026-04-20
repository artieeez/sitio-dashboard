import { Link } from "@tanstack/react-router";
import { MoreHorizontal, MoreVertical } from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const menuItemClass =
  "flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-foreground no-underline hover:bg-muted [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export type RowKebabMenuItem = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onClick?: () => void | Promise<void>;
  /** When set, row is a router `Link` instead of a button. */
  link?: { to: string; params?: Record<string, string> };
};

/** Disclosure-based row menu (⋮ or ⋯ trigger). */
export function RowKebabMenu(props: {
  ariaLabel: string;
  items: RowKebabMenuItem[];
  /** Default vertical (⋮); use horizontal (⋯) in dense tables. */
  iconOrientation?: "vertical" | "horizontal";
}) {
  const { ariaLabel, items, iconOrientation = "vertical" } = props;
  const Icon = iconOrientation === "horizontal" ? MoreHorizontal : MoreVertical;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const margin = 8;
    const top = Math.min(
      window.innerHeight - menuRect.height - margin,
      rect.bottom + margin,
    );
    const left = Math.max(
      margin,
      Math.min(
        window.innerWidth - menuRect.width - margin,
        rect.right - menuRect.width,
      ),
    );
    setMenuStyle({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onWindowChange = () => setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEscape);
    window.addEventListener("scroll", onWindowChange, true);
    window.addEventListener("resize", onWindowChange);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener("scroll", onWindowChange, true);
      window.removeEventListener("resize", onWindowChange);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-muted"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon className="pointer-events-none h-4 w-4" aria-hidden />
      </button>
      {open
        ? createPortal(
            <>
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: closes after menu item activation; items handle keyboard */}
              <div
                ref={menuRef}
                className="fixed z-50 flex min-w-[12rem] flex-col gap-1 rounded-md border border-border bg-background p-1 text-left shadow-md"
                style={
                  menuStyle
                    ? { top: menuStyle.top, left: menuStyle.left }
                    : { visibility: "hidden" }
                }
                role="menu"
                onClick={() => setOpen(false)}
              >
                {items.map((item) => (
                  <RowKebabMenuItemRow key={item.id} item={item} />
                ))}
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}

function RowKebabMenuItemRow(props: { item: RowKebabMenuItem }) {
  const { item } = props;
  const { label, icon, disabled, destructive, onClick, link } = item;

  const className = cn(
    menuItemClass,
    destructive && "text-destructive",
    disabled && "cursor-not-allowed opacity-50",
  );

  if (link) {
    return (
      <Link
        role="menuitem"
        to={link.to}
        params={link.params as never}
        className={className}
      >
        {icon ?? null}
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      className={className}
      disabled={disabled}
      onClick={() => {
        void onClick?.();
      }}
    >
      {icon ?? null}
      {label}
    </button>
  );
}
