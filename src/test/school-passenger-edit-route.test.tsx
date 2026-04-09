import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

describe("school-scoped passenger edit route", () => {
  it("matches /schools/.../trips/.../passengers/.../edit in the route tree", async () => {
    const school = "550e8400-e29b-41d4-a716-446655440000";
    const trip = "660e8400-e29b-41d4-a716-446655440001";
    const pass = "770e8400-e29b-41d4-a716-446655440002";
    const path = `/schools/${school}/trips/${trip}/passengers/${pass}/edit`;

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: [path] }),
    });

    await router.load();

    const ids = router.state.matches.map((m) => m.routeId);
    expect(ids).toContain(
      "/schools/$schoolId/trips/$tripId/passengers/$passengerId/edit",
    );

    const notFound = router.state.matches.filter((m) => m.status === "notFound");
    expect(notFound).toHaveLength(0);

    const tripsShell = router.state.matches.find(
      (m) => m.routeId === "/schools/$schoolId/trips",
    );
    const shellParams = tripsShell?.params as Record<string, string> | undefined;
    expect(shellParams?.tripId).toBe(trip);
  });
});
