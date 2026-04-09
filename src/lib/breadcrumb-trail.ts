import { ptBR } from "@/messages/pt-BR";

export type BreadcrumbSegment =
  | { key: string; label: string }
  | {
      key: string;
      label: string;
      to: string;
      params?: Record<string, string>;
    };

export function extractPathIds(pathname: string): {
  schoolId?: string;
  tripId?: string;
  passengerId?: string;
  paymentId?: string;
} {
  const schoolMatch = pathname.match(/^\/schools\/([^/]+)/);
  const tripMatch = pathname.match(/^\/trips\/([^/]+)/);
  const schoolScopedTripMatch = pathname.match(
    /^\/schools\/[^/]+\/trips\/([^/]+)/,
  );
  const passengerMatch = pathname.match(/\/passengers\/([^/]+)/);
  const paymentMatch = pathname.match(/\/payments\/([^/]+)/);
  const tail = schoolScopedTripMatch?.[1];
  const tripFromSchoolTrips =
    tail && tail !== "new" && /^[0-9a-f-]{36}$/i.test(tail) ? tail : undefined;
  return {
    schoolId: schoolMatch?.[1],
    tripId: tripMatch?.[1] ?? tripFromSchoolTrips,
    passengerId: passengerMatch?.[1],
    paymentId: paymentMatch?.[1],
  };
}

