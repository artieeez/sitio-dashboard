import { describe, expect, it } from "vitest";

import {
  highlightedPassengerIdFromTripWorkspacePathname,
  isPassengerPaymentsIndexPath,
  isTripPassengersListHubPath,
  isTripWorkspacePassengersPath,
  tripSummaryLink,
} from "@/lib/trip-payment-links";

describe("highlightedPassengerIdFromTripWorkspacePathname", () => {
  const trip = "660e8400-e29b-41d4-a716-446655440001";
  const pass = "770e8400-e29b-41d4-a716-446655440002";

  it("returns passenger id on edit detail (global trip URL)", () => {
    expect(
      highlightedPassengerIdFromTripWorkspacePathname(
        `/trips/${trip}/passengers/${pass}/edit`,
        trip,
      ),
    ).toBe(pass);
  });

  it("returns passenger id on payments branch", () => {
    expect(
      highlightedPassengerIdFromTripWorkspacePathname(
        `/trips/${trip}/passengers/${pass}/payments/new`,
        trip,
      ),
    ).toBe(pass);
  });

  it("returns passenger id when school-prefixed", () => {
    const school = "550e8400-e29b-41d4-a716-446655440000";
    expect(
      highlightedPassengerIdFromTripWorkspacePathname(
        `/schools/${school}/trips/${trip}/passengers/${pass}/edit`,
        trip,
      ),
    ).toBe(pass);
  });

  it("returns null on passengers index (no detail passenger)", () => {
    expect(
      highlightedPassengerIdFromTripWorkspacePathname(
        `/trips/${trip}/passengers`,
        trip,
      ),
    ).toBeNull();
  });
});

describe("isTripPassengersListHubPath", () => {
  const trip = "660e8400-e29b-41d4-a716-446655440001";
  const school = "550e8400-e29b-41d4-a716-446655440000";

  it("is true for global passengers hub", () => {
    expect(isTripPassengersListHubPath(`/trips/${trip}/passengers`, trip)).toBe(
      true,
    );
    expect(
      isTripPassengersListHubPath(`/trips/${trip}/passengers/`, trip),
    ).toBe(true);
  });

  it("is true for school-scoped passengers hub", () => {
    expect(
      isTripPassengersListHubPath(
        `/schools/${school}/trips/${trip}/passengers`,
        trip,
      ),
    ).toBe(true);
  });

  it("is false when a passenger segment is present", () => {
    expect(
      isTripPassengersListHubPath(
        `/trips/${trip}/passengers/770e8400-e29b-41d4-a716-446655440002/payments`,
        trip,
      ),
    ).toBe(false);
    expect(
      isTripPassengersListHubPath(`/trips/${trip}/passengers/new`, trip),
    ).toBe(false);
  });
});

describe("isTripWorkspacePassengersPath", () => {
  const trip = "660e8400-e29b-41d4-a716-446655440001";
  const school = "550e8400-e29b-41d4-a716-446655440000";

  it("is true for global and school passengers routes", () => {
    expect(
      isTripWorkspacePassengersPath(`/trips/${trip}/passengers`, trip),
    ).toBe(true);
    expect(
      isTripWorkspacePassengersPath(
        `/schools/${school}/trips/${trip}/passengers`,
        trip,
      ),
    ).toBe(true);
    expect(
      isTripWorkspacePassengersPath(
        `/schools/${school}/trips/${trip}/passengers/${"770e8400-e29b-41d4-a716-446655440002"}/payments`,
        trip,
      ),
    ).toBe(true);
  });

  it("is false for trip summary paths", () => {
    expect(isTripWorkspacePassengersPath(`/trips/${trip}/summary`, trip)).toBe(
      false,
    );
    expect(
      isTripWorkspacePassengersPath(`/schools/${school}/trips/${trip}`, trip),
    ).toBe(false);
  });
});

describe("tripSummaryLink", () => {
  const trip = "660e8400-e29b-41d4-a716-446655440001";
  const school = "550e8400-e29b-41d4-a716-446655440000";

  it("targets global summary or school trip detail", () => {
    expect(tripSummaryLink({ tripId: trip })).toEqual({
      to: "/trips/$tripId/summary",
      params: { tripId: trip },
    });
    expect(tripSummaryLink({ tripId: trip, schoolId: school })).toEqual({
      to: "/schools/$schoolId/trips/$tripId",
      params: { schoolId: school, tripId: trip },
    });
  });
});

describe("isPassengerPaymentsIndexPath", () => {
  const trip = "660e8400-e29b-41d4-a716-446655440001";
  const pass = "770e8400-e29b-41d4-a716-446655440002";
  const school = "550e8400-e29b-41d4-a716-446655440000";

  it("is true for payments index with or without trailing slash", () => {
    expect(
      isPassengerPaymentsIndexPath(
        `/trips/${trip}/passengers/${pass}/payments`,
      ),
    ).toBe(true);
    expect(
      isPassengerPaymentsIndexPath(
        `/trips/${trip}/passengers/${pass}/payments/`,
      ),
    ).toBe(true);
    expect(
      isPassengerPaymentsIndexPath(
        `/schools/${school}/trips/${trip}/passengers/${pass}/payments`,
      ),
    ).toBe(true);
  });

  it("is false for new/edit payment routes", () => {
    expect(
      isPassengerPaymentsIndexPath(
        `/trips/${trip}/passengers/${pass}/payments/new`,
      ),
    ).toBe(false);
    expect(
      isPassengerPaymentsIndexPath(
        `/trips/${trip}/passengers/${pass}/payments/770e8400-e29b-41d4-a716-446655440003/edit`,
      ),
    ).toBe(false);
  });
});
