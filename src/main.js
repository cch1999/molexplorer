import MoleculeLoader from './utils/MoleculeLoader.js';
import MoleculeRepository from './utils/MoleculeRepository.js';
import { DEFAULT_MOLECULE_CODES } from './utils/constants.js';
import BoundLigandTable from './components/BoundLigandTable.js';
import FragmentLibrary from './components/FragmentLibrary.js';
import LigandModal from './modal/ligandModal.js';
import MoleculeCard from './components/MoleculeCard.js';
import PdbDetailsModal from './modal/PdbDetailsModal.js';
import AddMoleculeModal from './modal/AddMoleculeModal.js';
import ProteinBrowser from './components/ProteinBrowser.js';

class MoleculeManager {
    constructor() {
        this.repository = new MoleculeRepository(
            DEFAULT_MOLECULE_CODES.map(code => ({ code, status: 'pending' }))
        );
        this.grid = null;
        this.loadingIndicator = null;
        this.cardUI = null;
        this.loader = null;
        this.ligandModal = null;
        this.boundLigandTable = null;
        this.pdbDetailsModal = null;
        this.addModal = null;
    }

    init() {
        this.grid = document.getElementById('molecule-grid');
        this.loadingIndicator = document.querySelector('.loading-indicator');

        this.cardUI = new MoleculeCard(this.grid, this.repository, {
            onDelete: code => this.confirmDelete(code),
            onShowDetails: (code, data, format) => this.showMoleculeDetails(code, data, format)
        });

        this.loader = new MoleculeLoader(this.repository, this.cardUI);
        this.ligandModal = new LigandModal(this);
        this.boundLigandTable = new BoundLigandTable(
            molecule => this.addMolecule(molecule),
            code => this.showMoleculeDetails(code),
            this.ligandModal
        );
        this.pdbDetailsModal = new PdbDetailsModal(this.boundLigandTable);
        this.addModal = new AddMoleculeModal(this);

        document.getElementById('add-molecule-btn').addEventListener('click', () => {
            if (this.addModal) {
                this.addModal.open();
            }
        });

        document.getElementById('delete-all-btn').addEventListener('click', () => {
            if (confirm('Delete all molecules?')) {
                this.deleteAllMolecules();
            }
        });

        const searchInput = document.getElementById('molecule-search');
        if (searchInput) {
            searchInput.addEventListener('input', e => {
                if (this.cardUI) {
                    this.cardUI.filterMolecules(e.target.value);
                }
            });
        }

        // Tab switching for Molecules, Fragments, Proteins
        const tabButtons = document.querySelectorAll('.tab-button');
        const panels = [
            document.getElementById('molecule-library-content'),
            document.getElementById('fragment-library-content'),
            document.getElementById('protein-browser-content')
        ];
        tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                tabButtons.forEach((btn, i) => btn.classList.toggle('active', i === index));
                panels.forEach((panel, i) => {
                    panel.style.display = i === index ? 'block' : 'none';
                });
            });
        });

        return this;
    }

    addMolecule(molecule) {
        const added = this.repository.addMolecule(molecule);
        if (added) {
            this.loader.loadMolecule(molecule);
        }
        return added;
    }

    addPdbInstance({ code, pdbId, authSeqId, labelAsymId }) {
        return this.addMolecule({ code, pdbId, authSeqId, labelAsymId });
    }

    deleteMolecule(code) {
        if (this.repository.removeMolecule(code)) {
            const card = this.grid.querySelector(`[data-molecule-code="${code}"]`);
            if (card) card.remove();
            return true;
        }
        return false;
    }

    deleteAllMolecules() {
        this.repository.clearAll();
        if (this.cardUI) {
            this.cardUI.clearAll();
        }
        showNotification('All molecules deleted successfully!', 'info');
    }

    getMolecule(code) {
        return this.repository.getMolecule(code);
    }

    getAllMolecules() {
        return this.repository.getAllMolecules();
    }

    updateMoleculeStatus(code, status) {
        this.repository.updateMoleculeStatus(code, status);
    }

    loadAllMolecules() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }
        this.loader.loadAllMolecules().finally(() => {
            if (this.loadingIndicator) {
                this.loadingIndicator.style.display = 'none';
            }
        });
    }

    showMoleculeDetails(ccdCode, data, format) {
        if (this.ligandModal) {
            this.ligandModal.show(ccdCode, data, format);
        }
    }

    fetchRCSBDetails(pdbId) {
        if (this.pdbDetailsModal) {
            return this.pdbDetailsModal.fetchRCSBDetails(pdbId);
        }
        return Promise.resolve(null);
    }

    showPDBDetailsModal(pdbId) {
        if (this.pdbDetailsModal) {
            this.pdbDetailsModal.showPDBDetailsModal(pdbId);
        }
    }

    confirmDelete(code) {
        if (confirm(`Delete ${code}?`)) {
            this.deleteMolecule(code);
        }
    }
}

const moleculeManager = new MoleculeManager().init();
moleculeManager.loadAllMolecules();

const fragmentLibrary = new FragmentLibrary(moleculeManager, {
    notify: showNotification,
    smilesDrawer: window.SmilesDrawer
}).init();
fragmentLibrary.loadFragments();

const proteinBrowser = new ProteinBrowser(moleculeManager).init();

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1001',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease'
    });
    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else {
        notification.style.background = '#6e45e2';
    }
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

window.moleculeManager = moleculeManager;
window.fragmentLibrary = fragmentLibrary;
window.proteinBrowser = proteinBrowser;
window.showNotification = showNotification;
