class MoleculeRepository {
    constructor(initial = []) {
        this.molecules = [...initial];
    }

    addMolecule(data) {
        const code = typeof data === 'string' ? data : data.code;
        if (this.molecules.find(m => m.code === code)) {
            return false;
        }
        const molecule = { code, status: 'pending' };
        if (data && typeof data === 'object') {
            Object.assign(molecule, data);
        }
        this.molecules.push(molecule);
        return true;
    }

    removeMolecule(code) {
        const index = this.molecules.findIndex(m => m.code === code);
        if (index === -1) return false;
        this.molecules.splice(index, 1);
        return true;
    }

    deleteAllMolecules() {
        this.molecules = [];
    }

    getMolecule(code) {
        return this.molecules.find(m => m.code === code);
    }

    updateMoleculeStatus(code, status) {
        const molecule = this.getMolecule(code);
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
}

export default MoleculeRepository;
