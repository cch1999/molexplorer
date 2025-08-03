import LigandDetails from './LigandDetails.js';
import SimilarLigandTable from './SimilarLigandTable.js';
import PdbEntryList from './PdbEntryList.js';
import PropertyCalculator from '../utils/propertyCalculator.js';
import StructureViewer from '../components/StructureViewer.js';

class LigandModal {
    constructor(moleculeManager, ViewerClass = StructureViewer) {
        this.details = new LigandDetails(moleculeManager);
        this.similarLigandTable = new SimilarLigandTable(moleculeManager);
        this.pdbEntryList = new PdbEntryList(moleculeManager);
        this.propertiesContainer = document.getElementById('ligand-properties');

        this.viewer = new ViewerClass(document.getElementById('details-viewer-container'));
        const rot = document.getElementById('ligand-rotate-btn');
        if (rot) rot.addEventListener('click', () => this.viewer.toggleRotate());
        const zoom = document.getElementById('ligand-zoom-btn');
        if (zoom) zoom.addEventListener('click', () => this.viewer.zoom());
        const reset = document.getElementById('ligand-reset-btn');
        if (reset) reset.addEventListener('click', () => this.viewer.reset());
    }

    show(ccdCode, sdfData) {
        this.details.show(ccdCode, sdfData);
        this.similarLigandTable.load(ccdCode);
        this.pdbEntryList.load(ccdCode);
        this.viewer.loadSDF(sdfData);

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

