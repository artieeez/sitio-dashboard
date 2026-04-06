export const queryKeys = {
  schools: (includeInactive: boolean) =>
    ["schools", { includeInactive }] as const,
  school: (id: string) => ["school", id] as const,
  trips: (schoolId: string, includeInactive: boolean) =>
    ["trips", schoolId, { includeInactive }] as const,
  trip: (id: string) => ["trip", id] as const,
  passengers: (tripId: string, includeRemoved: boolean) =>
    ["passengers", tripId, { includeRemoved }] as const,
  payments: (passengerId: string) => ["payments", passengerId] as const,
};
