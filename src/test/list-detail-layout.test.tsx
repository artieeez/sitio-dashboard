import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useNavigate,
  useParams,
  useRouterState,
} from "@tanstack/react-router";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ListDetailLayout,
  useListDetailLayout,
} from "@/components/layout/list-detail-layout";
import { ptBR } from "@/messages/pt-BR";

function TestSchoolsList() {
  const { requestSelect, selectedKey } = useListDetailLayout();
  return (
    <ul>
      <li>
        <button
          type="button"
          aria-current={selectedKey === "alpha" ? true : undefined}
          onClick={() => requestSelect("alpha")}
        >
          School Alpha
        </button>
      </li>
    </ul>
  );
}

function TestSchoolsShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segment = pathname.match(/^\/schools\/([^/]+)/)?.[1];
  const selectedKey = segment && segment !== "" ? segment : null;

  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ListDetailLayout
        isCompactOverride={false}
        selectedKey={selectedKey}
        onSelectedKeyChange={(key) => {
          if (key) {
            void navigate({
              to: "/schools/$itemId",
              params: { itemId: key },
            } as never);
          } else {
            void navigate({ to: "/schools" });
          }
        }}
        list={<TestSchoolsList />}
        detail={<Outlet />}
      />
    </QueryClientProvider>
  );
}

function SchoolsIndexDetail() {
  return <div data-testid="schools-index-detail">pick-one</div>;
}

function SchoolsItemDetail() {
  const { itemId } = useParams({ strict: false }) as { itemId?: string };
  return <div data-testid="school-item-detail">{itemId}</div>;
}

describe("list-detail layout integration (US1 / T011)", () => {
  it("shows list and detail regions and updates detail when selection navigates", async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });

    const schoolsLayoutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "schools",
      component: TestSchoolsShell,
    });

    const schoolsIndexRoute = createRoute({
      getParentRoute: () => schoolsLayoutRoute,
      path: "/",
      component: SchoolsIndexDetail,
    });

    const schoolsItemRoute = createRoute({
      getParentRoute: () => schoolsLayoutRoute,
      path: "$itemId",
      component: SchoolsItemDetail,
    });

    const routeTree = rootRoute.addChildren([
      schoolsLayoutRoute.addChildren([schoolsIndexRoute, schoolsItemRoute]),
    ]);

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/schools"] }),
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByTestId("list-detail-layout")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: ptBR.listDetail.listRegion }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: ptBR.listDetail.detailRegion }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("schools-index-detail")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "School Alpha" }));

    await waitFor(() => {
      expect(screen.getByTestId("school-item-detail")).toHaveTextContent(
        "alpha",
      );
    });

    const row = screen.getByRole("button", { name: "School Alpha" });
    expect(row).toHaveAttribute("aria-current", "true");
  });
});
