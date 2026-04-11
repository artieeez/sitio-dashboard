import { isUuid } from "@/lib/uuid";

/** Link/navigate targets for passenger payment flows (trip workspace vs school list–detail shell). */

/** When pathname is under `/schools/:id/trips/...`, return that school id for scoped payment links. */
export function scopedSchoolIdFromPathname(
  pathname: string,
): string | undefined {
  const m = pathname.match(/^\/schools\/([^/]+)\/trips\//);
  if (!m?.[1] || !isUuid(m[1])) return undefined;
  return m[1];
}

export type PaymentRouteIds = {
  tripId: string;
  passengerId: string;
  /** When set, URLs stay under `/schools/$schoolId/trips/...` so the school shell list pane stays mounted. */
  schoolId?: string;
};

/** Payments index, new, or edit under `/.../passengers/:passengerId/payments/...`. */
export function isPassengerPaymentsBranchPath(pathname: string): boolean {
  return /\/passengers\/[0-9a-f-]{36}\/payments(?:\/|$)/i.test(pathname);
}

/** Create/edit payment form routes: embed title + close in content (like school form). */
export function isPassengerPaymentFormDetailPath(pathname: string): boolean {
  if (!isPassengerPaymentsBranchPath(pathname)) return false;
  if (pathname.includes("/payments/new")) return true;
  return /\/payments\/[0-9a-f-]{36}\/edit(?:\/|$)/i.test(pathname);
}

/** Payments list for a passenger (`.../payments` or `.../payments/`); close lives in the pane header. */
export function isPassengerPaymentsIndexPath(pathname: string): boolean {
  return (
    isPassengerPaymentsBranchPath(pathname) &&
    !isPassengerPaymentFormDetailPath(pathname)
  );
}

/** Passenger edit form (`.../passengers/:id/edit`): embed title + close like school form. */
export function isPassengerEditDetailPath(pathname: string): boolean {
  return /\/passengers\/[0-9a-f-]{36}\/edit(?:\/|$)/i.test(pathname);
}

/** Create passenger (`.../passengers/new`): title row + close aligned in page header. */
export function isPassengerNewFormPath(pathname: string): boolean {
  return /\/passengers\/new(?:\/|$)/.test(pathname);
}

/**
 * Passengers list hub only: `.../trips/:tripId/passengers` (no `/new`, no passenger id).
 * Used to hide the list–detail chrome close control when nothing is selected in the table.
 */
export function isTripPassengersListHubPath(
  pathname: string,
  tripId: string,
): boolean {
  const norm = pathname.replace(/\/$/, "") || pathname;
  if (norm === `/trips/${tripId}/passengers`) return true;
  const m = norm.match(/^\/schools\/[^/]+\/trips\/([^/]+)(\/.*)$/);
  if (!m || m[1] !== tripId) return false;
  return m[2] === "/passengers";
}

/**
 * Under `.../trips/:tripId/passengers/...`, returns the passenger id when the detail
 * route is that passenger’s payments branch or edit screen (global or school-prefixed URLs).
 */
export function highlightedPassengerIdFromTripWorkspacePathname(
  pathname: string,
  tripId: string,
): string | null {
  const passengerSegment = `/trips/${tripId}/passengers/`;
  const pIdx = pathname.indexOf(passengerSegment);
  if (pIdx < 0) return null;
  const rest = pathname.slice(pIdx + passengerSegment.length);
  const m = rest.match(/^([0-9a-f-]{36})\/(?:payments|edit)(?:\/|$)/i);
  return m?.[1] ?? null;
}

export function passengerEditLink(opts: PaymentRouteIds): {
  to: string;
  params: Record<string, string>;
} {
  if (opts.schoolId) {
    return {
      to: "/schools/$schoolId/trips/$tripId/passengers/$passengerId/edit",
      params: {
        schoolId: opts.schoolId,
        tripId: opts.tripId,
        passengerId: opts.passengerId,
      },
    };
  }
  return {
    to: "/trips/$tripId/passengers/$passengerId/edit",
    params: { tripId: opts.tripId, passengerId: opts.passengerId },
  };
}

export function passengersListLink(opts: {
  tripId: string;
  schoolId?: string;
}): { to: string; params: Record<string, string> } {
  if (opts.schoolId) {
    return {
      to: "/schools/$schoolId/trips/$tripId/passengers",
      params: { schoolId: opts.schoolId, tripId: opts.tripId },
    };
  }
  return { to: "/trips/$tripId/passengers", params: { tripId: opts.tripId } };
}

/** Trip edit/summary: `/trips/:id/summary` or school list–detail `/schools/.../trips/:id`. */
export function tripSummaryLink(opts: { tripId: string; schoolId?: string }): {
  to: string;
  params: Record<string, string>;
} {
  if (opts.schoolId) {
    return {
      to: "/schools/$schoolId/trips/$tripId",
      params: { schoolId: opts.schoolId, tripId: opts.tripId },
    };
  }
  return { to: "/trips/$tripId/summary", params: { tripId: opts.tripId } };
}

/** Any trip-workspace URL under `.../trips/:tripId/passengers/...` (global or school-prefixed). */
export function isTripWorkspacePassengersPath(
  pathname: string,
  tripId: string,
): boolean {
  return pathname.includes(`/trips/${tripId}/passengers`);
}

export function paymentsIndexLink(opts: PaymentRouteIds): {
  to: string;
  params: Record<string, string>;
} {
  if (opts.schoolId) {
    return {
      to: "/schools/$schoolId/trips/$tripId/passengers/$passengerId/payments",
      params: {
        schoolId: opts.schoolId,
        tripId: opts.tripId,
        passengerId: opts.passengerId,
      },
    };
  }
  return {
    to: "/trips/$tripId/passengers/$passengerId/payments",
    params: { tripId: opts.tripId, passengerId: opts.passengerId },
  };
}

export function paymentsNewLink(opts: PaymentRouteIds): {
  to: string;
  params: Record<string, string>;
} {
  if (opts.schoolId) {
    return {
      to: "/schools/$schoolId/trips/$tripId/passengers/$passengerId/payments/new",
      params: {
        schoolId: opts.schoolId,
        tripId: opts.tripId,
        passengerId: opts.passengerId,
      },
    };
  }
  return {
    to: "/trips/$tripId/passengers/$passengerId/payments/new",
    params: { tripId: opts.tripId, passengerId: opts.passengerId },
  };
}

export function paymentEditLink(
  opts: PaymentRouteIds & { paymentId: string },
): { to: string; params: Record<string, string> } {
  if (opts.schoolId) {
    return {
      to: "/schools/$schoolId/trips/$tripId/passengers/$passengerId/payments/$paymentId/edit",
      params: {
        schoolId: opts.schoolId,
        tripId: opts.tripId,
        passengerId: opts.passengerId,
        paymentId: opts.paymentId,
      },
    };
  }
  return {
    to: "/trips/$tripId/passengers/$passengerId/payments/$paymentId/edit",
    params: {
      tripId: opts.tripId,
      passengerId: opts.passengerId,
      paymentId: opts.paymentId,
    },
  };
}
