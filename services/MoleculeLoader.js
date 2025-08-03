import ApiService from '../apiService.js';

class MoleculeLoader {
    constructor(repository, cardUI) {
        this.repository = repository;
        this.cardUI = cardUI;
    }

    async loadAllMolecules() {
        for (const molecule of this.repository.getAllMolecules()) {
            if (molecule.status === 'pending') {
                await this.loadMolecule(molecule.code);
            }
        }
    }

    async loadMolecule(code) {
        try {
            this.repository.updateMoleculeStatus(code, 'loading');
            const localSdfData = await this.findMoleculeInLocalSdf(code);
            if (localSdfData) {
                this.repository.updateMoleculeStatus(code, 'loaded');
                this.cardUI.createMoleculeCard(localSdfData, code, 'sdf');
                return;
            }
            const smilesData = await this.findMoleculeInLocalTsv(code);
            if (smilesData) {
                this.repository.updateMoleculeStatus(code, 'loaded');
                this.cardUI.createMoleculeCardFromSmiles(smilesData, code);
                return;
            }
            const sdfData = await ApiService.getCcdSdf(code);
            if (!sdfData || sdfData.trim() === '' || sdfData.toLowerCase().includes('<html')) {
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

    async findMoleculeInLocalSdf(code) {
        try {
            const sdfContent = await ApiService.getLocalSdfLibrary();
            const molecules = sdfContent.split('$$$$');
            for (const molecule of molecules) {
                if (molecule.includes(`<Catalog ID>\n${code}`) ||
                    molecule.includes(`<ID>\n${code}`) ||
                    molecule.includes(`>${code}<`)) {
                    return molecule + '$$$$';
                }
            }
            return null;
        } catch (error) {
            console.error('Error searching local SDF:', error);
            return null;
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
