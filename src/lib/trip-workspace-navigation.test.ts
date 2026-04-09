import { describe, expect, it, vi } from "vitest";

import { navigateToTripWorkspacePassengerDetail } from "@/lib/trip-workspace-navigation";

describe("navigateToTripWorkspacePassengerDetail", () => {
  const trip = "660e8400-e29b-41d4-a716-446655440001";
  const p1 = "770e8400-e29b-41d4-a716-446655440002";
  const p2 = "880e8400-e29b-41d4-a716-446655440003";
  const school = "550e8400-e29b-41d4-a716-446655440000";

  it("keeps edit detail when pathname is passenger edit", () => {
    const navigate = vi.fn();
    navigateToTripWorkspacePassengerDetail({
      navigate,
      pathname: `/trips/${trip}/passengers/${p1}/edit`,
      tripId: trip,
      passengerId: p2,
    });
    expect(navigate).toHaveBeenCalledWith({
      to: "/trips/$tripId/passengers/$passengerId/edit",
      params: { tripId: trip, passengerId: p2 },
    });
  });

  it("keeps school-scoped edit URLs", () => {
    const navigate = vi.fn();
    navigateToTripWorkspacePassengerDetail({
      navigate,
      pathname: `/schools/${school}/trips/${trip}/passengers/${p1}/edit`,
      tripId: trip,
      passengerId: p2,
      scopedSchoolId: school,
    });
    expect(navigate).toHaveBeenCalledWith({
      to: "/schools/$schoolId/trips/$tripId/passengers/$passengerId/edit",
      params: { schoolId: school, tripId: trip, passengerId: p2 },
    });
  });

  it("uses payments index when on payments branch", () => {
    const navigate = vi.fn();
    navigateToTripWorkspacePassengerDetail({
      navigate,
      pathname: `/trips/${trip}/passengers/${p1}/payments`,
      tripId: trip,
      passengerId: p2,
    });
    expect(navigate).toHaveBeenCalledWith({
      to: "/trips/$tripId/passengers/$passengerId/payments",
      params: { tripId: trip, passengerId: p2 },
    });
  });

  it("uses new payment route when on payments/new", () => {
    const navigate = vi.fn();
    navigateToTripWorkspacePassengerDetail({
      navigate,
      pathname: `/trips/${trip}/passengers/${p1}/payments/new`,
      tripId: trip,
      passengerId: p2,
    });
    expect(navigate).toHaveBeenCalledWith({
      to: "/trips/$tripId/passengers/$passengerId/payments/new",
      params: { tripId: trip, passengerId: p2 },
    });
  });

  it("defaults to payments index on passengers list", () => {
    const navigate = vi.fn();
    navigateToTripWorkspacePassengerDetail({
      navigate,
      pathname: `/trips/${trip}/passengers`,
      tripId: trip,
      passengerId: p2,
    });
    expect(navigate).toHaveBeenCalledWith({
      to: "/trips/$tripId/passengers/$passengerId/payments",
      params: { tripId: trip, passengerId: p2 },
    });
  });
});
