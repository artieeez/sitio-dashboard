import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useContext,
} from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export type TabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: ReactNode;
};

export function Tabs({ value, onValueChange, className, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = ComponentPropsWithoutRef<"div">;

/** Horizontal tab row; active tab shows an underline via `TabsTrigger`. */
export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-auto w-full min-w-0 shrink-0 items-end justify-start gap-6 overflow-x-auto",
        className,
      )}
      {...props}
    />
  );
}

export type TabsTriggerProps = {
  value: string;
  className?: string;
  children: ReactNode;
};

export function TabsTrigger({ value, className, children }: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("TabsTrigger must be used within Tabs");
  }
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center border-0 border-b-2 bg-transparent px-1 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}
