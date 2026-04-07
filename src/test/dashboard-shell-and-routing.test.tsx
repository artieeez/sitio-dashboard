import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/layout/dashboard-breadcrumbs", () => ({
  DashboardBreadcrumbs: () => <div data-testid="breadcrumbs-stub" />,
}));

vi.mock("@/components/layout/school-scope-menu", () => ({
  SchoolScopeMenu: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/sidebar", () => {
  return {
    SidebarProvider: ({
      children,
      className,
    }: {
      children: ReactNode;
      className?: string;
    }) => <div className={className}>{children}</div>,
    Sidebar: ({
      children,
      "aria-label": ariaLabel,
      role,
    }: {
      children: ReactNode;
      "aria-label"?: string;
      role?: string;
    }) => (
      <aside role={role ?? "complementary"} aria-label={ariaLabel}>
        {children}
      </aside>
    ),
    SidebarContent: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    SidebarFooter: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    SidebarGroup: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    SidebarGroupContent: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    SidebarGroupLabel: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    SidebarHeader: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    SidebarInset: ({
      children,
      className,
    }: {
      children: ReactNode;
      className?: string;
    }) => <main className={className}>{children}</main>,
    SidebarMenu: ({ children }: { children: ReactNode }) => <ul>{children}</ul>,
    SidebarMenuButton: ({
      children,
      render,
    }: {
      children: ReactNode;
      render?: ReactNode;
    }) => (
      <div>
        {render}
        {children}
      </div>
    ),
    SidebarMenuItem: ({ children }: { children: ReactNode }) => (
      <li>{children}</li>
    ),
    SidebarRail: () => null,
    SidebarTrigger: () => (
      <button type="button" aria-label="Toggle sidebar">
        menu
      </button>
    ),
  };
});

import { DashboardShell } from "@/components/layout/dashboard-shell";

describe("Dashboard shell (US5)", () => {
  it("exposes a scrollable main region and sidebar landmark", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });

    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: () => (
        <QueryClientProvider client={client}>
          <DashboardShell>
            <div>Conteúdo</div>
          </DashboardShell>
        </QueryClientProvider>
      ),
    });

    const router = createRouter({
      routeTree: rootRoute.addChildren([indexRoute]),
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: /navegação principal/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/viagens/i)).toBeInTheDocument();
  });
});
