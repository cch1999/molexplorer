import { create } from 'zustand';

export const useProteinStore = create((set, get) => ({
  queryId: 'G_1002155',
  proteinDetails: [],
  allPdbIds: [],
  totalResults: 0,
  offset: 0,
  limit: 20,
  hideAids: true,
  hideIons: true,
  isLoading: false,
  error: null,

  setQueryId: (queryId) => set({ queryId }),

  setProteinResults: (proteinDetails, allPdbIds, totalResults) =>
    set({
      proteinDetails,
      allPdbIds: allPdbIds || [],
      totalResults: totalResults ?? 0,
      offset: get().limit,
      isLoading: false,
      error: null,
    }),

  appendResults: (proteinDetails, allPdbIds) =>
    set((state) => ({
      proteinDetails: [...state.proteinDetails, ...proteinDetails],
      allPdbIds: allPdbIds || state.allPdbIds,
      offset: state.offset + state.limit,
      isLoading: false,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  setHideAids: (hideAids) => set({ hideAids }),

  setHideIons: (hideIons) => set({ hideIons }),

  resetResults: () =>
    set({
      proteinDetails: [],
      allPdbIds: [],
      totalResults: 0,
      offset: 0,
      error: null,
    }),
}));
