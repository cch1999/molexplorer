import LigandDetails from './LigandDetails.js';
import SimilarLigandTable from './SimilarLigandTable.js';
import PdbEntryList from './PdbEntryList.js';
import PropertyCalculator from '../utils/propertyCalculator.js';
import SimilarityGraph from '../components/SimilarityGraph.js';

class LigandModal {
    constructor(moleculeManager) {
        this.details = new LigandDetails(moleculeManager);
        this.similarLigandTable = new SimilarLigandTable(moleculeManager);
        this.pdbEntryList = new PdbEntryList(moleculeManager);
        this.propertiesContainer = document.getElementById('ligand-properties');
        this.similarityGraph = new SimilarityGraph(moleculeManager);
        this.currentCode = null;

        const viewBtn = document.getElementById('view-similar-graph-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                if (this.currentCode) {
                    this.similarityGraph.open(this.currentCode);
                }
            });
        }
    }

    show(ccdCode, sdfData) {
        this.currentCode = ccdCode;
        this.details.show(ccdCode, sdfData);
        this.similarLigandTable.load(ccdCode);
        this.pdbEntryList.load(ccdCode);

        if (this.propertiesContainer) {
            this.propertiesContainer.textContent = 'Loading properties...';
            PropertyCalculator.getProperties(ccdCode)
                .then(props => {
                    if (props) {
                        const mw = props.molecularWeight ?? 'N/A';
                        const formula = props.formula ?? 'N/A';
                        this.propertiesContainer.innerHTML = `
                            <div>Molecular Weight: ${mw}</div>
                            <div>Formula: ${formula}</div>
                        `;
                    } else {
                        this.propertiesContainer.textContent = 'Properties unavailable';
                    }
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

