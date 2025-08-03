import ApiService from './apiService.js';
import LigandModal from './ui/ligandModal.js';

// A list of interesting CCD codes for the "I'm Feeling Lucky" feature
const luckyDipCodes = [
    'STI', 'Imatinib (Gleevec), cancer drug',
    '1PE', 'Polyethylene glycol, common crystallizing agent',
    'AF3', 'Aspirin, painkiller',
    'VIA', 'Sildenafil (Viagra), erectile dysfunction drug',
    'CFF', 'Caffeine, stimulant',
    'N8P', 'NADP, cofactor',
    'HEM', 'Heme group, in hemoglobin',
    'FAD', 'Flavin adenine dinucleotide, cofactor',
    'COA', 'Coenzyme A, cofactor',
    'ATP', 'Adenosine triphosphate, energy currency',
    'ADP', 'Adenosine diphosphate',
    'GTP', 'Guanosine triphosphate',
    'UDP', 'Uridine diphosphate',
    'NAD', 'Nicotinamide adenine dinucleotide',
    'FMN', 'Flavin mononucleotide',
    'SAM', 'S-Adenosyl methionine',
    'GLC', 'Glucose, sugar',
    'FRU', 'Fructose, sugar',
    'GOL', 'Glycerol, solvent',
    'EDO', 'Ethylene glycol, solvent',
    'SO4', 'Sulfate ion, common buffer',
    'PO4', 'Phosphate ion, common buffer',
    'CIT', 'Citrate ion, common buffer'
];

const crystallizationAids = [
    'SO4', 'PO4', 'CIT', 'EDO', 'GOL', '1PE', // Common buffers and solvents
    'ACE', 'ACT', // Acetate
    'BME', // Beta-mercaptoethanol
    'DMS', // Dimethyl sulfoxide
    'FMT', // Formate
    'IMD', // Imidazole
    'MES', // 2-(N-morpholino)ethanesulfonic acid
    'PEG', 'PGE', // Polyethylene glycol variants
    'TRS', // Tris buffer
    'ZN', 'MG', 'CA', 'NA', 'K', 'CL' // Common ions
];

const suggestedDepositionGroups = {
    'mPro': 'G_1002155',
    'NSP13': 'G_1002164',
    'NSP15': 'G_1002165',
    'NSP16': 'G_1002166'
};

