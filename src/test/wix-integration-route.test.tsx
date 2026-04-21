import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { routeTree } from "@/routeTree.gen";

vi.mock("@tanstack/react-devtools", () => ({
  TanStackDevtools: () => null,
}));

vi.mock("@tanstack/react-router-devtools", () => ({
  TanStackRouterDevtoolsPanel: () => null,
}));

vi.mock("@/lib/api-client", () => ({
  apiJson: vi.fn((path: string) => {
    if (path === "/integrations/wix") {
      return Promise.resolve({
        siteId: null,
        publicKey: null,
        privateApiKeyPrefix: null,
      });
    }
    if (path === "/schools") {
      return Promise.resolve([]);
    }
    const m = path.match(/^\/schools\/([^/]+)$/);
    if (m) {
      const id = m[1];
      return Promise.resolve({
        id,
        active: true,
        url: null,
        title: "Escola teste",
        description: null,
        imageUrl: null,
        faviconUrl: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });
    }
    return Promise.resolve([]);
  }),
}));

vi.mock("@/components/layout/school-scope-menu", () => ({
  SchoolScopeMenu: () => null,
}));

describe("Wix integration route (US1)", () => {
  const schoolId = "550e8400-e29b-41d4-a716-446655440000";

  it("renders list and detail regions with table and placeholder when school is scoped", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: [`/schools/${schoolId}/integrations/wix`],
      }),
    });

    render(
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("region", { name: /lista/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /detalhes/i }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { name: /pagamentos wix/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: /viagem/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /valor/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/selecione um evento de pagamento/i),
    ).toBeInTheDocument();
  });

  it("disables the Wix sidebar entry until a school is selected", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^início$/i }),
      ).toBeInTheDocument();
    });

    const wixBtn = screen.getByRole("button", { name: /integração wix/i });
    expect(wixBtn).toHaveAttribute("data-trigger-disabled");
  });
});
