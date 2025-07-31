// Molecule Manager Class
class MoleculeManager {
    constructor() {
        this.molecules = [
            { code: 'HEM', status: 'pending' },
            { code: 'NAD', status: 'pending' },
            { code: 'FAD', status: 'pending' },
            { code: 'COA', status: 'pending' },
            { code: 'ATP', status: 'pending' },
            { code: 'ADP', status: 'pending' },
            { code: '355', status: 'pending' },
            { code: 'GPY', status: 'pending' },
            { code: 'YQD', status: 'pending' }
        ];
        this.grid = null;
        this.loadingIndicator = null;
    }

    // Initialize the manager with DOM elements
    init() {
        this.grid = document.getElementById('molecule-grid');
        this.loadingIndicator = document.querySelector('.loading-indicator');
        return this;
    }

    // Add a new molecule to the list
    addMolecule(code) {
        // Check if molecule already exists
        if (this.molecules.find(mol => mol.code === code)) {
            console.warn(`Molecule ${code} already exists`);
            return false;
        }

        this.molecules.push({ code: code, status: 'pending' });
        this.loadMolecule(code);
        return true;
    }

    // Remove a molecule from the list and DOM
    removeMolecule(code) {
        const index = this.molecules.findIndex(mol => mol.code === code);
        if (index === -1) {
            console.warn(`Molecule ${code} not found`);
            return false;
        }

        // Remove from array
        this.molecules.splice(index, 1);

        // Remove from DOM
        const card = document.querySelector(`[data-molecule-code="${code}"]`);
        if (card) {
            card.remove();
        }

        return true;
    }

    // Get molecule by code
    getMolecule(code) {
        return this.molecules.find(mol => mol.code === code);
    }

    // Update molecule status
    updateMoleculeStatus(code, status) {
        const molecule = this.getMolecule(code);
        if (molecule) {
            molecule.status = status;
        }
    }

    // Get all molecules
    getAllMolecules() {
        return [...this.molecules];
    }

    // Load all pending molecules
    async loadAllMolecules() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }

        for (const molecule of this.molecules) {
            if (molecule.status === 'pending') {
                await this.loadMolecule(molecule.code);
            }
        }

        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    // Load a single molecule
    async loadMolecule(code) {
        try {
            this.updateMoleculeStatus(code, 'loading');
            const response = await fetch(`https://files.rcsb.org/ligands/view/${code}_ideal.sdf`);

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Ligand ${code} not found.`);
                    this.updateMoleculeStatus(code, 'not_found');
                    this.createNotFoundCard(code);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const sdfData = await response.text();
            this.updateMoleculeStatus(code, 'loaded');
            this.createMoleculeCard(sdfData, code);
        } catch (error) {
            console.error(`Could not fetch or process data for ${code}:`, error);
            this.updateMoleculeStatus(code, 'error');
            this.createNotFoundCard(code, "Failed to load");
        }
    }

    // Create molecule card
    createMoleculeCard(sdfData, ligandCode) {
        const card = document.createElement('div');
        card.className = 'molecule-card';
        card.draggable = true;
        card.setAttribute('data-molecule-code', ligandCode);

        // Add drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '⋯';
        card.appendChild(dragHandle);

        const title = document.createElement('h3');
        title.textContent = ligandCode;
        card.appendChild(title);

        const viewerContainer = document.createElement('div');
        viewerContainer.id = `viewer-${ligandCode}`;
        viewerContainer.className = 'viewer-container';
        card.appendChild(viewerContainer);

        // Add drag event listeners
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);

        this.grid.appendChild(card);

        // Wait a bit for the DOM to be ready
        setTimeout(() => {
            try {
                const viewer = $3Dmol.createViewer(viewerContainer, {
                    backgroundColor: 'white'
                });
                viewer.addModel(sdfData, 'sdf');
                viewer.setStyle({}, { stick: {} });
                viewer.setStyle({ elem: 'H' }, {}); // Hide hydrogen atoms
                viewer.zoomTo();
                viewer.render();
            } catch (e) {
                console.error(`Error initializing 3Dmol viewer for ${ligandCode}:`, e);
                viewerContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Render Error</p>';
            }
        }, 100);
    }

    // Create not found card
    createNotFoundCard(ligandCode, message = "Not found") {
        const card = document.createElement('div');
        card.className = 'molecule-card';
        card.draggable = true;
        card.setAttribute('data-molecule-code', ligandCode);

        // Add drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '⋯';
        card.appendChild(dragHandle);

        const content = document.createElement('div');
        content.innerHTML = `<h3>${ligandCode}</h3><p>${message}</p>`;
        card.appendChild(content);

        // Add drag event listeners
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);

        this.grid.appendChild(card);
    }

    // Clear all molecules
    clearAll() {
        this.molecules = [];
        if (this.grid) {
            this.grid.innerHTML = '<div class="loading-indicator">Loading molecules...</div>';
            this.loadingIndicator = this.grid.querySelector('.loading-indicator');
        }
    }

    // Reload all molecules
    async reloadAll() {
        this.clearAll();
        await this.loadAllMolecules();
    }
}

// Global molecule manager instance
const moleculeManager = new MoleculeManager();

// Initialize when page loads
window.onload = async () => {
    moleculeManager.init();
    await moleculeManager.loadAllMolecules();
};

// Legacy functions for backward compatibility (now just wrappers)
async function fetchMoleculeData(ligandCode, grid) {
    await moleculeManager.loadMolecule(ligandCode);
}

function createMoleculeCard(sdfData, ligandCode, grid) {
    moleculeManager.createMoleculeCard(sdfData, ligandCode);
}

function createNotFoundCard(ligandCode, grid, message = "Not found") {
    moleculeManager.createNotFoundCard(ligandCode, message);
}

// Drag and drop functionality
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== this) {
        const grid = document.getElementById('molecule-grid');
        const allCards = Array.from(grid.querySelectorAll('.molecule-card'));
        const draggedIndex = allCards.indexOf(draggedElement);
        const targetIndex = allCards.indexOf(this);

        if (draggedIndex < targetIndex) {
            this.parentNode.insertBefore(draggedElement, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedElement, this);
        }

        // Update the internal molecule order to match the DOM order
        const draggedCode = draggedElement.getAttribute('data-molecule-code');
        const targetCode = this.getAttribute('data-molecule-code');

        const molecules = moleculeManager.getAllMolecules();
        const draggedMol = molecules.find(mol => mol.code === draggedCode);
        const targetMol = molecules.find(mol => mol.code === targetCode);

        if (draggedMol && targetMol) {
            const draggedIdx = molecules.indexOf(draggedMol);
            const targetIdx = molecules.indexOf(targetMol);

            // Remove and reinsert to maintain order
            molecules.splice(draggedIdx, 1);
            molecules.splice(targetIdx, 0, draggedMol);
        }
    }

    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedElement = null;
}

// Expose moleculeManager globally for console access and future UI integration
window.moleculeManager = moleculeManager; 