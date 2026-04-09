/**
 * Derives list–detail selection key from the current path under `/trips/$tripId/*` (004 M3).
 */
export function tripWorkspaceSelectionKey(
  pathname: string,
  tripId: string,
): string | null {
  if (!tripId) return null;
  const prefix = `/trips/${tripId}`;
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
  const rest = pathname.slice(prefix.length);
  const match = rest.match(/^\/passengers\/([0-9a-f-]{36})\/payments/);
  if (match) return `passenger:${match[1]}`;
  if (rest.startsWith("/passengers")) return "passengers";
  return "trip";
}

export function navigateFromTripWorkspaceKey(opts: {
  navigate: (opts: {
    to: string;
    params?: Record<string, string>;
  }) => void | Promise<void>;
  tripId: string;
  key: string | null;
  /** When leaving the trip workspace (close / deselect), return to this school's trips list. */
  schoolId?: string | null;
}): void {
  const { navigate, tripId, key, schoolId } = opts;
  if (key == null) {
    if (schoolId) {
      void navigate({
        to: "/schools/$schoolId/trips",
        params: { schoolId },
      });
    } else {
      void navigate({ to: "/schools" });
    }
    return;
  }
  if (key === "trip") {
    void navigate({ to: "/trips/$tripId/summary", params: { tripId } });
    return;
  }
  if (key === "passengers") {
    void navigate({ to: "/trips/$tripId/passengers", params: { tripId } });
    return;
  }
  if (key === "passengers-new") {
    void navigate({ to: "/trips/$tripId/passengers/new", params: { tripId } });
    return;
  }
  if (key.startsWith("passenger:")) {
    const passengerId = key.slice("passenger:".length);
    void navigate({
      to: "/trips/$tripId/passengers/$passengerId/payments",
      params: { tripId, passengerId },
    });
  }
}
