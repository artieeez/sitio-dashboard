import { describe, expect, it } from "vitest";

import {
  highlightedPassengerIdFromTripWorkspacePathname,
  isTripPassengersListHubPath,
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
