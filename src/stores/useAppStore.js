import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  activeTab: 'molecules',
  setActiveTab: (tab) => set({ activeTab: tab }),

  currentItem: null,
  setCurrentItem: (item) => set({ currentItem: item }),

  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  overlays: [],
  openOverlay: (id) =>
    set((state) => ({
      overlays: [...state.overlays.filter((o) => o !== id), id].slice(-3),
    })),
  closeOverlay: (id) =>
    set((state) => ({
      overlays: id ? state.overlays.filter((o) => o !== id) : state.overlays.slice(0, -1),
    })),
  isOverlayOpen: (id) => get().overlays.includes(id),

  theme: 'holographic',
  setTheme: (theme) => set({ theme }),

  disclaimerAccepted: false,
  setDisclaimerAccepted: (accepted) => set({ disclaimerAccepted: accepted }),

  compareQueue: [],
  addToCompareQueue: (code) =>
    set((state) => {
      if (state.compareQueue.includes(code)) return state;
      const next = [...state.compareQueue, code].slice(-2);
      return { compareQueue: next };
    }),
  clearCompareQueue: () => set({ compareQueue: [] }),
}));