function stripTrailingSlash(path: string): string {
  if (path === "/" || path.length <= 1) return path;
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

export type BuildBreadcrumbTrailInput = {
  pathname: string;
  /** UUID from `/schools/:id` when present */
  schoolIdFromPath: string;
  /** Resolved school id for school-scoped links (path or from trip) */
  schoolIdForLinks: string;
  tripId: string;
  passengerId: string;
  tripLabel: string;
  passengerLabel: string;
};

function scopedHomeLink(schoolId: string): BreadcrumbSegment {
  return {
    key: "home",
    label: ptBR.nav.home,
    to: "/schools/$schoolId",
    params: { schoolId },
  };
}

function appendTripUnderPassengers(
  items: BreadcrumbSegment[],
  pathname: string,
  tripId: string,
  passengerId: string,
  passengerLabel: string,
): BreadcrumbSegment[] {
  const passengersList =
    pathname === `/trips/${tripId}/passengers` ||
    pathname === `/trips/${tripId}/passengers/`;

  if (passengersList) {
    const tripSeg = items[0];
    if (tripSeg?.key === "trip") {
      return [{ key: "trip", label: tripSeg.label }];
    }
    return items;
  }

  if (pathname === `/trips/${tripId}/passengers/new`) {
    items.push({
      key: "new-passenger",
      label: `${ptBR.actions.create} ${ptBR.entities.passenger}`,
    });
    return items;
  }

  if (
    passengerId &&
    pathname === `/trips/${tripId}/passengers/${passengerId}/edit`
  ) {
    items.push({
      key: "passenger",
      label: passengerLabel,
      to: "/trips/$tripId/passengers/$passengerId/payments",
      params: { tripId, passengerId },
    });
    items.push({
      key: "edit-passenger",
      label: `${ptBR.actions.edit} ${ptBR.entities.passenger}`,
    });
    return items;
  }

  if (passengerId && pathname.includes("/payments")) {
    items.push({
      key: "passenger",
      label: passengerLabel,
      to: "/trips/$tripId/passengers/$passengerId/payments",
      params: { tripId, passengerId },
    });

    if (pathname.endsWith("/payments/new")) {
      items.push({
        key: "payments",
        label: ptBR.entities.payments,
        to: "/trips/$tripId/passengers/$passengerId/payments",
        params: { tripId, passengerId },
      });
      items.push({
        key: "new-payment",
        label: ptBR.actions.newPayment,
      });
      return items;
    }

    if (/\/payments\/[^/]+\/edit\/?$/.test(pathname)) {
      items.push({
        key: "payments",
        label: ptBR.entities.payments,
        to: "/trips/$tripId/passengers/$passengerId/payments",
        params: { tripId, passengerId },
      });
      items.push({
        key: "edit-payment",
        label: ptBR.actions.editPayment,
      });
      return items;
    }

    items.push({ key: "payments", label: ptBR.entities.payments });
  }

  return items;
}

function appendSchoolTripUnderPassengers(
  items: BreadcrumbSegment[],
  pathname: string,
  schoolId: string,
  tripId: string,
  passengerId: string,
  passengerLabel: string,
): BreadcrumbSegment[] {
  const passengersList =
    pathname === `/schools/${schoolId}/trips/${tripId}/passengers` ||
    pathname === `/schools/${schoolId}/trips/${tripId}/passengers/`;

  if (passengersList) {
    const tripSeg = items[0];
    if (tripSeg?.key === "trip") {
      return [{ key: "trip", label: tripSeg.label }];
    }
    return items;
  }

  if (pathname === `/schools/${schoolId}/trips/${tripId}/passengers/new`) {
    items.push({
      key: "new-passenger",
      label: `${ptBR.actions.create} ${ptBR.entities.passenger}`,
    });
    return items;
  }

  if (
    passengerId &&
    pathname ===
      `/schools/${schoolId}/trips/${tripId}/passengers/${passengerId}/edit`
  ) {
    items.push({
      key: "passenger",
      label: passengerLabel,
      to: "/schools/$schoolId/trips/$tripId/passengers/$passengerId/payments",
      params: { schoolId, tripId, passengerId },
    });
    items.push({
      key: "edit-passenger",
      label: `${ptBR.actions.edit} ${ptBR.entities.passenger}`,
    });
    return items;
  }

  if (passengerId && pathname.includes("/payments")) {
    items.push({
      key: "passenger",
      label: passengerLabel,
      to: "/schools/$schoolId/trips/$tripId/passengers/$passengerId/payments",
      params: { schoolId, tripId, passengerId },
    });

    if (pathname.endsWith("/payments/new")) {
      items.push({
        key: "payments",
        label: ptBR.entities.payments,
        to: "/schools/$schoolId/trips/$tripId/passengers/$passengerId/payments",
        params: { schoolId, tripId, passengerId },
      });
      items.push({
        key: "new-payment",
        label: ptBR.actions.newPayment,
      });
      return items;
    }

    if (/\/payments\/[^/]+\/edit\/?$/.test(pathname)) {
      items.push({
        key: "payments",
        label: ptBR.entities.payments,
        to: "/schools/$schoolId/trips/$tripId/passengers/$passengerId/payments",
        params: { schoolId, tripId, passengerId },
      });
      items.push({
        key: "edit-payment",
        label: ptBR.actions.editPayment,
      });
      return items;
    }

    items.push({ key: "payments", label: ptBR.entities.payments });
  }

  return items;
}

export function buildBreadcrumbTrail(
  input: BuildBreadcrumbTrailInput,
): BreadcrumbSegment[] {
  const {
    pathname: rawPath,
    schoolIdFromPath: sidPath,
    schoolIdForLinks: sidLinks,
    tripId: tId,
    passengerId: pId,
    tripLabel,
    passengerLabel,
  } = input;

  const pathname = stripTrailingSlash(rawPath);

  if (pathname === "/") {
    return [{ key: "home", label: ptBR.nav.home }];
  }

  if (pathname === "/schools" || pathname === "/schools/") {
    return [{ key: "schools", label: ptBR.entities.schools }];
  }

  if (pathname === "/schools/new") {
    return [
      {
        key: "schools",
        label: ptBR.entities.schools,
        to: "/schools/",
      },
      {
        key: "new-school",
        label: `${ptBR.actions.create} ${ptBR.entities.school}`,
      },
    ];
  }

  if (pathname.startsWith("/schools/") && sidPath) {
    if (pathname === `/schools/${sidPath}`) {
      return [{ key: "home", label: ptBR.nav.home }];
    }

    if (pathname === `/schools/${sidPath}/edit`) {
      return [
        scopedHomeLink(sidPath),
        { key: "edit-school", label: ptBR.scope.editSchool },
      ];
    }

    if (
      pathname === `/schools/${sidPath}/trips` ||
      pathname === `/schools/${sidPath}/trips/`
    ) {
      return [];
    }

    if (pathname === `/schools/${sidPath}/trips/new`) {
      return [
        {
          key: "new-trip",
          label: `${ptBR.actions.create} ${ptBR.entities.trip}`,
        },
      ];
    }

    const schoolTripDetail = pathname.match(
      new RegExp(`^/schools/${sidPath}/trips/([0-9a-f-]{36})/?$`, "i"),
    );
    if (schoolTripDetail) {
      return [{ key: "trip", label: tripLabel }];
    }

    if (
      tId &&
      (pathname === `/schools/${sidPath}/trips/${tId}/passengers` ||
        pathname === `/schools/${sidPath}/trips/${tId}/passengers/`)
    ) {
      return [{ key: "trip", label: tripLabel }];
    }

    if (tId && pathname === `/schools/${sidPath}/trips/${tId}/passengers/new`) {
      return [
        {
          key: "trip",
          label: tripLabel,
          to: "/schools/$schoolId/trips/$tripId/passengers",
          params: { schoolId: sidPath, tripId: tId },
        },
        {
          key: "new-passenger",
          label: `${ptBR.actions.create} ${ptBR.entities.passenger}`,
        },
      ];
    }

    if (
      tId &&
      pId &&
      pathname === `/schools/${sidPath}/trips/${tId}/passengers/${pId}/edit`
    ) {
      return [
        {
          key: "trip",
          label: tripLabel,
          to: "/schools/$schoolId/trips/$tripId/passengers",
          params: { schoolId: sidPath, tripId: tId },
        },
        {
          key: "passenger",
          label: passengerLabel,
          to: "/schools/$schoolId/trips/$tripId/passengers/$passengerId/payments",
          params: {
            schoolId: sidPath,
            tripId: tId,
            passengerId: pId,
          },
        },
        {
          key: "edit-passenger",
          label: `${ptBR.actions.edit} ${ptBR.entities.passenger}`,
        },
      ];
    }

    if (
      tId &&
      pId &&
      pathname.startsWith(
        `/schools/${sidPath}/trips/${tId}/passengers/${pId}/payments`,
      )
    ) {
      const items: BreadcrumbSegment[] = [
        {
          key: "trip",
          label: tripLabel,
          to: "/schools/$schoolId/trips/$tripId/passengers",
          params: { schoolId: sidPath, tripId: tId },
        },
      ];
      return appendSchoolTripUnderPassengers(
        items,
        pathname,
        sidPath,
        tId,
        pId,
        passengerLabel,
      );
    }

    return [scopedHomeLink(sidPath), { key: "fallback", label: "\u2026" }];
  }

  if (pathname.startsWith("/trips/") && tId) {
    const sid = sidLinks;
    const tripOnly =
      pathname === `/trips/${tId}` ||
      pathname === `/trips/${tId}/` ||
      pathname === `/trips/${tId}/summary`;

    if (!sid) {
      if (tripOnly) {
        return [{ key: "trip", label: tripLabel }];
      }

      const items: BreadcrumbSegment[] = [
        {
          key: "trip",
          label: tripLabel,
          to: "/trips/$tripId/passengers",
          params: { tripId: tId },
        },
      ];
      return appendTripUnderPassengers(
        items,
        pathname,
        tId,
        pId,
        passengerLabel,
      );
    }

    const items: BreadcrumbSegment[] = [];

    if (tripOnly) {
      items.push({ key: "trip", label: tripLabel });
      return items;
    }

    items.push({
      key: "trip",
      label: tripLabel,
      to: "/trips/$tripId/passengers",
      params: { tripId: tId },
    });
    return appendTripUnderPassengers(items, pathname, tId, pId, passengerLabel);
  }

  return [
    {
      key: "home",
      label: ptBR.nav.home,
      to: "/",
    },
  ];
}
