import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { WixPaymentEventsListPane } from "@/components/wix/wix-payment-events-list-pane";
import { wixPaymentEventListItemSchema } from "@/lib/wix-payment-event-schemas";
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

const schoolId = "550e8400-e29b-41d4-a716-446655440000";

function renderWixRoute(path: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

const nonOrphanOnly = [
  wixPaymentEventListItemSchema.parse({
    event: {
      id: "10000000-0000-4000-8000-000000000099",
      dateCreated: "2026-04-10T12:00:00.000Z",
      buyerInfoId: "20000000-0000-4000-8000-000000000099",
      buyerIndoFirstname: "A",
      buyerIndoLastname: "B",
      buyerIndoPhone: "+55 00",
      buyerIndoEmail: "a@b.co",
      buyerIndoContactId: "30000000-0000-4000-8000-000000000099",
      orderId: "40000000-0000-4000-8000-000000000099",
      orderTotal: "10.00",
      billingInfoPaymentMethod: "pix",
      billingInfoCountry: "BR",
      billingInfoSubdivision: "BR-RS",
      billingInfoCity: "POA",
      billingInfoZipCode: "90000000",
      billingInfoPhone: "+55",
      billingInfoEmail: "x@y.co",
      billingInfoVatIdNumber: "000",
      billingInfoVatIdType: "CPF",
      billingInfoStreetNumber: "1",
      billingInfoStreetName: "Rua",
      lineItemsName: "Item",
      lineItemsProductId: "p1",
    },
    isOrphan: false,
    tripTitle: "Viagem única",
    integrationEventType: "order_paid",
  }),
];

function renderListPaneOnly(rowsOverride: typeof nonOrphanOnly) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function TestPane() {
    return (
      <ListDetailLayout
        isCompactOverride={false}
        selectedKey={null}
        onSelectedKeyChange={() => {}}
        disableLocalUnsavedGuard
        list={
          <WixPaymentEventsListPane
            schoolId={schoolId}
            rowsOverride={rowsOverride}
          />
        }
        detail={<div data-testid="detail-placeholder" />}
      />
    );
  }

  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => (
      <QueryClientProvider client={client}>
        <TestPane />
      </QueryClientProvider>
    ),
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  render(<RouterProvider router={router} />);
}

describe("Wix payment events table (US3)", () => {
  it("toggles sort direction when the same column header is activated twice", async () => {
    renderWixRoute(`/schools/${schoolId}/integrations/wix`);

    const tripHeader = await screen.findByRole("button", { name: /^viagem/i });
    const table = screen.getByRole("table");
    const firstDataRowText = () =>
      within(table).getAllByRole("row")[1]?.textContent ?? "";

    const before = firstDataRowText();
    fireEvent.click(tripHeader);
    const afterFirst = firstDataRowText();
    fireEvent.click(tripHeader);
    const afterSecond = firstDataRowText();

    expect(before).not.toBe(afterFirst);
    expect(afterFirst).not.toBe(afterSecond);
  });

  it("changes pagination when page size is updated", async () => {
    renderWixRoute(`/schools/${schoolId}/integrations/wix`);

    await screen.findByRole("heading", { name: /pagamentos wix/i });

    const sizeSelect = document.querySelector(
      "select",
    ) as HTMLSelectElement | null;
    expect(sizeSelect).toBeTruthy();
    fireEvent.change(sizeSelect as HTMLSelectElement, {
      target: { value: "25" },
    });

    expect(await screen.findByText(/página 1 de \d+/i)).toBeInTheDocument();
  });

  it("filters to orphan rows when the orphan chip is active", async () => {
    renderWixRoute(`/schools/${schoolId}/integrations/wix`);

    await screen.findByRole("heading", { name: /pagamentos wix/i });

    const chip = screen.getByRole("switch", { name: /somente órfãos/i });
    fireEvent.click(chip);

    const table = screen.getByRole("table");
    const dataRows = within(table).getAllByRole("row").slice(1);
    expect(dataRows.length).toBeGreaterThan(0);
    for (const row of dataRows) {
      expect(within(row).getByText(/órfão/i)).toBeInTheDocument();
    }
  });

  it("shows the orphan-only empty state when no orphan rows exist", async () => {
    renderListPaneOnly(nonOrphanOnly);

    const chip = await screen.findByRole("switch", { name: /somente órfãos/i });
    fireEvent.click(chip);

    expect(await screen.findByText(/nenhum evento órfão/i)).toBeInTheDocument();
  });

  it("disables next on the last page", async () => {
    renderWixRoute(`/schools/${schoolId}/integrations/wix`);

    await screen.findByRole("heading", { name: /pagamentos wix/i });

    const next = screen.getByRole("button", { name: /próxima página/i });
    while (!next.hasAttribute("disabled")) {
      fireEvent.click(next);
    }
    expect(next).toBeDisabled();
  });
});
