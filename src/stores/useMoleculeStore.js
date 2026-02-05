import { create } from 'zustand';
import { DEFAULT_MOLECULE_CODES, DEFAULT_PDB_INSTANCES } from '../utils/constants.js';

function generateId(data) {
  if (typeof data === 'string') return data;
  const { code, pdbId, chainId, authorResidueNumber } = data;
  if (pdbId && chainId && authorResidueNumber) {
    return `${pdbId}_${chainId}_${authorResidueNumber}_${code}`;
  }
  return code;
}

function removeHydrogensFromSdf(sdf) {
  const lines = sdf.split(/\r?\n/);
  if (lines.length < 4) return sdf;

  const counts = lines[3];
  const atomCount = parseInt(counts.slice(0, 3), 10);
  const bondCount = parseInt(counts.slice(3, 6), 10);
  const atomLines = lines.slice(4, 4 + atomCount);
  const bondLines = lines.slice(4 + atomCount, 4 + atomCount + bondCount);
  const otherLines = lines.slice(4 + atomCount + bondCount);

  const keptIndices = [];
  const newAtomLines = [];

  atomLines.forEach((line, idx) => {
    const element = line.slice(31, 34).trim();
    if (element !== 'H') {
      keptIndices.push(idx + 1);
      newAtomLines.push(line);
    }
  });

  const indexMap = new Map();
  keptIndices.forEach((oldIdx, newIdx) => {
    indexMap.set(oldIdx, newIdx + 1);
  });

  const newBondLines = [];
  bondLines.forEach((line) => {
    const a1 = parseInt(line.slice(0, 3), 10);
    const a2 = parseInt(line.slice(3, 6), 10);
    if (indexMap.has(a1) && indexMap.has(a2)) {
      const na1 = String(indexMap.get(a1)).padStart(3, '0');
      const na2 = String(indexMap.get(a2)).padStart(3, '0');
      newBondLines.push(na1 + na2 + line.slice(6));
    }
  });

  const newCounts =
    String(newAtomLines.length).padStart(3, '0') +
    String(newBondLines.length).padStart(3, '0') +
    counts.slice(6);

  return [
    ...lines.slice(0, 3),
    newCounts,
    ...newAtomLines,
    ...newBondLines,
    ...otherLines,
  ].join('\n');
}

const initialMolecules = [
  ...DEFAULT_MOLECULE_CODES.map((code) => ({ code, status: 'pending', id: code })),
  ...DEFAULT_PDB_INSTANCES.map((inst) => ({
    ...inst,
    status: 'pending',
    id: generateId(inst),
  })),
];

export const useMoleculeStore = create((set, get) => ({
  molecules: initialMolecules,

  addMolecule: (data) => {
    const id = generateId(data);
    const molecules = get().molecules;
    if (molecules.find((m) => m.id === id)) return false;
    const molecule = {
      code: typeof data === 'string' ? data : data.code,
      status: 'pending',
      id,
    };
    if (data && typeof data === 'object') {
      Object.assign(molecule, data);
    }
    set({ molecules: [...molecules, molecule] });
    return true;
  },

  removeMolecule: (identifier) => {
    const molecules = get().molecules;
    const index = molecules.findIndex(
      (m) => m.id === identifier || m.code === identifier
    );
    if (index === -1) return false;
    set({
      molecules: molecules.filter(
        (m) => m.id !== identifier && m.code !== identifier
      ),
    });
    return true;
  },

  deleteAllMolecules: () => set({ molecules: [] }),

  getMolecule: (identifier) => {
    return get().molecules.find(
      (m) => m.id === identifier || m.code === identifier
    );
  },

  updateMoleculeStatus: (identifier, status) => {
    set((state) => ({
      molecules: state.molecules.map((m) =>
        m.id === identifier || m.code === identifier ? { ...m, status } : m
      ),
    }));
  },

  updateMolecule: (identifier, patch) => {
    set((state) => ({
      molecules: state.molecules.map((m) =>
        m.id === identifier || m.code === identifier ? { ...m, ...patch } : m
      ),
    }));
  },

  reorderMolecules: (fromIndex, toIndex) => {
    set((state) => {
      const list = [...state.molecules];
      const [removed] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, removed);
      return { molecules: list };
    });
  },

  getAllMolecules: () => [...get().molecules],

  exportToSdf: (options = {}) => {
    const { removeHydrogens = false } = options;
    return get()
      .molecules.filter((m) => m.sdf)
      .map((m) => {
        let sdf = removeHydrogens ? removeHydrogensFromSdf(m.sdf) : m.sdf;
        sdf = sdf.trimEnd();
        if (!sdf.endsWith('$$$$')) {
          sdf += '\n$$$$';
        }
        return sdf;
      })
      .join('\n');
  },
}));