let currentBoundLigands = [];

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
            { code: 'MPV', status: 'pending' },
            { code: 'YQD', status: 'pending' },
            { code: 'J9N', status: 'pending' },
            { code: 'VIA', status: 'pending' },
        ];
        this.grid = null;
        this.loadingIndicator = null;
        this.ligandModal = new LigandModal(this);
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

    // Delete all molecules from the list and DOM
    deleteAllMolecules() {
        // Clear the molecules array
        this.molecules = [];

        // Remove all molecule cards from DOM
        const allCards = document.querySelectorAll('.molecule-card');
        allCards.forEach(card => card.remove());

        // Show loading indicator if it exists
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }

        showNotification('All molecules deleted successfully!', 'info');
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

            // First, try to find the molecule in local SDF file
            const localSdfData = await this.findMoleculeInLocalSdf(code);
            if (localSdfData) {
                console.log(`Found ${code} in local SDF file`);
                this.updateMoleculeStatus(code, 'loaded');
                this.createMoleculeCard(localSdfData, code, 'sdf');
                return;
            }

            // Second, try to find SMILES in local TSV file
            const smilesData = await this.findMoleculeInLocalTsv(code);
            if (smilesData) {
                console.log(`Found ${code} in local TSV file with SMILES: ${smilesData}`);
                this.updateMoleculeStatus(code, 'loaded');
                this.createMoleculeCardFromSmiles(smilesData, code);
                return;
            }

            // Last resort: try external fetch (this often fails due to CORS)
            console.log(`Trying external fetch for ${code}`);
            const sdfData = await ApiService.getCcdSdf(code);
            if (!sdfData || sdfData.trim() === '' || sdfData.toLowerCase().includes('<html')) {
                throw new Error('Received empty or invalid SDF data.');
            }

            this.updateMoleculeStatus(code, 'loaded');
            this.createMoleculeCard(sdfData, code, 'sdf');
        } catch (error) {
            console.error(`Could not fetch or process data for ${code}:`, error);
            this.updateMoleculeStatus(code, 'error');
            this.createNotFoundCard(code, `Failed to load: ${error.message}`);
        }
    }

    // Find molecule in local SDF file
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

    // Find molecule SMILES in fragment library TSV file
    async findMoleculeInLocalTsv(code) {
        try {
            const tsvContent = await ApiService.getFragmentLibraryTsv();
            const lines = tsvContent.split('\n');

            for (const line of lines) {
                const columns = line.split('\t');
                if (columns.length > 8 && columns[8] === code) { // CCD column (8th column)
                    return columns[3]; // SMILES/query column (3rd column)
                }
            }
            return null;
        } catch (error) {
            console.error('Error searching fragment library TSV:', error);
            return null;
        }
    }

    // Create molecule card from SMILES
    createMoleculeCardFromSmiles(smiles, ccdCode) {
        const card = document.createElement('div');
        card.className = 'molecule-card';
        card.draggable = true;
        card.setAttribute('data-molecule-code', ccdCode);

        // Add drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '⋯';
        card.appendChild(dragHandle);

        // Add delete button
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>';
        deleteBtn.title = `Delete ${ccdCode}`;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteMolecule(ccdCode);
        });
        card.appendChild(deleteBtn);

        // Add molecule code label
        const codeLabel = document.createElement('div');
        codeLabel.className = 'molecule-code';
        codeLabel.textContent = ccdCode;
        card.appendChild(codeLabel);

        // Add 3D viewer container
        const viewerContainer = document.createElement('div');
        viewerContainer.className = 'molecule-viewer';
        viewerContainer.id = `viewer-${ccdCode}`;
        card.appendChild(viewerContainer);

        // Add SMILES display
        const smilesLabel = document.createElement('div');
        smilesLabel.className = 'smiles-label';
        smilesLabel.textContent = `SMILES: ${smiles}`;
        smilesLabel.style.fontSize = '10px';
        smilesLabel.style.color = '#666';
        smilesLabel.style.marginTop = '5px';
        card.appendChild(smilesLabel);

        // Add to container
        this.moleculeContainer.appendChild(card);

        // Create simple 2D representation using SMILES
        this.renderSmilesIn2D(smiles, viewerContainer);
    }

    // Simple 2D rendering from SMILES (placeholder for now)
    renderSmilesIn2D(smiles, container) {
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px;">
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 24px; margin-bottom: 5px;">🧪</div>
                    <div style="font-size: 10px; color: #666;">SMILES</div>
                </div>
            </div>
        `;
    }

    // Create molecule card
    createMoleculeCard(data, ccdCode, format = 'sdf') {
        const card = document.createElement('div');
        card.className = 'molecule-card';
        card.draggable = true;
        card.setAttribute('data-molecule-code', ccdCode);

        // Add drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '⋯';
        card.appendChild(dragHandle);

        // Add delete button
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>';
        deleteBtn.title = `Delete ${ccdCode}`;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.confirmDelete(ccdCode);
        });
        card.appendChild(deleteBtn);

        const title = document.createElement('h3');
        title.textContent = ccdCode;
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => {
            this.showMoleculeDetails(ccdCode, data, format);
        });
        card.appendChild(title);

        const viewerContainer = document.createElement('div');
        viewerContainer.id = `viewer-${ccdCode}`;
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
                viewer.addModel(data, format);
                viewer.setStyle({}, { stick: {} });
                viewer.setStyle({ elem: 'H' }, {}); // Hide hydrogen atoms
                viewer.zoomTo();
                viewer.render();
            } catch (e) {
                console.error(`Error initializing 3Dmol viewer for ${ccdCode}:`, e);
                viewerContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Render Error</p>';
            }
        }, 100);
    }

    // Create not found card
    createNotFoundCard(ccdCode, message = "Not found") {
        const card = document.createElement('div');
        card.className = 'molecule-card';
        card.draggable = true;
        card.setAttribute('data-molecule-code', ccdCode);

        // Add drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '⋯';
        card.appendChild(dragHandle);

        // Add delete button
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>';
        deleteBtn.title = `Delete ${ccdCode}`;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.confirmDelete(ccdCode);
        });
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.confirmDelete(ccdCode);
        });
        card.appendChild(deleteBtn);

        const content = document.createElement('div');
        content.innerHTML = `<h3>${ccdCode}</h3><p>${message}</p>`;

        // Make title clickable
        const title = content.querySelector('h3');
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => {
            this.showMoleculeDetails(ccdCode, null);
        });

        card.appendChild(content);

        // Add drag event listeners
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);

        this.grid.appendChild(card);
    }

    // Confirm delete with user
    confirmDelete(code) {
        if (confirm(`Are you sure you want to delete molecule ${code}?`)) {
            const success = this.removeMolecule(code);
            if (success) {
                showNotification(`Molecule ${code} deleted`, 'success');
            } else {
                showNotification(`Failed to delete molecule ${code}`, 'error');
            }
        }
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

    // Show molecule details in a modal
    showMoleculeDetails(ccdCode, sdfData) {
        this.ligandModal.show(ccdCode, sdfData);
    }




    async fetchRCSBDetails(pdbId) {
        try {
            const data = await ApiService.getRcsbEntry(pdbId);
            return data;
        } catch (error) {
            console.error(`Error fetching RCSB details for PDB ${pdbId}:`, error);
            return null;
        }
    }

    async showPDBDetailsModal(pdbId) {
        const modal = document.getElementById('pdb-details-modal');
        const title = document.getElementById('pdb-details-title');
        const body = document.getElementById('pdb-details-body');
        const viewerContainer = document.getElementById('pdb-viewer-container');

        title.textContent = `PDB Entry Details: ${pdbId.toUpperCase()}`;
        body.innerHTML = '<div class="properties-loading">Loading PDB entry details...</div>';
        viewerContainer.innerHTML = '';
        viewerContainer.style.display = 'none';
        modal.style.display = 'block';

        try {
            const details = await this.fetchRCSBDetails(pdbId);
            if (!details) {
                throw new Error('No data found for this PDB entry.');
            }

            body.innerHTML = this.createPDBDetailsHTML(details);

            // Populate bound ligands table
            this.populateBoundLigands(pdbId);

            // Add event listeners for the new buttons
            document.getElementById('open-rcsb-btn').addEventListener('click', () => {
                window.open(`https://www.rcsb.org/structure/${pdbId.toUpperCase()}`, '_blank');
            });
            document.getElementById('open-pdbe-btn').addEventListener('click', () => {
                window.open(`https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbId.toLowerCase()}`, '_blank');
            });

            // Fetch PDB data and initialize 3Dmol.js viewer
            viewerContainer.style.display = 'block';
            viewerContainer.innerHTML = '<p class="properties-loading">Loading 3D structure...</p>';

            const pdbData = await ApiService.getPdbFile(pdbId);

            setTimeout(() => {
                try {
                    const viewer = $3Dmol.createViewer(viewerContainer, {
                        backgroundColor: 'white',
                        width: '100%',
                        height: '100%'
                    });
                    viewer.addModel(pdbData, 'pdb');
                    viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
                    viewer.zoomTo();
                    viewer.render();
                } catch (e) {
                    console.error('Error creating 3Dmol viewer:', e);
                    viewerContainer.innerHTML = '<div class="no-pdb-entries">Could not render 3D structure.</div>';
                }
            }, 100);

        } catch (error) {
            console.error('Error fetching PDB details:', error);
            body.innerHTML = '<div class="no-pdb-entries">Could not load details for this PDB entry.</div>';
            viewerContainer.style.display = 'none';
        }
    }

    // Create HTML for PDB details modal
    createPDBDetailsHTML(data) {
        const title = data.struct?.title || 'Not available';
        const authors = data.citation?.[0]?.rcsb_authors?.join(', ') || 'Not available';
        const releaseDate = data.rcsb_accession_info?.initial_release_date ? new Date(data.rcsb_accession_info.initial_release_date).toLocaleDateString() : 'Not available';
        const resolution = data.rcsb_entry_info?.resolution_combined?.[0]?.toFixed(2) ? `${data.rcsb_entry_info.resolution_combined[0].toFixed(2)} Å` : 'N/A';
        const method = data.exptl?.[0]?.method || 'N/A';
        const organism = data.entity_src_gen?.[0]?.pdbx_host_org_scientific_name || 'Not available';
        const pdbId = data.rcsb_id;

        return `
            <div class="details-section" style="padding-bottom: 0;">
                <div class="pdb-details-grid" style="grid-template-columns: repeat(5, 1fr);">
                    <div class="pdb-info-item">
                        <div class="pdb-info-label">PDB ID</div>
                        <div class="pdb-info-value">${pdbId.toUpperCase()}</div>
                    </div>
                    <div class="pdb-info-item">
                        <div class="pdb-info-label">Organism</div>
                        <div class="pdb-info-value">${organism}</div>
                    </div>
                    <div class="pdb-info-item">
                        <div class="pdb-info-label">Method</div>
                        <div class="pdb-info-value">${method}</div>
                    </div>
                    <div class="pdb-info-item">
                        <div class="pdb-info-label">Resolution</div>
                        <div class="pdb-info-value">${resolution}</div>
                    </div>
                    <div class="pdb-info-item">
                        <div class="pdb-info-label">Release Date</div>
                        <div class="pdb-info-value">${releaseDate}</div>
                    </div>
                </div>
            </div>
            <div class="details-section" style="padding-top: 0;">
                 <div class="pdb-details-grid">
                    <div class="pdb-info-item" style="grid-column: 1 / -1;">
                        <div class="pdb-info-label">Title</div>
                        <div class="pdb-info-value" title="${title}">${title}</div>
                    </div>
                    <div class="pdb-info-item" style="grid-column: 1 / -1;">
                        <div class="pdb-info-label">Authors</div>
                        <div class="pdb-info-value">${authors}</div>
                    </div>
                </div>
                <div class="pdb-external-links">
                    <button id="open-rcsb-btn" class="view-structure-btn rcsb-btn">Open on RCSB PDB</button>
                    <button id="open-pdbe-btn" class="view-structure-btn pdbe-btn">Open on PDBe</button>
                </div>
            </div>
            <div class="details-section">
                <h4>Interactive Molecular Structure</h4>
            </div>
        `;
    }

    // Populate the bound ligands table
    populateBoundLigands(pdbId) {
        const section = document.getElementById('bound-ligands-section');
        const table = document.getElementById('bound-ligands-table');
        const tableBody = document.getElementById('bound-ligands-tbody');
        const noLigandsMessage = document.getElementById('no-bound-ligands-message');
        const addAllBtn = document.getElementById('add-all-bound-btn');

        tableBody.innerHTML = ''; // Clear previous entries

        ApiService.getLigandMonomers(pdbId)
            .then(data => {
                const ligands = data[pdbId.toLowerCase()];

                if (ligands && ligands.length > 0) {
                    // Filter out common ions and solvents, unless they are the only things present
                    const significantLigands = ligands.filter(l => !['HOH', 'ZN', 'MG', 'CA', 'NA', 'K', 'CL'].includes(l.chem_comp_id));
                    const ligandsToShow = significantLigands.length > 0 ? significantLigands : ligands;

                    section.style.display = 'block';
                    table.style.display = 'table';
                    noLigandsMessage.style.display = 'none';

                    ligandsToShow.forEach(ligand => {
                        const row = this.createBoundLigandRow(ligand);
                        tableBody.appendChild(row);
                    });
                    currentBoundLigands = ligandsToShow.map(l => l.chem_comp_id);
                    if (currentBoundLigands.length > 0) {
                        addAllBtn.style.display = 'inline-block';
                        addAllBtn.textContent = `Add All (${currentBoundLigands.length})`;
                        addAllBtn.onclick = () => this.addAllLigands(currentBoundLigands, 'bound');
                    } else {
                        addAllBtn.style.display = 'none';
                    }
                } else {
                    section.style.display = 'block';
                    table.style.display = 'none';
                    noLigandsMessage.style.display = 'block';
                    addAllBtn.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching bound ligands:', error);
                section.style.display = 'block';
                table.style.display = 'none';
                noLigandsMessage.style.display = 'block';
                noLigandsMessage.textContent = 'Could not load bound ligand data.';
                addAllBtn.style.display = 'none';
            });
    }

    // Create a table row for a bound ligand
    createBoundLigandRow(ligand) {
        const row = document.createElement('tr');

        // 2D Structure image
        const imageCell = document.createElement('td');
        imageCell.className = 'structure-2d';
        const imageContainer = document.createElement('div');
        imageContainer.className = 'loading';
        imageContainer.textContent = 'Loading...';
        imageCell.appendChild(imageContainer);
        this.ligandModal.load2DStructure(ligand.chem_comp_id, imageContainer);

        // CCD Code
        const codeCell = document.createElement('td');
        const codeSpan = document.createElement('span');
        codeSpan.className = 'ccd-code';
        codeSpan.textContent = ligand.chem_comp_id;
        codeSpan.title = `Click to add ${ligand.chem_comp_id} to database`;
        codeSpan.addEventListener('click', () => {
            document.getElementById('close-pdb-details-modal').click();
            this.showMoleculeDetails(ligand.chem_comp_id);
        });
        codeCell.appendChild(codeSpan);

        // Chain ID
        const chainCell = document.createElement('td');
        chainCell.textContent = ligand.chain_id;

        // Residue Number
        const residueCell = document.createElement('td');
        residueCell.textContent = ligand.author_residue_number;

        // Entity ID
        const entityCell = document.createElement('td');
        entityCell.textContent = ligand.entity_id;

        // Name
        const nameCell = document.createElement('td');
        nameCell.className = 'ligand-name';
        nameCell.textContent = ligand.chem_comp_name;
        nameCell.title = ligand.chem_comp_name;

        // Add button
        const addCell = document.createElement('td');
        const addButton = document.createElement('button');
        addButton.className = 'add-ligand-btn';
        addButton.innerHTML = '&#43;';
        addButton.title = `Add ${ligand.chem_comp_id} to database`;
        addButton.addEventListener('click', () => {
            const success = this.addMolecule(ligand.chem_comp_id);
            if (success) {
                showNotification(`Adding molecule ${ligand.chem_comp_id}...`, 'success');
            } else {
                showNotification(`Molecule ${ligand.chem_comp_id} already exists`, 'info');
            }
        });
        addCell.appendChild(addButton);

        row.appendChild(imageCell);
        row.appendChild(codeCell);
        row.appendChild(chainCell);
        row.appendChild(residueCell);
        row.appendChild(entityCell);
        row.appendChild(nameCell);
        row.appendChild(addCell);

        return row;
    }

    // Add all ligands from a list
    addAllLigands(ligandList, type) {
        if (!ligandList || ligandList.length === 0) {
            showNotification(`No ${type} ligands to add`, 'info');
            return;
        }

        const addAllBtn = document.getElementById(`add-all-${type}-btn`);
        addAllBtn.disabled = true;
        addAllBtn.textContent = 'Adding...';

        let addedCount = 0;
        let skippedCount = 0;

        ligandList.forEach((ligand, index) => {
            setTimeout(() => {
                const success = this.addMolecule(ligand);
                if (success) {
                    addedCount++;
                } else {
                    skippedCount++;
                }

                // Show final notification when all are processed
                if (index === ligandList.length - 1) {
                    let message = '';
                    if (addedCount > 0 && skippedCount > 0) {
                        message = `Added ${addedCount} new molecules, ${skippedCount} already existed`;
                    } else if (addedCount > 0) {
                        message = `Added ${addedCount} new molecules`;
                    } else {
                        message = `All ${skippedCount} molecules already existed`;
                    }

                    showNotification(message, addedCount > 0 ? 'success' : 'info');

                    // Re-enable button
                    addAllBtn.disabled = false;
                    addAllBtn.textContent = `Add All (${ligandList.length})`;
                }
            }, index * 100); // Stagger the additions to avoid overwhelming the UI
        });
    }
}

