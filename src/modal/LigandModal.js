import LigandDetails from './LigandDetails.js';
import SimilarLigandTable from './SimilarLigandTable.js';
import PdbEntryList from './PdbEntryList.js';
import PropertyCalculator from '../utils/propertyCalculator.js';
import ApiService from '../utils/apiService.js';

class LigandModal {
    constructor(moleculeManager) {
        this.details = new LigandDetails(moleculeManager);
        this.similarLigandTable = new SimilarLigandTable(moleculeManager);
        this.pdbEntryList = new PdbEntryList(moleculeManager);
        this.propertiesContainer = document.getElementById('ligand-properties');
    }

    show(ccdCode, sdfData) {
        this.details.show(ccdCode, sdfData);
        this.similarLigandTable.load(ccdCode);
        this.pdbEntryList.load(ccdCode);

        if (this.propertiesContainer) {
            this.propertiesContainer.textContent = 'Loading properties...';
            Promise.all([
                PropertyCalculator.getProperties(ccdCode).catch(() => null),
                ApiService.getPubChemMetadata(ccdCode).catch(() => null)
            ])
                .then(([calcProps, meta]) => {
                    if (!calcProps && !meta) {
                        this.propertiesContainer.textContent = 'Properties unavailable';
                        return;
                    }
                    let html = '';
                    const weight = meta?.properties?.MolecularWeight ?? calcProps?.molecularWeight;
                    const formula = meta?.properties?.MolecularFormula ?? calcProps?.formula;
                    if (weight || formula) {
                        html += `<div>Molecular Weight: ${weight ?? 'N/A'}</div>`;
                        html += `<div>Formula: ${formula ?? 'N/A'}</div>`;
                    }
                    if (meta?.properties?.IUPACName) {
                        html += `<div>IUPAC Name: ${meta.properties.IUPACName}</div>`;
                    }
                    if (meta?.synonyms && meta.synonyms.length) {
                        html += `<div>Synonyms: ${meta.synonyms.slice(0,5).join(', ')}</div>`;
                    }
                    if (meta?.link) {
                        html += `<div><a href="${meta.link}" target="_blank">PubChem Entry</a></div>`;
                    }
                    this.propertiesContainer.innerHTML = html;
                })
                .catch(() => {
                    this.propertiesContainer.textContent = 'Properties unavailable';
                });
        }
    }

    close() {
        this.details.close();
    }

    load2DStructure(ccdCode, container) {
        return this.similarLigandTable.load2DStructure(ccdCode, container);
    }
}

export default LigandModal;

