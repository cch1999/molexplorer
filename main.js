import ApiService from './apiService.js';

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

// A global variable to keep track of the currently displayed similar ligands
let currentSimilarLigands = [];
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
        const modal = document.getElementById('molecule-details-modal');
        const detailsTitle = document.getElementById('details-title');
        const detailsCode = document.getElementById('details-code');
        const detailsSource = document.getElementById('details-source');
        const detailsType = document.getElementById('details-type');
        const detailsViewer = document.getElementById('details-viewer-container');
        const detailsJSON = document.getElementById('details-json');

        // Update basic information
        detailsTitle.textContent = `Molecule Details: ${ccdCode}`;
        detailsCode.textContent = ccdCode;

        // Get molecule info
        const molecule = this.getMolecule(ccdCode);
        const isAminoAcid = ['ALA', 'ARG', 'ASN', 'ASP', 'CYS', 'GLN', 'GLU', 'GLY', 'HIS', 'ILE', 'LEU', 'LYS', 'MET', 'PHE', 'PRO', 'SER', 'THR', 'TRP', 'TYR', 'VAL'].includes(ccdCode);

        detailsSource.textContent = isAminoAcid ? 'building_blocks' : 'reagents';
        detailsType.textContent = isAminoAcid ? 'building_block' : 'reagent';

        // Clear and setup 3D viewer
        detailsViewer.innerHTML = '<p>Loading structure...</p>';

        if (sdfData) {
            setTimeout(() => {
                try {
                    const viewer = $3Dmol.createViewer(detailsViewer, {
                        backgroundColor: 'white',
                        width: '100%',
                        height: '100%'
                    });
                    viewer.addModel(sdfData, 'sdf');
                    viewer.setStyle({}, { stick: { radius: 0.2 }, sphere: { scale: 0.3 } });
                    viewer.setStyle({ elem: 'H' }, {}); // Hide hydrogen atoms
                    viewer.zoomTo();
                    viewer.render();
                } catch (e) {
                    console.error(`Error initializing details viewer for ${ccdCode}:`, e);
                    detailsViewer.innerHTML = '<p style="color: #666;">Structure rendering error</p>';
                }
            }, 100);
        } else {
            detailsViewer.innerHTML = '<p style="color: #666;">Structure data not available</p>';
        }

        // Update JSON representation
        const jsonData = {
            molecule_id: `mol_${ccdCode.toLowerCase()}`,
            ccd_code: ccdCode,
            source: isAminoAcid ? 'building_blocks' : 'reagents',
            type: isAminoAcid ? 'building_block' : 'reagent',
            structure_data: sdfData ? sdfData.substring(0, 100) + '...' : 'N/A',
            properties: {
                molecular_weight: null,
                formula: null,
                status: molecule ? molecule.status : 'unknown'
            }
        };

        detailsJSON.textContent = JSON.stringify(jsonData, null, 2);

        // Show modal
        modal.style.display = 'block';

        // Clear any cached data from previous molecule views
        this.clearPreviousModalData();

        // Load similar ligands and PDB entries
        this.loadSimilarCcds(ccdCode);
        this.loadPdbEntries(ccdCode);
    }

    // Clear any cached data from previous molecule modal views
    clearPreviousModalData() {
        // Clear similar ligands data
        this.currentSimilarLigands = [];
        const similarTable = document.getElementById('similar-ligands-table');
        const similarTbody = document.getElementById('similar-ligands-tbody');
        const similarContainer = document.getElementById('similar-ligands-container');
        const addAllBtn = document.getElementById('add-all-similar-btn');

        if (similarTable) similarTable.style.display = 'none';
        if (similarTbody) similarTbody.innerHTML = '';
        if (similarContainer) similarContainer.innerHTML = '<p>Loading similar ligands...</p>';
        if (addAllBtn) addAllBtn.style.display = 'none';

        // Clear PDB entries data
        const pdbTable = document.getElementById('pdb-entries-table-container');
        const pdbTbody = document.getElementById('pdb-entries-tbody');
        const pdbContainer = document.getElementById('pdb-entries-container');

        if (pdbTable) {
            pdbTable.style.display = 'none';
            // Remove any existing notes
            const existingNotes = pdbTable.querySelectorAll('p[style*="font-size: 12px"]');
            existingNotes.forEach(note => note.remove());
        }
        if (pdbTbody) pdbTbody.innerHTML = '';
        if (pdbContainer) pdbContainer.innerHTML = '<p>Loading PDB entries...</p>';
    }

    // Load similar compounds from PDBe API
    async loadSimilarCcds(ccdCode) {
        const container = document.getElementById('similar-ligands-container');
        const table = document.getElementById('similar-ligands-table');
        const tbody = document.getElementById('similar-ligands-tbody');
        const addAllBtn = document.getElementById('add-all-similar-btn');

        // Store similar ligands for "Add all" functionality
        this.currentSimilarLigands = [];

        try {
            container.innerHTML = '<p>Loading similar ligands...</p>';
            table.style.display = 'none';
            addAllBtn.style.display = 'none';

            const data = await ApiService.getSimilarCcds(ccdCode);
            const ccdData = data[ccdCode];

            if (!ccdData || (!ccdData[0]?.stereoisomers?.length && !ccdData[0]?.same_scaffold?.length && !ccdData[0]?.similar_ligands?.length)) {
                container.innerHTML = '<div class="no-similar-ligands">No similar ligands found</div>';
                return;
            }

            // Clear previous results
            tbody.innerHTML = '';
            this.currentSimilarLigands = [];

            const ligandInfo = ccdData[0];

            let allLigands = [];

            // Add stereoisomers
            if (ligandInfo.stereoisomers && ligandInfo.stereoisomers.length > 0) {
                allLigands.push(...ligandInfo.stereoisomers.map(l => ({ ...l, type: 'stereoisomer' })));
            }

            // Add same scaffold ligands
            if (ligandInfo.same_scaffold && ligandInfo.same_scaffold.length > 0) {
                allLigands.push(...ligandInfo.same_scaffold.map(l => ({ ...l, type: 'scaffold' })));
            }

            // Add similar ligands (>60% similarity)
            if (ligandInfo.similar_ligands && ligandInfo.similar_ligands.length > 0) {
                allLigands.push(...ligandInfo.similar_ligands.map(l => ({ ...l, type: 'similar' })));
            }

            // Limit to the top 10 most relevant ligands
            const limitedLigands = allLigands.slice(0, 10);

            limitedLigands.forEach(ligand => {
                const row = this.createSimilarLigandRow(ligand.type, ligand);
                tbody.appendChild(row);
                this.currentSimilarLigands.push(ligand);
            });

            // Add note if we limited the results
            if (allLigands.length > 10) {
                const note = document.createElement('p');
                note.style.fontSize = '12px';
                note.style.color = '#666';
                note.style.fontStyle = 'italic';
                note.style.marginTop = '10px';
                note.textContent = `Showing first 10 of ${allLigands.length} similar ligands`;
                table.parentNode.appendChild(note);
            }

            // Show table and add all button
            container.style.display = 'none';
            table.style.display = 'table';

            if (this.currentSimilarLigands.length > 0) {
                addAllBtn.style.display = 'inline-block';
                addAllBtn.textContent = `Add All (${this.currentSimilarLigands.length})`;

                // Remove existing event listeners and add new one
                addAllBtn.replaceWith(addAllBtn.cloneNode(true));
                const newAddAllBtn = document.getElementById('add-all-similar-btn');
                newAddAllBtn.addEventListener('click', () => this.addAllSimilarLigands());
            }

        } catch (error) {
            console.error(`Error fetching similar CCDs for ${ccdCode}:`, error);

            // For now, show a placeholder with some example data to demonstrate the feature
            container.innerHTML = '<div class="no-similar-ligands">Similar ligands feature temporarily unavailable due to CORS restrictions. <br><small>In production, this would be handled via a backend proxy.</small></div>';

            // Optionally show demo data for ATP as an example
            if (ccdCode === 'ATP') {
                this.showDemoSimilarLigands();
            }
        }
    }

    // Add all similar ligands to the database
    addAllSimilarLigands() {
        if (!this.currentSimilarLigands || this.currentSimilarLigands.length === 0) {
            showNotification('No similar ligands to add', 'info');
            return;
        }

        const addAllBtn = document.getElementById('add-all-similar-btn');
        addAllBtn.disabled = true;
        addAllBtn.textContent = 'Adding...';

        let addedCount = 0;
        let skippedCount = 0;

        this.currentSimilarLigands.forEach((ligand, index) => {
            setTimeout(() => {
                const success = this.addMolecule(ligand.chem_comp_id);
                if (success) {
                    addedCount++;
                } else {
                    skippedCount++;
                }

                // Show final notification when all are processed
                if (index === this.currentSimilarLigands.length - 1) {
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
                    addAllBtn.textContent = `Add All (${this.currentSimilarLigands.length})`;
                }
            }, index * 100); // Stagger the additions to avoid overwhelming the UI
        });
    }

    // Create a table row for similar ligand
    createSimilarLigandRow(type, ligand) {
        const row = document.createElement('tr');

        // 2D Structure image
        const imageCell = document.createElement('td');
        imageCell.className = 'structure-2d';

        const imageContainer = document.createElement('div');
        imageContainer.className = 'loading';
        imageContainer.textContent = 'Loading...';
        imageCell.appendChild(imageContainer);

        // Load 2D structure image
        this.load2DStructure(ligand.chem_comp_id, imageContainer);

        // Type badge
        const typeCell = document.createElement('td');
        const typeBadge = document.createElement('span');
        typeBadge.className = `type-badge type-${type}`;

        let typeText = '';
        switch (type) {
            case 'stereoisomer':
                typeText = 'Stereoisomer';
                break;
            case 'scaffold':
                typeText = 'Same Scaffold';
                break;
            case 'similar':
                typeText = 'Similar';
                break;
        }

        typeBadge.textContent = typeText;
        typeCell.appendChild(typeBadge);

        // CCD Code (clickable)
        const codeCell = document.createElement('td');
        const codeSpan = document.createElement('span');
        codeSpan.className = 'ccd-code';
        codeSpan.textContent = ligand.chem_comp_id;
        codeSpan.title = `Click to add ${ligand.chem_comp_id} to database`;
        codeSpan.addEventListener('click', () => {
            document.getElementById('close-details-modal').click();
            this.showMoleculeDetails(ligand.chem_comp_id);
        });
        codeCell.appendChild(codeSpan);

        // Name
        const nameCell = document.createElement('td');
        nameCell.className = 'ligand-name';
        nameCell.textContent = ligand.name || 'N/A';

        // Match info (substructure match or similarity score)
        const matchCell = document.createElement('td');
        matchCell.className = 'match-info';

        if (ligand.similarity_score) {
            // For similar ligands, show similarity score as percentage
            const score = Math.round(ligand.similarity_score * 100);
            matchCell.textContent = `${score}% similarity`;
        } else if (ligand.substructure_match && ligand.substructure_match.length > 0) {
            // For scaffold matches, show substructure match
            matchCell.textContent = ligand.substructure_match.join(', ');
        } else {
            matchCell.textContent = '-';
        }

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
        row.appendChild(typeCell);
        row.appendChild(codeCell);
        row.appendChild(nameCell);
        row.appendChild(matchCell);
        row.appendChild(addCell);

        return row;
    }

    // Load 2D structure image from PDBe static files
    async load2DStructure(ccdCode, container) {
        try {
            // PDBe provides 2D structure images at this static endpoint
            // Format: https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/{code}_200.svg
            const imageUrl = `https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${ccdCode.toUpperCase()}_200.svg`;

            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `2D structure of ${ccdCode}`;

            img.onload = () => {
                container.innerHTML = '';
                container.appendChild(img);
            };

            img.onerror = () => {
                // Try with lowercase code as fallback
                const altImageUrl = `https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${ccdCode.toLowerCase()}_200.svg`;
                const altImg = document.createElement('img');
                altImg.src = altImageUrl;
                altImg.alt = `2D structure of ${ccdCode}`;

                altImg.onload = () => {
                    container.innerHTML = '';
                    container.appendChild(altImg);
                };

                altImg.onerror = () => {
                    container.className = 'error';
                    container.textContent = 'No image';
                };
            };

        } catch (error) {
            console.error(`Error loading 2D structure for ${ccdCode}:`, error);
            container.className = 'error';
            container.textContent = 'Error';
        }
    }

    // Load PDB entries containing the CCD code
    async loadPdbEntries(ccdCode) {
        const container = document.getElementById('pdb-entries-container');
        const tableContainer = document.getElementById('pdb-entries-table-container');
        const tbody = document.getElementById('pdb-entries-tbody');

        try {
            // Clear all previous content completely
            container.innerHTML = '<p>Loading PDB entries...</p>';
            tbody.innerHTML = ''; // Clear table body
            tableContainer.style.display = 'none';

            // Remove any existing notes from previous searches
            const existingNotes = tableContainer.querySelectorAll('p[style*="font-size: 12px"]');
            existingNotes.forEach(note => note.remove());

            // Fetch PDB entries containing this CCD
            const data = await ApiService.getPdbEntriesForCcd(ccdCode);
            const pdbIds = data[ccdCode];

            if (!pdbIds || pdbIds.length === 0) {
                container.innerHTML = '<div class="no-pdb-entries">No PDB entries found containing this CCD code</div>';
                return;
            }

            // Clear previous results
            tbody.innerHTML = '';

            // Limit to first 10 entries to avoid overwhelming the UI
            const limitedPdbIds = pdbIds.slice(0, 10);

            console.log(`Found ${pdbIds.length} PDB entries for ${ccdCode}, showing first ${limitedPdbIds.length}`);

            // Create table rows with detailed info from RCSB PDB REST API
            for (const pdbId of limitedPdbIds) {
                try {
                    const details = await this.fetchRCSBDetails(pdbId);
                    const row = this.createDetailedPDBEntryRow(pdbId, details);
                    tbody.appendChild(row);
                } catch (error) {
                    console.warn(`Failed to fetch details for ${pdbId}:`, error);
                    // Fallback to simple row
                    const row = this.createSimplePDBEntryRow(pdbId);
                    tbody.appendChild(row);
                }
            }

            // Show table and hide loading
            container.style.display = 'none';
            tableContainer.style.display = 'block';

            // Add note if we limited the results
            if (pdbIds.length > 10) {
                const note = document.createElement('p');
                note.style.fontSize = '12px';
                note.style.color = '#666';
                note.style.fontStyle = 'italic';
                note.style.marginTop = '10px';
                note.textContent = `Showing first 10 of ${pdbIds.length} PDB entries containing ${ccdCode}`;
                tableContainer.appendChild(note);
            }

        } catch (error) {
            console.error(`Error fetching PDB entries for ${ccdCode}:`, error);

            // Clear table and show error message
            tbody.innerHTML = '';
            tableContainer.style.display = 'none';
            container.innerHTML = '<div class="no-pdb-entries">PDB entries feature temporarily unavailable due to CORS restrictions. <br><small>In production, this would be handled via a backend proxy.</small></div>';

            // Show demo data for ATP as an example
            if (ccdCode === 'ATP') {
                this.showDemoPDBEntries();
            }
        }
    }

    // Fetch detailed information from RCSB PDB REST API
    async fetchRCSBDetails(pdbId) {
        try {
            const data = await ApiService.getRcsbEntry(pdbId);
            return data;
        } catch (error) {
            console.error(`Error fetching RCSB details for PDB ${pdbId}:`, error);
            return null;
        }
    }

    // Fetch detailed information for a PDB entry (legacy method)
    async fetchPDBDetails(pdbId) {
        try {
            const data = await ApiService.getPdbSummary(pdbId);
            return data[pdbId] && data[pdbId][0] ? data[pdbId][0] : null;
        } catch (error) {
            console.error(`Error fetching details for PDB ${pdbId}:`, error);
            return null;
        }
    }

    // Create a detailed table row for PDB entry with RCSB data
    createDetailedPDBEntryRow(pdbId, details) {
        const row = document.createElement('tr');

        // PDB ID (clickable to open modal)
        const idCell = document.createElement('td');
        const idSpan = document.createElement('span');
        idSpan.className = 'pdb-id';
        idSpan.textContent = pdbId.toUpperCase();
        idSpan.title = `Click to view details for ${pdbId.toUpperCase()}`;
        idSpan.addEventListener('click', () => {
            this.showPDBDetailsModal(pdbId);
        });
        idCell.appendChild(idSpan);

        // Title
        const titleCell = document.createElement('td');
        titleCell.className = 'pdb-title';
        if (details && details.struct && details.struct.title) {
            titleCell.textContent = details.struct.title;
            titleCell.title = details.struct.title;
        } else {
            titleCell.textContent = 'N/A';
        }

        // Resolution
        const resolutionCell = document.createElement('td');
        resolutionCell.className = 'pdb-resolution';
        if (details && details.rcsb_entry_info && details.rcsb_entry_info.resolution_combined && details.rcsb_entry_info.resolution_combined.length > 0) {
            resolutionCell.textContent = `${details.rcsb_entry_info.resolution_combined[0].toFixed(2)}`;
        } else {
            resolutionCell.textContent = 'N/A';
        }

        // Release date
        const dateCell = document.createElement('td');
        dateCell.className = 'pdb-date';
        if (details && details.rcsb_accession_info && details.rcsb_accession_info.initial_release_date) {
            const date = new Date(details.rcsb_accession_info.initial_release_date);
            dateCell.textContent = date.toLocaleDateString();
        } else {
            dateCell.textContent = 'N/A';
        }

        // View Structure buttons
        const viewCell = document.createElement('td');
        viewCell.className = 'view-buttons-cell';

        // RCSB PDB button
        const rcsbButton = document.createElement('button');
        rcsbButton.textContent = 'RCSB PDB';
        rcsbButton.className = 'view-structure-btn rcsb-btn';
        rcsbButton.title = `View ${pdbId.toUpperCase()} on RCSB PDB`;
        rcsbButton.addEventListener('click', () => {
            window.open(`https://www.rcsb.org/structure/${pdbId.toUpperCase()}`, '_blank');
        });

        // PDBe button
        const pdbeButton = document.createElement('button');
        pdbeButton.textContent = 'PDBe';
        pdbeButton.className = 'view-structure-btn pdbe-btn';
        pdbeButton.title = `View ${pdbId.toUpperCase()} on PDBe`;
        pdbeButton.addEventListener('click', () => {
            window.open(`https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbId.toLowerCase()}`, '_blank');
        });

        viewCell.appendChild(rcsbButton);
        viewCell.appendChild(pdbeButton);

        row.appendChild(idCell);
        row.appendChild(titleCell);
        row.appendChild(resolutionCell);
        row.appendChild(dateCell);
        row.appendChild(viewCell);

        return row;
    }

    // Create a simple table row for PDB entry (without detailed info)
    createSimplePDBEntryRow(pdbId) {
        const row = document.createElement('tr');

        // PDB ID (clickable)
        const idCell = document.createElement('td');
        const idSpan = document.createElement('span');
        idSpan.className = 'pdb-id';
        idSpan.textContent = pdbId.toUpperCase();
        idSpan.title = `Click to view ${pdbId.toUpperCase()} on RCSB PDB`;
        idSpan.addEventListener('click', () => {
            window.open(`https://www.rcsb.org/structure/${pdbId.toUpperCase()}`, '_blank');
        });
        idCell.appendChild(idSpan);

        // Fill empty cells for simple fallback
        const titleCell = document.createElement('td');
        titleCell.textContent = 'Loading...';
        titleCell.className = 'pdb-title';

        const resolutionCell = document.createElement('td');
        resolutionCell.textContent = 'N/A';
        resolutionCell.className = 'pdb-resolution';

        const dateCell = document.createElement('td');
        dateCell.textContent = 'N/A';
        dateCell.className = 'pdb-date';

        // View Structure buttons
        const viewCell = document.createElement('td');
        viewCell.className = 'view-buttons-cell';

        // RCSB PDB button
        const rcsbButton = document.createElement('button');
        rcsbButton.textContent = 'RCSB PDB';
        rcsbButton.className = 'view-structure-btn rcsb-btn';
        rcsbButton.title = `View ${pdbId.toUpperCase()} on RCSB PDB`;
        rcsbButton.addEventListener('click', () => {
            window.open(`https://www.rcsb.org/structure/${pdbId.toUpperCase()}`, '_blank');
        });

        // PDBe button
        const pdbeButton = document.createElement('button');
        pdbeButton.textContent = 'PDBe';
        pdbeButton.className = 'view-structure-btn pdbe-btn';
        pdbeButton.title = `View ${pdbId.toUpperCase()} on PDBe`;
        pdbeButton.addEventListener('click', () => {
            window.open(`https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbId.toLowerCase()}`, '_blank');
        });

        viewCell.appendChild(rcsbButton);
        viewCell.appendChild(pdbeButton);

        row.appendChild(idCell);
        row.appendChild(titleCell);
        row.appendChild(resolutionCell);
        row.appendChild(dateCell);
        row.appendChild(viewCell);

        return row;
    }

    // Create a table row for PDB entry
    createPDBEntryRow(pdbId, details) {
        const row = document.createElement('tr');

        // PDB ID (clickable)
        const idCell = document.createElement('td');
        const idSpan = document.createElement('span');
        idSpan.className = 'pdb-id';
        idSpan.textContent = pdbId.toUpperCase();
        idSpan.title = `View ${pdbId.toUpperCase()} on RCSB PDB`;
        idSpan.addEventListener('click', () => {
            window.open(`https://www.rcsb.org/structure/${pdbId.toUpperCase()}`, '_blank');
        });
        idCell.appendChild(idSpan);

        // Title
        const titleCell = document.createElement('td');
        titleCell.className = 'pdb-title';
        titleCell.textContent = details.title || 'N/A';

        // Resolution
        const resolutionCell = document.createElement('td');
        resolutionCell.className = 'pdb-resolution';
        if (details.resolution && details.resolution.length > 0) {
            resolutionCell.textContent = `${details.resolution[0].toFixed(2)}`;
        } else {
            resolutionCell.textContent = 'N/A';
        }

        // Release date
        const dateCell = document.createElement('td');
        dateCell.className = 'pdb-date';
        if (details.release_date) {
            const date = new Date(details.release_date);
            dateCell.textContent = date.toLocaleDateString();
        } else {
            dateCell.textContent = 'N/A';
        }

        // Experimental method
        const methodCell = document.createElement('td');
        if (details.experimental_method && details.experimental_method.length > 0) {
            const method = details.experimental_method[0].toLowerCase();
            const methodSpan = document.createElement('span');
            methodSpan.className = 'pdb-method';

            // Add specific class based on method type
            if (method.includes('x-ray') || method.includes('diffraction')) {
                methodSpan.classList.add('method-xray');
            } else if (method.includes('nmr')) {
                methodSpan.classList.add('method-nmr');
            } else if (method.includes('electron') || method.includes('em')) {
                methodSpan.classList.add('method-em');
            } else {
                methodSpan.classList.add('method-other');
            }

            methodSpan.textContent = details.experimental_method[0];
            methodCell.appendChild(methodSpan);
        } else {
            methodCell.textContent = 'N/A';
        }

        row.appendChild(idCell);
        row.appendChild(titleCell);
        row.appendChild(resolutionCell);
        row.appendChild(dateCell);
        row.appendChild(methodCell);

        return row;
    }

    // Show demo PDB entries for ATP when CORS fails
    showDemoPDBEntries() {
        const container = document.getElementById('pdb-entries-container');
        const tableContainer = document.getElementById('pdb-entries-table-container');
        const tbody = document.getElementById('pdb-entries-tbody');

        // Clear any existing content first
        tbody.innerHTML = '';
        const existingNotes = tableContainer.querySelectorAll('p[style*="font-size: 12px"]');
        existingNotes.forEach(note => note.remove());

        // Demo data for ATP with sample details
        const demoEntries = [
            {
                pdb_id: '1atp',
                title: 'CRYSTAL STRUCTURE OF THE TERNARY COMPLEX OF PHENYLALANYL-TRNA SYNTHETASE WITH TRNA AND A PHENYLALANYL-ADENYLATE ANALOGUE',
                resolution: 2.7,
                release_date: '1995-01-31'
            },
            {
                pdb_id: '2atp',
                title: 'ADENOSINE-5\'-TRIPHOSPHATE',
                resolution: 1.83,
                release_date: '1996-07-17'
            },
            {
                pdb_id: '3atp',
                title: 'ATP SYNTHASE',
                resolution: 2.4,
                release_date: '1999-02-24'
            },
            {
                pdb_id: '1a49',
                title: 'CRYSTAL STRUCTURE OF ADENYLYL CYCLASE',
                resolution: 2.8,
                release_date: '1998-04-15'
            },
            {
                pdb_id: '1a5u',
                title: 'ATP BINDING CASSETTE TRANSPORTER',
                resolution: 3.2,
                release_date: '1998-08-12'
            }
        ];

        tbody.innerHTML = '';

        demoEntries.forEach(entry => {
            const mockDetails = {
                struct: { title: entry.title },
                rcsb_entry_info: { resolution_combined: [entry.resolution] },
                rcsb_accession_info: { initial_release_date: entry.release_date }
            };
            const row = this.createDetailedPDBEntryRow(entry.pdb_id, mockDetails);
            tbody.appendChild(row);
        });

        container.innerHTML = '<div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; font-size: 12px; margin-bottom: 10px;">Demo data shown due to CORS restrictions. In production, this would show all PDB entries containing ATP.</div>';
        tableContainer.style.display = 'block';
    }

    // Demo function to show how similar ligands would work (for ATP example)
    showDemoSimilarLigands() {
        const container = document.getElementById('similar-ligands-container');
        const table = document.getElementById('similar-ligands-table');
        const tbody = document.getElementById('similar-ligands-tbody');

        // Sample data based on the API documentation example
        const demoData = [
            {
                type: 'stereoisomer',
                chem_comp_id: 'HEJ',
                name: '9-{5-O-[(S)-hydroxy{[(R)-hydroxy(phosphonooxy)phosphoryl]oxy}phosphoryl]-beta-D-arabinofuranosyl}-9H-purin-6-amine',
                substructure_match: []
            },
            {
                type: 'scaffold',
                chem_comp_id: 'E7X',
                name: '(2~{S})-4-[[(2~{R},3~{S},4~{R},5~{R})-5-(6-aminopurin-9-yl)-3,4-bis(oxidanyl)oxolan-2-yl]methyl-(2-hydroxyethyl)amino]-2-azaniumyl-butanoate',
                substructure_match: ['N7']
            },
            {
                type: 'scaffold',
                chem_comp_id: 'ADP',
                name: 'Adenosine 5-diphosphate',
                substructure_match: ['N1', 'N3', 'N7', 'N9']
            }
        ];

        // Clear previous results
        tbody.innerHTML = '';

        // Add demo rows
        demoData.forEach(ligand => {
            const row = this.createSimilarLigandRow(ligand.type, ligand);
            tbody.appendChild(row);
        });

        // Update container message
        container.innerHTML = '<div style="background: #e8f5e8; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-size: 13px;"><strong>Demo Data:</strong> Showing sample similar ligands for ATP. In production, this would fetch real data from the PDBe API.</div>';

        // Show table
        table.style.display = 'table';
    }

    // Show PDB entry details in a modal
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
        this.load2DStructure(ligand.chem_comp_id, imageContainer);

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
                        <div class="bound-ligands-container">
                            ${boundLigands.slice(0, 5).map(ligand => `
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
                            `).join('')}
                            ${boundLigands.length > 5 ? `<span class="more-ligands-indicator" title="${boundLigands.length - 5} more ligands">+${boundLigands.length - 5}</span>` : ''}
                        </div>
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
                    this.showQuickViewModal(ccdCode);
                });
            });

        } else {
            this.noResultsMessage.textContent = 'No PDB entries found in this group.';
            this.noResultsMessage.style.display = 'block';
            this.resultsContainer.style.display = 'none';
        }
    }

    async showQuickViewModal(ccdCode) {
        const modal = document.getElementById('quick-view-modal');
        const title = document.getElementById('quick-view-title');
        const viewer = document.getElementById('quick-view-viewer');

        title.textContent = `3D Structure: ${ccdCode}`;
        viewer.innerHTML = '<p>Loading...</p>';
        modal.style.display = 'block';

        try {
            // First, try to find the molecule in local SDF file
            const localSdfData = await moleculeManager.findMoleculeInLocalSdf(ccdCode);
            if (localSdfData) {
                console.log(`Quick view: Found ${ccdCode} in local SDF file`);
                const glviewer = $3Dmol.createViewer(viewer, {
                    backgroundColor: 'white'
                });
                glviewer.addModel(localSdfData, 'sdf');
                glviewer.setStyle({}, {
                    stick: {}
                });
                glviewer.zoomTo();
                glviewer.render();
                return;
            }

            // Second, try to find SMILES in local TSV file
            const smilesData = await moleculeManager.findMoleculeInLocalTsv(ccdCode);
            if (smilesData) {
                console.log(`Quick view: Found ${ccdCode} in local TSV file with SMILES: ${smilesData}`);
                viewer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa;">
                        <div style="text-align: center; padding: 20px;">
                            <div style="font-size: 48px; margin-bottom: 10px;">🧪</div>
                            <div style="font-size: 12px; color: #666; margin-bottom: 10px;">SMILES Structure</div>
                            <div style="font-size: 14px; font-family: monospace; background: white; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">${smilesData}</div>
                        </div>
                    </div>
                `;
                return;
            }

            // Last resort: try external fetch
            console.log(`Quick view: Trying external fetch for ${ccdCode}`);
            const sdfData = await ApiService.getCcdSdf(ccdCode);
            if (!sdfData || sdfData.trim() === '' || sdfData.toLowerCase().includes('<html')) {
                throw new Error('Received empty or invalid SDF data.');
            }

            const glviewer = $3Dmol.createViewer(viewer, {
                backgroundColor: 'white'
            });
            glviewer.addModel(sdfData, 'sdf');
            glviewer.setStyle({}, {
                stick: {}
            });
            glviewer.zoomTo();
            glviewer.render();
        } catch (error) {
            viewer.innerHTML = `<p>Could not load 3D structure: ${error.message}</p>`;
            console.error('Error fetching/rendering SDF for quick view:', error);
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

    // PDB Details Modal
    const pdbDetailsModal = document.getElementById('pdb-details-modal');
    const closePDBDetailsBtn = document.getElementById('close-pdb-details-modal');

    // Quick View Modal
    const quickViewModal = document.getElementById('quick-view-modal');
    const closeQuickViewBtn = document.getElementById('close-quick-view-modal');

    const closePDBDetailsModal = () => {
        if (pdbDetailsModal) pdbDetailsModal.style.display = 'none';
    };
    if (closePDBDetailsBtn) closePDBDetailsBtn.onclick = closePDBDetailsModal;

    const closeQuickViewModal = () => {
        if (quickViewModal) quickViewModal.style.display = 'none';
        const viewer = document.getElementById('quick-view-viewer');
        viewer.innerHTML = ''; // Clear viewer content
    };
    if (closeQuickViewBtn) closeQuickViewBtn.onclick = closeQuickViewModal;

    // Also add window click listener for PDB details modal
    window.addEventListener('click', (event) => {
        if (event.target === pdbDetailsModal) {
            closePDBDetailsModal();
        }
        if (event.target === quickViewModal) {
            closeQuickViewModal();
        }
    });
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