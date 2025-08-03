import ApiService from './apiService.js';

class MoleculeLoader {
    constructor(repository, cardUI) {
        this.repository = repository;
        this.cardUI = cardUI;
    }

    async loadAllMolecules() {
        for (const molecule of this.repository.getAllMolecules()) {
            if (molecule.status === 'pending') {
                await this.loadMolecule(molecule);
            }
        }
    }

    async loadMolecule(input) {
        const { code, pdbId, authSeqId, labelAsymId, id } =
            typeof input === 'string' ? { code: input, id: input } : input;
        const identifier = id || code;
        try {
            this.repository.updateMoleculeStatus(identifier, 'loading');
            const smilesData = await this.findMoleculeInLocalTsv(code);
            if (smilesData) {
                this.repository.updateMoleculeStatus(identifier, 'loaded');
                this.cardUI.createMoleculeCardFromSmiles(smilesData, code, identifier);
                return;
            }
            let sdfData;
            if (pdbId && authSeqId && labelAsymId) {
                sdfData = await ApiService.getInstanceSdf(pdbId, authSeqId, labelAsymId);
            } else {
                sdfData = await ApiService.getCcdSdf(code);
            }
            if (!sdfData || sdfData.trim() === '' || sdfData.toLowerCase().includes('<html')) {
                throw new Error('Received empty or invalid SDF data.');
            }
            this.repository.updateMoleculeStatus(identifier, 'loaded');
            const molecule = this.repository.getMolecule(identifier);
            if (molecule) {
                molecule.sdf = sdfData;
            }
            this.cardUI.createMoleculeCard(sdfData, code, 'sdf', identifier);
        } catch (error) {
            console.error(`Could not fetch or process data for ${code}:`, error);
            this.repository.updateMoleculeStatus(identifier, 'error');
            this.cardUI.createNotFoundCard(code, `Failed to load: ${error.message}`, identifier);
        }
    }

    async findMoleculeInLocalTsv(code) {
        try {
            const tsvContent = await ApiService.getFragmentLibraryTsv();
            const lines = tsvContent.split('\n');
            for (const line of lines) {
                const columns = line.split('\t');
                if (columns.length > 8 && columns[8] === code) {
                    return columns[3];
                }
            }
            return null;
        } catch (error) {
            console.error('Error searching fragment library TSV:', error);
            return null;
        }
    }
}

export default MoleculeLoader;
