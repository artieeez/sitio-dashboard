/**
 * Derives list–detail selection key from the current path under `/trips/$tripId/*`
 * or `/schools/$schoolId/trips/$tripId/*` (004 M3).
 */
function selectionKeyFromPassengersRest(rest: string): string {
  if (rest === "" || rest === "/") {
    return "trip";
  }
  if (rest === "/passengers/new" || rest.startsWith("/passengers/new/")) {
    return "passengers-new";
  }
  if (rest.startsWith("/passengers")) {
    const match = rest.match(/^\/passengers\/([0-9a-f-]{36})\/payments/);
    if (match) {
      return `passenger:${match[1]}`;
    }
    return "passengers";
  }
  return "trip";
}

export function tripWorkspaceSelectionKey(
  pathname: string,
  tripId: string,
): string | null {
  if (!tripId) return null;

  const prefix = `/trips/${tripId}`;
  if (pathname.startsWith(prefix)) {
    if (
      pathname === `${prefix}/summary` ||
      pathname === prefix ||
      pathname === `${prefix}/`
    ) {
      return "trip";
    }
    if (pathname === `${prefix}/passengers/new`) return "passengers-new";
    if (
      pathname === `${prefix}/passengers` ||
      pathname === `${prefix}/passengers/`
    ) {
      return "passengers";
    }
    const tripRest = pathname.slice(prefix.length);
    const tripMatch = tripRest.match(
      /^\/passengers\/([0-9a-f-]{36})\/payments/,
    );
    if (tripMatch) return `passenger:${tripMatch[1]}`;
    if (tripRest.startsWith("/passengers")) return "passengers";
  }

  const schoolScoped = pathname.match(
    /^\/schools\/[^/]+\/trips\/([^/]+)(\/.*)?$/,
  );
  if (schoolScoped?.[1] === tripId) {
    const rest = schoolScoped[2] ?? "";
    return selectionKeyFromPassengersRest(rest);
  }

  return "trip";
}

export function navigateFromTripWorkspaceKey(opts: {
  navigate: (opts: {
    to: string;
    params?: Record<string, string>;
  }) => void | Promise<void>;
  tripId: string;
  key: string | null;
  /**
   * When set (school trips list–detail shell), use `/schools/.../trips/...` URLs.
   * Omit under `/trips/$tripId/*` so bookmarks and deep links stay on trip workspace.
   */
  scopedSchoolId?: string | null;
  /** Under `/trips/*`, used when `key === null` to return to this school's trips hub. */
  tripSchoolIdForClose?: string | null;
}): void {
  const { navigate, tripId, key, scopedSchoolId, tripSchoolIdForClose } = opts;
  const useSchool = Boolean(scopedSchoolId);

  if (key == null) {
    const closeSchool = scopedSchoolId ?? tripSchoolIdForClose;
    if (closeSchool) {
      void navigate({
        to: "/schools/$schoolId/trips",
        params: { schoolId: closeSchool },
      });
    } else {
      void navigate({ to: "/schools" });
    }
    return;
  }
  if (key === "trip") {
    if (useSchool) {
      void navigate({
        to: "/schools/$schoolId/trips/$tripId",
        params: { schoolId: scopedSchoolId as string, tripId },
      });
    } else {
      void navigate({ to: "/trips/$tripId/summary", params: { tripId } });
    }
    return;
  }
  if (key === "passengers") {
    if (useSchool) {
      void navigate({
        to: "/schools/$schoolId/trips/$tripId/passengers",
        params: { schoolId: scopedSchoolId as string, tripId },
      });
    } else {
      void navigate({ to: "/trips/$tripId/passengers", params: { tripId } });
    }
    return;
  }
  if (key === "passengers-new") {
    if (useSchool) {
      void navigate({
        to: "/schools/$schoolId/trips/$tripId/passengers/new",
        params: { schoolId: scopedSchoolId as string, tripId },
      });
    } else {
      void navigate({
        to: "/trips/$tripId/passengers/new",
        params: { tripId },
      });
    }
    return;
  }
  if (key.startsWith("passenger:")) {
    const passengerId = key.slice("passenger:".length);
    if (useSchool) {
      void navigate({
        to: "/schools/$schoolId/trips/$tripId/passengers/$passengerId/payments",
        params: {
          schoolId: scopedSchoolId as string,
          tripId,
          passengerId,
        },
      });
    } else {
      void navigate({
        to: "/trips/$tripId/passengers/$passengerId/payments",
        params: { tripId, passengerId },
      });
    }
  }
}
