import LigandDetails from './LigandDetails.js';
import SimilarLigandTable from './SimilarLigandTable.js';
import PdbEntryList from './PdbEntryList.js';
import SimilarityGraph from '../components/SimilarityGraph.js';

class LigandModal {
    constructor(moleculeManager) {
        this.details = new LigandDetails(moleculeManager);
        this.similarLigandTable = new SimilarLigandTable(moleculeManager);
        this.pdbEntryList = new PdbEntryList(moleculeManager);
        this.graph = null;
        this.currentCcd = null;
        this.viewGraphBtn = document.getElementById('view-similar-graph-btn');
        if (this.viewGraphBtn) {
            this.viewGraphBtn.addEventListener('click', () => {
                if (!this.graph) {
                    this.graph = new SimilarityGraph(moleculeManager);
                }
                if (this.currentCcd) {
                    this.graph.open(this.currentCcd);
                }
            });
        }
    }

    show(ccdCode, sdfData) {
        this.currentCcd = ccdCode;
        this.details.show(ccdCode, sdfData);
        this.similarLigandTable.load(ccdCode);
        this.pdbEntryList.load(ccdCode);
        if (this.viewGraphBtn) {
            this.viewGraphBtn.style.display = 'inline-block';
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

