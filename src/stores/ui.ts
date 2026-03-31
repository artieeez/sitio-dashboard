import { create } from 'zustand';

type UiState = {
  selectedSchoolId: string | null;
  selectedTripId: string | null;
  setSelectedSchool: (id: string | null) => void;
  setSelectedTrip: (id: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  selectedSchoolId: null,
  selectedTripId: null,
  setSelectedSchool: (id) => set({ selectedSchoolId: id }),
  setSelectedTrip: (id) => set({ selectedTripId: id }),
}));
