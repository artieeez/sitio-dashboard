import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

/**
 * US5 shell: fixed sidebar + scrollable main (UI-FR-001).
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2 text-sm sm:gap-4">
        <span className="font-medium text-foreground">Sítio</span>
        <Link
          to="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          {ptBR.nav.home}
        </Link>
        <Link
          to="/schools"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "sm:hidden",
          )}
        >
          {ptBR.entities.schools}
        </Link>
      </header>
      <div className="flex min-h-0 min-w-0 flex-1">
        <aside
          className="hidden w-52 shrink-0 overflow-y-auto border-r border-border bg-muted/30 p-4 sm:block"
          aria-label={ptBR.shell.sidebarNav}
        >
          <nav className="flex flex-col gap-1 text-sm">
            <Link
              to="/schools"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start",
              )}
            >
              {ptBR.entities.schools}
            </Link>
          </nav>
        </aside>
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
