import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/layout/dashboard-breadcrumbs", () => ({
  DashboardBreadcrumbs: () => <div data-testid="breadcrumbs-stub" />,
}));

vi.mock("@/components/layout/school-scope-menu", () => ({
  SchoolScopeMenu: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/sidebar", () => {
  return {
    SidebarProvider: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    Sidebar: ({ children }: { children: ReactNode }) => (
      <aside>{children}</aside>
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
    SidebarInset: ({ children }: { children: ReactNode }) => (
      <main>{children}</main>
    ),
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
    SidebarTrigger: () => null,
  };
});

vi.mock("@/hooks/use-schools-for-scope", () => ({
  useSchoolsForScope: () => ({ data: [] }),
}));

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
    "@tanstack/react-router",
  );
  return {
    ...actual,
    useRouterState: () => "/schools/550e8400-e29b-41d4-a716-446655440000",
    useNavigate: () => vi.fn(),
    Link: ({
      to,
      params,
      children,
      ...rest
    }: {
      to?: string;
      params?: { schoolId?: string };
      children?: ReactNode;
    } & AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const href =
        typeof to === "string" && params?.schoolId
          ? to.replace("$schoolId", params.schoolId)
          : to;
      return (
        <a href={href ?? "#"} {...rest}>
          {children}
        </a>
      );
    },
  };
});

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );
  return {
    ...actual,
    useQuery: () => ({
      data: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Escola Aurora",
      },
    }),
  };
});

import { DashboardShell } from "@/components/layout/dashboard-shell";

describe("school scoped sidebar links", () => {
  it("keeps links under current school id", () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <DashboardShell>
          <div>Conteúdo</div>
        </DashboardShell>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("link", { name: /início/i })).toHaveAttribute(
      "href",
      "/schools/550e8400-e29b-41d4-a716-446655440000/home",
    );
    expect(screen.getByRole("link", { name: /viagens/i })).toHaveAttribute(
      "href",
      "/schools/550e8400-e29b-41d4-a716-446655440000/trips",
    );
  });
});
