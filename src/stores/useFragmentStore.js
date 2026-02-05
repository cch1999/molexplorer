import { create } from 'zustand';

export const useFragmentStore = create((set) => ({
  customFragments: [],
  addCustomFragment: (fragment) =>
    set((state) => ({
      customFragments: [
        {
          id: `custom-${Date.now()}`,
          name: fragment.name,
          kind: fragment.kind || 'SMILES',
          query: fragment.query,
          description: fragment.description || '',
          comment: 'Custom fragment',
          url: '',
          source: fragment.source || 'custom',
          ccd: '',
          in_ccd: false,
        },
        ...state.customFragments,
      ],
    })),
}));
