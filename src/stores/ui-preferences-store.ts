import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiPreferencesState = {
  includeInactiveSchools: boolean;
  includeInactiveTrips: boolean;
  includeRemovedPassengers: boolean;
  setIncludeInactiveSchools: (value: boolean) => void;
  setIncludeInactiveTrips: (value: boolean) => void;
  setIncludeRemovedPassengers: (value: boolean) => void;
};

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      includeInactiveSchools: false,
      includeInactiveTrips: false,
      includeRemovedPassengers: false,
      setIncludeInactiveSchools: (includeInactiveSchools) =>
        set({ includeInactiveSchools }),
      setIncludeInactiveTrips: (includeInactiveTrips) =>
        set({ includeInactiveTrips }),
      setIncludeRemovedPassengers: (includeRemovedPassengers) =>
        set({ includeRemovedPassengers }),
    }),
    { name: "sitio-ui-preferences" },
  ),
);
