import MoleculeLoader from './utils/MoleculeLoader.js';
import MoleculeRepository from './utils/MoleculeRepository.js';
import { DEFAULT_MOLECULE_CODES } from './utils/constants.js';
import BoundLigandTable from './components/BoundLigandTable.js';
import FragmentLibrary from './components/FragmentLibrary.js';
import LigandModal from './modal/LigandModal.js';
import MoleculeCard from './components/MoleculeCard.js';
import PdbDetailsModal from './modal/PdbDetailsModal.js';
import AddMoleculeModal from './modal/AddMoleculeModal.js';
import ProteinBrowser from './components/ProteinBrowser.js';
import ComparisonModal from './modal/ComparisonModal.js';

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
        this.comparisonModal = null;
        this.compareQueue = [];
    }

    init() {
        this.grid = document.getElementById('molecule-grid');
        this.loadingIndicator = document.querySelector('.loading-indicator');

        this.cardUI = new MoleculeCard(this.grid, this.repository, {
            onDelete: code => this.confirmDelete(code),
            onShowDetails: (code, data, format) => this.showMoleculeDetails(code, data, format),
            onCompare: code => this.queueComparison(code)
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
        this.comparisonModal = new ComparisonModal();

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

        const exportModal = document.getElementById('export-modal');
        const exportFilenameInput = document.getElementById('export-filename');
        const exportRemoveH = document.getElementById('export-remove-h-toggle');
        const closeExport = () => (exportModal.style.display = 'none');

        document.getElementById('export-btn').addEventListener('click', () => {
            if (exportModal) {
                exportFilenameInput.value = 'molecules';
                exportRemoveH.checked = false;
                exportModal.style.display = 'block';
            }
        });
        document.getElementById('cancel-export-btn').addEventListener('click', closeExport);
        document.getElementById('close-export-modal').addEventListener('click', closeExport);
        document.getElementById('confirm-export-btn').addEventListener('click', () => {
            const sdf = this.repository.exportToSdf({ removeHydrogens: exportRemoveH.checked });
            if (!sdf) {
                showNotification('No SDF data to export', 'info');
                return;
            }
            let filename = exportFilenameInput.value.trim() || 'molecules';
            if (!filename.toLowerCase().endsWith('.sdf')) {
                filename += '.sdf';
            }
            const blob = new Blob([sdf], { type: 'chemical/x-mdl-sdfile' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            closeExport();
        });

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

    queueComparison(code) {
        if (this.compareQueue.includes(code)) return;
        this.compareQueue.push(code);
        if (this.compareQueue.length === 2) {
            const [c1, c2] = this.compareQueue;
            const mol1 = this.getMolecule(c1);
            const mol2 = this.getMolecule(c2);
            if (mol1 && mol2 && this.comparisonModal) {
                if (mol1.sdf && mol2.sdf) {
                    this.comparisonModal.show(mol1, mol2);
                } else if (typeof showNotification === 'function') {
                    showNotification('Both molecules must be loaded before comparison', 'error');
                }
            }
            this.compareQueue = [];
        } else if (typeof showNotification === 'function') {
            showNotification('Select another molecule to compare', 'info');
        }
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
