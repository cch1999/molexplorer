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
                sdfData = await ApiService.getInstanceSdf(
                    pdbId,
                    authSeqId,
                    labelAsymId,
                    code
                );
            } else {
                sdfData = await ApiService.getCcdSdf(code);
            }
            const lower = sdfData.toLowerCase();
            const countsLine = sdfData.split('\n')[3] || '';
            const atomCount = parseInt(countsLine.slice(0, 3));
            if (
                !sdfData ||
                sdfData.trim() === '' ||
                lower.includes('<html') ||
                lower.includes('<model_server_result') ||
                !atomCount
            ) {
                throw new Error('Received empty or invalid SDF data.');
            }
            this.repository.updateMoleculeStatus(code, 'loaded');
            this.cardUI.createMoleculeCard(sdfData, code, 'sdf');
        } catch (error) {
            console.error(`Could not fetch or process data for ${code}:`, error);
            this.repository.updateMoleculeStatus(code, 'error');
            this.cardUI.createNotFoundCard(code, `Failed to load: ${error.message}`);
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
