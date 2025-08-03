import rcsbService from './api/rcsbService.js';
import fragmentService from './api/fragmentService.js';

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
        const { code, pdbId, authSeqId, labelAsymId } =
            typeof input === 'string' ? { code: input } : input;
        try {
            this.repository.updateMoleculeStatus(code, 'loading');
            const smilesData = await this.findMoleculeInLocalTsv(code);
            if (smilesData) {
                this.repository.updateMoleculeStatus(code, 'loaded');
                this.cardUI.createMoleculeCardFromSmiles(smilesData, code);
                return;
            }
            let sdfData;
            if (pdbId && authSeqId && labelAsymId) {
                sdfData = await rcsbService.getInstanceSdf(pdbId, authSeqId, labelAsymId);
            } else {
                sdfData = await rcsbService.getCcdSdf(code);
            }
            if (!sdfData || sdfData.trim() === '' || sdfData.toLowerCase().includes('<html')) {
                throw new Error('Received empty or invalid SDF data.');
            }
            this.repository.updateMoleculeStatus(code, 'loaded');
            const molecule = this.repository.getMolecule(code);
            if (molecule) {
                molecule.sdf = sdfData;
            }
            this.cardUI.createMoleculeCard(sdfData, code, 'sdf');
        } catch (error) {
            console.error(`Could not fetch or process data for ${code}:`, error);
            this.repository.updateMoleculeStatus(code, 'error');
            this.cardUI.createNotFoundCard(code, `Failed to load: ${error.message}`);
        }
    }

    async findMoleculeInLocalTsv(code) {
        try {
            const tsvContent = await fragmentService.getFragmentLibraryTsv();
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
