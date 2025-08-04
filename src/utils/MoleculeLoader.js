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
            typeof input === 'string' ? { code: input } : input;
        const identifier = id || code;
        try {
            this.repository.updateMoleculeStatus(identifier, 'loading');
            let sdfData;
            if (pdbId && authSeqId && labelAsymId) {
                // For PDB instances always fetch experimental coordinates
                const url = ApiService.getInstanceSdf(
                    pdbId,
                    authSeqId,
                    labelAsymId,
                    code
                );
                sdfData = await ApiService.fetchText(url);
            } else {
                const smilesData = await this.findMoleculeInLocalTsv(code);
                if (smilesData) {
                    this.repository.updateMoleculeStatus(identifier, 'loaded');
                    this.cardUI.createMoleculeCardFromSmiles(
                        smilesData,
                        code,
                        identifier
                    );
                    return;
                }
                sdfData = await ApiService.getCcdSdf(code);
            }
            if (
                !sdfData ||
                sdfData.trim() === '' ||
                sdfData.toLowerCase().includes('<html') ||
                !MoleculeLoader.#isValidSdf(sdfData)
            ) {
                throw new Error('Received empty or invalid SDF data.');
            }
            this.repository.updateMoleculeStatus(identifier, 'loaded');
            const molecule = this.repository.getMolecule(identifier);
            if (molecule) {
                molecule.sdf = sdfData;
            }
            const instanceInfo = pdbId && authSeqId && labelAsymId
                ? { pdbId, authSeqId, labelAsymId }
                : null;
            this.cardUI.createMoleculeCard(sdfData, code, 'sdf', identifier, instanceInfo);
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

    static #isValidSdf(sdf) {
        const lines = sdf.split('\n');
        if (lines.length < 4) {
            return false;
        }
        const countsLine = lines[3];
        const countsMatch = /^\s*\d+\s+\d+\s+\d+\s+\d+/.test(countsLine);
        return countsMatch && sdf.includes('M  END');
    }
}

export default MoleculeLoader;
