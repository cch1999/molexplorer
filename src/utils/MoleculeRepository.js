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

    exportToSdf() {
        return this.molecules
            .filter(m => m.sdf)
            .map(m => {
                let sdf = m.sdf.trimEnd();
                if (!sdf.endsWith('$$$$')) {
                    sdf += '\n$$$$';
                }
                return sdf;
            })
            .join('\n');
    }
}

export default MoleculeRepository;
