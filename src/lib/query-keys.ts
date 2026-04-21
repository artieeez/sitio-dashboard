export const queryKeys = {
  scopeSchools: () => ["scope-schools"] as const,
  schools: (includeInactive: boolean) =>
    ["schools", { includeInactive }] as const,
  school: (id: string) => ["school", id] as const,
  schoolDeactivateEligibility: (schoolId: string) =>
    ["school-deactivate-eligibility", schoolId] as const,
  trips: (schoolId: string, includeInactive: boolean) =>
    ["trips", schoolId, { includeInactive }] as const,
  trip: (id: string) => ["trip", id] as const,
  passenger: (id: string) => ["passenger", id] as const,
  passengers: (tripId: string, includeRemoved: boolean) =>
    ["passengers", tripId, { includeRemoved }] as const,
  payments: (passengerId: string) => ["payments", passengerId] as const,
  /** Prefix with `tripId` invalidates all `includeRemoved` variants. */
  passengerAggregates: (tripId: string, includeRemoved: boolean) =>
    ["passengerAggregates", tripId, { includeRemoved }] as const,
  /** Tenant-wide Wix keys (public key full; private key first 10 chars only in API). */
  wixIntegration: () => ["wix-integration"] as const,
  /** Single Wix Stores collection summary (`GET .../integrations/wix/collections/:id`). */
  wixCollection: (collectionId: string) =>
    ["wix-collection", collectionId] as const,
};