class FragmentManager {
    constructor() {
        this.fragments = [];
        this.grid = null;
        this.searchInput = null;
        this.sourceFilter = null;
        this.ccdToggle = null;
    }

    init() {
        this.grid = document.getElementById('fragment-grid');
        this.searchInput = document.getElementById('fragment-search');
        this.sourceFilter = document.getElementById('fragment-filter-source');
        this.ccdToggle = document.getElementById('ccd-toggle');

        this.addEventListeners();
        return this;
    }

    addEventListeners() {
        this.searchInput.addEventListener('input', () => this.renderFragments());
        this.sourceFilter.addEventListener('change', () => this.renderFragments());
        this.ccdToggle.addEventListener('change', () => this.renderFragments());
    }

    async loadFragments() {
        try {
            const tsvData = await ApiService.getFragmentLibraryTsv();

            const rows = tsvData.split('\n').slice(1); // Skip header
            this.fragments = rows.map((row, index) => {
                const columns = row.split('\t');
                if (columns.length < 10) return null;
                return {
                    id: columns[0] || index, // Use the actual index from TSV, fallback to array index
                    name: columns[1],
                    kind: columns[2],
                    query: columns[3],
                    description: columns[4],
                    comment: columns[5],
                    url: columns[6],
                    source: columns[7],
                    ccd: columns[8],
                    in_ccd: columns[9].trim() === 'True'
                };
            }).filter(Boolean); // remove nulls from empty lines

            this.renderFragments();
        } catch (error) {
            console.error('Failed to load fragment library:', error);
            this.grid.innerHTML = '<p>No fragments match your criteria.</p>';
        }
    }

