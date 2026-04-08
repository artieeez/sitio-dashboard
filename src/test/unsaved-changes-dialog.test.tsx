import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
  useBlocker,
} from "@tanstack/react-router";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { UnsavedChangesDialog } from "@/components/layout/unsaved-changes-dialog";
import { ptBR } from "@/messages/pt-BR";

function BlockerShell() {
  const [dirty, setDirty] = useState(true);
  const blocker = useBlocker({
    shouldBlockFn: () => dirty,
    withResolver: true,
  });

  return (
    <div>
      <Link to={"/unsaved-blocker-test/away" as never}>Leave</Link>
      {blocker.status === "blocked" ? (
        <UnsavedChangesDialog
          open
          onContinueEditing={() => blocker.reset?.()}
          onDiscard={() => {
            setDirty(false);
            blocker.proceed?.();
          }}
        />
      ) : null}
      <Outlet />
    </div>
  );
}

function buildBlockerRouter(initialPath: string) {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });

  const shellRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "unsaved-blocker-test",
    component: BlockerShell,
  });

  const homeRoute = createRoute({
    getParentRoute: () => shellRoute,
    path: "/",
    component: () => <div data-testid="home">Home</div>,
  });

  const awayRoute = createRoute({
    getParentRoute: () => shellRoute,
    path: "away",
    component: () => <div data-testid="away">Away</div>,
  });

  const routeTree = rootRoute.addChildren([
    shellRoute.addChildren([homeRoute, awayRoute]),
  ]);

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

describe("unsaved-changes dialog + router blocker (US1 / T012)", () => {
  it("blocks navigation when dirty and proceeds after discard", async () => {
    const router = buildBlockerRouter("/unsaved-blocker-test");

    render(<RouterProvider router={router} />);

    expect(await screen.findByTestId("home")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Leave" }));

    expect(
      await screen.findByRole("heading", { name: ptBR.unsavedChanges.title }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: ptBR.unsavedChanges.discard }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("away")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("home")).not.toBeInTheDocument();
  });

  it("cancels navigation when user continues editing", async () => {
    const router = buildBlockerRouter("/unsaved-blocker-test");

    render(<RouterProvider router={router} />);

    expect(await screen.findByTestId("home")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Leave" }));

    expect(
      await screen.findByTestId("unsaved-changes-dialog"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: ptBR.unsavedChanges.continueEditing }),
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("unsaved-changes-dialog"),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("home")).toBeInTheDocument();
    expect(screen.queryByTestId("away")).not.toBeInTheDocument();
  });
});
