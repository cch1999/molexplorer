class MoleculeRepository {
    constructor(initial = []) {
        this.molecules = initial.map(m => ({ ...m, id: this.generateId(m) }));
    }

    generateId(data) {
        if (typeof data === 'string') return data;
        const { code, pdbId, authSeqId, labelAsymId } = data;
        if (pdbId && authSeqId && labelAsymId) {
            return `${pdbId}_${labelAsymId}_${authSeqId}_${code}`;
        }
        return code;
    }

    addMolecule(data) {
        const id = this.generateId(data);
        if (this.molecules.find(m => m.id === id)) {
            return false;
        }
        const molecule = {
            code: typeof data === 'string' ? data : data.code,
            status: 'pending',
            id,
        };
        if (data && typeof data === 'object') {
            Object.assign(molecule, data);
        }
        this.molecules.push(molecule);
        return true;
    }

    removeMolecule(identifier) {
        const index = this.molecules.findIndex(
            m => m.id === identifier || m.code === identifier
        );
        if (index === -1) return false;
        this.molecules.splice(index, 1);
        return true;
    }

    deleteAllMolecules() {
        this.molecules = [];
    }

    getMolecule(identifier) {
        return this.molecules.find(
            m => m.id === identifier || m.code === identifier
        );
    }

    updateMoleculeStatus(identifier, status) {
        const molecule = this.getMolecule(identifier);
        if (molecule) {
            molecule.status = status;
        }
    }

    getAllMolecules() {
        return [...this.molecules];
    }

    clearAll() {
        this.molecules = [];
    }

    removeHydrogensFromSdf(sdf) {
        const lines = sdf.split(/\r?\n/);
        if (lines.length < 4) return sdf;

        const counts = lines[3];
        const atomCount = parseInt(counts.slice(0, 3));
        const bondCount = parseInt(counts.slice(3, 6));
        const atomLines = lines.slice(4, 4 + atomCount);
        const bondLines = lines.slice(4 + atomCount, 4 + atomCount + bondCount);
        const otherLines = lines.slice(4 + atomCount + bondCount);

        const keptIndices = [];
        const newAtomLines = [];

        atomLines.forEach((line, idx) => {
            const element = line.slice(31, 34).trim();
            if (element !== 'H') {
                keptIndices.push(idx + 1); // original 1-indexed
                newAtomLines.push(line);
            }
        });

        const indexMap = new Map();
        keptIndices.forEach((oldIdx, newIdx) => {
            indexMap.set(oldIdx, newIdx + 1); // map old -> new
        });

        const newBondLines = [];
        bondLines.forEach(line => {
            const a1 = parseInt(line.slice(0, 3));
            const a2 = parseInt(line.slice(3, 6));
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

    exportToSdf(options = {}) {
        const { removeHydrogens = false } = options;
        return this.molecules
            .filter(m => m.sdf)
            .map(m => {
                let sdf = removeHydrogens
                    ? this.removeHydrogensFromSdf(m.sdf)
                    : m.sdf;
                sdf = sdf.trimEnd();
                if (!sdf.endsWith('$$$$')) {
                    sdf += '\n$$$$';
                }
                return sdf;
            })
            .join('\n');
    }
}

export default MoleculeRepository;