    renderFragments() {
        this.grid.innerHTML = '';

        const searchTerm = this.searchInput.value.toLowerCase();
        const source = this.sourceFilter.value;
        const onlyInCCD = this.ccdToggle.checked;

        const filteredFragments = this.fragments.filter(fragment => {
            const nameMatch = fragment.name.toLowerCase().includes(searchTerm);
            const sourceMatch = source === 'all' || fragment.source === source;
            const ccdMatch = !onlyInCCD || fragment.in_ccd;
            return nameMatch && sourceMatch && ccdMatch;
        });

        if (filteredFragments.length === 0) {
            this.grid.innerHTML = '<p>No fragments match your criteria.</p>';
            return;
        }

        filteredFragments.forEach(fragment => {
            const card = this.createFragmentCard(fragment);
            this.grid.appendChild(card);
        });
    }

    createFragmentCard(fragment) {
        const card = document.createElement('div');
        card.className = 'molecule-card fragment-card';

        const title = document.createElement('h3');
        title.textContent = fragment.name;
        card.appendChild(title);

        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'viewer-container';
        card.appendChild(canvasContainer);

        const info = document.createElement('div');
        info.className = 'fragment-info';

        let ccdText = 'No';
        if (fragment.in_ccd && fragment.ccd) {
            const ccdCode = fragment.ccd.split(',')[0].trim();
            ccdText = `Yes (<a href="#" class="ccd-link" data-ccd="${ccdCode}">${ccdCode}</a>)`;
        }

        info.innerHTML = `
            <p><strong>Source:</strong> ${fragment.source}</p>
            <p><strong>In CCD:</strong> ${ccdText}</p>
            <p><strong>Type:</strong> ${fragment.kind}</p>
        `;
        card.appendChild(info);

        // Add event listener for the CCD link
        const ccdLink = info.querySelector('.ccd-link');
        if (ccdLink) {
            ccdLink.addEventListener('click', (e) => {
                e.preventDefault();
                const ccd = e.target.dataset.ccd;
                moleculeManager.showMoleculeDetails(ccd);
            });
        }

        // Add "Add to library" button if in CCD
        if (fragment.in_ccd && fragment.ccd) {
            const ccdCode = fragment.ccd.split(',')[0].trim();
            const alreadyExists = moleculeManager.getMolecule(ccdCode);

            const addButton = document.createElement('button');
            addButton.textContent = alreadyExists ? 'In library' : 'Add to library';
            addButton.className = 'add-to-library-btn';
            if (alreadyExists) {
                addButton.disabled = true;
                addButton.classList.add('added');
            }

            addButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const success = moleculeManager.addMolecule(ccdCode);
                if (success) {
                    showNotification(`Adding molecule ${ccdCode} to library...`, 'success');
                    addButton.textContent = 'Added to library';
                    addButton.disabled = true;
                    addButton.classList.add('added');
                } else {
                    // This case is for safety, though the initial check should handle it
                    showNotification(`Molecule ${ccdCode} already exists.`, 'info');
                    addButton.textContent = 'In library';
                    addButton.disabled = true;
                    addButton.classList.add('added');
                }
            });
            card.appendChild(addButton);
        }

        // Defer rendering smile
        setTimeout(() => {
            if ((fragment.kind === 'SMILES' || fragment.kind === 'SMARTS') && fragment.query) {
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 150;
                canvasContainer.appendChild(canvas);

                try {
                    const sanitizedQuery = this.sanitizeSMILES(fragment.query);
                    // Use the parser with error callback for robustness
                    SmilesDrawer.parse(sanitizedQuery, function (tree) {
                        let options = { width: 200, height: 150 };
                        let smilesDrawer = new SmilesDrawer.Drawer(options);
                        smilesDrawer.draw(tree, canvas, 'light', false);
                    }, function (err) {
                        console.error("Error parsing SMILES for " + fragment.name, err);
                        canvasContainer.innerHTML = `<p class="render-error">Render error for query: ${fragment.query}</p>`;
                    });
                } catch (ex) {
                    console.error("General error rendering SMILES for " + fragment.name, ex);
                    canvasContainer.innerHTML = `<p class="render-error">Render error for query: ${fragment.query}</p>`;
                }

            } else {
                canvasContainer.innerHTML = `<p class="render-error">Cannot render type: ${fragment.kind || 'N/A'}</p>`;
            }
        }, 50);

        return card;
    }

    addFragment(fragmentData) {
        // Basic validation
        if (!fragmentData.name || !fragmentData.query) {
            showNotification('Fragment name and SMILES/SMARTS query are required.', 'error');
            return false;
        }

        // Add to the start of the fragments array
        this.fragments.unshift({
            id: `custom-${Date.now()}`,
            name: fragmentData.name,
            kind: 'SMILES', // Assume SMILES for now
            query: fragmentData.query,
            description: fragmentData.description,
            comment: 'Custom fragment',
            url: '',
            source: fragmentData.source || 'custom',
            ccd: '',
            in_ccd: false
        });

        // Re-render the fragments view
        this.renderFragments();
        showNotification(`Fragment "${fragmentData.name}" added successfully!`, 'success');
        return true;
    }

    sanitizeSMILES(smiles) {
        if (!smiles) return '';
        // Remove any characters that are not part of the standard SMILES alphabet
        return smiles.replace(/[^A-Za-z0-9\(\)\[\]\.\-=#$:@\/\\]/g, '');
    }
}

class ProteinModal {
    constructor() {
        // PDB details modal elements
        this.pdbModal = document.getElementById('pdb-details-modal');
        this.pdbTitle = document.getElementById('pdb-details-title');
        this.pdbBody = document.getElementById('pdb-details-body');
        this.pdbViewerContainer = document.getElementById('pdb-viewer-container');
        this.boundLigandsSection = document.getElementById('bound-ligands-section');
        this.boundLigandsTable = document.getElementById('bound-ligands-table');
        this.boundLigandsTbody = document.getElementById('bound-ligands-tbody');
        this.noBoundLigandsMessage = document.getElementById('no-bound-ligands-message');
        this.addAllBoundBtn = document.getElementById('add-all-bound-btn');

        // Quick view modal elements
        this.quickViewModal = document.getElementById('quick-view-modal');
        this.quickViewTitle = document.getElementById('quick-view-title');
        this.quickViewViewer = document.getElementById('quick-view-viewer');

        // Wire up close buttons
        const closePdbBtn = document.getElementById('close-pdb-details-modal');
        if (closePdbBtn) {
            closePdbBtn.addEventListener('click', () => this.closePdbDetails());
        }

        const closeQuickBtn = document.getElementById('close-quick-view-modal');
        if (closeQuickBtn) {
            closeQuickBtn.addEventListener('click', () => this.closeQuickView());
        }

        window.addEventListener('click', (event) => {
            if (event.target === this.pdbModal) {
                this.closePdbDetails();
            }
            if (event.target === this.quickViewModal) {
                this.closeQuickView();
            }
        });
    }

    closePdbDetails() {
        if (this.pdbModal) {
            this.pdbModal.style.display = 'none';
        }
    }

    closeQuickView() {
        if (this.quickViewModal) {
            this.quickViewModal.style.display = 'none';
            if (this.quickViewViewer) {
                this.quickViewViewer.innerHTML = '';
            }
        }
    }

    renderBoundLigands(ligands) {
        if (!ligands || ligands.length === 0) {
            return '<div class="bound-ligands-container"></div>';
        }

        const ligandHtml = ligands.slice(0, 5).map(ligand => `
            <div class="ligand-img-container">
                <img src="https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${ligand.chem_comp_id}_200.svg"
                     alt="${ligand.chem_comp_id}"
                     title="${ligand.chem_comp_id}: ${ligand.chem_comp_name}"
                     class="bound-ligand-img">
                <div class="ligand-img-overlay">
                    <button class="ligand-action-btn add-ligand" data-ccd-code="${ligand.chem_comp_id}">+</button>
                    <button class="ligand-action-btn quick-view" data-ccd-code="${ligand.chem_comp_id}">👁️</button>
                </div>
            </div>
        `).join('');

        const moreIndicator = ligands.length > 5
            ? `<span class="more-ligands-indicator" title="${ligands.length - 5} more ligands">+${ligands.length - 5}</span>`
            : '';

        return `<div class="bound-ligands-container">${ligandHtml}${moreIndicator}</div>`;
    }

    showQuickViewLoading(ccdCode) {
        if (!this.quickViewModal) return;
        this.quickViewTitle.textContent = `3D Structure: ${ccdCode}`;
        this.quickViewViewer.innerHTML = '<p>Loading...</p>';
        this.quickViewModal.style.display = 'block';
    }

    showQuickViewFromSdf(ccdCode, sdfData) {
        this.showQuickViewLoading(ccdCode);
        try {
            const viewer = $3Dmol.createViewer(this.quickViewViewer, {
                backgroundColor: 'white'
            });
            viewer.addModel(sdfData, 'sdf');
            viewer.setStyle({}, { stick: {} });
            viewer.zoomTo();
            viewer.render();
        } catch (e) {
            console.error('Error rendering SDF for quick view:', e);
            this.showQuickViewError(ccdCode, 'Could not render 3D structure.');
        }
    }

    showQuickViewFromSmiles(ccdCode, smiles) {
        this.showQuickViewLoading(ccdCode);
        this.quickViewViewer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa;">
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🧪</div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 10px;">SMILES Structure</div>
                    <div style="font-size: 14px; font-family: monospace; background: white; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">${smiles}</div>
                </div>
            </div>
        `;
    }

    showQuickViewError(ccdCode, message) {
        this.showQuickViewLoading(ccdCode);
        this.quickViewViewer.innerHTML = `<p>Could not load 3D structure: ${message}</p>`;
    }
}

class ProteinManager {
    constructor() {
        this.searchBtn = document.getElementById('protein-group-search-btn');
        this.searchInput = document.getElementById('protein-group-search');
        this.suggestedDropdown = document.getElementById('suggested-groups-dropdown');
        this.resultsContainer = document.getElementById('protein-results-table-container');
        this.resultsBody = document.getElementById('protein-results-tbody');
        this.loadingIndicator = document.getElementById('protein-loading-indicator');
        this.noResultsMessage = document.getElementById('no-protein-results-message');
        this.hideAidsToggle = document.getElementById('hide-aids-toggle');
        this.currentProteinDetails = []; // To store current search results
        this.modal = new ProteinModal();
    }

    init() {
        this.searchBtn.addEventListener('click', () => {
            const groupId = this.searchInput.value.trim();
            if (groupId) {
                this.fetchProteinGroup(groupId);
            } else {
                showNotification('Please enter a Group ID.', 'info');
            }
        });

        this.hideAidsToggle.addEventListener('change', () => {
            if (this.currentProteinDetails.length > 0) {
                this.displayResults(this.currentProteinDetails);
            }
        });

        // Handle suggested groups dropdown selection
        this.suggestedDropdown.addEventListener('change', () => {
            const selectedGroupId = this.suggestedDropdown.value;
            if (selectedGroupId) {
                this.searchInput.value = selectedGroupId;
                // Optionally auto-search when selection is made
                this.fetchProteinGroup(selectedGroupId);
            }
        });
    }

    async fetchProteinGroup(groupId) {
        this.loadingIndicator.style.display = 'block';
        this.resultsContainer.style.display = 'none';
        this.noResultsMessage.style.display = 'none';

        try {
            const data = await ApiService.getProteinGroup(groupId);
            const memberIds = data.rcsb_group_container_identifiers.group_member_ids;

            this.currentProteinDetails = await this.fetchMemberDetails(memberIds);
            this.displayResults(this.currentProteinDetails);

        } catch (error) {
            console.error('Error fetching protein group:', error);
            this.noResultsMessage.textContent = 'Could not fetch data for the given Group ID.';
            this.noResultsMessage.style.display = 'block';
        } finally {
            this.loadingIndicator.style.display = 'none';
        }
    }

    async fetchMemberDetails(pdbIds) {
        const details = [];
        for (const pdbId of pdbIds) {
            try {
                const data = await ApiService.getRcsbEntry(pdbId);
                details.push(data);
            } catch (error) {
                details.push({ rcsb_id: pdbId, error: 'Failed to fetch details' });
            }
        }
        return details;
    }

    async fetchBoundLigands(pdbId) {
        try {
            const data = await ApiService.getLigandMonomers(pdbId);
            return data[pdbId.toLowerCase()] || [];
        } catch (error) {
            console.error(`Error fetching bound ligands for ${pdbId}:`, error);
            return [];
        }
    }

    async displayResults(proteinDetails) {
        this.resultsBody.innerHTML = '';
        if (proteinDetails && proteinDetails.length > 0) {
            const hideAids = this.hideAidsToggle.checked;

            for (const detail of proteinDetails) {
                const row = this.resultsBody.insertRow();
                const pdbId = detail.rcsb_id;
                const title = detail.struct?.title || 'N/A';
                const resolution = detail.rcsb_entry_info?.resolution_combined?.[0]?.toFixed(2) || 'N/A';
                const releaseDate = detail.rcsb_accession_info?.initial_release_date ? new Date(detail.rcsb_accession_info.initial_release_date).toLocaleDateString() : 'N/A';
                const imageUrl = `https://cdn.rcsb.org/images/structures/${pdbId.toLowerCase()}_assembly-1.jpeg`;

                let boundLigands = await this.fetchBoundLigands(pdbId);

                if (hideAids) {
                    boundLigands = boundLigands.filter(ligand => !crystallizationAids.includes(ligand.chem_comp_id));
                }

                row.innerHTML = `
                    <td><img src="${imageUrl}" alt="${pdbId} thumbnail" class="protein-thumbnail"></td>
                    <td><a href="#" class="pdb-id-link" data-pdb-id="${pdbId}">${pdbId}</a></td>
                    <td>${title}</td>
                    <td>${resolution}</td>
                    <td>${releaseDate}</td>
                    <td class="bound-ligands-cell">
                        ${this.modal.renderBoundLigands(boundLigands)}
                    </td>
                    <td class="view-buttons-cell">
                        <button class="view-structure-btn rcsb-btn" data-pdb-id="${pdbId}">RCSB PDB</button>
                        <button class="view-structure-btn pdbe-btn" data-pdb-id="${pdbId}">PDBe</button>
                    </td>
                `;
            }

            this.resultsContainer.style.display = 'block';
            this.noResultsMessage.style.display = 'none';

            document.querySelectorAll('.pdb-id-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    moleculeManager.showPDBDetailsModal(e.target.dataset.pdbId);
                });
            });

            document.querySelectorAll('.view-structure-btn.rcsb-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    window.open(`https://www.rcsb.org/structure/${e.target.dataset.pdbId}`, '_blank');
                });
            });
            document.querySelectorAll('.view-structure-btn.pdbe-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    window.open(`https://www.ebi.ac.uk/pdbe/entry/pdb/${e.target.dataset.pdbId.toLowerCase()}`, '_blank');
                });
            });

            document.querySelectorAll('.add-ligand').forEach(button => {
                button.addEventListener('click', (e) => {
                    const ccdCode = e.target.dataset.ccdCode;
                    moleculeManager.addMolecule(ccdCode);
                    showNotification(`Added ${ccdCode} to library`, 'success');
                });
            });

            document.querySelectorAll('.quick-view').forEach(button => {
                button.addEventListener('click', (e) => {
                    const ccdCode = e.target.dataset.ccdCode;
                    this.showQuickView(ccdCode);
                });
            });

        } else {
            this.noResultsMessage.textContent = 'No PDB entries found in this group.';
            this.noResultsMessage.style.display = 'block';
            this.resultsContainer.style.display = 'none';
        }
    }

    async showQuickView(ccdCode) {
        this.modal.showQuickViewLoading(ccdCode);
        try {
            const localSdfData = await moleculeManager.findMoleculeInLocalSdf(ccdCode);
            if (localSdfData) {
                console.log(`Quick view: Found ${ccdCode} in local SDF file`);
                this.modal.showQuickViewFromSdf(ccdCode, localSdfData);
                return;
            }

            const smilesData = await moleculeManager.findMoleculeInLocalTsv(ccdCode);
            if (smilesData) {
                console.log(`Quick view: Found ${ccdCode} in local TSV file with SMILES: ${smilesData}`);
                this.modal.showQuickViewFromSmiles(ccdCode, smilesData);
                return;
            }

            console.log(`Quick view: Trying external fetch for ${ccdCode}`);
            const sdfData = await ApiService.getCcdSdf(ccdCode);
            if (!sdfData || sdfData.trim() === '' || sdfData.toLowerCase().includes('<html')) {
                throw new Error('Received empty or invalid SDF data.');
            }

            this.modal.showQuickViewFromSdf(ccdCode, sdfData);
        } catch (error) {
            console.error('Error fetching/rendering SDF for quick view:', error);
            this.modal.showQuickViewError(ccdCode, error.message);
        }
    }
}

