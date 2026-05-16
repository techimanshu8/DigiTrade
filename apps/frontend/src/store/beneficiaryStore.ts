import { create } from 'zustand';

interface BeneficiaryState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
}

export const useBeneficiaryStore = create<BeneficiaryState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedType: null,
  setSelectedType: (type) => set({ selectedType: type }),
}));