// Global molecule manager instance
const moleculeManager = new MoleculeManager();
const fragmentManager = new FragmentManager();
const proteinManager = new ProteinManager();

// Initialize when page loads
window.onload = async () => {
    // Show disclaimer modal first
    showDisclaimerModal();
};

// Function to show disclaimer modal on launch
function showDisclaimerModal() {
    const disclaimerModal = document.getElementById('launch-disclaimer-modal');
    const acceptBtn = document.getElementById('accept-disclaimer-btn');

    if (disclaimerModal && acceptBtn) {
        // Show the disclaimer modal
        disclaimerModal.style.display = 'flex';

        // Handle acceptance
        acceptBtn.addEventListener('click', async () => {
            disclaimerModal.style.display = 'none';
            // Initialize the app after disclaimer is accepted
            await initializeApp();
        });
    } else {
        // If modal doesn't exist, initialize immediately
        initializeApp();
    }
}

// Function to initialize the main application
async function initializeApp() {
    moleculeManager.init();
    fragmentManager.init();
    proteinManager.init();
    await moleculeManager.loadAllMolecules();
    await fragmentManager.loadFragments();
    initializeModal();
    initializeTabs();
}

// Modal functionality
function initializeModal() {
    // Add Molecule Modal
    const addModal = document.getElementById('add-molecule-modal');
    const addBtn = document.getElementById('add-molecule-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const confirmBtn = document.getElementById('confirm-add-btn');
    const feelingLuckyBtn = document.getElementById('feeling-lucky-btn');
    const input = document.getElementById('molecule-code');

    // Details Modal
    const detailsModal = document.getElementById('molecule-details-modal');
    const closeDetailsBtn = document.getElementById('close-details-modal');

    // Add Fragment Modal elements
    const addFragmentModal = document.getElementById('add-fragment-modal');
    const addFragmentBtn = document.getElementById('add-fragment-btn');
    const closeFragmentModalBtn = document.getElementById('close-fragment-modal');
    const cancelFragmentBtn = document.getElementById('cancel-add-fragment-btn');
    const confirmFragmentBtn = document.getElementById('confirm-add-fragment-btn');

    // Open add modal
    addBtn.addEventListener('click', () => {
        addModal.style.display = 'block';
        input.focus();
    });

    // Delete all molecules with confirmation
    deleteAllBtn.addEventListener('click', () => {
        const moleculeCount = moleculeManager.getAllMolecules().length;
        if (moleculeCount === 0) {
            showNotification('No molecules to delete!', 'info');
            return;
        }

        const confirmed = confirm(`Are you sure you want to delete all ${moleculeCount} molecules? This action cannot be undone.`);
        if (confirmed) {
            moleculeManager.deleteAllMolecules();
        }
    });

    // Close add modal functions
    const closeAddModal = () => {
        addModal.style.display = 'none';
        input.value = '';
    };

    // Close details modal function
    const closeDetailsModal = () => {
        detailsModal.style.display = 'none';
    };

    // Open add fragment modal
    addFragmentBtn.addEventListener('click', () => {
        addFragmentModal.style.display = 'block';
        document.getElementById('fragment-name').focus();
    });

    // Close add fragment modal functions
    const closeFragmentModal = () => {
        addFragmentModal.style.display = 'none';
        // Clear form fields
        document.getElementById('fragment-name').value = '';
        document.getElementById('fragment-query').value = '';
        document.getElementById('fragment-description').value = '';
        document.getElementById('fragment-source').value = 'custom';
    };

    closeBtn.addEventListener('click', closeAddModal);
    cancelBtn.addEventListener('click', closeAddModal);
    closeDetailsBtn.addEventListener('click', closeDetailsModal);
    closeFragmentModalBtn.addEventListener('click', closeFragmentModal);
    cancelFragmentBtn.addEventListener('click', closeFragmentModal);

    // Handle confirm add fragment
    confirmFragmentBtn.addEventListener('click', () => {
        const name = document.getElementById('fragment-name').value;
        const query = document.getElementById('fragment-query').value;
        const source = document.getElementById('fragment-source').value;
        const description = document.getElementById('fragment-description').value;

        fragmentManager.addFragment({ name, query, source, description });
        closeFragmentModal();
    });

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === addModal) {
            closeAddModal();
        }
        if (event.target === detailsModal) {
            closeDetailsModal();
        }
        if (event.target === addFragmentModal) {
            closeFragmentModal();
        }
    });

    // Handle Enter key in input
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addMolecule();
        }
    });

    // Add molecule function
    const addMolecule = () => {
        const code = input.value.trim().toUpperCase();

        if (!code) {
            alert('Please enter a molecule code');
            return;
        }

        if (code.length > 10) {
            alert('Molecule code should be 10 characters or less');
            return;
        }

        const success = moleculeManager.addMolecule(code);
        if (success) {
            closeAddModal();
            // Show success message briefly
            showNotification(`Adding molecule ${code}...`, 'success');
        } else {
            alert(`Molecule ${code} already exists in the database`);
        }
    };

    if (feelingLuckyBtn) {
        feelingLuckyBtn.addEventListener('click', () => {
            const randomIndex = Math.floor(Math.random() * (luckyDipCodes.length / 2)) * 2;
            const randomCode = luckyDipCodes[randomIndex];

            const success = moleculeManager.addMolecule(randomCode);
            if (success) {
                showNotification(`Feeling lucky! Adding ${randomCode}...`, 'success');
                closeAddModal();
            } else {
                showNotification(`Molecule ${randomCode} already exists, try again!`, 'info');
            }
        });
    }

    confirmBtn.addEventListener('click', addMolecule);
}

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const moleculeHeader = document.querySelector('.database-header');
    const moleculeGrid = document.getElementById('molecule-grid');
    const fragmentContent = document.getElementById('fragment-library-content');
    const proteinContent = document.getElementById('protein-browser-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Activate clicked tab
            button.classList.add('active');

            // Hide all content panels
            moleculeHeader.style.display = 'none';
            moleculeGrid.style.display = 'none';
            fragmentContent.style.display = 'none';
            proteinContent.style.display = 'none';

            // Show the correct one
            if (button.textContent === 'Molecules') {
                moleculeHeader.style.display = 'flex';
                moleculeGrid.style.display = 'grid';
            } else if (button.textContent === 'Fragments') {
                fragmentContent.style.display = 'block';
            } else if (button.textContent === 'Proteins') {
                proteinContent.style.display = 'block';
            }
        });
    });
}

// Simple notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Style the notification
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

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);

    // Remove after 3 seconds
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

// Legacy functions for backward compatibility (now just wrappers)
async function fetchMoleculeData(ccdCode, grid) {
    await moleculeManager.loadMolecule(ccdCode);
}

function createMoleculeCard(sdfData, ccdCode, grid) {
    moleculeManager.createMoleculeCard(sdfData, ccdCode);
}

function createNotFoundCard(ccdCode, grid, message = "Not found") {
    moleculeManager.createNotFoundCard(ccdCode, message);
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